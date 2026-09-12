# OmniAudit-GEO: Enterprise Brand AI-Readiness Marketplace

<p align="center">
  <a href="https://github.com/SH20RAJ/adobe-hackathon-2026"><img src="https://api.visitorbadge.io/api/visitors?page_id=SH20RAJ.adobe-hackathon-2026&label=Visitors&labelColor=%2324292e&countColor=%23eb1000&style=flat-square" alt="Visitors" /></a>
  <a href="https://github.com/SH20RAJ/adobe-hackathon-2026/actions/workflows/verify.yml"><img src="https://img.shields.io/github/actions/workflow/status/SH20RAJ/adobe-hackathon-2026/verify.yml?branch=main&label=6-Gate%20Verification&style=flat-square&logo=githubactions&logoColor=white" alt="Verification" /></a>
  <a href="https://github.com/SH20RAJ/adobe-hackathon-2026/actions/workflows/publish-container.yml"><img src="https://img.shields.io/github/actions/workflow/status/SH20RAJ/adobe-hackathon-2026/publish-container.yml?branch=main&label=GHCR%20Build&style=flat-square&logo=docker&logoColor=white" alt="Container" /></a>
  <a href="https://omniaudit-geo.onrender.com/"><img src="https://img.shields.io/badge/Live%20Demo-Render-46E3B7?style=flat-square&logo=render&logoColor=white" alt="Live Demo" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=flat-square" alt="License" /></a>
  <a href="https://www.python.org/"><img src="https://img.shields.io/badge/Python-3.12%20%7C%203.14-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python" /></a>
  <a href="https://fastapi.tiangolo.com"><img src="https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI" /></a>
  <a href="https://gradio.app/"><img src="https://img.shields.io/badge/Frontend-Gradio%206-FF7C00?style=flat-square&logo=gradio&logoColor=white" alt="Gradio" /></a>
  <a href="https://agentskills.io"><img src="https://img.shields.io/badge/Spec-agentskills.io-8B5CF6?style=flat-square" alt="agentskills.io" /></a>
  <a href="https://modelcontextprotocol.io"><img src="https://img.shields.io/badge/Protocol-Anthropic%20MCP-D97706?style=flat-square" alt="MCP" /></a>
  <a href="./CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome" /></a>
  <a href="https://github.com/SH20RAJ/adobe-hackathon-2026/stargazers"><img src="https://img.shields.io/github/stars/SH20RAJ/adobe-hackathon-2026?style=flat-square&color=ffd700" alt="Stars" /></a>
  <a href="https://github.com/SH20RAJ/adobe-hackathon-2026/network/members"><img src="https://img.shields.io/github/forks/SH20RAJ/adobe-hackathon-2026?style=flat-square&color=blue" alt="Forks" /></a>
</p>

