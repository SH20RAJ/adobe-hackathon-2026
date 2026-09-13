# Judge & Jury Defense Guide: OmniAudit-GEO

Welcome, Adobe Hackathon Judges and Technical Evaluators. This document is designed to give you a complete technical assessment of **OmniAudit-GEO** in under 5 minutes.

---

## ⏱️ 90-Second Executive Summary

### 1. What is OmniAudit-GEO?
OmniAudit-GEO is an **Agent Skill Marketplace** conforming to the `agentskills.io` standard. It equips autonomous AI agents with tools to audit websites across two interconnected axes:
1. **Off-site AI Discoverability (GEO/AEO):** Diagnosing why generative AI search engines (ChatGPT Search, Perplexity, Claude, Google AI Overviews) fail to crawl, render, parse, trust, and cite a brand.
2. **On-site Visitor Retention (CRS):** Diagnosing why visitors arriving from AI referrals bounce within seconds due to poor above-the-fold value prop clarity and cognitive friction.

### 2. What Makes the Architecture Technically Strong?
* **Zero External API Dependencies:** The core AST and heuristic audit engine uses 100% Python standard library modules (`urllib`, `html.parser`, `re`, `json`, `math`). It executes offline with zero paid API keys.
* **In-Memory Speed & Bounded Execution:** In-memory AST parsing executes in **~0.7–1.0 ms** on standard hardware, with strict network bounds (10s timeout, 5 MB limit, 5 redirects).
* **Deep Security Hardening:** Comprehensive anti-SSRF protection blocking private RFC 1918 subnets, loopback, and cloud metadata (`169.254.169.254`).
* **Multi-Channel Delivery:** Same canonical audit engine shared across CLI (`omni`), Anthropic MCP (Claude/Cursor), REST API (FastAPI), and Web UI (Gradio 6).
* **Verified Quality:** 167 automated tests passing with **100% precision and recall** on 16 golden benchmark fixtures.

---

## 👥 Engineering Team Ownership

