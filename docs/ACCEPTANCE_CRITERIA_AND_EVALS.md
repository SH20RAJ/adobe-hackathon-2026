# Acceptance Criteria (AC) & Evaluation Harness (Evals)
## OmniAudit-GEO (`brand-ai-readiness-audit`) — Adobe University Hackathon 2026

This document specifies the formal **Acceptance Criteria (AC)**, **Evaluation Harness (Evals)**, and **Quality Gates** governing the OmniAudit-GEO marketplace skills and engine, synthesized from the Everything Claude Code (ECC) agent harness methodology.

---

## 1. High-Level System Acceptance Criteria

| ID | Criterion | Requirement | Verification Method |
|---|---|---|---|
| **AC-SYS-01** | Zero External API Dependencies | The core audit engine must run 100% offline or against static fixtures without requiring paid/external LLM API keys (OpenAI, Anthropic, Google). | Unit tests run in air-gapped/offline mode without network calls. |
| **AC-SYS-02** | Deterministic Scoring | Identical HTML/robots inputs must yield identical ACPI and CRS scores (±0.0 score jitter). | Automated benchmark fixture tests. |
| **AC-SYS-03** | Sub-Second Local Execution | Auditing a pre-fetched HTML document must complete in under 500ms on standard hardware. | Benchmark runner timer asserts <0.50s per site. |
| **AC-SYS-04** | Schema Validation | All outputs must conform strictly to `skills/audit-orchestrator/references/audit_schema.json` and `marketplace.json` must conform to `agentskills.io` spec. | Automated JSON schema validator in test suite. |
| **AC-SYS-05** | SSRF & Sandbox Security | Fetcher must disallow requests to loopback addresses (`127.0.0.1`, `localhost`), link-local metadata IPs (`169.254.169.254`), and private RFC 1918 subnets. | `skills/crawl-render-audit/tests/test_safe_fetch.py`. |

---

## 2. Skill-Specific Acceptance Criteria

### Skill 1: Crawl & Render Audit (`crawl-render-audit`)
- **AC-CRAWL-01 (Robots Disallow Detection):** When `robots.txt` explicitly disallows `GPTBot`, `ClaudeBot`, `PerplexityBot`, or `*`, the skill must emit a `fail` finding with severity `critical` and detail the blocked bot user-agents.
- **AC-CRAWL-02 (Hydration Gap Detection):** If the raw HTML body text contains fewer than 150 words while containing React/Vue/Nuxt hydration mount roots (`<div id="root"></div>`, `__NEXT_DATA__`, `window.__INITIAL_STATE__`), the skill must report a `hydration_gap` finding with confidence `high`.
- **AC-CRAWL-03 (HTTP Response Headers):** Must verify `X-Robots-Tag`, `Content-Type`, and canonical headers.

### Skill 2: Structured Entity Audit (`structured-entity-audit`)
- **AC-ENT-01 (JSON-LD Parsing):** Must extract all `<script type="application/ld+json">` blocks, handling both single objects and `@graph` arrays.
- **AC-ENT-02 (Disambiguation):** Must verify `sameAs` authorities (Wikidata, Wikipedia, LinkedIn, GitHub, official profiles). If absent, emit finding with severity `high`.
- **AC-ENT-03 (Core Schema Types):** Must detect `Organization`, `WebSite`, `Product`, `Article`, `FAQPage`, and `Person`. Missing basic entity details drops Entity Score below 50.

### Skill 3: AEO & Quotability Audit (`aeo-quotability-audit`)
- **AC-AEO-01 (Atomic Fact Density):** Computes atomic fact density based on quantified entities (numbers, percentages, dates, currency symbols) per paragraph.
- **AC-AEO-02 (Heading Question/Answer Pairing):** Must identify interrogative headings (`What`, `Why`, `How`, `Does`, `Can`) followed immediately by definitional answer paragraphs.
- **AC-AEO-03 (Non-Text Data Accessibility):** Must inspect `table` tags for `thead`/`th` headers and images for descriptive `alt` tags.

