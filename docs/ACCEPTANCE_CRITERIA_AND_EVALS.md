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

## 3. Evaluation Benchmark Harness (16 Golden Fixtures)

The evaluation suite verifies that our heuristics discriminate accurately across diverse real-world architectures:

| Fixture | Architecture | Expected ACPI | Expected CRS | Key Finding Tested |
|---|---|---|---|---|
| `crawler_blocked.html` | Blocked AI crawlers | Low (<40) | N/A | `robots_disallow` |
| `hydration_spa.html` | Client-only SPA | Low (<40) | Medium | `hydration_gap` |
| `partial_hydration.html`| Partial hydration gap | Medium | High | Partial JS content dependency |
| `large_state_static.html`| Large static JSON state | High (>80) | High (>80) | Hydration false positive prevention |
| `app_router.html` | App Router (RSC) | High (>80) | High (>80) | Clean static payload verification |
| `good_business.html` | Production Brand | High (>90) | High (>90) | Full commercial readiness |
| `good_structured.html` | Valid JSON-LD `@graph` + `sameAs` | High (>80) | High | Entity disambiguated |
| `bad_structured.html` | Broken/missing Schema.org | Penalty | Medium | Missing schema / no `sameAs` |
| `strong_aeo.html` | Rich facts, FAQ headings, tables | High (>80) | High | High quotability |
| `weak_aeo.html` | Vague fluff, no facts, no tables | Low (<45) | Low | Low atomic density |
| `stale_article.html` | Copyright 2021, no updated date | Low (<50) | Medium | Temporal decay |
| `current_article.html` | 2026 timestamps, author bio | High (>80) | High | Freshness confirmed |
| `strong_engagement.html` | Hero H1 + subhead + clear CTA | High | High (>85) | Optimal CRS |
| `weak_engagement.html` | Wall of text, no H1, no CTA | Medium | Low (<40) | Bounce risk |
| `documentation.html` | API Docs layout | High | High | Technical readability / no false CTA |
| `navigation_noise.html` | Massive menu DOM, low main content | Adjusted | Adjusted | Content-to-nav ratio |

---

## 4. Master 6-Gate Quality Verification

Any proposed change to the codebase must pass all 6 Verification Gates via `python3 scripts/verify.py`:

```text
[Gate 1: Hostile Security & SSRF Defense Invariants]
   └── 61 security invariant tests passing (IPv4/v6, decimal, octal, hex, DNS rebinding, redirect hops)

[Gate 2: Core Audit Engine & Specialist Tests]
   └── 83 unit tests passing in skills/audit-orchestrator/tests (AST, parser invariants, scoring determinism)

[Gate 3: Golden Benchmark Evaluation Matrix]
   └── 16/16 Golden Fixtures passing with 100% precision, 100% recall, and sub-millisecond latency

[Gate 4: Recursive JSON Schema & Contract Parity]
   └── 100% compliance against BrandAIReadinessAuditReport and SpecialistAuditResult schemas

[Gate 5: FastAPI Web Control Plane & MCP Server]
   └── 8 unit tests passing across all endpoints, 27 routes cleanly mounted, JSON-RPC 2.0 verified

[Gate 6: Marketplace Package & Sandbox Verification]
   └── Clean assembly of marketplace.json, README.md, skills/ into isolated archive & sandbox verification
```
