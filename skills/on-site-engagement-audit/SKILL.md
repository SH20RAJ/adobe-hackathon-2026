---
name: on-site-engagement-audit
description: Audits above-the-fold value prop clarity, cognitive load (Flesch-Kincaid), and search scent retention.
license: Apache-2.0
allowed-tools:
  - run_command
---

# On-Site Visitor Engagement Audit Skill

## When to use
Use to diagnose why visitors referred from AI search engines immediately bounce or fail to take action on the landing page.

## Inputs
* `url` (string, required): The target website URL.

## Procedure
1. Analyze the already-fetched page HTML in the normal audit path; the standalone
   `scripts/engagement_evaluator.py` adapter uses the same bounded fetch and analyzer.
2. Detect meaningful buttons, links, forms, and action categories while excluding
   navigation, footer, social, policy, empty, and decorative links.
3. Evaluate CTA specificity, usable form controls, and whether a contact or conversion
   path exists. Produce a transparent deterministic readiness score.
4. Return structured evidence and targeted remediation. This is a static, read-only
   heuristic and is not a conversion-rate, usability, click-success, or satisfaction
   predictor.

## Output
JSON array of engagement and cognitive retention findings.