> **Adobe University Hackathon 2026 (CRP) — Round 3 Team Submission**<br>
> **Team:** Shaswat Raj ([@sh20raj](https://github.com/sh20raj)) & Prithvi ([@chikolavosaki-sys](https://github.com/chikolavosaki-sys))<br>
> **Challenge:** [Unstop - Adobe University Hackathon 2026](https://unstop.com/hackathons/crp-adobe-university-hackathon-2026-adobe-1715333)<br>
> **Live Web Demo & API:** [omniaudit-geo.onrender.com](https://omniaudit-geo.onrender.com/)

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

## 🌐 Web Control Plane, API & Container Deployment

* **Pure Python Control Plane, Gradio UI & MCP Server (`omniaudit-geo`):**
  * Built 100% in Python using **Gradio 6**, **FastAPI**, and **Jinja2 SSR** (Zero React, Zero JS build step).
  * Direct Python AST & heuristic imports directly from canonical skill scripts (`audit_runner.py`, `mcp_server.py`, `safe_fetch.py`).
  * **Enterprise Gradio Frontend:** Mounted directly at root `/` with 5 enterprise tabs: Master Brand Audit, Specialist Diagnostics, 16 Golden Benchmarks Matrix, Skill Marketplace Manifest, and MCP & API Docs.
  * **Standalone Launcher:** Run locally or deploy anywhere via `python3 app.py` (port 7860).
  * Real-time live auditing API at `GET /api/audit?url=<URL>`.
  * Remote Model Context Protocol (MCP) JSON-RPC 2.0 endpoint at `POST /api/mcp` and `GET /mcp`.
  * Clean, ultra-fast **Adobe Spectrum UI/UX** design system rendered server-side in sub-milliseconds.
  * Containerized for DigitalOcean App Platform, Render, and cloud runtimes via GitHub Container Registry (`ghcr.io/sh20raj/omniaudit-geo`).
  * **Live Production Instance:** [https://omniaudit-geo.onrender.com/](https://omniaudit-geo.onrender.com/)
    * Gradio Enterprise UI: `https://omniaudit-geo.onrender.com/`
    * Audit Console: `https://omniaudit-geo.onrender.com/audit`
    * Benchmarks Matrix: `https://omniaudit-geo.onrender.com/benchmarks`
    * MCP Server Endpoint: `https://omniaudit-geo.onrender.com/api/mcp`
    * Interactive API Docs: `https://omniaudit-geo.onrender.com/docs`

---

## 🏗️ Architecture at a Glance

```
adobe-hackathon-2026/
├── marketplace.json                    <- Top-level agentskills.io Marketplace Manifest
├── README.md                           <- Documentation & Quickstart (This file)
├── AGENTS.md                           <- Workspace Agent Protocol & Memory
├── Dockerfile                          <- Production Containerfile (Python 3.12 slim, non-root)
├── .github/workflows/verify.yml        <- 6-Gate Automated Verification CI Workflow
├── .github/workflows/publish-container.yml <- GHCR Linux AMD64 Container Publisher
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
> Evaluates all 16 Golden Benchmarks against labeled ground truth fixtures with benchmark precision/recall (100.0% on fixture suite) and sub-millisecond local engine execution latency (~0.5ms/site local AST execution; real-world audit latency depends on network target response time).

### 4. Run Frontend & Web Control Plane Locally:

**Option A: Standalone Gradio Interface (Port 7860):**
```bash
python3 app.py
```
- Open browser at `http://localhost:7860`

**Option B: Full FastAPI Control Plane + Mounted Gradio UI (Port 8000):**
```bash
uvicorn main:app --app-dir omniaudit-geo --reload --port 8000
```
- Interactive Gradio UI: `http://localhost:8000/`
- Audit Console: `http://localhost:8000/audit?url=https://adobe.com`
- Benchmarks Table: `http://localhost:8000/benchmarks`
- MCP JSON-RPC Endpoint: `http://localhost:8000/api/mcp`
- Interactive OpenAPI Docs: `http://localhost:8000/docs`

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

### 6. Container Deployment (Docker, GHCR & DigitalOcean App Platform):
- **Container Registry:** `ghcr.io/sh20raj/omniaudit-geo`
- **Run Pre-built OCI Image:**
  ```bash
  docker run --rm -p 8000:8000 -e PORT=8000 ghcr.io/sh20raj/omniaudit-geo:stable
  ```
- **Build & Run Locally:**
  ```bash
  docker build -t omniaudit-geo .
  docker run --rm -p 8000:8000 -e PORT=8000 omniaudit-geo
  ```
- **Health Probe:**
  ```bash
  curl http://localhost:8000/api/health
  ```
- **DigitalOcean App Platform Deployment:**
  - **Component Type:** Web Service
  - **Source:** GitHub Container Registry (`ghcr.io/sh20raj/omniaudit-geo`)
  - **HTTP Port:** `8000`
  - **Health Check Route:** `/api/health`

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

## 🤝 Open Source Community & Contributing

We welcome contributions from developers, researchers, and AI practitioners! OmniAudit-GEO is built in the open to advance website visibility and discoverability in the era of generative answer engines.

* 📖 **[Contributing Guide (CONTRIBUTING.md)](./CONTRIBUTING.md)** — Step-by-step developer setup, local testing, and PR submission guidelines.
* 📜 **[Code of Conduct (CODE_OF_CONDUCT.md)](./CODE_OF_CONDUCT.md)** — Community pledges, standards, and reporting procedures.
* 🔒 **[Security Policy (SECURITY.md)](./SECURITY.md)** — Vulnerability reporting and responsible disclosure for anti-SSRF protections.
* ⚖️ **[Apache 2.0 License (LICENSE)](./LICENSE)** — Permissive open-source license free for community, research, and enterprise use.

---

## 📅 Submission Metadata
* **Submission Deadline:** September 13, 2026, 11:59 PM IST
* **Format:** ZIP archive (`≤ 50 MB`) of the marketplace root directory
* **Performance:** bounded HTTP responses, redirects, and timeouts; runtime depends on the target response and network.
* **License:** Apache-2.0
