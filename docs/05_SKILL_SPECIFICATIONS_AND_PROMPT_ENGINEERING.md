# Skill Specifications & Prompt Engineering Guide

## 1. Compliance with the `agentskills.io` Standard

Every skill inside the marketplace is authored according to the official **Agent Skills (`agentskills.io`) Specification**. 

### Anatomy of an Agent Skill:
```
skills/<skill-name>/
├── SKILL.md                 <- [REQUIRED] YAML Frontmatter + Lean Instructions
├── scripts/                 <- [OPTIONAL] Bundled deterministic executables
│   └── <analyzer>.py
└── references/              <- [OPTIONAL] Checklists, schemas, reference manuals
    └── <reference>.md
```

### Progressive Disclosure Architecture:
* **The `SKILL.md` must remain lean (< 200 lines):** It provides high-level intent, inputs, numbered deterministic procedure steps, tool invocations, and output schema.
* **Heavy data is pushed to `references/`:** Large rule tables, regex catalogs, and schema standards live in reference documents.
* **Fast execution is pushed to `scripts/`:** Deterministic checks (HTML parsing, JSON-LD validation, regex matching) are executed via bundled Python scripts rather than LLM token generation, guaranteeing zero hallucination and sub-second execution.

---

## 2. Top-Level Marketplace Manifest (`marketplace.json`)

The marketplace root must contain a `marketplace.json` that defines the marketplace metadata, lists all constituent skills, and designates exactly one entrypoint skill.

```json
{
  "name": "brand-ai-readiness-audit",
  "version": "1.0.0",
  "description": "Comprehensive Agent Skill Marketplace for auditing website AI Discoverability (GEO/AEO) and On-site Visitor Engagement.",
  "author": "Shaswat Raj (@sh20raj)",
  "license": "Apache-2.0",
  "skills": [
    {
      "id": "audit-orchestrator",
      "path": "skills/audit-orchestrator",
      "entrypoint": true,
      "description": "Master orchestrator that composes all audit skills and generates the unified findings report."
    },
    {
      "id": "crawl-render-audit",
      "path": "skills/crawl-render-audit",
      "description": "Audits robots.txt AI bot policies, sitemap completeness, and JS hydration content gaps."
    },
    {
      "id": "structured-entity-audit",
      "path": "skills/structured-entity-audit",
      "description": "Validates Schema.org JSON-LD structured data and entity disambiguation links (sameAs)."
    },
    {
      "id": "aeo-quotability-audit",
      "path": "skills/aeo-quotability-audit",
      "description": "Audits atomic fact quotability for LLMs, content density, and facts locked in non-text."
    },
    {
      "id": "freshness-corroboration-audit",
      "path": "skills/freshness-corroboration-audit",
      "description": "Audits temporal freshness signals, trust markers, and cross-web authority corroboration."
    },
    {
      "id": "on-site-engagement-audit",
      "path": "skills/on-site-engagement-audit",
      "description": "Audits above-the-fold value prop clarity, cognitive load, and contextual retention."
    }
  ]
}
```

---

## 3. Detailed `SKILL.md` Specifications

### 3.1 `skills/audit-orchestrator/SKILL.md`

```markdown
---
name: audit-orchestrator
description: Entrypoint orchestrator for the Brand AI-Readiness Marketplace. Coordinates sub-skills, normalizes findings, and emits the final JSON audit report.
license: Apache-2.0
allowed-tools:
  - run_command
  - view_file
---

# Brand AI-Readiness Master Audit Orchestrator

## When to use
Use as the primary entrypoint when auditing any website for AI discoverability barriers (why AI assistants do not cite it) and visitor engagement defects (why referred users bounce).

## Inputs
* `url` (string, required): The target website URL to audit (e.g., `https://example.com`).
* `options` (object, optional): Audit configuration flags (e.g., `max_pages`, `timeout_seconds`).

## Procedure
1. **Target Normalization:** Validate and normalize the target URL. Extract the base hostname.
2. **Deterministic Script Execution:** Run `python3 skills/audit-orchestrator/scripts/audit_runner.py --url <URL>`.
3. **Sub-Skill Composition:**
   - Execute `crawl-render-audit` to evaluate robots.txt, sitemaps, and JS hydration differences.
   - Execute `structured-entity-audit` to extract and validate JSON-LD and entity networks.
   - Execute `aeo-quotability-audit` to measure atomic fact density and non-text locked data.
   - Execute `freshness-corroboration-audit` to check temporal staleness and trust signals.
   - Execute `on-site-engagement-audit` to evaluate above-the-fold clarity and bounce risk.
4. **Severity Deduplication & Prioritization:** Group findings by category, assign standardized severity (`critical`, `high`, `medium`, `low`), and link concrete evidence.
5. **Action Generation:** Attach specific, mechanism-sound code snippets (JSON-LD, robots.txt rules, HTML patches) for each finding.
6. **Emit Structured Output:** Emit the final JSON report strictly matching `references/audit_schema.json`.

## Output
Emits a structured JSON document conforming to the official Adobe Round 3 Audit Report Schema.
```

---

### 3.2 `skills/crawl-render-audit/SKILL.md`

```markdown
---
name: crawl-render-audit
description: Audits website crawlability, AI bot permissions (robots.txt), sitemap health, and JavaScript rendering/hydration gaps.
license: Apache-2.0
allowed-tools:
  - run_command
