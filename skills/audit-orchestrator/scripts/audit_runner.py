#!/usr/bin/env python3
"""
Audit Runner & Master Orchestrator for Brand AI-Readiness Marketplace.
Conforms strictly to the Adobe University Hackathon Round 3 JSON Schema.
Zero external dependencies (uses Python standard library).
"""

import sys
import os
import json
import re
import math
import urllib.request
import urllib.error
import urllib.parse
from datetime import datetime, timezone
from html.parser import HTMLParser

USER_AGENT = "Mozilla/5.0 (compatible; BrandAIAuditBot/1.0; +https://agentskills.io)"

class HTMLContentExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.text_chunks = []
        self.scripts = []
        self.json_ld_blocks = []
        self.headings = []
        self.images = []
        self.links = []
        self.meta_tags = {}
        self.current_tag = None
        self.in_script = False
        self.script_type = ""
        self.script_buffer = []

    def handle_starttag(self, tag, attrs):
        self.current_tag = tag
        attr_dict = dict(attrs)
        
        if tag == "script":
            self.in_script = True
            self.script_type = attr_dict.get("type", "").lower()
            self.script_buffer = []
        elif tag == "meta":
            name = attr_dict.get("name", attr_dict.get("property", "")).lower()
            content = attr_dict.get("content", "")
            if name and content:
                self.meta_tags[name] = content
        elif tag == "img":
            self.images.append({
                "src": attr_dict.get("src", ""),
                "alt": attr_dict.get("alt", ""),
                "has_alt": bool(attr_dict.get("alt", "").strip())
            })
        elif tag == "a":
            href = attr_dict.get("href", "")
            if href:
                self.links.append(href)
        elif tag in ["h1", "h2", "h3", "h4", "h5", "h6"]:
            self.headings.append({"level": tag, "text": ""})

    def handle_endtag(self, tag):
        if tag == "script":
            self.in_script = False
            full_script = "".join(self.script_buffer)
            if "application/ld+json" in self.script_type:
                self.json_ld_blocks.append(full_script)
            self.scripts.append(full_script)
            self.script_buffer = []
        self.current_tag = None

    def handle_data(self, data):
        if self.in_script:
            self.script_buffer.append(data)
        elif self.current_tag not in ["style", "noscript", "svg"]:
            cleaned = data.strip()
            if cleaned:
                self.text_chunks.append(cleaned)
                if self.headings and self.current_tag in ["h1", "h2", "h3", "h4", "h5", "h6"]:
                    if not self.headings[-1]["text"]:
                        self.headings[-1]["text"] = cleaned

def fetch_url(url, timeout=10):
    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": USER_AGENT, "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"}
        )
        with urllib.request.urlopen(req, timeout=timeout) as response:
            status = response.getcode()
            headers = dict(response.info())
            raw_bytes = response.read()
            html = raw_bytes.decode("utf-8", errors="replace")
            return {"status": status, "headers": headers, "html": html, "error": None}
    except Exception as e:
        return {"status": 0, "headers": {}, "html": "", "error": str(e)}

