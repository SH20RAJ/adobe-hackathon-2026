# Adobe University Hackathon 2026 — Brand AI-Readiness Marketplace

> **Round 3: Build the Agent Skill Marketplace**  
> **Candidate:** Shaswat Raj ([@sh20raj](https://github.com/sh20raj))  
> **Challenge:** [Unstop - Adobe University Hackathon 2026](https://unstop.com/hackathons/crp-adobe-university-hackathon-2026-adobe-1715333)

---

## 🚀 Overview

This repository contains the winning research, strategy, architecture, and implementation for **Round 3 of the Adobe University Hackathon 2026**.

The goal is to build a multi-skill **Agent Skills Marketplace** adhering to the standard `agentskills.io` specification that enables an autonomous AI agent to audit any website for:
1. **Off-site AI Discoverability:** Diagnosing why AI search assistants (ChatGPT Search, Perplexity, Claude, Google AI Overviews) fail to find, index, understand, trust, and quote a brand.
2. **On-site Visitor Engagement:** Diagnosing why visitors referred from AI search engines fail to orient themselves and bounce upon arrival.

---

## 📚 Comprehensive Documentation Suite

All in-depth research, architectural blueprints, competitive benchmarks, and candidate profile analysis are available in the [`docs/`](./docs/) directory:

1. **[01. Round 3 Deep Dive & Problem Breakdown](./docs/01_ADOBE_HACKATHON_2026_ROUND3_DEEP_DIVE.md)** — Analysis of prompt constraints, evaluation rubric, and mathematical criteria.
2. **[02. Previous Winners & Benchmark Analysis](./docs/02_PREVIOUS_WINNERS_AND_BENCHMARK_ANALYSIS.md)** — What separates 1st place Adobe hackathon winners from runners-up.
3. **[03. Shaswat Raj Profile & Competitive Strengths](./docs/03_SHASWAT_RAJ_PROFILE_AND_TEAM_STRENGTHS.md)** — Mapping candidate open-source experience (`MCPPure`, `IndexFast`, `CodeSeek`) to Round 3 advantages.
4. **[04. Master Winning Strategy & System Architecture](./docs/04_MASTER_WINNING_STRATEGY_AND_SYSTEM_ARCHITECTURE.md)** — Architectural design, 5-skill decomposition, and dataflow.
5. **[05. Skill Specifications & Prompt Engineering](./docs/05_SKILL_SPECIFICATIONS_AND_PROMPT_ENGINEERING.md)** — `agentskills.io` compliant specifications for all marketplace skills.
6. **[06. Execution Timeline & Milestone Roadmap](./docs/06_EXECUTION_TIMELINE_AND_MILESTONE_ROADMAP.md)** — Day-by-day roadmap leading to the September 13 submission.

---

## 🏗️ Architecture at a Glance

```
brand-ai-readiness-audit/
├── marketplace.json                    <- Top-level Marketplace Manifest
├── README.md                           <- Documentation & Quickstart
├── skills/
│   ├── audit-orchestrator/             <- [ENTRYPOINT] Composes subordinate skills
│   ├── crawl-render-audit/             <- AI Bot Permissions (robots.txt) & Hydration Gaps
│   ├── structured-entity-audit/        <- Schema.org JSON-LD & Entity Disambiguation (sameAs)
│   ├── aeo-quotability-audit/          <- LLM Quotability, Atomic Facts & Non-Text Data
│   ├── freshness-corroboration-audit/  <- Temporal Signals, Trust & Cross-Web Consistency
│   └── on-site-engagement-audit/       <- Value Prop Clarity, Readability & Bounce Risk
```

---

## 📅 Submission Details
* **Submission Deadline:** September 13, 2026, 11:59 PM IST
* **Format:** ZIP package (`≤ 50 MB`) of the marketplace root directory
* **Runtime:** `< 5 minutes` per site audit (deterministic scripts complete in `< 30 seconds`)
