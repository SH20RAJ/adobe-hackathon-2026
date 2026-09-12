# OmniAudit-GEO: Enterprise Brand AI-Readiness Marketplace

> **Adobe University Hackathon 2026 (CRP) — Round 3 Team Submission**
> **Team:** Shaswat Raj ([@sh20raj](https://github.com/sh20raj)) & Prithvi ([@chikolavosaki-sys](https://github.com/chikolavosaki-sys))
> **Challenge:** [Unstop - Adobe University Hackathon 2026](https://unstop.com/hackathons/crp-adobe-university-hackathon-2026-adobe-1715333)  
> **Live Showcase & Pitch:** [sh20raj.github.io/adobe-hackathon-2026](https://sh20raj.github.io/adobe-hackathon-2026/)

---

## 🚀 Overview

**OmniAudit-GEO** is a modular, high-performance Agent Skill Marketplace built strictly on the `agentskills.io` standard. It equips autonomous AI agents with the tools to audit any web property for:

1. **Off-Site AI Discoverability (GEO/AEO):** Diagnosing why AI search assistants (ChatGPT Search, Perplexity, Claude, Google AI Overviews) fail to crawl, render, understand, trust, and quote a brand.
2. **On-Site Visitor Engagement:** Diagnosing why visitors referred from AI search engines fail to orient themselves and bounce upon arrival.

---

## 📦 Marketplace Skills & Orchestration Composition

As required by the Adobe University Hackathon 2026 Round 3 Development specification, this repository is organized as an `agentskills.io` compliant Agent Skill Marketplace defined by [`marketplace.json`](./marketplace.json).

### What Each Skill Does

1. **`audit-orchestrator` (Master Entrypoint):**
   - **Path:** [`skills/audit-orchestrator`](./skills/audit-orchestrator)
   - **Role:** Master dispatcher and aggregator. Composes all specialist skills, calculates composite scores (**ACPI** - AI Crawler & Parser Index, **CRS** - Click-to-Retention Score), normalizes findings, and outputs the standardized, schema-validated JSON audit report.
2. **`crawl-render-audit`:**
   - **Path:** [`skills/crawl-render-audit`](./skills/crawl-render-audit)
   - **Role:** Audits `robots.txt` crawler policies across 7 major AI crawler user-agents (GPTBot, ClaudeBot, PerplexityBot, Applebot, etc.), verifies HTTP response headers (`X-Robots-Tag`, canonicals), and detects client-side JavaScript hydration gaps (SPA empty shells vs. SSR/SSG content).
3. **`structured-entity-audit`:**
   - **Path:** [`skills/structured-entity-audit`](./skills/structured-entity-audit)
   - **Role:** Extracts and validates Schema.org JSON-LD microdata graphs (`Organization`, `Product`, `FAQPage`, etc.) and verifies entity disambiguation via authoritative `sameAs` links (Wikidata, Wikipedia, LinkedIn, Crunchbase).
4. **`aeo-quotability-audit`:**
   - **Path:** [`skills/aeo-quotability-audit`](./skills/aeo-quotability-audit)
   - **Role:** Evaluates deterministic content quotability for LLM answer synthesis. Measures atomic fact density (numbers, statistics, percentages, currencies), interrogative heading-to-answer structures, and audits facts locked in inaccessible non-text assets (missing `th` table headers, missing image `alt` attributes).
5. **`freshness-corroboration-audit`:**
   - **Path:** [`skills/freshness-corroboration-audit`](./skills/freshness-corroboration-audit)
   - **Role:** Audits temporal signals (publication and modification timestamps vs. current year 2026, copyright freshness) and inspects on-page publisher trust and authority corroboration markers (author bylines, editorial policies, contact details, privacy policies).
6. **`on-site-engagement-audit`:**
   - **Path:** [`skills/on-site-engagement-audit`](./skills/on-site-engagement-audit)
   - **Role:** Evaluates post-click visitor retention and bounce risk. Inspects above-the-fold hero value proposition clarity, calculates Flesch-Kincaid Reading Ease & ARI readability grades, and checks call-to-action (CTA) specificity and form accessibility.

### How the Entry Point Composes Them

```text
                                  ┌──────────────────────────┐
                                  │   Target URL / Domain    │
                                  └─────────────┬────────────┘
                                                │
                                                ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ ENTRYPOINT: skills/audit-orchestrator (scripts/audit_runner.py & scripts/mcp_server.py)│
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. SSRF-Safe Bounded Fetch: Fetches HTML and robots.txt via safe_fetch.py              │
│ 2. Pipeline Dispatch: Executes specialist skills with in-memory parsed DOM & headers   │
│    ├── crawl-render-audit           ──> robots AI bot rules + JS hydration gap check   │
│    ├── structured-entity-audit      ──> JSON-LD extraction + sameAs authority checks   │
│    ├── aeo-quotability-audit        ──> Atomic fact density + tabular/heading analysis │
│    ├── freshness-corroboration-audit──> Date decay + publisher trust corroboration     │
│    └── on-site-engagement-audit     ──> Readability + CTA clarity + bounce risk        │
│ 3. Score Synthesis & Normalization:                                                    │
│    ├── ACPI (AI Crawler & Parser Index)   = f(Crawlability, Entity, AEO, Freshness)    │
│    └── CRS (Click-to-Retention Score)     = f(Hero Clarity, Readability, CTA Action)   │
│ 4. Output Generation: Emits deterministic, validated JSON conforming to audit_schema.json│
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 👥 Team & Engineering Ownership

- **Shaswat Raj (@sh20raj):** Original product direction and challenge framing; marketplace and MCP foundation; initial skill decomposition, architecture, documentation, Cloudflare/Next.js showcase, GitHub Pages presentation, and deployment/distribution work.
- **Prithvi (@chikolavosaki-sys):** Audit-engine hardening and generalization; SSRF-safe bounded fetching, robots and hydration analysis, structured data, AEO, freshness/trust, engagement detectors, adapter architecture, regression benchmarks, security validation, and implementation-vs-documentation quality work.

Together, the team maintains the final provider-neutral, read-only marketplace submission.

---

## 🌐 Web Control Plane, API & Live Environments

* **Pure Python Web Control Plane & MCP Server (`omniaudit-geo`):**
  * Built 100% in Python using **FastAPI** and **Jinja2 SSR** (Zero React, Zero JS build step).
  * Direct Python AST & heuristic imports directly from canonical skill scripts (`audit_runner.py`, `mcp_server.py`, `safe_fetch.py`).
  * Real-time live auditing API at `GET /api/audit?url=<URL>`.
  * Remote Model Context Protocol (MCP) JSON-RPC 2.0 endpoint at `POST /api/mcp` and `GET /mcp`.
  * Clean, ultra-fast **Adobe Spectrum UI/UX** design system rendered server-side in sub-milliseconds.

* **Live Showcase & Pitch Page (GitHub Pages):**  
  👉 **[https://sh20raj.github.io/adobe-hackathon-2026/](https://sh20raj.github.io/adobe-hackathon-2026/)**

---

## 🏗️ Architecture at a Glance

```
adobe-hackathon-2026/
├── marketplace.json                    <- Top-level agentskills.io Marketplace Manifest
├── README.md                           <- Documentation & Quickstart (This file)
├── AGENTS.md                           <- Workspace Agent Protocol & Memory
├── CLAUDE.md                           <- Claude Code Operational Protocol
├── index.html                          <- Interactive Pitch & Showcase Dashboard
├── .github/workflows/deploy-pages.yml  <- Automated GitHub Pages CI/CD
├── omniaudit-geo/                      <- Pure Python FastAPI Control Plane & MCP Server
│   ├── main.py                         <- FastAPI App, REST API & JSON-RPC 2.0 MCP Server
│   ├── templates/                      <- Server-Side Rendered (SSR) Jinja2 Templates
│   ├── static/                         <- Vanilla CSS Design System & Static Brand Assets
│   ├── requirements.txt                <- FastAPI, Uvicorn, Pydantic, HTTPX, Jinja2
│   └── tests/                          <- TestClient test suite for API & MCP endpoints
├── docs/                               <- Master Architecture, Pitch & Defense Guides
│   ├── ARCHITECTURE.md                 <- Master System Architecture & Scoring Engine
│   ├── ACCEPTANCE_CRITERIA_AND_EVALS.md<- Formal Acceptance Criteria & Golden Benchmarks
│   ├── JUDGE_DEFENSE.md                <- 14 Comprehensive Jury & Technical Defense Answers
│   ├── TECH_STACK_JUSTIFICATION.md     <- Industry Demand & Tech Stack Choices
│   ├── PITCH.md                        <- Executive Presentation & Demo Script
│   ├── INTERVIEW_QA_AND_DEFENSE.md     <- Jury Defense & 100/100 Model Q&A
│   └── 08_SKILL_MARKETPLACES_AND_DISTRIBUTION_STRATEGY.md <- MCP, agentskills.io & Adobe Exchange
├── scripts/
│   ├── verify.py                       <- Unified 6-gate verification runner (--ci)
│   ├── final_check.py                  <- Single mandatory pre-submission pass gate
│   ├── eval_benchmarks.py              <- 16 Golden Benchmarks evaluation harness
│   └── package_submission.py           <- Clean zip packager and sandbox validator
└── skills/                             <- Specialized Agent Skills (agentskills.io)
    ├── audit-orchestrator/             <- [ENTRYPOINT] scripts/audit_runner.py & mcp_server.py
    ├── crawl-render-audit/             <- AI Bot Permissions (robots.txt) & Hydration Gaps
    ├── structured-entity-audit/        <- Schema.org JSON-LD & Entity Disambiguation (sameAs)
    ├── aeo-quotability-audit/          <- Deterministic Quotability & Non-Text Asset Signals
    ├── freshness-corroboration-audit/  <- Temporal Signals & On-Page Trust Corroboration
    └── on-site-engagement-audit/       <- CTA, Form & Action-Path Readiness
```

---

## ⚡ Quickstart: Run & Verify

### 1. Single Final Submission Check:
```bash
python3 scripts/final_check.py
```
> Runs the complete 6-gate verification runner in strict CI mode, verifies the unzipped package inside an isolated sandbox, and outputs `FINAL SUBMISSION: PASS`.

### 2. Unified 6-Gate Master Verification Loop:
```bash
python3 scripts/verify.py --ci
```
> Runs 164 unit and benchmark tests across 6 gates: Hostile SSRF Defense, Specialist unit tests, 16 Golden Benchmarks matrix, Recursive Schema integrity, FastAPI control plane tests, and Marketplace package sandbox verification.

### 3. Standalone 16 Golden Benchmarks Evaluation Harness:
```bash
python3 scripts/eval_benchmarks.py
```
> Evaluates all 16 Golden Benchmarks with latency breakdown (<0.5ms/site), scoring precision (100.0%), and beyond-defect proactive recommendations in ~6ms.

### 4. Run FastAPI Web Control Plane & MCP Server Locally:
```bash
uvicorn main:app --app-dir omniaudit-geo --reload --port 8000
```
- Open browser at `http://localhost:8000`
- Audit Console: `http://localhost:8000/audit?url=https://adobe.com`
- Benchmarks Table: `http://localhost:8000/benchmarks`
- MCP JSON-RPC Endpoint: `http://localhost:8000/api/mcp`
- Interactive API Docs: `http://localhost:8000/docs`

### 5. Model Context Protocol (MCP) Integration:
- **Instant IDE Remote Connection (Cursor, Claude Desktop, Antigravity):**
  ```text
  URL: http://localhost:8000/api/mcp
  ```
- **Air-Gapped Python MCP Server (Stdio):**
  ```bash
  python3 skills/audit-orchestrator/scripts/mcp_server.py
  # Self-test all 7 tools:
  python3 skills/audit-orchestrator/scripts/mcp_server.py --test
  ```

---

## 🤖 Agent Harness & Multi-Environment Compatibility

OmniAudit-GEO incorporates the agent harness engineering standards inspired by **Everything Claude Code (ECC)**:
* **Claude Code:** Configured with [`CLAUDE.md`](./CLAUDE.md) (commands, boundaries, subagent delegation).
* **Google Antigravity AI:** Configured with [`AGENTS.md`](./AGENTS.md) and [`.agents/`](./.agents/) rules & skills (`tdd-workflow`, `verification-loop`, `security-review`, `eval-harness`).
* **Cursor IDE:** Configured with [`.cursorrules`](./.cursorrules).
* **Evaluation Harness:** 16 Golden Benchmarks and Acceptance Criteria documented in [`docs/ACCEPTANCE_CRITERIA_AND_EVALS.md`](./docs/ACCEPTANCE_CRITERIA_AND_EVALS.md).

## 📚 Master Documentation Suite

Explore the comprehensive research and design documents in [`docs/`](./docs/):

1. **[Master Architecture & Scoring Models](./docs/ARCHITECTURE.md)** — Component topology and mathematical formulation for ACPI and CRS scores.
2. **[Adobe Senior Panel Defense & Interview Q&A](./docs/JUDGE_DEFENSE.md)** — 14 comprehensive defense answers addressing real-world edge cases, SSRF defense, ReDoS immunity, and benchmarking.
3. **[Tech Stack Selection & Justification](./docs/TECH_STACK_JUSTIFICATION.md)** — Why the Python standard-library engine, AST parsers, FastAPI, MCP, and `agentskills.io` approach are used.
4. **[Skill Marketplaces & Distribution Strategy](./docs/08_SKILL_MARKETPLACES_AND_DISTRIBUTION_STRATEGY.md)** — Distribution across `agentskills.io`, MCP Registries (Smithery/Glama), and Adobe Exchange.
5. **[Executive Pitch & Presentation Deck](./docs/PITCH.md)** — Complete presentation narrative, hook, and Adobe ecosystem synergy.
6. **[Technical Q&A Defense](./docs/INTERVIEW_QA_AND_DEFENSE.md)** — 100/100 model answers to technical jury questions.
7. **[Team Profiles & Engineering Strengths](./docs/03_SHASWAT_RAJ_PROFILE_AND_TEAM_STRENGTHS.md)** — Shaswat's product/showcase foundation and Prithvi's audit-engine hardening contributions.

---

## 📅 Submission Metadata
* **Submission Deadline:** September 13, 2026, 11:59 PM IST
* **Format:** ZIP archive (`≤ 50 MB`) of the marketplace root directory
* **Performance:** bounded HTTP responses, redirects, and timeouts; runtime depends on the target response and network.
* **License:** Apache-2.0