* **Shaswat Raj ([@sh20raj](https://github.com/sh20raj)):** Product direction and challenge framing; marketplace and MCP foundation; initial skill decomposition, architecture, documentation, Cloudflare/Next.js showcase, GitHub Pages presentation, and deployment/distribution work.
* **Prithvi ([@chikolavosaki-sys](https://github.com/chikolavosaki-sys)):** Audit-engine hardening and generalization; SSRF-safe bounded fetching, robots and hydration analysis, structured data, AEO, freshness/trust, engagement detectors, adapter architecture, regression benchmarks, security validation, and implementation-vs-documentation quality work.

Together, the team maintains the final provider-neutral, read-only marketplace submission.

---

## 🛡️ 15 Comprehensive Jury Defense Questions & Answers

### Q1: Why did you build the core engine using Python's standard library rather than Beautiful Soup or Playwright?
**A:** Beautiful Soup and Playwright add heavy C-extensions, massive node/browser binaries (>500 MB), and high cold-start latency. By implementing a stream-based AST extractor on `html.parser`, our entire marketplace package is only **0.09 MB** (well below the 50 MB hackathon limit), requires **zero pip dependencies** to audit a site, and runs in-memory AST analysis in **under 1 ms**.

### Q2: How do you prevent Server-Side Request Forgery (SSRF) when auditing arbitrary URLs?
**A:** All network traffic routes through `safe_fetch.py`. Before establishing a connection, we resolve the domain via DNS and verify that all IP addresses belong to public address space. We reject loopback (`127.0.0.0/8`, `::1`), private RFC 1918 subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), cloud instance metadata (`169.254.169.254`), and carrier-grade NAT. We also follow redirects manually, re-validating every redirect destination.

### Q3: How do you prevent double-penalizing the same root defect in scoring?
**A:** When a single root defect causes multiple symptoms (e.g. an empty client-rendered React SPA shell causes both a hydration gap finding and a low text density finding), our scoring engine (`scoring.py`) identifies shared root causes and applies a **50% damping factor** to secondary symptoms, preventing score collapse.

### Q4: How do you ensure regexes are immune to ReDoS (Regular Expression Denial of Service)?
**A:** All regular expressions are strictly linear-time without nested quantifiers (no `(a+)+` patterns). Regexes are pre-compiled at module load, and input strings are bounded before regex scanning.

### Q5: How do you detect JavaScript hydration content gaps without running a full headless Chromium browser?
**A:** We compare the raw static HTML sent to crawlers with framework state markers. For example, in Next.js/Nuxt/React applications, we inspect server-rendered DOM tags versus hydration payloads (`__NEXT_DATA__`, Nuxt payload, or empty `<div id="root"></div>`). When an application embeds large data states or scripts while leaving the visible HTML empty, our detector identifies the hydration gap with evidence metrics.

### Q6: What is the difference between ACPI and CRS scores?
**A:**
* **ACPI (AI Citation Probability Index, 0–100):** Measures *machine discoverability*—can AI crawlers index the site, understand entity relationships via Schema.org, and extract atomic facts?
* **CRS (Cognitive Retention Score, 0–100):** Measures *human cognitive orientation*—when a human visitor clicks an AI referral link, do they find an immediate value proposition above the fold, high reading ease, and clear action triggers?

### Q7: How does the marketplace comply with the `agentskills.io` standard?
**A:** The repository root defines `marketplace.json`. Each of the 6 skills resides in `skills/<skill-id>/` with a valid `SKILL.md` containing YAML frontmatter, deterministic Python scripts in `scripts/`, references and schemas in `references/`, and automated unit tests in `tests/`.

### Q8: How does the Model Context Protocol (MCP) server integrate with LLMs?
**A:** We implement JSON-RPC 2.0 per the Anthropic MCP specification (`protocolVersion: 2024-11-05`). It can be invoked via local stdio (`omni mcp`) or via HTTP (`https://omniaudit-geo.onrender.com/api/mcp`). Tools expose strict JSON schemas describing inputs and outputs, allowing Claude, Cursor, Antigravity, or Windsurf to autonomously invoke audits.

### Q9: Does the audit engine verify the factual truth of on-page claims?
**A:** No. Verifying the factual truth of arbitrary real-world claims requires world knowledge beyond a static audit. Instead, our `freshness-corroboration-audit` evaluates *structural corroboration signals*: author bylines, citation links, references to authoritative studies, transparent company contact info, and temporal date metadata.

### Q10: How do you handle non-HTML responses or huge binary files?
**A:** `safe_fetch.py` checks the `Content-Type` header and aborts immediately if the content is not text/HTML (e.g. video, binary, zip). Additionally, a streaming byte counter truncates downloads at **5 MB**, and socket connections timeout after **10 seconds**.

### Q11: Why did you choose Gradio 6 for the web frontend instead of a separate React frontend?
**A:** Using Gradio 6 mounted directly onto FastAPI gives us a 100% Python stack with **zero JavaScript build step**, zero npm vulnerabilities, and instantaneous updates when audit heuristics change. It imports directly from the canonical skill scripts with zero API contract lag.

### Q12: How does the submission package maintain the $\le 50$ MB hackathon constraint?
**A:** Our build script (`scripts/package_submission.py`) includes only the essentials: `marketplace.json`, `README.md`, and `skills/`. Because our core engine relies on Python standard library modules without heavy wheels or browser binaries, the entire submission archive is only **0.09 MB** (99.8% under the 50 MB budget).

### Q13: What happens if an audited website is down or returns HTTP 404/500?
**A:** The engine does not crash. `safe_fetch.py` catches socket, HTTP, and connection errors, and the orchestrator emits a structured audit report with `status: "unknown"` and an actionable `failure_reason`.

### Q14: How are proactive remediations generated?
**A:** In addition to defect logs, the engine synthesizes ready-to-paste assets:
1. Valid Schema.org JSON-LD customized with the target site's metadata.
2. An AI-optimized `robots.txt` configuration that permits ethical AI crawlers.
3. An `llms.txt` knowledge manifest for LLM retrieval engines.

### Q15: How can a judge verify the system in 1 command?
**A:** Run:
```bash
python3 cli.py verify --ci
```
This executes all 6 verification gates, 167 automated unit/integration tests, and the 16 golden benchmarks in ~10 seconds.