---

# Crawl & JS-Render Audit Skill

## When to use
Use to diagnose why AI assistants and search bots (GPTBot, ClaudeBot, PerplexityBot) cannot fetch, crawl, or render page content.

## Inputs
* `url` (string, required): The target URL.

## Procedure
1. Fetch and parse `/robots.txt` against known AI crawler user-agents listed in `references/ai_user_agents.md`.
2. Inspect HTTP response headers (X-Robots-Tag, Cache-Control, Content-Type).
3. Fetch static HTML response and compare text content against rendered DOM tree to detect JavaScript hydration gaps.
4. Detect canonical URL mismatches or accidental `noindex` directives.
5. Return findings with line numbers and exact HTTP response codes.

## Output
JSON array of crawl and rendering findings with severity and concrete remediation code.
```

---

### 3.3 `skills/structured-entity-audit/SKILL.md`

```markdown
---
name: structured-entity-audit
description: Extracts, validates, and diagnoses Schema.org JSON-LD, Microdata, and entity disambiguation links.
license: Apache-2.0
allowed-tools:
  - run_command
---

# Structured Data & Entity Disambiguation Audit Skill

## When to use
Use to verify if machines can unambiguously understand the brand identity, products, services, FAQs, and authority links.

## Inputs
* `url` (string, required): The target URL.

## Procedure
1. Extract all `<script type="application/ld+json">` blocks and Microdata attributes from the DOM.
2. Validate syntax and mandatory fields against Schema.org definitions in `references/schema_blueprints.md`.
3. Check for presence of essential schemas: `Organization`, `WebSite`, `Product`/`Service`, `FAQPage`, `BreadcrumbList`.
4. Inspect `sameAs` array to verify entity disambiguation to trusted knowledge graphs (Wikidata, Crunchbase, Wikipedia, official social profiles).
5. Identify broken or circular schema references.
6. Generate ready-to-use JSON-LD replacement snippets for missing or invalid schemas.

## Output
JSON array of structured data findings with validated schema replacement payloads.
```

---

### 3.4 `skills/aeo-quotability-audit/SKILL.md`

```markdown
---
name: aeo-quotability-audit
description: Measures Answer Engine Optimization (AEO), atomic fact density, heading semantics, and detects facts locked in non-text assets.
license: Apache-2.0
allowed-tools:
  - run_command
---

# AEO Quotability & Non-Text Data Audit Skill

## When to use
Use to diagnose why AI search assistants (ChatGPT Search, Perplexity) fail to extract direct quotes, definitions, or pricing from a site.

## Inputs
* `url` (string, required): The target URL.

## Procedure
1. Parse DOM heading structure (`H1` through `H6`) to check for logical hierarchy and question-answering formats.
2. Scan for facts locked in non-text: images containing text, infographics lacking comprehensive `alt` descriptions, or tables rendered as canvas/images.
3. Compute **Content-to-Noise Ratio** (pure textual informational content vs. navigation/boilerplate fluff).
4. Identify missing atomic definition sentences (e.g., direct 20-word explanation of what the product/service does).
5. Suggest high-quotability summary blocks and semantic HTML tables.

## Output
JSON array of AEO findings and content refactoring templates.
```

---

### 3.5 `skills/freshness-corroboration-audit/SKILL.md`

```markdown
---
name: freshness-corroboration-audit
description: Evaluates temporal freshness signals, cross-page factual consistency, and E-E-A-T trust markers.
license: Apache-2.0
allowed-tools:
  - run_command
---

# Freshness & Trust Corroboration Audit Skill

## When to use
Use to detect stale content, outdated temporal signals, or uncorroborated claims that cause AI assistants to discount site reliability.

## Inputs
* `url` (string, required): The target URL.

## Procedure
1. Scan for temporal staleness markers: footer copyright year vs. current year, `article:modified_time`, date mentions in headers.
2. Verify contact transparency: existence of verifiable Name, Physical Address, Phone (NAP), privacy policy, terms of service, and support channels.
3. Scan for author credentials and editorial trust signals on informational articles.
4. Detect conflicting claims across multiple pages (e.g., differing pricing tiers or product specs).
5. Provide recommendations for adding last-updated indicators and citation anchors.

## Output
JSON array of freshness and trust findings with remediation priority.
```

---

### 3.6 `skills/on-site-engagement-audit/SKILL.md`

```markdown
---
name: on-site-engagement-audit
description: Audits above-the-fold value proposition clarity, information scent, reading level, and cognitive friction for referred visitors.
license: Apache-2.0
allowed-tools:
  - run_command
---

# On-Site Visitor Engagement Audit Skill

## When to use
Use to diagnose why visitors referred from AI search engines immediately bounce or fail to take action on the landing page.

## Inputs
* `url` (string, required): The target URL.

## Procedure
1. Analyze the first viewport / hero section: verify if the headline clearly states the core value proposition within 5 seconds of reading.
2. Measure readability grade level (Flesch-Kincaid) to identify unnecessarily complex jargon.
3. Evaluate Call to Action (CTA) prominence and clarity.
4. Detect high-friction barriers (e.g., intrusive modals, missing navigation orientation, broken search bars).
5. Generate actionable recommendations for hero copy refactoring and conversion funnel streamlining.

## Output
JSON array of engagement and cognitive retention findings.
```
