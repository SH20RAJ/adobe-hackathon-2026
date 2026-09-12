# Security Policy

## Supported Versions

| Version | Supported          |
| :---    | :---               |
| 1.0.x   | :white_check_mark: |

---

## Reporting a Vulnerability

The OmniAudit-GEO team takes security seriously, especially given our bounded HTTP fetching and anti-SSRF architecture.

If you discover a security vulnerability (such as an SSRF bypass in `safe_fetch.py`, a ReDoS risk in heuristic regexes, or an injection vector in the MCP adapter), please **do not open a public GitHub issue**.

Instead, please report it privately:

1. Use [GitHub Private Vulnerability Reporting](https://github.com/SH20RAJ/adobe-hackathon-2026/security/advisories/new).
2. Or email the core maintainers directly at [shaswatraj.dev@gmail.com](mailto:shaswatraj.dev@gmail.com) with the subject `[SECURITY] OmniAudit-GEO Vulnerability Report`.

Please include:
* Description of the vulnerability and attack vector.
* Minimal proof of concept (PoC) or reproducible test case.
* Potential impact.

We will acknowledge receipt within 48 hours and work with you on a coordinated disclosure and patch release.
