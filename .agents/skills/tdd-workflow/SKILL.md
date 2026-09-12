---
name: tdd-workflow
description: Enforce strict Test-Driven Development (Red-Green-Refactor) for OmniAudit-GEO heuristic updates and bug fixes.
---

# Test-Driven Development (TDD) Workflow

Follow this systematic 4-phase discipline whenever adding new heuristics, parser rules, or bugfixes to OmniAudit-GEO:

## Phase 1: Test Case & Fixture Creation (RED)
1. Add an HTML fixture reproducing the exact scenario in `skills/audit-orchestrator/tests/fixtures/benchmark/` or `skills/crawl-render-audit/tests/fixtures/`.
2. Write a unit test asserting the expected finding, severity, or score impact.
3. Run the test to confirm failure:
   ```bash
   python3 -m unittest discover -s skills/audit-orchestrator/tests
   ```

## Phase 2: Minimal Implementation (GREEN)
1. Implement the minimal necessary logic in the target skill script (e.g. `quotability_scorer.py`, `crawl_inspector.py`, `schema_validator.py`).
2. Re-run the test to confirm it now passes.

## Phase 3: Cross-Skill Impact & Refactoring (REFACTOR)
1. Ensure no regressions across the 16 golden benchmark fixtures.
2. Refactor regex patterns or parsing logic for clarity and execution speed.
3. Verify test execution time remains < 50ms.

## Phase 4: Verification
Execute the full verification loop:
```bash
python3 scripts/verify.py
```
