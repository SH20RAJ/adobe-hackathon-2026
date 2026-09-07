#!/usr/bin/env python3
"""
Crawl & JS-Render Inspector Script.
Parses robots.txt, HTTP headers, and detects JS hydration gaps.
"""
import sys
import json
import urllib.request
import urllib.parse
import re

from safe_fetch import DEFAULT_MAX_ROBOTS_BYTES, safe_fetch

HYDRATION_FINDING_ID = "F-011"
LOW_STATIC_WORDS = 20
PARTIAL_STATIC_WORDS = 45
NEAR_EMPTY_ROOT_CHARS = 24
PAYLOAD_RATIO_THRESHOLD = 6.0

FRAMEWORK_MARKERS = {
    "__NEXT_DATA__": "Next.js",
    "self.__next_f.push": "Next.js App Router/RSC",
    "__NUXT_DATA__": "Nuxt",
    "window.__NUXT__": "Nuxt",
    "window.__INITIAL_STATE__": "application state",
    "__APOLLO_STATE__": "Apollo",
    "__remixContext": "Remix",
}

CSR_SCRIPT_MARKERS = (
    "createRoot(",
    "hydrateRoot(",
    "ReactDOM.render(",
    "document.getElementById(",
    "document.querySelector(",
    "innerHTML =",
)

STRONG_CSR_SCRIPT_MARKERS = (
    "createRoot(",
    "hydrateRoot(",
    "ReactDOM.render(",
)

ROOT_NAMES = {
    "app",
    "root",
    "__next",
    "__nuxt",
    "nuxt",
    "application",
    "app-root",
    "root-app",
}

ROOT_PRIORITY = {
    "__next": 0,
    "__nuxt": 0,
    "root": 1,
    "app": 2,
    "application": 3,
}


class _HydrationHTMLParser:
    """Small HTML parser focused on visible text, roots, and script payloads."""

    def __init__(self):
        from html.parser import HTMLParser

        class Parser(HTMLParser):
            def __init__(self, owner):
                super().__init__(convert_charrefs=True)
                self.owner = owner
                self.stack = []

            def handle_starttag(self, tag, attrs):
                attrs = dict(attrs)
                root_name = owner_root_name(tag, attrs)
                self.stack.append((tag.lower(), root_name))
                if root_name:
                    self.owner.root_chunks.setdefault(root_name, [])
                if tag.lower() == "script":
                    self.owner.script_depth += 1
                    self.owner.script_buffer = []
                    self.owner.script_attrs = attrs
                if attrs.get("data-ssr") is not None:
                    self.owner.ssr_markers.append(attrs["data-ssr"].lower())

            def handle_startendtag(self, tag, attrs):
                self.handle_starttag(tag, attrs)
                self.handle_endtag(tag)

            def handle_endtag(self, tag):
                tag = tag.lower()
                if tag == "script" and self.owner.script_depth:
                    self.owner.scripts.append(
                        (self.owner.script_attrs, "".join(self.owner.script_buffer))
                    )
                    self.owner.script_depth -= 1
                    self.owner.script_buffer = []
                if self.stack:
                    self.stack.pop()

            def handle_data(self, data):
                if self.owner.script_depth:
                    self.owner.script_buffer.append(data)
                    return
                if self.stack and self.stack[-1][0] in {"style", "noscript", "svg", "template"}:
                    return
                text = normalize_text(data)
                if not text:
                    return
                self.owner.visible_chunks.append(text)
                roots = [root for _, root in self.stack if root]
                if roots:
                    self.owner.root_chunks.setdefault(roots[-1], []).append(text)

        def owner_root_name(tag, attrs):
            if tag.lower() not in {"div", "main", "section", "article", "body"}:
                return None
            values = []
            if attrs.get("id"):
                values.append(attrs["id"])
            values.extend((attrs.get("class") or "").split())
            normalized = {value.lower() for value in values}
            if normalized & ROOT_NAMES or any(
                value.lower().endswith(("-root", "-app")) for value in values
            ):
                return attrs.get("id") or next(iter(values), tag)
            return None

        def normalize_text(value):
            return re.sub(r"\s+", " ", value).strip()

        self.parser = Parser(self)
        self.visible_chunks = []
        self.root_chunks = {}
        self.scripts = []
        self.ssr_markers = []
        self.script_depth = 0
        self.script_buffer = []
        self.script_attrs = {}

    def feed(self, html):
        self.parser.feed(html)


