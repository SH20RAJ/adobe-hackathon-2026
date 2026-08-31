---
name: audit-orchestrator
description: Entrypoint orchestrator for the Brand AI-Readiness Marketplace. Composes all sub-skills, aggregates findings, normalizes severities, and emits the standardized JSON audit report.
license: Apache-2.0
allowed-tools:
  - run_command
  - view_file
---

# Brand AI-Readiness Audit Orchestrator (Entrypoint)

## When to use
Use as the single primary entrypoint whenever auditing any website for **Off-site AI Discoverability** (why AI search engines fail to find or cite it) and **On-site Visitor Engagement** (why visitors referred from AI models bounce).

## Inputs
* `url` (string, required): The target website URL to audit (e.g. `https://example.com` or `example.com`).

## Procedure
1. **Target Normalization:** Normalize the input URL to ensure standard protocol (`https://`). Extract the base domain.
2. **Execute Unified Python Audit Engine:** Run the bundled deterministic audit engine:
   ```bash
   python3 skills/audit-orchestrator/scripts/audit_runner.py --url "<URL>"
   ```
3. **Compose Specialized Diagnostic Skills:**
   * **`crawl-render-audit`:** Inspects `robots.txt` AI user-agents, headers, and client-side JS hydration gaps.
   * **`structured-entity-audit`:** Extracts and validates Schema.org JSON-LD AST and `sameAs` entity links.
   * **`aeo-quotability-audit`:** Measures atomic fact density, heading semantics, and non-text locked data.
   * **`freshness-corroboration-audit`:** Evaluates temporal staleness and cross-page trust signals.
   * **`on-site-engagement-audit`:** Analyzes 5-second hero value proposition, reading grade, and CTA visibility.
4. **Aggregate & Prioritize Findings:** Deduplicate findings, calculate summary severity counts (`critical`, `high`, `medium`, `low`), and attach proactive fix blueprints.
5. **Emit Compliant JSON Report:** Output the final audit report conforming strictly to `references/audit_schema.json`.

## Output
Emits a structured JSON document conforming to the official Adobe Round 3 Audit Report Schema.
