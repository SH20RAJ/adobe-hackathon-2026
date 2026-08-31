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
1. Run `python3 skills/on-site-engagement-audit/scripts/engagement_evaluator.py --url "<URL>"`.
2. Evaluate hero section text for 5-second value proposition clarity.
3. Compute readability scores (Flesch-Kincaid) and sentence length distribution.
4. Assess Call to Action (CTA) discoverability and cognitive friction.
5. Return findings array with suggestions for hero headline and CTA refinement.

## Output
JSON array of engagement and cognitive retention findings.
