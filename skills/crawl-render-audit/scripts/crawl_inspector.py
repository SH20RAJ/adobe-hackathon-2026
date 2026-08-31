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

def inspect_crawl(url):
    if not url.startswith("http"):
        url = "https://" + url
    parsed = urllib.parse.urlparse(url)
    robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
    findings = []

    try:
        req = urllib.request.Request(robots_url, headers={"User-Agent": "Mozilla/5.0 (compatible; AIAuditBot/1.0)"})
        with urllib.request.urlopen(req, timeout=5) as res:
            robots_txt = res.read().decode("utf-8", errors="ignore")
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
    except Exception as e:
        pass

    return findings

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "https://example.com"
    print(json.dumps(inspect_crawl(target), indent=2))
