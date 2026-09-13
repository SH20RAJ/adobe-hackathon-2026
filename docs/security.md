# Security Architecture & Guardrails Model

This document outlines the security architecture, threat model, and defense mechanisms implemented across **OmniAudit-GEO**.

Every security control documented here is traceable to concrete source code in [`safe_fetch.py`](../skills/crawl-render-audit/scripts/safe_fetch.py) or [`audit_guard.py`](../omniaudit-geo/audit_guard.py) and validated by adversarial automated tests in [`test_security_adversarial.py`](../skills/crawl-render-audit/tests/test_security_adversarial.py).

---

## 🛡️ Core Security Invariants

1. **Strict Read-Only Operations:** The engine only issues HTTP `GET` and `HEAD` requests. It never performs mutating requests (`POST`, `PUT`, `DELETE`), executes form submissions, or alters remote state.
2. **Zero Inbound Socket Exposure from Skills:** Marketplace skills run purely in-process; they do not bind open network ports.
3. **No Dynamic Code Evaluation:** The engine never uses `eval()`, `exec()`, or unsafe deserialization on parsed DOM content or Schema.org JSON blocks.

---

## 🔒 Server-Side Request Forgery (SSRF) Defense

Because an audit engine must fetch arbitrary user-specified URLs, Server-Side Request Forgery (SSRF) is the primary threat vector. OmniAudit-GEO implements a multi-layer defense:

### 1. URL Normalization & Scheme Restriction
* Only schemes `http://` and `https://` are permitted.
* Schemes such as `file://`, `gopher://`, `ftp://`, `data:`, and `javascript:` are rejected immediately before any network activity.
* User-supplied URLs without an explicit scheme are automatically normalized to `https://`.

### 2. DNS Resolution & Private IP Blocking
Before opening a socket to a target domain, `safe_fetch.py` resolves the hostname via DNS and verifies that all resolved IP addresses are public, non-reserved addresses.

The fetcher rejects:
* **Loopback:** `127.0.0.0/8`, `localhost`, `::1`
* **Private Networks (RFC 1918):**
  * `10.0.0.0/8`
  * `172.16.0.0/12`
  * `192.168.0.0/16`
* **Link-Local & Cloud Metadata:**
  * `169.254.169.254` (AWS, GCP, Azure, DigitalOcean instance metadata endpoints)
  * `169.254.0.0/16`
* **Carrier-Grade NAT (RFC 6598):** `100.64.0.0/10`
* **Multicast & Reserved:** `224.0.0.0/4`, `240.0.0.0/4`
* **IPv6 Equivalents:** `fc00::/7` (Unique Local), `fe80::/10` (Link-Local), and IPv4-mapped IPv6 addresses (`::ffff:127.0.0.1`).

### 3. Safe Redirect Following
* HTTP redirects (`301`, `302`, `307`, `308`) are followed manually rather than by automatic library redirects.
* The destination URL of every redirect hop is independently re-validated against the full SSRF filter before fetching.
* Redirect chains are capped at **5 hops** to prevent redirect loops and amplification attacks.

---

## ⏱️ Resource Bounds & DoS Mitigation

To prevent denial-of-service against the audit worker:

| Defense Parameter | Boundary Value | Implementation Location |
| :--- | :--- | :--- |
| **Max Response Body** | **5,242,880 bytes (5 MB)** | `safe_fetch.py` stream reader truncates payloads exceeding 5 MB. |
| **Network Timeout** | **10.0 seconds** | Socket connect and read timeouts in `urllib.request`. |
| **Max Redirects** | **5 hops** | Manual redirect loop in `safe_fetch.py`. |
| **Global Semaphore** | **10 concurrent audits** | `audit_guard.py` (`asyncio.Semaphore(10)`). |
| **Per-IP Rate Limit** | **30 requests / minute** | Sliding window rate limiter in `audit_guard.py`. |
| **HTML Parser Safety** | **Standard Library AST** | `html.parser` stream parser without external C-library crashes. |

---

## 🔍 Regular Expression Safety (ReDoS Protection)

All regular expressions used for DOM tokenization, date extraction, and fact density analysis are:
1. **Linear Time:** Free of nested polynomial quantifiers (e.g. `(a+)+$`).
2. **Pre-compiled:** Compiled at module load time to avoid runtime compilation overhead.
3. **Length Bounded:** Input strings are truncated before running complex regex scans.

---

## 🌐 Web Control Plane Security (`omniaudit-geo`)

* **Non-Root Container:** The production `Dockerfile` creates and runs as an unprivileged user (`appuser:appgroup`, UID 1001).
* **CORS Policy:** FastAPI allows standard read-only cross-origin GET requests while restricting mutating headers.
* **Security Headers:** Response headers include `X-Content-Type-Options: nosniff` and standard frame restrictions.
* **No Sensitive State:** OmniAudit-GEO maintains zero database, zero session cookies, and zero user credentials.

---

## ⚠️ Known Limitations & Operational Considerations

1. **DNS Rebinding:** In hostile multi-tenant environments with microsecond DNS rebinding, an external DNS proxy or network-level firewall (egress filtering) provides defense-in-depth.
2. **Single-Page Dynamic Hydration:** The engine inspects static HTML AST and framework markers (Next.js, Nuxt, React root). It does not execute a full headless Chromium browser in the default sandbox to maintain zero external dependencies and sub-second execution speeds. Sites relying exclusively on client-side JS without SSR are correctly diagnosed with high hydration content gaps.
3. **Truth Verification:** The audit engine inspects on-page corroboration signals (author bylines, citation links, organization identity); it does not verify the factual truth of real-world claims.
