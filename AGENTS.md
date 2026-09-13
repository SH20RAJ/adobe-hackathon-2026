# AGENTS.md — Repository-Wide AI Agent Operating Contract

This document defines the execution protocol, invariants, and boundaries for all autonomous AI coding agents (Antigravity AI, Claude Code, Cursor, Windsurf) operating in this repository.

---

## 🏛️ Project Identity & Mission

* **Project:** OmniAudit-GEO (`brand-ai-readiness-audit`)
* **Context:** Adobe University Hackathon 2026 (Campus Recruitment Program) — Round 3
* **Standard:** `agentskills.io` Agent Skill Marketplace Standard
* **Core Goal:** Audit websites across two interconnected axes:
  1. **Off-site AI Discoverability (GEO/AEO):** Machine crawler accessibility, Schema.org entities, and atomic fact quotability (ACPI: 0–100).
  2. **On-site Visitor Retention (CRS):** Above-the-fold value proposition clarity, reading ease, and conversion orientation (CRS: 0–100).

---

## 🔒 Mandatory Invariants for Agent Modifications

1. **Strict Read-Only Operations:** All crawler and fetch requests must use HTTP `GET` or `HEAD`. Never emit mutating requests (`POST`, `PUT`, `DELETE`).
2. **Zero External API Dependencies:** The core AST and scoring engine in `skills/` must execute 100% offline using the Python standard library (`urllib`, `html.parser`, `re`, `json`, `math`). No cloud LLM API calls are permitted for core audits.
3. **Single Source of Truth:** Core diagnostic logic lives strictly in `skills/**/scripts/`. Adapters (`cli.py`, `omniaudit-geo/main.py`, `omniaudit-geo/gradio_ui.py`) must import and invoke canonical scripts directly without duplicating logic.
4. **`agentskills.io` Directory Integrity:** Never break the layout of `skills/<skill-id>/` (`SKILL.md`, `scripts/`, `references/`, `tests/`).
5. **Output Schema Compliance:** All final reports emitted by `audit-orchestrator` must validate against `skills/audit-orchestrator/references/audit_schema.json`.
6. **Marketplace Submission Boundary:** Never pollute `omniaudit-geo-marketplace.zip` with repository tooling, docs, or web adapters. The ZIP must only contain `marketplace.json`, `README.md`, and `skills/` ($\le 50$ MB).

---

## ⚡ Agent Operational Commands

```bash
# 1. Run full 6-gate verification loop (Mandatory before PR/commit)
python3 scripts/verify.py --ci

# 2. Run single pre-submission pass gate
python3 scripts/final_check.py

# 3. Run full site audit via unified CLI
python3 cli.py --url "https://example.com"

# 4. Run isolated 16 Golden Benchmarks evaluation harness
python3 cli.py benchmark

# 5. Rebuild and sandbox-verify the submission archive
python3 cli.py package
```

---

## 🧭 Canonical Documentation Links for Agents

When reasoning about system components, **always read the canonical documentation** rather than relying on cached memory:

* **Architecture & Scoring Math:** [`docs/architecture.md`](docs/architecture.md)
* **Marketplace Spec & Submission Boundary:** [`docs/marketplace.md`](docs/marketplace.md)
* **Specialist Skills Heuristics:** [`docs/skills.md`](docs/skills.md)
* **CLI Reference & Options:** [`docs/cli.md`](docs/cli.md)
* **REST API & Guardrails:** [`docs/api.md`](docs/api.md)
* **Model Context Protocol (MCP):** [`docs/mcp.md`](docs/mcp.md)
* **Security & Anti-SSRF Defenses:** [`docs/security.md`](docs/security.md)
* **Testing & Quality Gates:** [`docs/testing.md`](docs/testing.md)
* **16 Golden Benchmarks Matrix:** [`docs/benchmarking.md`](docs/benchmarking.md)
* **Deployment & Container Specs:** [`docs/deployment.md`](docs/deployment.md)
* **Judge Defense & FAQ:** [`docs/judging.md`](docs/judging.md)
