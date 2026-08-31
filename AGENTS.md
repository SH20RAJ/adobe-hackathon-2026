# AGENTS.md — Workspace Agent Guidance & Execution Protocol

## Project Identity & Mission
* **Project Name:** OmniAudit-GEO (`brand-ai-readiness-audit`)
* **Context:** Adobe University Hackathon 2026 (Campus Recruitment Program) — Round 3
* **Lead Engineer:** Shaswat Raj ([@sh20raj](https://github.com/sh20raj))
* **Objective:** Win #1 place by building the most modular, high-performance, and standard-compliant Agent Skill Marketplace (`agentskills.io` spec) for auditing website AI Discoverability and On-site Visitor Engagement.

---

## 🏛️ Repository Structure & Conventions

```
adobe-hackathon-2026/
├── marketplace.json                    <- Official Round 3 Marketplace Manifest
├── README.md                           <- Root Project Documentation
├── AGENTS.md                           <- Workspace Agent Protocol & Memory (This file)
├── .agents/skills/                     <- Workspace-level Agent Customizations
│   └── brand-ai-auditor/
│       └── SKILL.md
├── context/                            <- Challenge PDFs & Handouts
│   ├── 6a8ffdf33590a_round3-handout-updated.pdf
│   └── Certificate of Participation - Shaswat Raj.pdf
├── docs/                               <- Comprehensive Research, Strategy & Architecture Docs
│   ├── ARCHITECTURE.md                 <- Master System Architecture & Scoring Models
│   ├── TECH_STACK_JUSTIFICATION.md     <- Industry Demand & Tech Stack Justification
│   ├── PITCH.md                        <- Executive Presentation & Pitch Deck
│   ├── INTERVIEW_QA_AND_DEFENSE.md     <- Jury Defense & 100/100 Model Q&A
│   ├── 01_ADOBE_HACKATHON_2026_ROUND3_DEEP_DIVE.md
│   ├── 02_PREVIOUS_WINNERS_AND_BENCHMARK_ANALYSIS.md
│   ├── 03_SHASWAT_RAJ_PROFILE_AND_TEAM_STRENGTHS.md
│   ├── 04_MASTER_WINNING_STRATEGY_AND_SYSTEM_ARCHITECTURE.md
│   ├── 05_SKILL_SPECIFICATIONS_AND_PROMPT_ENGINEERING.md
│   ├── 06_EXECUTION_TIMELINE_AND_MILESTONE_ROADMAP.md
│   └── 07_WINNING_PROJECT_IDEAS_AND_ARCHITECTURES.md
└── skills/                             <- The Submittable Marketplace Skills
    ├── audit-orchestrator/             <- [ENTRYPOINT] Master Dispatcher & Aggregator
    ├── crawl-render-audit/             <- robots.txt AI Bot Permissions & Hydration Gaps
    ├── structured-entity-audit/        <- Schema.org JSON-LD & Entity Disambiguation (sameAs)
    ├── aeo-quotability-audit/          <- LLM Quotability, Atomic Facts & Non-Text Data
    ├── freshness-corroboration-audit/  <- Temporal Signals & Trust Verification
    └── on-site-engagement-audit/       <- Value Prop Clarity, Readability & Bounce Risk
```

---

## ⚡ Agent Execution Commands

### 1. Run Complete Site Audit via Master Orchestrator:
```bash
python3 skills/audit-orchestrator/scripts/audit_runner.py --url "https://example.com"
```

### 2. Save Audit Report to JSON File:
```bash
python3 skills/audit-orchestrator/scripts/audit_runner.py --url "https://example.com" --output "report.json"
```

---

## 🔒 Rules & Guardrails for Agent Modifications

1. **Strict Read-Only & Sandbox Compliance:** No scripts may make mutating HTTP requests (`POST`, `PUT`, `DELETE`). All crawls must use `GET`/`HEAD`.
2. **Zero External API Dependencies:** The core AST and DOM parsing must remain 100% executable offline using Python standard library modules (`urllib`, `html.parser`, `re`, `json`, `math`).
3. **`agentskills.io` Compliance:** Every skill in `skills/` must have a valid `SKILL.md` with YAML frontmatter, deterministic numbered steps, and clean separation between `scripts/` and `references/`.
4. **Output Schema Integrity:** The final JSON emitted by `audit-orchestrator` must strictly satisfy `references/audit_schema.json` with required fields `site`, `audited_at`, `summary`, and `findings`.
5. **Memory & Context Maintenance:** Whenever new features, benchmarks, or documentation are added, update `AGENTS.md`, `README.md`, and `docs/README.md` to keep the context permanently synchronized.
