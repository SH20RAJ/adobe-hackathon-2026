---
name: verification-loop
description: Run the 4-gate automated verification loop across Python unittests, benchmarks, schema integrity, and Next.js build.
---

# Verification Loop Skill

Use this skill before concluding any task, submitting a PR, or deploying changes.

## Verification Checklist

1. **Unit Tests (106+ tests):**
   - Crawl & safe_fetch tests:
     ```bash
     python3 -m unittest discover -s skills/crawl-render-audit/tests
     ```
   - Orchestrator, entity, AEO, freshness, and engagement tests:
     ```bash
     python3 -m unittest discover -s skills/audit-orchestrator/tests
     ```

2. **Benchmark Fixtures Evaluation:**
   - 14 golden fixtures evaluated for score boundaries and specific findings.
     ```bash
     python3 -m unittest skills/audit-orchestrator/tests/test_benchmark.py
     ```

3. **Next.js & Vinext Production Build:**
   - Verify zero TypeScript or build errors:
     ```bash
     cd omniaudit-geo && bun run build && cd ..
     ```

4. **One-Command Full Verification:**
   Run the master verification runner:
   ```bash
   python3 scripts/verify.py
   ```
