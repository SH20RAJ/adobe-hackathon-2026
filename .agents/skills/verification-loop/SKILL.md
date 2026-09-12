---
name: verification-loop
description: Run the 6-gate automated verification loop across security, unittests, 16 benchmarks, schema integrity, FastAPI, and marketplace packaging.
---

# Verification Loop Skill

Use this skill before concluding any task, submitting a PR, or deploying changes.

## Verification Checklist

1. **Unit Tests (150+ dynamically discovered tests):**
   - Crawl, render & safe_fetch SSRF defense tests:
     ```bash
     python3 -m unittest discover -s skills/crawl-render-audit/tests
     ```
   - Orchestrator, entity, AEO, freshness, engagement, MCP server & schema tests:
     ```bash
     python3 -m unittest discover -s skills/audit-orchestrator/tests
     ```

2. **Benchmark Fixtures Evaluation:**
   - 16 golden fixtures evaluated for score boundaries and specific findings:
     ```bash
     python3 scripts/eval_benchmarks.py
     ```

3. **FastAPI Web Control Plane & MCP Server:**
   - Verify zero import or route errors:
     ```bash
     python3 -m unittest discover -s omniaudit-geo/tests
     ```

4. **One-Command Master 6-Gate Verification:**
   Run the master verification runner:
   ```bash
   python3 scripts/verify.py
   ```
