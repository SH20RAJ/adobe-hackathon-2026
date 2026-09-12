# OmniAudit-GEO: Enterprise Brand AI-Readiness Marketplace

> **Adobe University Hackathon 2026 (CRP) — Round 3 Team Submission**
> **Team:** Shaswat Raj ([@sh20raj](https://github.com/sh20raj)) & Prithvi ([@chikolavosaki-sys](https://github.com/chikolavosaki-sys))
> **Challenge:** [Unstop - Adobe University Hackathon 2026](https://unstop.com/hackathons/crp-adobe-university-hackathon-2026-adobe-1715333)  
> **Live Edge Web App:** [omniaudit-geo.shraj.workers.dev](https://omniaudit-geo.shraj.workers.dev)  
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

## 🌐 Live Deployments & Interactive Environments

* **Live Edge Application (Cloudflare Workers + Next.js App Router):**  
  👉 **[https://omniaudit-geo.shraj.workers.dev](https://omniaudit-geo.shraj.workers.dev)**
  * Separate interactive web/API prototype powered by Cloudflare Workers.
  * Real-time live auditing API at `/api/audit?url=<URL>`.
  * Clean, minimalist **Adobe Spectrum UI/UX** design system.

* **Live Showcase & Pitch Page (GitHub Pages):**  
  👉 **[https://sh20raj.github.io/adobe-hackathon-2026/](https://sh20raj.github.io/adobe-hackathon-2026/)**

---

## 🏗️ Architecture at a Glance

```
adobe-hackathon-2026/
├── marketplace.json                    <- Top-level Marketplace Manifest
├── README.md                           <- Documentation & Quickstart
├── AGENTS.md                           <- Workspace Agent Protocol & Memory
├── index.html                          <- Interactive Pitch & Showcase Dashboard
├── .github/workflows/deploy-pages.yml  <- Automated GitHub Pages CI/CD
├── omniaudit-geo/                      <- Cloudflare Workers Next.js Edge App
│   ├── app/page.tsx                    <- Adobe Spectrum Dashboard
│   ├── app/api/audit/route.ts          <- Real-time Live Edge Audit API
│   └── wrangler.jsonc                  <- Cloudflare Edge Manifest
├── docs/                               <- Master Architecture, Pitch & Defense Guides
│   ├── ARCHITECTURE.md                 <- Master System Architecture & Scoring Engine
│   ├── TECH_STACK_JUSTIFICATION.md     <- Industry Demand & Tech Stack Choices
│   ├── PITCH.md                        <- Executive Presentation & Demo Script
│   ├── INTERVIEW_QA_AND_DEFENSE.md     <- Jury Defense & 100/100 Model Q&A
│   └── 08_SKILL_MARKETPLACES_AND_DISTRIBUTION_STRATEGY.md <- MCP, agentskills.io & Adobe Exchange
└── skills/                             <- Specialized Agent Skills
    ├── audit-orchestrator/             <- [ENTRYPOINT] scripts/audit_runner.py & mcp_server.py
    ├── crawl-render-audit/             <- AI Bot Permissions (robots.txt) & Hydration Gaps
    ├── structured-entity-audit/        <- Schema.org JSON-LD & Entity Disambiguation (sameAs)
    ├── aeo-quotability-audit/          <- Deterministic Quotability & Non-Text Asset Signals
    ├── freshness-corroboration-audit/  <- Temporal Signals & On-Page Trust Corroboration
    └── on-site-engagement-audit/       <- CTA, Form & Action-Path Readiness
```

---

## ⚡ Quickstart: Run & Verify

### 1. Unified 6-Gate Master Verification Loop:
```bash
python3 scripts/verify.py
```
> Runs 122 unit and benchmark tests across 6 gates: Crawl/SSRF safety, Specialist unit tests, 16 Golden Benchmarks matrix, Schema integrity, Web unit tests, and Cloudflare Next.js production build in ~3 seconds.

### 2. Standalone 16 Golden Benchmarks Evaluation Harness:
```bash
python3 scripts/eval_benchmarks.py
```
> Evaluates all 16 Golden Benchmarks with latency breakdown (<1ms/site), scoring precision, and beyond-defect proactive recommendations in ~20ms.

### 3. Model Context Protocol (MCP) Integration:
- **Instant IDE Remote Connection (Cursor, Claude Desktop, Antigravity):**
  ```text
  URL: https://omniaudit-geo.shraj.workers.dev/api/mcp
  ```
- **Air-Gapped Python MCP Server (Stdio):**
  ```bash
  python3 skills/audit-orchestrator/scripts/mcp_server.py
  # Self-test all 7 tools:
  python3 skills/audit-orchestrator/scripts/mcp_server.py --test
  ```

### 4. Edge HTTP Audit API:
```bash
curl -s "https://omniaudit-geo.shraj.workers.dev/api/audit?url=https://adobe.com"
```

### 5. Adobe Spectrum 2 Web Application & PWA:
- **Live URL:** [omniaudit-geo.shraj.workers.dev](https://omniaudit-geo.shraj.workers.dev)
- **PWA Manifest:** [omniaudit-geo.shraj.workers.dev/manifest.json](https://omniaudit-geo.shraj.workers.dev/manifest.json)
- **Design System:** Engineered adhering to authentic Adobe Spectrum 2 design principles (Adobe Red `#EB1000`, Charcoal surfaces `#141414`/`#1E1E1E`, Celery status accents `#27C281`, and crisp typography).


---

## 🤖 Agent Harness & Multi-Environment Compatibility

OmniAudit-GEO incorporates the agent harness engineering standards inspired by **Everything Claude Code (ECC)**:
* **Claude Code:** Configured with [`CLAUDE.md`](./CLAUDE.md) (commands, boundaries, subagent delegation).
* **Google Antigravity AI:** Configured with [`AGENTS.md`](./AGENTS.md) and [`.agents/`](./.agents/) rules & skills (`tdd-workflow`, `verification-loop`, `security-review`, `eval-harness`).
* **Cursor IDE:** Configured with [`.cursorrules`](./.cursorrules).
* **Evaluation Harness:** 14 Golden Benchmarks and Acceptance Criteria documented in [`docs/ACCEPTANCE_CRITERIA_AND_EVALS.md`](./docs/ACCEPTANCE_CRITERIA_AND_EVALS.md).

## 📚 Master Documentation Suite

Explore the comprehensive research and design documents in [`docs/`](./docs/):

1. **[Master Architecture & Scoring Models](./docs/ARCHITECTURE.md)** — Component topology and mathematical formulation for ACPI and CRS scores.
2. **[Tech Stack Selection & Justification](./docs/TECH_STACK_JUSTIFICATION.md)** — Why the Python standard-library engine, AST parsers, Cloudflare Workers, MCP, and `agentskills.io` approach are used.
3. **[Skill Marketplaces & Distribution Strategy](./docs/08_SKILL_MARKETPLACES_AND_DISTRIBUTION_STRATEGY.md)** — Distribution across `agentskills.io`, MCP Registries (Smithery/Glama), Adobe Exchange, and Cloudflare.
4. **[Executive Pitch & Presentation Deck](./docs/PITCH.md)** — Complete presentation narrative, hook, and Adobe ecosystem synergy.
5. **[Adobe Senior Panel Defense & Interview Q&A](./docs/INTERVIEW_QA_AND_DEFENSE.md)** — 100/100 model answers to technical jury questions.
6. **[Team Profiles & Engineering Strengths](./docs/03_SHASWAT_RAJ_PROFILE_AND_TEAM_STRENGTHS.md)** — Shaswat's product/showcase foundation and Prithvi's audit-engine hardening contributions.

---

## 📅 Submission Metadata
* **Submission Deadline:** September 13, 2026, 11:59 PM IST
* **Format:** ZIP archive (`≤ 50 MB`) of the marketplace root directory
* **Performance:** bounded HTTP responses, redirects, and timeouts; runtime depends on the target response and network.
* **License:** Apache-2.0
