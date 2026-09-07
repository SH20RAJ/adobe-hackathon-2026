# Testing & Quality Assurance Standards

## 1. Zero-Regression Requirement
- All automated tests across `skills/audit-orchestrator/tests` and `skills/crawl-render-audit/tests` must pass 100% of the time.
- Any new feature or bugfix must include corresponding unit tests in the appropriate `tests/` directory.

## 2. Test-Driven Development (TDD)
- When adding new heuristic rules, create HTML fixtures first in `tests/fixtures/` illustrating the target pattern (e.g. edge-case Schema.org graphs, tricky robots directives).
- Run the test to observe failure (RED), implement the heuristic in the skill script (GREEN), and refactor for performance and readability (REFACTOR).

## 3. Offline Benchmark Invariant
- Test suites must NEVER initiate live network calls during automated test execution.
- Use mock responses or static HTML fixtures to guarantee reproducibility in CI/CD and offline evaluation.

## 4. Verification Command
Always run the verification harness before concluding:
```bash
python3 scripts/verify.py
```
