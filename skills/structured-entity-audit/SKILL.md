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
1. In the normal audit path, analyze the already-fetched page HTML; the standalone
   `scripts/schema_validator.py` adapter uses the same bounded fetch and analyzer.
2. Extract all `<script type="application/ld+json">` tags.
3. Parse single objects, top-level arrays, and `@graph` node collections.
4. Summarize recognized Organization, WebSite, WebPage, Article, Product, Person,
   and LocalBusiness nodes, including useful fields, `sameAs`, and `@id` links.
5. Report malformed blocks with their indexes and distinguish missing, unknown, and
   recognized entity data. `sameAs` values are reported as machine-readable
   relationships; they are not independently treated as authoritative.
6. Return findings with serialized structured evidence and targeted remediation.

## Output
JSON array of structured data findings with severity and copy-pasteable JSON-LD code.
