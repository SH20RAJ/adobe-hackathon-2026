#!/usr/bin/env python3
"""Standalone adapter for the audit runner's freshness/trust analyzer."""

import json
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parents[2]
CRAWL_SCRIPT_DIR = SCRIPT_DIR / "crawl-render-audit" / "scripts"
ORCHESTRATOR_SCRIPT_DIR = SCRIPT_DIR / "audit-orchestrator" / "scripts"
sys.path.insert(0, str(CRAWL_SCRIPT_DIR))
sys.path.insert(0, str(ORCHESTRATOR_SCRIPT_DIR))

from audit_runner import HTMLContentExtractor, audit_freshness_trust
from safe_fetch import DEFAULT_MAX_RESPONSE_BYTES, DEFAULT_TIMEOUT_SECONDS, safe_fetch


def check_trust(url):
    if not url.startswith(("http://", "https://")):
        url = "https://" + url
    result = safe_fetch(
        url,
        timeout=DEFAULT_TIMEOUT_SECONDS,
        max_bytes=DEFAULT_MAX_RESPONSE_BYTES,
        require_html=True,
    )
    if result["error"]:
        return [
            {
                "id": "F-TRUST-02",
                "title": "Freshness and Trust Page Could Not Be Fetched",
                "severity": "medium",
                "evidence": json.dumps(
                    {
                        "url": url,
                        "status": "FETCH_ERROR",
                        "error_code": result.get("error_code") or "fetch_failed",
                    },
                    sort_keys=True,
                ),
                "suggested_action": {
                    "summary": "Make the target page reachable over HTTP or HTTPS before auditing freshness signals.",
                    "priority": "medium",
                },
            }
        ]
    parsed_content = HTMLContentExtractor()
    parsed_content.feed(result["html"])
    return audit_freshness_trust(parsed_content, result["html"], url)


if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "https://example.com"
    print(json.dumps(check_trust(target), indent=2))