def _word_count(text):
    return len(re.findall(r"\b[\w][\w'-]*\b", text, re.UNICODE))


def _payload_info(parser):
    payload_scripts = []
    markers = []
    framework_names = []
    csr_markers = []
    for attrs, content in parser.scripts:
        script_text = content
        for marker, framework in FRAMEWORK_MARKERS.items():
            if marker.lower() in script_text.lower():
                markers.append(marker)
                if framework not in framework_names:
                    framework_names.append(framework)
        for marker in CSR_SCRIPT_MARKERS:
            if marker in script_text:
                csr_markers.append(marker)
        script_type = (attrs.get("type") or "").lower()
        script_id = (attrs.get("id") or "").lower()
        if (
            script_type in {"application/json", "application/ld+json"}
            or "payload" in script_id
            or "data" in script_id
            or any(marker.lower() in script_text.lower() for marker in FRAMEWORK_MARKERS)
        ):
            payload_scripts.append(len(content))
    return {
        "markers": markers,
        "frameworks": framework_names,
        "csr_markers": sorted(set(csr_markers)),
        "strong_csr_markers": sorted(
            marker for marker in set(csr_markers)
            if marker in STRONG_CSR_SCRIPT_MARKERS
        ),
        "script_count": len(parser.scripts),
        "payload_chars": sum(payload_scripts),
    }


