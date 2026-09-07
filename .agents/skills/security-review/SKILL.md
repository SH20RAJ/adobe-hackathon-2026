---
name: security-review
description: Audit scraper, crawler, and API implementations for SSRF vulnerabilities, ReDoS risks, and unsafe execution.
---

# Security Review Skill

Inspect changes to ensure compliance with OmniAudit-GEO's strict security requirements:

## Security Checklist
1. **SSRF Guarding:**
   - Verify all outbound requests route through `safe_fetch.py`.
   - Ensure DNS resolution validates resolved IP against blocked CIDR blocks (`127.0.0.0/8`, `169.254.0.0/16`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`).
   - Run tests:
     ```bash
     python3 -m unittest skills/crawl-render-audit/tests/test_safe_fetch.py
     ```

2. **Read-Only Invariant:**
   - Confirm only `GET` and `HEAD` HTTP methods are used.
   - Verify no mutating HTTP methods (`POST`, `PUT`, `DELETE`) exist in any crawler script.

3. **ReDoS Inspection:**
   - Check all regular expressions for catastrophic backtracking risks.
   - Avoid nested quantifiers like `(a+)+` or unanchored matching on large payloads.

4. **Sanitized Error Messaging:**
   - Ensure internal system paths or network traces are not leaked in public audit JSON outputs.
