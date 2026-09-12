# Contributing to OmniAudit-GEO

Thank you for your interest in contributing to **OmniAudit-GEO**! We welcome contributions from developers, researchers, and open-source enthusiasts building the next generation of autonomous Brand AI-Readiness and Generative Engine Optimization (GEO/AEO) tools.

---

## Code of Conduct

This project and everyone participating in it is governed by the [OmniAudit-GEO Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

---

## How Can I Contribute?

* **Report Bugs:** Open an issue describing the defect with reproducible steps, expected vs. actual behavior, and environment details.
* **Suggest Enhancements:** Propose new heuristics, specialist diagnostic skills, or benchmark fixtures.
* **Contribute Golden Benchmarks:** Add ground-truth labeled fixtures to `skills/audit-orchestrator/tests/fixtures/` to expand precision/recall evaluation.
* **Improve Documentation:** Enhance developer guides, architecture specifications, or API documentation.
* **Submit Pull Requests:** Implement bug fixes, performance optimizations, or new capabilities conforming to the 6-gate verification standard.

---

## Development Setup

### Prerequisites
* Python 3.12+
* Git
* Optional: Docker (for containerized testing)

### Local Setup
1. Fork and clone the repository:
   ```bash
   git clone https://github.com/<your-username>/adobe-hackathon-2026.git
   cd adobe-hackathon-2026
   ```

2. Create and activate a virtual environment:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r omniaudit-geo/requirements.txt pytest
   ```

4. Run the local FastAPI development server:
   ```bash
   uvicorn main:app --app-dir omniaudit-geo --reload --port 8000
   ```

---

## Architectural Guardrails & Invariants

When submitting code to OmniAudit-GEO, the following invariants **must never be violated**:

1. **Strict Read-Only Networking:** No outgoing mutating requests (`POST`, `PUT`, `DELETE`). Audits must only use `GET` and `HEAD`.
2. **Mandatory SSRF Protection:** All external network fetches must route through `safe_fetch.py` (rejecting loopback, link-local metadata, RFC 1918 private subnets, non-web ports, and DNS rebinding).
3. **Canonical Python AST / DOM Engine:** Core heuristics must remain deterministic and executable offline using Python standard library parsers (`html.parser`, `urllib`, `re`, `json`).
4. **Schema Compliance:** The composite output from `run_full_audit()` must strictly validate against `skills/audit-orchestrator/references/audit_schema.json`.
5. **No Client-Side React/JS Runtime Dependencies:** The web control plane uses pure FastAPI and Gradio 6 without external JavaScript toolchains.

---

## Verification Before Submitting PRs

Every change must pass the automated 6-gate verification suite:

```bash
# Run the complete 6-gate verification loop:
python3 scripts/verify.py --ci

# Single final check gate:
python3 scripts/final_check.py
```

Expected output:
```text
✅ ALL 6 VERIFICATION GATES PASSED — SUBMISSION READY
FINAL SUBMISSION: PASS
```

---

## Git Commit & Pull Request Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

* `feat(...)`: New feature or audit capability
* `fix(...)`: Bug fix
* `docs(...)`: Documentation updates
* `test(...)`: Adding or updating test suites / fixtures
* `refactor(...)`: Code refactoring without behavior change
* `chore(...)`: Maintenance, dependency, or packaging tasks

### PR Submission Checklist
- [ ] Code follows project coding style and architectural invariants.
- [ ] New tests added for any new feature or heuristic.
- [ ] `python3 scripts/verify.py --ci` passes all 6 verification gates.
- [ ] No secrets, tokens, or credential files included in the diff.
- [ ] Commit message conforms to Conventional Commits.
