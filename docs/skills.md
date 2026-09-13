# Specialist Skills Catalog & Diagnostic Rubrics

This document provides the authoritative technical reference for all six skills within the **OmniAudit-GEO** marketplace.

---

## Overview of the Skill Matrix

| Skill ID | Category | Primary Detection Target | Primary Script |
| :--- | :--- | :--- | :--- |
| **`audit-orchestrator`** | Master Entrypoint | Multi-skill dispatch, severity deduplication, JSON synthesis | `audit_runner.py` |
| **`crawl-render-audit`** | Off-Site Discoverability | AI crawler permissions (`robots.txt`), JS hydration content gaps | `crawl_inspector.py` |
| **`structured-entity-audit`** | Off-Site Discoverability | Schema.org JSON-LD validity, `sameAs` entity graph links | `schema_validator.py` |
| **`aeo-quotability-audit`** | Off-Site Discoverability | Atomic fact density, Q&A headings, facts in non-text images | `quotability_scorer.py` |
| **`freshness-corroboration-audit`**| On-Site & Off-Site | Temporal staleness, author bylines, trust corroboration | `trust_corrobator.py` |
| **`on-site-engagement-audit`** | On-Site Retention | Above-the-fold value prop, reading ease (Flesch/ARI), CTAs | `engagement_evaluator.py` |

---

## 1. `audit-orchestrator` (Master Entrypoint)

* **Location:** [`skills/audit-orchestrator`](../skills/audit-orchestrator)
* **Manifest Status:** `"entrypoint": true`
* **Purpose:** Acts as the master coordinator. Validates the target URL, executes the bounded network fetch, parses raw HTML into memory once, dispatches specialist diagnostics, normalizes severity codes, computes composite scores, and outputs a schema-validated report.
* **Key Scripts:**
  * `scripts/audit_runner.py`: Core execution pipeline and CLI runner.
  * `scripts/mcp_server.py`: Anthropic Model Context Protocol JSON-RPC 2.0 server.
  * `scripts/scoring.py`: Mathematical calculation of ACPI (0–100) and CRS (0–100).
  * `scripts/schema_validator.py`: Report validation against `references/audit_schema.json`.
* **Inputs:** `url` (string, required), `output_format` (`text`, `json`, `markdown`), `output_file` (optional path).
* **Outputs:** Conforms strictly to [`references/audit_schema.json`](../skills/audit-orchestrator/references/audit_schema.json) with required top-level keys:
  * `site`: Normalized domain and URL audited.
  * `audited_at`: ISO 8601 UTC timestamp.
  * `scores`: ACPI and CRS composite scores with sub-component breakdowns.
  * `summary`: `total_findings`, `critical`, `high`, `medium`, `low`.
  * `findings`: Array of standardized finding objects (`id`, `category`, `severity`, `title`, `description`, `evidence`, `remediation`).
  * `remediation_assets`: Generated JSON-LD snippet, optimized `robots.txt`, and `llms.txt`.
* **Tests:** `skills/audit-orchestrator/tests/test_schema_validation.py`, `test_benchmark.py`, `test_mcp.py`.

---

## 2. `crawl-render-audit` (AI Bot Permissions & Hydration Gaps)

* **Location:** [`skills/crawl-render-audit`](../skills/crawl-render-audit)
* **Purpose:** Audits whether AI search crawlers can access the site, and checks whether the static HTML sent to crawlers lacks content compared to client-rendered JavaScript hydration.
* **Detection Logic:**
  1. **Robots.txt Analysis:** Fetches and evaluates `/robots.txt` directives for 7 major AI bot user-agents: `GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`, `Bytespider`, `Applebot-Extended`, and `CCBot`. Evaluates `Allow` vs. `Disallow` rules with exact-match and wildcard precedence.
  2. **Response Header Directives:** Inspects `X-Robots-Tag` and `<meta name="robots">` for `noindex`, `nofollow`, or `noai`.
  3. **Hydration Gap Scanner:** Compares the static HTML content length and semantic tags against indicators of client-only rendering (e.g. empty `<div id="root"></div>`, large `__NEXT_DATA__` states with empty DOM, or client-rendered framework bundles).
* **Severity Rubric:**
  * **Critical:** Disallow all AI crawlers (`Disallow: /`) or blank HTML root.
  * **High:** Disallow specific major AI crawlers (e.g., `GPTBot` or `ClaudeBot`) while allowing generic crawlers.
  * **Medium:** Significant hydration gap where core content requires client-side JavaScript execution.
  * **Low:** Missing XML sitemap reference in `robots.txt`.
* **Tests:** `skills/crawl-render-audit/tests/test_robots.py`, `test_hydration_detector.py`, `test_safe_fetch.py`, `test_security_adversarial.py`.

---

## 3. `structured-entity-audit` (Schema.org & Entity Graphs)

