# CLAUDE.md — Operational Protocol for Claude Code

This guide provides operational boundaries and command references for **Claude Code** working within **OmniAudit-GEO**.

---

## ⚡ Primary Verification Commands

Before completing any task or proposing commits:

```bash
# 1. 6-Gate verification loop (Strict CI mode)
python3 scripts/verify.py --ci

# 2. Mandatory pre-submission final pass check
python3 scripts/final_check.py

# 3. Benchmark accuracy check (16 Golden Fixtures)
python3 cli.py benchmark
```

---

## 🏛️ Repository Architecture & Boundaries

```text
adobe-hackathon-2026/
├── marketplace.json        <- Official agentskills.io marketplace manifest
├── cli.py                  <- Unified CLI entrypoint (shares skills/ logic directly)
├── app.py                  <- Standalone Gradio 6 UI launcher (Port 7860)
├── skills/                 <- 6 Deterministic Python Skills (agentskills.io)
│   ├── audit-orchestrator/ <- [ENTRYPOINT] Dispatcher, scorer & schema validator
│   ├── crawl-render-audit/ <- robots.txt AI permissions & JS hydration gaps
│   ├── structured-entity-audit/ <- Schema.org JSON-LD & sameAs entity graphs
│   ├── aeo-quotability-audit/   <- Atomic fact density & quotability signals
│   ├── freshness-corroboration-audit/ <- Temporal decay & publisher trust signals
│   └── on-site-engagement-audit/      <- Above-the-fold value prop, reading ease & CTAs
├── omniaudit-geo/          <- Pure Python FastAPI Control Plane & Gradio 6 UI
├── scripts/                <- Verification, benchmark, and packaging utilities
└── docs/                   <- Canonical Documentation Hub (docs/README.md)
```

---

## 🔒 Code Style & Engineering Standards

* **Language Stack:** Pure Python 3.10+.
* **Core Engine (`skills/`):** Python standard library only (`urllib`, `html.parser`, `re`, `json`, `math`). Do not add external pip dependencies to the core audit engine.
* **Web Control Plane (`omniaudit-geo/`):** FastAPI + Gradio 6. Zero React, zero npm, zero JS build step.
* **Read-Only Crawling:** Use HTTP `GET` and `HEAD` only. Never issue mutating HTTP requests.
* **SSRF Guard:** All target URL fetches must route through `safe_fetch.py`. Never fetch private IP subnets or loopback.
* **Error Handling:** Never swallow exceptions with bare `except: pass`. Emit `status: "unknown"` with an actionable `failure_reason`.

---

## 🧭 Canonical Documentation Reference

Do not maintain duplicate technical specifications in agent instructions. Refer to canonical docs:

* **System Architecture:** [`docs/architecture.md`](docs/architecture.md)
* **Marketplace Packaging:** [`docs/marketplace.md`](docs/marketplace.md)
* **Specialist Skills Logic:** [`docs/skills.md`](docs/skills.md)
* **CLI Reference:** [`docs/cli.md`](docs/cli.md)
* **REST API:** [`docs/api.md`](docs/api.md)
* **Model Context Protocol:** [`docs/mcp.md`](docs/mcp.md)
* **Security Model:** [`docs/security.md`](docs/security.md)
* **Testing & Quality Gates:** [`docs/testing.md`](docs/testing.md)
* **Jury Defense & Pitch:** [`docs/judging.md`](docs/judging.md)
