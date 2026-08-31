# OmniAudit-GEO: Enterprise Brand AI-Readiness Marketplace

> **Adobe University Hackathon 2026 (CRP) — Round 3 Winner Submission**  
> **Candidate:** Shaswat Raj ([@sh20raj](https://github.com/sh20raj))  
> **Challenge:** [Unstop - Adobe University Hackathon 2026](https://unstop.com/hackathons/crp-adobe-university-hackathon-2026-adobe-1715333)  
> **Live Interactive Showcase & Pitch:** [sh20raj.github.io/adobe-hackathon-2026](https://sh20raj.github.io/adobe-hackathon-2026/)

---

## 🚀 Overview

**OmniAudit-GEO** is a modular, high-performance Agent Skill Marketplace built strictly on the `agentskills.io` standard. It equips autonomous AI agents with the tools to audit any web property for:

1. **Off-Site AI Discoverability (GEO/AEO):** Diagnosing why AI search assistants (ChatGPT Search, Perplexity, Claude, Google AI Overviews) fail to crawl, render, understand, trust, and quote a brand.
2. **On-Site Visitor Engagement:** Diagnosing why visitors referred from AI search engines fail to orient themselves and bounce upon arrival.

---

## 🌟 Interactive Live Pitch & Playground
Access the live interactive pitch, animated audit engine, and architecture explorer at:  
👉 **[https://sh20raj.github.io/adobe-hackathon-2026/](https://sh20raj.github.io/adobe-hackathon-2026/)**

---

## 🏗️ Architecture at a Glance

```
adobe-hackathon-2026/
├── marketplace.json                    <- Top-level Marketplace Manifest
├── README.md                           <- Documentation & Quickstart
├── AGENTS.md                           <- Workspace Agent Protocol & Memory
├── index.html                          <- Interactive Pitch & Showcase Dashboard
├── .github/workflows/deploy-pages.yml  <- Automated GitHub Pages Deployment CI/CD
├── docs/                               <- Master Architecture, Pitch & Defense Guides
│   ├── ARCHITECTURE.md                 <- Master System Architecture & Scoring Engine
│   ├── TECH_STACK_JUSTIFICATION.md     <- Industry Demand & Tech Stack Choices
│   ├── PITCH.md                        <- Executive Presentation & Demo Script
│   └── INTERVIEW_QA_AND_DEFENSE.md     <- Jury Defense & 100/100 Model Q&A
└── skills/                             <- Specialized Agent Skills
    ├── audit-orchestrator/             <- [ENTRYPOINT] Composes all sub-skills & emits JSON
    │   ├── SKILL.md
    │   ├── scripts/audit_runner.py     <- Deterministic sub-second audit runner
    │   ├── scripts/mcp_server.py      <- Model Context Protocol (MCP) JSON-RPC Adapter
    │   └── references/audit_schema.json
    ├── crawl-render-audit/             <- AI Bot Permissions (robots.txt) & Hydration Gaps
    ├── structured-entity-audit/        <- Schema.org JSON-LD & Entity Disambiguation (sameAs)
    ├── aeo-quotability-audit/          <- LLM Quotability, Atomic Facts & Non-Text Assets
    ├── freshness-corroboration-audit/  <- Temporal Staleness & Trust Verification
    └── on-site-engagement-audit/       <- Hero Value Prop Clarity & Cognitive Retention
```

---

## ⚡ Quickstart: Run an Autonomous Audit in Seconds

Execute a comprehensive audit on any domain using the native zero-dependency runner:

```bash
# Run audit and output formatted JSON report:
python3 skills/audit-orchestrator/scripts/audit_runner.py --url "https://example.com"

# Save output to file:
python3 skills/audit-orchestrator/scripts/audit_runner.py --url "https://example.com" --output "report.json"
```

### Run as a Model Context Protocol (MCP) Server
```bash
python3 skills/audit-orchestrator/scripts/mcp_server.py
```

---

## 📚 Master Documentation Suite

Explore the comprehensive research and design documents in [`docs/`](./docs/):

1. **[Master Architecture & Scoring Models](./docs/ARCHITECTURE.md)** — Detailed component topology, dataflow, and mathematical formulation for ACPI and CRS scores.
2. **[Tech Stack Selection & Justification](./docs/TECH_STACK_JUSTIFICATION.md)** — Why Python Async, AST parsers, Docker sandbox, MCP, and `agentskills.io` are in high demand at Adobe.
3. **[Executive Pitch & Presentation Deck](./docs/PITCH.md)** — Complete presentation narrative, hook, demo walkthrough, and Adobe ecosystem synergy.
4. **[Adobe Senior Panel Defense & Interview Q&A](./docs/INTERVIEW_QA_AND_DEFENSE.md)** — 100/100 model answers to technical jury questions on concurrency, hydration, and false positive mitigation.
5. **[Candidate Profile & Strengths Mapping](./docs/03_SHASWAT_RAJ_PROFILE_AND_TEAM_STRENGTHS.md)** — How Shaswat Raj's background (@sh20raj) aligns with this challenge.
6. **[All 7 Strategy & Planning Documents](./docs/README.md)** — Complete historical research and milestone roadmaps.

---

## 📅 Submission Metadata
* **Submission Deadline:** September 13, 2026, 11:59 PM IST
* **Format:** ZIP archive (`≤ 50 MB`) of the marketplace root directory
* **Performance:** `< 15 seconds` execution time (well below the `< 5 minutes` requirement)
* **License:** Apache-2.0
