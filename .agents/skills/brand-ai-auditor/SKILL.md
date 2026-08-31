---
name: brand-ai-auditor
description: Workspace skill for Antigravity AI to audit any web domain for AI Discoverability and On-site Engagement using the OmniAudit-GEO marketplace.
license: Apache-2.0
---

# Brand AI Auditor Workspace Skill

## When to use
Activate this skill whenever the user or system requests an automated AI discoverability, GEO (Generative Engine Optimization), Schema.org JSON-LD, or user engagement audit for a URL.

## Execution Steps
1. Run the master orchestrator CLI from the project root:
   ```bash
   python3 skills/audit-orchestrator/scripts/audit_runner.py --url "<TARGET_URL>"
   ```
2. Read the resulting JSON output to interpret finding severities, ACPI (AI Citation Probability Index), and CRS (Cognitive Retention Score).
3. Present the findings with prioritized remediation code blocks.
