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
1. Analyze the already-fetched page HTML in the normal audit path; the standalone
   `scripts/quotability_scorer.py` adapter uses the same bounded fetch and analyzer.
2. Measure visible words, meaningful headings, substantive text blocks, direct-answer
   signals, factual markers, lists, tables, FAQ-like blocks, and informative images.
3. Detect conservative extractability issues such as missing/multiple H1 headings,
   low machine-readable quotability signals, hidden content, and missing alt text on
   likely informative images.
4. Return a transparent 0-100 heuristic score with its component metrics. This score
   is not an official Adobe metric and does not predict a particular model's ranking.

## Output
JSON array of AEO findings and content refactoring templates.
