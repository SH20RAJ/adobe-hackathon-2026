# AGENTS.md — Workspace Agent Guidance & Execution Protocol

## Project Identity & Mission
* **Project Name:** OmniAudit-GEO (`brand-ai-readiness-audit`)
* **Context:** Adobe University Hackathon 2026 (Campus Recruitment Program) — Round 3
* **Engineering Team:**
  * **Shaswat Raj** ([@sh20raj](https://github.com/sh20raj)) — product/showcase/marketplace foundation
  * **Prithvi** ([@chikolavosaki-sys](https://github.com/chikolavosaki-sys)) — audit-engine hardening, security, and generalization
* **Objective:** Win #1 place by building the most modular, high-performance, and standard-compliant Agent Skill Marketplace (`agentskills.io` spec) for auditing website AI Discoverability and On-site Visitor Engagement.

---

## 🏛️ Repository Structure & Conventions

```
adobe-hackathon-2026/
├── marketplace.json                    <- Official Round 3 Marketplace Manifest
├── README.md                           <- Root Project Documentation
├── AGENTS.md                           <- Workspace Agent Protocol & Memory (This file)
├── CLAUDE.md                           <- Claude Code Agent Operational Protocol
├── .cursorrules                        <- Cursor IDE Operational Protocol
├── .agents/                            <- Workspace-level Antigravity Agent Customizations
│   ├── rules/                          <- Always-on and contextual quality rules
│   │   ├── coding-style.md             <- Python stdlib & TypeScript standards
│   │   ├── testing.md                  <- 100% pass rate & offline fixture rules
│   │   ├── security.md                 <- SSRF protection & read-only invariants
│   │   ├── git-workflow.md             <- Conventional commits protocol
│   │   ├── agents.md                   <- Subagent persona delegation protocol
│   │   └── performance.md              <- Sub-second local DOM parsing standards
│   └── skills/                         <- Workspace skills
│       ├── brand-ai-auditor/           <- Brand AI Readiness audit runner
│       ├── tdd-workflow/               <- Red-Green-Refactor test cycle
│       ├── verification-loop/          <- 6-Gate automated verification runner
│       ├── security-review/            <- SSRF and ReDoS security reviewer
│       └── eval-harness/               <- 16 Golden Benchmarks evaluator
├── scripts/
│   └── verify.py                       <- Unified 6-gate automated verification runner
├── context/                            <- Challenge PDFs & Handouts
│   ├── 6a8ffdf33590a_round3-handout-updated.pdf
│   └── Certificate of Participation - Shaswat Raj.pdf
├── docs/                               <- Comprehensive Research, Strategy & Architecture Docs
│   ├── ARCHITECTURE.md                 <- Master System Architecture & Scoring Models
│   ├── ACCEPTANCE_CRITERIA_AND_EVALS.md<- Formal Acceptance Criteria & Golden Benchmarks
│   ├── TECH_STACK_JUSTIFICATION.md     <- Industry Demand & Tech Stack Justification
│   ├── PITCH.md                        <- Executive Presentation & Pitch Deck
│   ├── INTERVIEW_QA_AND_DEFENSE.md     <- Jury Defense & 100/100 Model Q&A
│   └── 08_SKILL_MARKETPLACES_AND_DISTRIBUTION_STRATEGY.md
└── skills/                             <- The Submittable Marketplace Skills
    ├── audit-orchestrator/             <- [ENTRYPOINT] Master Dispatcher & Aggregator
    ├── crawl-render-audit/             <- robots.txt AI Bot Permissions & Hydration Gaps
    ├── structured-entity-audit/        <- Schema.org JSON-LD & Entity Disambiguation (sameAs)
    ├── aeo-quotability-audit/          <- LLM Quotability, Atomic Facts & Non-Text Data
    ├── freshness-corroboration-audit/  <- Temporal Signals & Trust Verification
    └── on-site-engagement-audit/       <- Value Prop Clarity, Readability & Bounce Risk
```

---

## ⚡ Agent Execution & Verification Commands

### 1. Unified 6-Gate Verification Loop (Pre-commit / Pre-PR):
```bash
python3 scripts/verify.py
```

### 2. Run Complete Site Audit via Master Orchestrator:
```bash
python3 skills/audit-orchestrator/scripts/audit_runner.py --url "https://example.com"
```

### 3. Save Audit Report to JSON File:
```bash
python3 skills/audit-orchestrator/scripts/audit_runner.py --url "https://example.com" --output "report.json"
```

### 4. Run Golden Benchmark Eval Suite:
```bash
python3 -m unittest skills/audit-orchestrator/tests/test_benchmark.py
```

---

## 🔒 Rules & Guardrails for Agent Modifications

1. **Strict Read-Only & Sandbox Compliance:** No scripts may make mutating HTTP requests (`POST`, `PUT`, `DELETE`). All crawls must use `GET`/`HEAD`.
2. **Zero External API Dependencies:** The core AST and DOM parsing must remain 100% executable offline using Python standard library modules (`urllib`, `html.parser`, `re`, `json`, `math`).
3. **`agentskills.io` Compliance:** Every skill in `skills/` must have a valid `SKILL.md` with YAML frontmatter, deterministic numbered steps, and clean separation between `scripts/` and `references/`.
4. **Output Schema Integrity:** The final JSON emitted by `audit-orchestrator` must strictly satisfy `references/audit_schema.json` with required fields `site`, `audited_at`, `summary`, and `findings`.
5. **Memory & Context Maintenance:** Whenever new features, benchmarks, or documentation are added, update `AGENTS.md`, `README.md`, and `docs/README.md` to keep the context permanently synchronized.