### Skill 4: Freshness & Trust Corroboration Audit (`freshness-corroboration-audit`)
- **AC-FRESH-01 (Temporal Signals):** Must parse `datePublished`, `dateModified`, OpenGraph `article:modified_time`, and DOM time elements. If modified date is older than 365 days, trigger freshness warning.
- **AC-FRESH-02 (Trust Corroboration):** Must check for author bio/byline, editorial policy or review links, physical contact details, and privacy/terms links.
- **AC-FRESH-03 (Cross-Source Alignment):** Must flag discrepancies between JSON-LD `dateModified` and DOM visible dates.

### Skill 5: On-Site Engagement & UX Retention Audit (`on-site-engagement-audit`)
- **AC-ENG-01 (Above-the-Fold Hero Clarity):** Must verify presence of a clear H1, subhead within 40 words, and primary Call-to-Action within the top DOM region.
- **AC-ENG-02 (Cognitive Readability):** Must compute Flesch-Kincaid Reading Ease and Automated Readability Index (ARI). Score must flag text with readability grade > 14 (impenetrable academic jargon) or < 5.
- **AC-ENG-03 (Bounce Risk Heuristic):** Flags pages with no clear CTA, wall-of-text paragraphs (>150 words without headings), or broken internal anchor targets.

---

## 3. Evaluation Benchmark Harness (14 Golden Fixtures)

The evaluation suite verifies that our heuristics discriminate accurately across diverse real-world architectures:

| Fixture | Architecture | Expected ACPI | Expected CRS | Key Finding Tested |
|---|---|---|---|---|
| `crawler_blocked.html` | Blocked AI crawlers | Low (<40) | N/A | `robots_disallow` |
| `hydration_spa.html` | Client-only SPA | Low (<40) | Medium | `hydration_gap` |
| `next-ssr.html` | Next.js Server-Side Rendered | High (>75) | High (>70) | No hydration gap |
| `next-rsc.html` | Next.js App Router (RSC) | High (>80) | High (>70) | Clean static payload |
| `bad_structured.html` | Broken/missing Schema.org | Penalty (-30) | Medium | Missing schema / no `sameAs` |
| `good_structured.html` | Valid JSON-LD `@graph` + `sameAs` | High (>80) | High | Entity disambiguated |
| `weak_aeo.html` | Vague fluff, no facts, no tables | Low (<45) | Low | Low atomic density |
| `strong_aeo.html` | Rich facts, FAQ headings, tables | High (>80) | High | High quotability |
| `stale_article.html` | Copyright 2021, no updated date | Low (<50) | Medium | Temporal decay |
| `current_article.html` | 2026 timestamps, author bio | High (>80) | High | Freshness confirmed |
| `weak_engagement.html` | Wall of text, no H1, no CTA | Medium | Low (<40) | Bounce risk |
| `strong_engagement.html` | Hero H1 + subhead + clear CTA | High | High (>85) | Optimal CRS |
| `documentation.html` | API Docs layout | High | High | Technical readability |
| `navigation_noise.html` | Massive menu DOM, low main content | Adjusted | Adjusted | Content-to-nav ratio |

---

## 4. Quality Gates & Enforcement

Any proposed change to the codebase must pass all four Quality Gates:

```text
[Gate 1: Static Analysis & Security]
   ├── Zero linting/syntax errors
   └── SSRF prevention verified in safe_fetch.py

[Gate 2: Unit Test Suite]
   ├── 100% pass rate in skills/audit-orchestrator/tests
   └── 100% pass rate in skills/crawl-render-audit/tests

[Gate 3: Benchmark Evals]
   └── 14/14 Golden Benchmark fixtures match expected score bounds

[Gate 4: Full Production Build]
   └── bun run build in omniaudit-geo completes with 0 errors
```