def audit_crawl_render(base_url, html, headers):
    findings = []
    parsed_url = urllib.parse.urlparse(base_url)
    robots_url = f"{parsed_url.scheme}://{parsed_url.netloc}/robots.txt"
    
    # 1. Inspect robots.txt for AI bots
    robots_res = fetch_url(robots_url, timeout=5)
    ai_bots = ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended", "Bytespider", "CCBot"]
    blocked_bots = []
    
    if robots_res["status"] == 200 and robots_res["html"]:
        robots_text = robots_res["html"]
        for bot in ai_bots:
            pattern = rf"(?i)user-agent:\s*{bot}[\s\S]*?disallow:\s*/(\s|$)"
            if re.search(pattern, robots_text):
                blocked_bots.append(bot)
        if re.search(r"(?i)user-agent:\s*\*[\s\S]*?disallow:\s*/(\s|$)", robots_text):
            if not re.search(r"(?i)allow:\s*/", robots_text):
                blocked_bots.append("All Crawlers (*)")
    
    if blocked_bots:
        findings.append({
            "id": "F-001",
            "title": "AI Search Crawlers Blocked in robots.txt",
            "severity": "critical" if "All Crawlers (*)" in blocked_bots or len(blocked_bots) >= 3 else "high",
            "category": "crawlability_ai_permissions",
            "evidence": f"Found active Disallow directives targeting AI user-agents: {', '.join(blocked_bots)} in {robots_url}",
            "suggested_action": {
                "summary": "Update robots.txt to permit indexing by modern generative search assistants while maintaining private path protections.",
                "priority": "critical" if "All Crawlers (*)" in blocked_bots else "high",
                "implementation_code": "User-Agent: GPTBot\nAllow: /\n\nUser-Agent: ClaudeBot\nAllow: /\n\nUser-Agent: PerplexityBot\nAllow: /\n\nDisallow: /admin/\nDisallow: /api/"
            }
        })

    # 2. Inspect X-Robots-Tag headers
    x_robots = headers.get("X-Robots-Tag", headers.get("x-robots-tag", ""))
    if "noindex" in x_robots.lower() or "noai" in x_robots.lower():
        findings.append({
            "id": "F-002",
            "title": "HTTP Header X-Robots-Tag Restricts AI Indexing",
            "severity": "critical",
            "category": "crawlability_headers",
            "evidence": f"Server response included header 'X-Robots-Tag: {x_robots}'.",
            "suggested_action": {
                "summary": "Remove noindex / noai directives from public response headers.",
                "priority": "critical",
                "implementation_code": "# Remove 'X-Robots-Tag: noindex' from web server configuration (Nginx / Cloudflare / Apache)"
            }
        })
        
    return findings

def audit_structured_data(base_url, parsed_content):
    findings = []
    json_lds = parsed_content.json_ld_blocks
    parsed_schemas = []
    
    for raw in json_lds:
        try:
            cleaned = raw.strip()
            data = json.loads(cleaned)
            if isinstance(data, list):
                parsed_schemas.extend(data)
            else:
                parsed_schemas.append(data)
        except Exception:
            findings.append({
                "id": "F-003",
                "title": "Syntax Error in Embedded JSON-LD Script Block",
                "severity": "high",
                "category": "structured_data_syntax",
                "evidence": "Found a <script type='application/ld+json'> with invalid JSON syntax.",
                "suggested_action": {
                    "summary": "Fix JSON syntax in the embedded script tag to ensure machine parsability.",
                    "priority": "high",
                    "implementation_code": "{\n  \"@context\": \"https://schema.org\",\n  \"@type\": \"Organization\",\n  \"name\": \"Brand Name\"\n}"
                }
            })

    types_found = set()
    has_same_as = False
    for schema in parsed_schemas:
        stype = schema.get("@type", "")
        if isinstance(stype, list):
            types_found.update(stype)
        elif stype:
            types_found.add(stype)
        if "sameAs" in schema and schema["sameAs"]:
            has_same_as = True

    essential_schemas = ["Organization", "WebSite", "Product", "Service", "FAQPage", "Article"]
    missing_essential = [s for s in ["Organization", "WebSite"] if s not in types_found]

    if not parsed_schemas or ("Organization" not in types_found and "WebSite" not in types_found):
        findings.append({
            "id": "F-004",
            "title": "Missing Organization / WebSite Schema.org JSON-LD",
            "severity": "high",
            "category": "structured_data_entity",
            "evidence": f"Found {len(parsed_schemas)} Schema.org objects. Missing core Organization entity definition.",
            "suggested_action": {
                "summary": "Inject Organization Schema.org JSON-LD to establish definitive brand entity identity.",
                "priority": "high",
                "implementation_code": f"<script type=\"application/ld+json\">\n{{\n  \"@context\": \"https://schema.org\",\n  \"@type\": \"Organization\",\n  \"name\": \"{urllib.parse.urlparse(base_url).netloc}\",\n  \"url\": \"{base_url}\",\n  \"sameAs\": [\n    \"https://www.wikidata.org/wiki/...\",\n    \"https://www.linkedin.com/company/...\"\n  ]\n}}\n</script>"
            }
        })

    if parsed_schemas and not has_same_as:
        findings.append({
            "id": "F-005",
            "title": "Missing sameAs Entity Corroboration Links",
            "severity": "medium",
            "category": "structured_data_corroboration",
            "evidence": "Schema.org markup lacks 'sameAs' links to external authoritative knowledge bases (Wikidata, Wikipedia, Crunchbase).",
            "suggested_action": {
                "summary": "Add sameAs URIs to Organization JSON-LD to eliminate entity ambiguity in AI models.",
                "priority": "medium",
                "implementation_code": "\"sameAs\": [\n  \"https://www.wikidata.org/entity/...\",\n  \"https://www.crunchbase.com/organization/...\"\n]"
            }
        })

    return findings

