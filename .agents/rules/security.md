# Security & Safety Guardrails

## 1. Network Fetching & SSRF Prevention
- Every outbound HTTP request must be mediated by `skills/crawl-render-audit/scripts/safe_fetch.py`.
- Disallow fetching of:
  - Loopback (`127.0.0.1`, `localhost`, `::1`)
  - Cloud metadata endpoints (`169.254.169.254`)
  - RFC 1918 private subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`)
- Enforce strict connect and read timeouts (default 10s).
- Disallow non-HTTP/HTTPS protocols (`file://`, `ftp://`, `gopher://`).

## 2. Mutating Requests Prohibited
- All crawlers and auditors are strictly read-only.
- Only HTTP `GET` and `HEAD` methods are permitted. Never use `POST`, `PUT`, `DELETE`, or `PATCH`.

## 3. Sandboxed HTML & DOM Parsing
- HTML parsing must handle untrusted, malformed, or hostile inputs gracefully without crashing.
- Protect regular expressions against catastrophic backtracking (ReDoS).
- Never evaluate untrusted JavaScript or use `eval()`.