* **Location:** [`skills/structured-entity-audit`](../skills/structured-entity-audit)
* **Purpose:** Validates Schema.org JSON-LD microdata and entity disambiguation to prevent LLMs from hallucinating brand facts.
* **Detection Logic:**
  1. **Schema Extraction:** Parses all `<script type="application/ld+json">` tags and validates JSON syntax.
  2. **Entity Type Recognition:** Verifies the presence of key schemas: `Organization`, `WebSite`, `Product`, `Article`, `FAQPage`, `LocalBusiness`.
  3. **Entity Disambiguation (`sameAs`):** Validates the `sameAs` array for authoritative knowledge graph anchors (Wikidata, Wikipedia, LinkedIn, Crunchbase, official social channels).
  4. **Proactive Blueprinting:** If `Organization` schema is missing or incomplete, auto-generates a ready-to-paste JSON-LD blueprint customized with the site's brand name.
* **Severity Rubric:**
  * **High:** Complete absence of Schema.org JSON-LD on a commercial brand page.
  * **Medium:** Missing `sameAs` disambiguation links in `Organization` schema.
  * **Low:** Syntactically valid schema missing optional recommended fields (e.g. `logo`, `contactPoint`).
* **Tests:** `skills/audit-orchestrator/tests/test_structured_data.py`.

---

## 4. `aeo-quotability-audit` (AEO & Atomic Fact Density)

* **Location:** [`skills/aeo-quotability-audit`](../skills/aeo-quotability-audit)
* **Purpose:** Evaluates whether content is structured for direct quotation and atomic fact retrieval by generative answer engines.
* **Detection Logic:**
  1. **Atomic Fact Density:** Measures the frequency of verifiable atomic assertions (numbers, percentages, dates, currencies, specifications) per 100 words.
  2. **Interrogative Heading Structure:** Scans for question-oriented headings (`H2`, `H3` matching *What*, *How*, *Why*, *When*, *Pricing*) immediately followed by direct 1-to-2 sentence answer paragraphs.
  3. **Non-Text Locked Facts:** Identifies tabular or structured data rendered as images without accessible HTML tables (`<table>`, `<th>`) or lacking descriptive `alt` text.
* **Severity Rubric:**
  * **High:** Core pricing or technical specifications locked in image assets without HTML text fallbacks.
  * **Medium:** Extremely low atomic fact density (< 1 fact per 200 words); excessive marketing fluff.
  * **Low:** Broken heading nesting (e.g., `H1` jumping directly to `H4`).
* **Tests:** `skills/audit-orchestrator/tests/test_aeo_quotability.py`.

---

## 5. `freshness-corroboration-audit` (Freshness & Trust Corroboration)

* **Location:** [`skills/freshness-corroboration-audit`](../skills/freshness-corroboration-audit)
* **Purpose:** Evaluates temporal freshness metadata and on-page publisher trust markers that AI models use to score source credibility.
* **Detection Logic:**
  1. **Temporal Decay:** Inspects publication dates (`datePublished`, `dateModified`, `<time>`, meta tags) against current year (2026). Flags stale content that has not been updated in over 24 months.
  2. **Copyright Freshness:** Inspects footer copyright declarations for severely outdated years (e.g. 2021 or older).
  3. **On-Page Corroboration Signals:** Verifies author bylines, editorial review notices, contact details, transparent physical addresses, and clear privacy/terms policy links.
  *Note: OmniAudit-GEO inspects on-page trust signals; it does not attempt to verify the factual truth of arbitrary real-world claims.*
* **Severity Rubric:**
  * **Medium:** Outdated timestamps on time-sensitive documentation or pricing pages.
  * **Low:** Missing author attribution or missing link to editorial/privacy policies.
* **Tests:** `skills/audit-orchestrator/tests/test_freshness_trust.py`.

---

## 6. `on-site-engagement-audit` (On-Site Cognitive Retention)

* **Location:** [`skills/on-site-engagement-audit`](../skills/on-site-engagement-audit)
* **Purpose:** Evaluates post-referral visitor retention, cognitive clarity, and immediate information scent to minimize bounce rates for traffic referred by AI search engines.
* **Detection Logic:**
  1. **Above-the-Fold Hero Clarity (5-Second Rule):** Evaluates whether the hero section contains a concise `H1` headline and clear value proposition explaining what the product does.
  2. **Readability Indexing:** Computes the Flesch-Kincaid Reading Ease score and Automated Readability Index (ARI). Flags content that is overly convoluted for general consumer audiences.
  3. **Call-to-Action (CTA) Readiness:** Verifies presence, specificity, and accessibility of primary action paths (e.g. "Start Free Trial", "Schedule Demo") versus vague or missing action triggers.
  4. **Navigation Noise Filtering:** Quantifies the ratio of navigation and footer boilerplate to core body content.
* **Severity Rubric:**
  * **High:** No clear value proposition or visible CTA above the fold; immediate bounce hazard.
  * **Medium:** Extreme reading difficulty (Flesch score < 30 on non-academic content) or broken interactive form controls.
  * **Low:** Minor CTA wording ambiguity (e.g., generic "Click Here" instead of descriptive action verbs).
* **Tests:** `skills/audit-orchestrator/tests/test_engagement.py`.