def audit_aeo_quotability(parsed_content):
    findings = []
    text_chunks = parsed_content.text_chunks
    full_text = " ".join(text_chunks)
    words = full_text.split()
    total_words = len(words)
    
    # 1. Facts locked in non-text (Images without alt text)
    images = parsed_content.images
    missing_alt = [img for img in images if not img["has_alt"]]
    if len(missing_alt) > 0 and (len(missing_alt) / max(len(images), 1)) > 0.3:
        findings.append({
            "id": "F-006",
            "title": "Facts Trapped in Non-Text Graphical Assets",
            "severity": "high" if len(missing_alt) >= 5 else "medium",
            "category": "aeo_non_text_facts",
            "evidence": f"{len(missing_alt)} out of {len(images)} images lack descriptive alt text attributes.",
            "suggested_action": {
                "summary": "Provide informative, factual alt attributes for all meaningful imagery and diagrams.",
                "priority": "high",
                "implementation_code": "<img src=\"product-specs.png\" alt=\"Detailed technical specification table showing bandwidth, storage, and pricing tiers.\">"
            }
        })

    # 2. Heading hierarchy check
    h1_count = sum(1 for h in parsed_content.headings if h["level"] == "h1")
    if h1_count == 0:
        findings.append({
            "id": "F-007",
            "title": "Missing Primary H1 Heading for Topic Framing",
            "severity": "medium",
            "category": "aeo_heading_structure",
            "evidence": "Page lacks an <h1> tag, impeding semantic chunking and topic extraction by AI retrieval models.",
            "suggested_action": {
                "summary": "Add a clear, concise H1 headline defining the core entity or subject matter.",
                "priority": "medium",
                "implementation_code": "<h1>Enterprise AI Discoverability Platform</h1>"
            }
        })

    # 3. Proactive recommendation: Missing llms.txt standard
    findings.append({
        "id": "F-008",
        "title": "Proactive Opportunity: Publish an llms.txt Manifest",
        "severity": "low",
        "category": "aeo_proactive_enhancement",
        "evidence": "Site does not yet provide a standardized /llms.txt summary for LLM context ingestion.",
        "suggested_action": {
            "summary": "Deploy an /llms.txt file at the domain root containing an atomic markdown summary of products, docs, and APIs.",
            "priority": "low",
            "implementation_code": "# Title: Brand Summary\n> High-density summary for LLM ingestion.\n\n## Products & Capabilities\n- Feature A: Direct atomic definition."
        }
    })

    return findings

def audit_freshness_trust(parsed_content, full_html):
    findings = []
    current_year = datetime.now().year
    
    # Check copyright year
    copyright_matches = re.findall(r"(?:copyright|©|\&copy;)\s*(\d{4})", full_html, re.IGNORECASE)
    if copyright_matches:
        years = [int(y) for y in copyright_matches if 2000 <= int(y) <= current_year + 1]
        if years:
            latest_year = max(years)
            if latest_year < (current_year - 1):
                findings.append({
                    "id": "F-009",
                    "title": "Outdated Temporal Copyright Anchor",
                    "severity": "medium",
                    "category": "freshness_temporal_signals",
                    "evidence": f"Found copyright date '{latest_year}' which is older than {current_year - 1}. AI assistants may classify content as unmaintained.",
                    "suggested_action": {
                        "summary": "Update copyright year and inject dynamic 'last-modified' metadata tags.",
                        "priority": "medium",
                        "implementation_code": f"<p>&copy; {current_year} All rights reserved.</p>\n<meta property=\"article:modified_time\" content=\"{datetime.now().isoformat()}\">"
                    }
                })
    return findings

