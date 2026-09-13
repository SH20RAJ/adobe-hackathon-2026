# 16 Golden Benchmarks Evaluation Harness

This document provides the benchmark methodology, fixture definitions, and statistical accuracy metrics for the **OmniAudit-GEO Benchmark Evaluation Harness** (`scripts/eval_benchmarks.py`).

---

## 🎯 Benchmark Objectives & Scope

To ensure the diagnostic rules are both sensitive (detecting genuine defects) and specific (avoiding false positives on modern frameworks), the engine is continuously evaluated against **16 deterministic HTML test fixtures**.

Each fixture models a realistic architectural pattern or failure mode encountered on the modern web, ranging from blank client-rendered single-page applications to rich semantic websites with modern JSON-LD and accessible tables.

---

## 📊 The 16 Golden Fixtures Test Matrix

| # | Fixture Name | Category | Primary Detection Target | Expected ACPI | Expected CRS | Schema |
| :-: | :--- | :--- | :--- | :-: | :-: | :-: |
| **1** | `crawler_blocked` | Crawl & Robots | `robots.txt` disallows all AI crawlers (`GPTBot`, `ClaudeBot`) | **84.9** | **93.0** | `PASS` |
| **2** | `hydration_spa` | Hydration Gap | Empty `<div id="root"></div>` React shell without SSR | **79.3** | **83.5** | `PASS` |
| **3** | `partial_hydration` | Hydration Gap | Core pricing and specs missing from raw static HTML | **84.9** | **91.5** | `PASS` |
| **4** | `large_state_static`| Hydration (FP Check) | Legitimate server-rendered content with large `__NEXT_DATA__` | **89.4** | **91.5** | `PASS` |
| **5** | `app_router` | Hydration (FP Check) | Next.js App Router streaming chunks with complete text DOM | **89.4** | **91.5** | `PASS` |
| **6** | `good_business` | Production Brand | Optimized enterprise site (JSON-LD, high fact density, CTAs) | **96.2** | **94.5** | `PASS` |
| **7** | `good_structured` | Structured Data | Full `Organization` schema with Wikidata `sameAs` entity links | **96.4** | **91.5** | `PASS` |
| **8** | `bad_structured` | Structured Data | Missing Schema.org JSON-LD and zero entity disambiguation | **90.0** | **91.5** | `PASS` |
| **9** | `strong_aeo` | AEO & Quotability | Interrogative Q&A headings and accessible tabular data | **88.2** | **88.7** | `PASS` |
| **10**| `weak_aeo` | AEO & Quotability | Marketing fluff copy without atomic facts; pricing in images | **82.2** | **83.5** | `PASS` |
| **11**| `stale_article` | Freshness & Trust | Publication dates outdated by > 24 months, stale copyright | **87.0** | **91.5** | `PASS` |
| **12**| `current_article` | Freshness & Trust | Up-to-date article with author byline and citation references | **88.2** | **91.5** | `PASS` |
| **13**| `strong_engagement`| On-Site Engagement | Clear above-the-fold value prop, high reading ease, clear CTAs | **89.4** | **95.5** | `PASS` |
| **14**| `weak_engagement` | On-Site Engagement | Ambiguous hero text, buried CTAs, convoluted paragraph prose | **88.2** | **90.7** | `PASS` |
| **15**| `documentation` | On-Site Engagement | Technical API documentation with balanced reading grade | **89.4** | **91.5** | `PASS` |
| **16**| `navigation_noise` | On-Site Engagement | Excessive header/footer boilerplate dominating body content | **87.8** | **88.9** | `PASS` |

---

## 📈 Statistical Accuracy & Metrics

Running the benchmark evaluation harness produces deterministic statistical telemetry:

```text
📊 Evaluation Metrics & Statistical Accuracy:
   • Total Benchmarks Evaluated : 16
   • Passed Benchmarks          : 16/16 (100.0%)
   • True Positives (TP)        : 9
   • False Positives (FP)       : 0
   • False Negatives (FN)       : 0
   • Measured Precision         : 100.0%
   • Measured Recall            : 100.0%
   • F1-Score                   : 100.0%
   • Average Execution Latency  : ~0.89 ms / site (in-memory AST analysis)
   • Total Eval Run Time        : ~14 ms
   • Schema Validation Failures : 0/16
```

### Clarification on Precision & Recall
* **Precision ($\text{TP} / (\text{TP} + \text{FP}) = 1.0$):** When the engine reports a defect in a benchmark fixture (e.g. hydration gap or missing entity disambiguation), the defect is genuinely present. The false-positive control fixtures (`large_state_static`, `app_router`) confirm that modern SSR implementations are not falsely flagged.
* **Recall ($\text{TP} / (\text{TP} + \text{FN}) = 1.0$):** Every known defect in the fixture suite is successfully caught by the specialist heuristic rules.

---

## ⚡ Running the Benchmark Suite

To execute the benchmark harness directly from the command line:

```bash
# Via Unified CLI:
omni benchmark

# Or via Python script:
python3 scripts/eval_benchmarks.py
```

To run as an automated unit test:
```bash
python3 -m unittest skills/audit-orchestrator/tests/test_benchmark.py
```
