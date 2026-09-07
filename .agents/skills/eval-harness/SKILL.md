---
name: eval-harness
description: Run accuracy and benchmark evaluations across the 14 Golden Fixtures for ACPI and CRS scores.
---

# Evaluation Harness Skill

Executes the offline evaluation benchmark to score and calibrate OmniAudit-GEO against canonical test fixtures.

## Execution Command
```bash
python3 -m unittest skills/audit-orchestrator/tests/test_benchmark.py
```

## Benchmark Scenarios
The eval harness tests 14 distinct real-world architectural scenarios:
1. `crawler_blocked.html`: Ensures blocked AI user-agents yield critical finding and low ACPI.
2. `hydration_spa.html`: Ensures client-only SPAs trigger hydration gap warning.
3. `next-ssr.html` & `next-rsc.html`: Verifies proper detection of server-rendered React payloads.
4. `bad_structured.html` vs `good_structured.html`: Tests Schema.org JSON-LD extraction and `sameAs` entity authority.
5. `weak_aeo.html` vs `strong_aeo.html`: Tests atomic fact density, question headings, and table quotability.
6. `stale_article.html` vs `current_article.html`: Tests temporal decay scoring.
7. `weak_engagement.html` vs `strong_engagement.html`: Tests hero clarity, reading grade, and CTA detection.
8. `documentation.html` & `navigation_noise.html`: Tests documentation layouts and content-to-noise ratio.