def detect_hydration_gap(url, html):
    """Return an F-011 finding only when independent CSR-gap signals agree."""
    parser = _HydrationHTMLParser()
    parser.feed(html)
    visible_text = " ".join(parser.visible_chunks)
    static_words = _word_count(visible_text)
    static_chars = len(visible_text)
    roots = {
        name: " ".join(chunks)
        for name, chunks in parser.root_chunks.items()
    }
    payload = _payload_info(parser)
    payload_ratio = payload["payload_chars"] / max(static_chars, 1)
    framework_evidence = bool(payload["markers"])
    csr_evidence = bool(payload["csr_markers"])
    strong_csr_evidence = bool(payload["strong_csr_markers"])
    nuxt_evidence = (
        any(marker in {"__NUXT_DATA__", "window.__NUXT__"} for marker in payload["markers"])
        or any(name.lower() in {"__nuxt", "nuxt"} for name in roots)
    )
    nuxt_false = nuxt_evidence and "false" in parser.ssr_markers
    nuxt_true = "true" in parser.ssr_markers
    root_name, root_text = min(
        roots.items(),
        key=lambda item: (
            ROOT_PRIORITY.get(item[0].lower(), 4),
            bool(item[1]),
            item[0].lower(),
        ),
    ) if roots else (None, "")
    root_chars = len(root_text)
    root_empty = bool(root_name) and root_chars <= NEAR_EMPTY_ROOT_CHARS
    low_static = static_words <= LOW_STATIC_WORDS
    partial_static = static_words <= PARTIAL_STATIC_WORDS

    signals = []
    if framework_evidence:
        signals.append("framework/state payload marker")
    if csr_evidence:
        signals.append("client-rendering script marker")
    if root_empty:
        signals.append("empty or near-empty application root")
    if nuxt_false:
        signals.append('Nuxt data-ssr="false"')
    if nuxt_true:
        signals.append('Nuxt data-ssr="true"')
    if payload_ratio >= PAYLOAD_RATIO_THRESHOLD:
        signals.append("large payload relative to visible text")

    # Payload size is deliberately only a supporting signal, never a trigger alone.
    strong_gap = (
        (nuxt_false and low_static)
        or (root_empty and (framework_evidence or strong_csr_evidence))
        or (
            low_static
            and (framework_evidence or strong_csr_evidence)
            and payload_ratio >= PAYLOAD_RATIO_THRESHOLD
        )
    )
    partial_gap = (
        partial_static
        and payload_ratio >= PAYLOAD_RATIO_THRESHOLD
        and (
            nuxt_false
            or (
                framework_evidence
                and (root_empty or strong_csr_evidence)
            )
        )
    )
    if not strong_gap and not partial_gap:
        return None

    confidence = "high" if strong_gap and len(signals) >= 3 else "medium"
    severity = "high" if strong_gap and len(signals) >= 3 else "medium"
    evidence = {
        "target_url": url,
        "detected_frameworks": payload["frameworks"],
        "state_markers": payload["markers"],
        "client_rendering_markers": payload["csr_markers"],
        "meaningful_static_word_count": static_words,
        "meaningful_static_char_count": static_chars,
        "root": {
            "selector": root_name,
            "text_char_count": root_chars,
            "near_empty": root_empty,
        },
        "payload": {
            "script_count": payload["script_count"],
            "payload_char_count": payload["payload_chars"],
            "payload_to_text_ratio": round(payload_ratio, 2),
        },
        "nuxt_data_ssr": parser.ssr_markers,
        "combined_signals": signals,
        "confidence": confidence,
    }
    return {
        "id": HYDRATION_FINDING_ID,
        "title": "Likely Client-Side Rendering Content Gap",
        "severity": severity,
        "category": "crawlability_rendering",
        "evidence": json.dumps(evidence, sort_keys=True),
        "suggested_action": {
            "summary": (
                "Render the primary value proposition and essential facts in the initial "
                "HTML response, while retaining hydration for interactive behavior."
            ),
            "priority": severity,
            "implementation_code": (
                "Ensure the page renders its H1, core description, and essential facts "
                "server-side before client hydration."
            ),
        },
    }


def inspect_crawl(url):
    if not url.startswith("http"):
        url = "https://" + url
    parsed = urllib.parse.urlparse(url)
    robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
    findings = []

    try:
        robots_res = safe_fetch(
            robots_url,
            timeout=5,
            max_bytes=DEFAULT_MAX_ROBOTS_BYTES,
            require_html=False,
        )
        if robots_res["error"] is None:
            robots_txt = robots_res["body"].decode("utf-8", errors="ignore")
            ai_bots = ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended", "Bytespider", "CCBot"]
            blocked = []
            for bot in ai_bots:
                if re.search(rf"(?i)user-agent:\s*{bot}[\s\S]*?disallow:\s*/(\s|$)", robots_txt):
                    blocked.append(bot)
            if blocked:
                findings.append({
                    "id": "F-CRAWL-01",
                    "title": "AI Crawlers Restricted in robots.txt",
                    "severity": "critical" if len(blocked) >= 3 else "high",
                    "evidence": f"Found active Disallow rules for: {', '.join(blocked)}",
                    "suggested_action": {
                        "summary": "Permit ethical AI assistant crawlers to index public pages.",
                        "priority": "high",
                        "implementation_code": "User-Agent: GPTBot\nAllow: /\n\nUser-Agent: ClaudeBot\nAllow: /"
                    }
                })
    except (OSError, ValueError):
        pass

    try:
        page_res = safe_fetch(
            url,
            timeout=8,
            require_html=True,
        )
        if page_res["error"] is None:
            hydration_finding = detect_hydration_gap(url, page_res["html"])
            if hydration_finding:
                findings.append(hydration_finding)
    except (OSError, ValueError):
        pass

    return findings

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "https://example.com"
    print(json.dumps(inspect_crawl(target), indent=2))
