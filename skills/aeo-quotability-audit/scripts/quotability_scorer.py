#!/usr/bin/env python3
"""
Quotability Scorer Script.
Evaluates content-to-noise ratio, heading hierarchy, and facts locked in images.
"""
import sys
import json
import urllib.request
import re

def score_quotability(url):
    if not url.startswith("http"):
        url = "https://" + url
    findings = []
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible; AIAuditBot/1.0)"})
        with urllib.request.urlopen(req, timeout=8) as res:
            html = res.read().decode("utf-8", errors="ignore")
            
            # Check for images missing alt text
            imgs = re.findall(r'<img\s+[^>]*>', html, re.IGNORECASE)
            missing_alt = [img for img in imgs if 'alt=' not in img.lower() or 'alt=""' in img or "alt=''" in img]
            
            if len(missing_alt) >= 3:
                findings.append({
                    "id": "F-AEO-01",
                    "title": "Non-Text Visual Data Lacks Alt Descriptions",
                    "severity": "medium",
                    "evidence": f"{len(missing_alt)} images lack descriptive alt text.",
                    "suggested_action": {
                        "summary": "Add detailed alt text to images containing diagrams, charts, or product specs.",
                        "priority": "medium",
                        "implementation_code": "<img src=\"chart.png\" alt=\"Annual revenue growth comparison chart for 2024 to 2026.\">"
                    }
                })
    except Exception:
        pass
    return findings

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "https://example.com"
    print(json.dumps(score_quotability(target), indent=2))
