# CLAUDE.md — Agent Operations & Codebase Guide for OmniAudit-GEO

## Project Overview
**OmniAudit-GEO** (`brand-ai-readiness-audit`) is the winning submission for the **Adobe University Hackathon 2026 (Round 3 CRP)**.
It is an autonomous website audit system compliant with the `agentskills.io` marketplace specification that evaluates:
1. **AI Citation Probability Index (ACPI, 0–100)**: Crawlability, hydration gaps, Schema.org entity disambiguation, atomic fact quotability, and freshness corroboration.
2. **Cognitive Retention Score (CRS, 0–100)**: Above-the-fold value proposition clarity, reading ease, and intent continuity.

---

## ⚡ Core Operational Commands

### Verification Loop (Run before any PR/commit):
```bash
python3 scripts/verify.py
```

### Python Audit Test Suites:
```bash
# Run orchestrator and benchmark tests
python3 -m unittest discover -s skills/audit-orchestrator/tests

# Run crawler and safe_fetch tests
python3 -m unittest discover -s skills/crawl-render-audit/tests
```

### Run Master Audit Runner:
```bash
# Basic CLI run
python3 skills/audit-orchestrator/scripts/audit_runner.py --url "https://example.com"

# Output to JSON
python3 skills/audit-orchestrator/scripts/audit_runner.py --url "https://example.com" --output "report.json"
```

### Web Control Plane (`omniaudit-geo`):
```bash
cd omniaudit-geo
bun run dev       # Start local development server
bun run build     # Build Next.js / Vinext production bundle
bun run deploy    # Deploy to Cloudflare Workers (omniaudit-geo.shraj.workers.dev)
```

---

## 🏛️ Architecture & System Boundaries

```
adobe-hackathon-2026/
├── marketplace.json                    <- Official agentskills.io marketplace manifest
├── AGENTS.md                           <- Workspace Agent Protocol for Antigravity AI
├── CLAUDE.md                           <- Operational Guide for Claude Code (This file)
├── docs/                               <- Architecture, Acceptance Criteria, and Pitch Docs
│   ├── ARCHITECTURE.md                 <- Master system architecture & scoring models
│   ├── ACCEPTANCE_CRITERIA_AND_EVALS.md<- Formal Acceptance Criteria (AC) & Golden Benchmarks
│   ├── PITCH.md                        <- Executive Presentation & Jury Deck
│   └── INTERVIEW_QA_AND_DEFENSE.md     <- Jury Q&A Defense
├── scripts/
│   └── verify.py                       <- Unified 4-gate verification script
├── skills/                             <- Deterministic Python Audit Skills
│   ├── audit-orchestrator/             <- [ENTRYPOINT] Master dispatcher & schema validator
│   ├── crawl-render-audit/             <- Robots.txt AI permissions & hydration gaps
│   ├── structured-entity-audit/        <- Schema.org JSON-LD & sameAs entity graphs
│   ├── aeo-quotability-audit/          <- LLM quotability & atomic fact density
│   ├── freshness-corroboration-audit/  <- Temporal freshness & trust corroboration
│   └── on-site-engagement-audit/       <- Value prop clarity, readability & bounce risk
└── omniaudit-geo/                      <- Cloudflare Workers Edge Web Control Plane
    ├── app/                            <- Next.js App Router (Adobe Spectrum UI)
    └── wrangler.jsonc                  <- Cloudflare Workers configuration
```

---

## 🔒 Security & Guardrails (Mandatory)

1. **Read-Only Crawling:** All HTTP fetches must use `GET` or `HEAD`. Never emit mutating requests (`POST`, `PUT`, `DELETE`).
2. **SSRF Protection:** All network requests must pass through `safe_fetch.py` which blocks:
   - Loopback (`127.0.0.0/8`, `localhost`, `::1`)
   - Link-local cloud metadata (`169.254.169.254`)
   - RFC 1918 private subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`)
3. **Zero External LLM Dependency:** The core audit engine uses Python standard library DOM/AST heuristics (`html.parser`, `re`, `json`, `math`, `urllib`). No paid API keys required.
4. **Offline Capability:** All unit tests must run offline using fixtures without making external HTTP requests.

---

## 📐 Code Style & Conventions

### Python (Audit Engine)
- Use standard library modules whenever possible.
- Pure functions and immutable data structures for findings and scores.
- Typed dataclasses / dictionaries matching `audit_schema.json`.
- Strict error handling: never swallow exceptions with bare `except: pass`; use explicit status `"unknown"` and provide descriptive reasons.

### TypeScript / React (Web App)
- Follow **Adobe Spectrum** and **React Aria** design principles: Clean, high-contrast, accessible, minimal noise.
- Tailwind CSS / Vanilla CSS with curated color tokens (Slate dark mode + Spectrum accents).
- No console logs in production components.

---

## 🤖 Subagent Delegation Protocol

When tackling complex tasks in this repository, delegate to specialized subagents:
- **Architect:** Reviewing changes against `docs/ARCHITECTURE.md` and `marketplace.json` schema.
- **TDD Guide:** Ensuring test fixtures are written in `tests/fixtures/` before modifying heuristics.
- **Security Reviewer:** Checking any new network or parsing logic for SSRF, ReDoS, or injection.
- **Code Reviewer:** Reviewing git diffs against acceptance criteria in `docs/ACCEPTANCE_CRITERIA_AND_EVALS.md`.
