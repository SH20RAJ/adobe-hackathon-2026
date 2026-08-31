---
name: aeo-quotability-audit
description: Audits atomic fact quotability for LLMs, content density, and facts locked in non-text assets.
license: Apache-2.0
allowed-tools:
  - run_command
---

# AEO Quotability & Non-Text Data Audit Skill

## When to use
Use to diagnose why AI search engines (ChatGPT Search, Perplexity) fail to extract direct quotes, definitions, or pricing specs from a website.

## Inputs
* `url` (string, required): The target website URL.

## Procedure
1. Run `python3 skills/aeo-quotability-audit/scripts/quotability_scorer.py --url "<URL>"`.
2. Parse DOM heading structures (`H1` through `H6`) for logical hierarchy and question-answering formats.
3. Detect facts locked in non-text (images without descriptive `alt` text).
4. Measure atomic fact density and Content-to-Noise Ratio.
5. Return findings array with suggestions for high-quotability summary blocks.

## Output
JSON array of AEO findings and content refactoring templates.
