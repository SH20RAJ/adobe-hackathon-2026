---
name: freshness-corroboration-audit
description: Audits temporal freshness signals, trust markers, and cross-web claim corroboration.
license: Apache-2.0
allowed-tools:
  - run_command
---

# Freshness & Trust Corroboration Audit Skill

## When to use
Use to detect stale content, outdated temporal signals, or uncorroborated claims that cause AI assistants to downrank or ignore site data.

## Inputs
* `url` (string, required): The target website URL.

## Procedure
1. Analyze the already-fetched page HTML in the normal audit path; the standalone
   `scripts/trust_corroborator.py` adapter uses the same bounded fetch and analyzer.
2. Normalize explicit JSON-LD, meta, `<time>`, and labelled visible dates while
   treating copyright years as context rather than proof of staleness.
3. Detect structural corroboration signals such as external references, citation
   blocks, author/byline, organization identity, `sameAs`, and contact/about signals.
4. Return transparent evidence and conservative freshness/trust findings. These are
   observed signals, not factual truth or authority verification.

## Output
JSON array of freshness and trust findings with remediation priority.
