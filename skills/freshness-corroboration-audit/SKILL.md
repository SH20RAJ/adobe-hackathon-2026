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
1. Run `python3 skills/freshness-corroboration-audit/scripts/trust_corroborator.py --url "<URL>"`.
2. Scan for temporal staleness markers (copyright years, `article:modified_time`).
3. Verify contact transparency (verifiable Name, Address, Phone, Privacy Policy).
4. Return findings array with suggestions for updating freshness anchors.

## Output
JSON array of freshness and trust findings with remediation priority.
