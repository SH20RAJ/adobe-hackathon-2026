# Adobe Marketplace Submission & Packaging Specification

This document defines the packaging boundaries, submission requirements, and standard compliance for the **Adobe University Hackathon 2026 (Round 3 CRP)**.

---

## 🏛️ Challenge Context & Standard Compliance

* **Competition:** Adobe University Hackathon 2026 (Campus Recruitment Program) — Round 3
* **Specification:** `agentskills.io` Agent Skill Marketplace Standard
* **Constraint:** Standalone submission ZIP archive must be **$\le 50$ MB**, provider-neutral, read-only, and fully self-contained.

---

## 📦 The Four Distinct Artifact Boundaries

To avoid confusion between development tools and hackathon deliverables, OmniAudit-GEO maintains four strictly separated artifact boundaries:

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. ADOBE MARKETPLACE SUBMISSION ZIP (`omniaudit-geo-marketplace.zip`)                     │
│    • Size: ~0.09 MB (Strictly below the 50 MB limit)                                     │
│    • Contents: ONLY `marketplace.json`, `README.md`, and `skills/**`                      │
│    • Purpose: Direct upload to Unstop hackathon portal as the submittable marketplace.   │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│ 2. PYTHON PACKAGE INSTALLATION (`pip install -e .`)                                      │
│    • Defined by: `pyproject.toml` and `setup.py`                                         │
│    • Provides: CLI console scripts `omni` and `omniaudit`                                │
│    • Purpose: Local command-line execution and developer tooling.                        │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│ 3. DOCKER / OCI CONTAINER (`ghcr.io/sh20raj/omniaudit-geo:stable`)                       │
│    • Built from: `Dockerfile` (Python 3.12-slim, non-root user)                          │
│    • Provides: Containerized FastAPI runtime, Gradio 6 UI, and remote MCP server.        │
│    • Purpose: Cloud deployment on Render, DigitalOcean App Platform, or Kubernetes.     │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│ 4. SOURCE REPOSITORY (`SH20RAJ/omniaudit`)                                               │
│    • Contents: Full workspace including tests, CI workflows, benchmarks, docs, assets.  │
│    • Purpose: Collaborative open-source development and version history.                 │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📜 Marketplace Manifest (`marketplace.json`)

The official entrypoint manifest is [`marketplace.json`](../marketplace.json), which registers the six skills and declares the canonical orchestrator:

```json
{
  "name": "brand-ai-readiness-audit",
  "version": "1.0.0",
  "description": "Enterprise Agent Skill Marketplace for auditing website AI Discoverability (GEO/AEO) and On-site Visitor Engagement.",
  "author": "Shaswat Raj (@sh20raj) & Prithvi (@chikolavosaki-sys)",
  "license": "Apache-2.0",
  "skills": [
    {
      "id": "audit-orchestrator",
      "path": "skills/audit-orchestrator",
      "entrypoint": true,
      "description": "Master orchestrator that composes all sub-skills, aggregates findings, and emits the standardized JSON audit report."
    },
    {
      "id": "crawl-render-audit",
      "path": "skills/crawl-render-audit",
      "description": "Audits robots.txt AI crawler policies, response headers, and evidence-based JS hydration content gaps."
    },
    {
      "id": "structured-entity-audit",
      "path": "skills/structured-entity-audit",
      "description": "Validates Schema.org JSON-LD structured data and entity disambiguation links (sameAs)."
    },
    {
      "id": "aeo-quotability-audit",
      "path": "skills/aeo-quotability-audit",
      "description": "Audits deterministic content quotability signals, factual text structure, and facts locked in non-text assets."
    },
    {
      "id": "freshness-corroboration-audit",
      "path": "skills/freshness-corroboration-audit",
      "description": "Audits explicit freshness metadata and on-page corroboration/trust signals without verifying factual truth."
    },
    {
      "id": "on-site-engagement-audit",
      "path": "skills/on-site-engagement-audit",
      "description": "Audits static on-site action paths, CTA specificity, usable forms, and navigation noise."
    }
  ]
}
```

---

## 🗂️ Skill Structure & Progressive Disclosure

Every skill in `skills/` strictly complies with the `agentskills.io` standard directory layout:

```text
skills/<skill-id>/
├── SKILL.md                 # Agent instructions with valid YAML frontmatter
├── scripts/                 # Deterministic Python AST analysis scripts
├── references/              # JSON schemas, severity matrices, and blueprints
└── tests/                   # Autonomous unit tests and offline HTML fixtures
```

### Progressive Disclosure Rules
1. **`SKILL.md` is Lean:** It contains high-level operational prompts, parameters, and step-by-step dispatch recipes for AI agents.
2. **Deterministic Code in `scripts/`:** Heavy DOM parsing, AST traversal, regex evaluation, and math are implemented in native Python scripts.
3. **Schemas in `references/`:** Expected inputs, outputs, and severity definitions are maintained in clean JSON and Markdown reference files.

---

## 🛠️ Automated Packaging & Sandbox Validation

The submission archive is built and validated using [`scripts/package_submission.py`](../scripts/package_submission.py):

```bash
# Build and sandbox-verify the official submission package
python3 scripts/package_submission.py
# or via CLI:
omni package
```

### What `package_submission.py` Enforces:
1. **Strict Inclusion Filter:** Only `marketplace.json`, `README.md`, and valid files in `skills/**` are included.
2. **Strict Exclusion Filter:** Excludes `__pycache__`, `.pytest_cache`, `.git`, `.github`, `docs/`, `scripts/`, `Dockerfile`, virtual environments, and temporary files.
3. **Archive Size Assertion:** Asserts that the final ZIP file is well under the 50 MB Unstop limit (current size: **0.09 MB / 68 files**).
4. **Sandbox Execution Verification:** Automatically unzips the archive into an isolated temporary directory, runs the test runner inside the sandbox, and verifies that the entrypoint executes without repository-level dependencies.
