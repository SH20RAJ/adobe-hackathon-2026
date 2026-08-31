---
name: structured-entity-audit
description: Validates Schema.org JSON-LD structured data and entity disambiguation links (sameAs).
license: Apache-2.0
allowed-tools:
  - run_command
---

# Structured Data & Entity Disambiguation Audit Skill

## When to use
Use to verify if machines can unambiguously understand brand identity, products, FAQs, and authority links.

## Inputs
* `url` (string, required): The target website URL.

## Procedure
1. Run `python3 skills/structured-entity-audit/scripts/schema_validator.py --url "<URL>"`.
2. Extract all `<script type="application/ld+json">` tags.
3. Validate syntax and mandatory properties against Schema.org standards in `references/schema_blueprints.md`.
4. Check for presence of `sameAs` entity links to Wikidata, Wikipedia, and Crunchbase.
5. Return findings array with synthesized Schema.org JSON-LD fix payloads.

## Output
JSON array of structured data findings with severity and copy-pasteable JSON-LD code.