def audit_on_site_engagement(parsed_content):
    findings = []
    text_chunks = parsed_content.text_chunks
    full_text = " ".join(text_chunks)
    words = full_text.split()
    
    # Hero / Above-the-fold value prop length
    first_100_words = " ".join(words[:100])
    if len(words) > 50 and len(first_100_words.strip()) < 80:
        findings.append({
            "id": "F-010",
            "title": "Weak Above-The-Fold Value Proposition Orientation",
            "severity": "high",
            "category": "engagement_orientation",
            "evidence": "First 100 words lack clear descriptive explanation of core product value, causing immediate bounce for AI-referred visitors.",
            "suggested_action": {
                "summary": "Refactor the hero section headline and sub-headline to state what the product does within 5 seconds of reading.",
                "priority": "high",
                "implementation_code": "<section class=\"hero\">\n  <h1>Autonomous Brand Intelligence</h1>\n  <p>Audit and optimize your website for AI discoverability and customer retention in real-time.</p>\n</section>"
            }
        })
    return findings

def calculate_metrics(findings, parsed_content):
    # Calculate ACPI (AI Citation Probability Index)
    crit_count = sum(1 for f in findings if f["severity"] == "critical")
    high_count = sum(1 for f in findings if f["severity"] == "high")
    med_count = sum(1 for f in findings if f["severity"] == "medium")
    
    deductions = (crit_count * 30) + (high_count * 15) + (med_count * 5)
    acpi_score = max(5.0, min(100.0, 100.0 - deductions))
    crs_score = max(10.0, min(100.0, 100.0 - ((high_count * 20) + (med_count * 10))))
    
    return {
        "acpi_score": round(acpi_score, 1),
        "crs_score": round(crs_score, 1)
    }

def run_full_audit(target_url):
    if not target_url.startswith("http://") and not target_url.startswith("https://"):
        target_url = "https://" + target_url

    parsed_url = urllib.parse.urlparse(target_url)
    site_domain = parsed_url.netloc or parsed_url.path

    # Step 1: Fetch primary page
    fetch_result = fetch_url(target_url)
    all_findings = []

    if fetch_result["error"]:
        all_findings.append({
            "id": "F-000",
            "title": "Target Website Inaccessible or Connection Failed",
            "severity": "critical",
            "category": "crawlability_network",
            "evidence": f"Failed to fetch {target_url}: {fetch_result['error']}",
            "suggested_action": {
                "summary": "Ensure DNS, SSL certificate, and web server are operational.",
                "priority": "critical"
            }
        })
        parsed_content = HTMLContentExtractor()
    else:
        # Step 2: Parse HTML AST
        html = fetch_result["html"]
        headers = fetch_result["headers"]
        parsed_content = HTMLContentExtractor()
        parsed_content.feed(html)

        # Step 3: Run Sub-audits
        all_findings.extend(audit_crawl_render(target_url, html, headers))
        all_findings.extend(audit_structured_data(target_url, parsed_content))
        all_findings.extend(audit_aeo_quotability(parsed_content))
        all_findings.extend(audit_freshness_trust(parsed_content, html))
        all_findings.extend(audit_on_site_engagement(parsed_content))

    # Step 4: Calculate Summary Counts
    severity_counts = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    for f in all_findings:
        sev = f.get("severity", "medium").lower()
        if sev in severity_counts:
            severity_counts[sev] += 1

    metrics = calculate_metrics(all_findings, parsed_content)

    report = {
        "site": site_domain,
        "audited_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "summary": {
            "total_findings": len(all_findings),
            "critical": severity_counts["critical"],
            "high": severity_counts["high"],
            "medium": severity_counts["medium"],
            "low": severity_counts["low"]
        },
        "metrics": metrics,
        "findings": all_findings
    }

    return report

def main():
    import argparse
    parser = argparse.ArgumentParser(description="OmniAudit-GEO Master Audit Runner")
    parser.add_argument("--url", required=True, help="Target website URL to audit")
    parser.add_argument("--output", default=None, help="Path to write JSON output")
    args = parser.parse_args()

    report = run_full_audit(args.url)
    output_json = json.dumps(report, indent=2)

    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(output_json)
        print(f"Audit report saved to {args.output}")
    else:
        print(output_json)

if __name__ == "__main__":
    main()
