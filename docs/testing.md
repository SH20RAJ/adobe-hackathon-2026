# Testing Methodology & 6-Gate Verification Framework

This document outlines the testing architecture, evaluation methodology, and continuous quality gates implemented in **OmniAudit-GEO**.

---

## 🏛️ Testing Philosophy & Scope Distinctions

### Scientific Rigor & Benchmark Integrity
To avoid marketing exaggeration and maintain strict technical honesty:

> **Important Boundary:**
> * When documentation states **"100% precision and recall"**, this refers strictly to the **16 labeled ground-truth benchmark fixtures** in the deterministic test suite (`skills/audit-orchestrator/tests/fixtures/benchmark/`).
> * It does **not** claim 100% error-free auditing of all arbitrary, dynamic websites across the public Internet, where network latency, bot-mitigation firewalls (e.g. Cloudflare Turnstile), and complex client-side single-page applications introduce real-world variability.
> * Local execution latency metrics (~0.7–1.0 ms) measure **in-memory AST parsing and heuristic scoring**. Real-world end-to-end audits are bounded by the target web server's response time and network round-trips.

---

## 🚪 The 6-Gate Verification Framework

The entire test suite is orchestrated through [`scripts/verify.py`](../scripts/verify.py), which enforces 6 sequential verification gates before any commit, PR merge, or package release:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ GATE 1: Adversarial Security & SSRF Defense Test Suite                                 │
│ • Tests private IP blocking, loopback rejection, cloud metadata blocking, redirects   │
│ • 100% offline unit tests in `test_safe_fetch.py` and `test_security_adversarial.py`   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ GATE 2: Specialist Skill Diagnostic Unit Tests                                         │
│ • Tests crawl/robots rules, hydration detectors, Schema.org parsing, AEO, freshness    │
│ • Unit test suites across `skills/crawl-render-audit/tests` and `audit-orchestrator`   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ GATE 3: 16 Golden Benchmarks Accuracy Evaluation                                       │
│ • Evaluates engine against 16 diverse HTML fixtures with known ground-truth labels     │
│ • Asserts 100% TP/TN accuracy, 0 FP, 0 FN across ACPI & CRS boundary conditions       │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ GATE 4: Recursive JSON Schema & Contract Validation                                    │
│ • Validates all generated reports against `references/audit_schema.json`               │
│ • Tests negative schema cases (missing required fields, out-of-bounds scores)          │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ GATE 5: FastAPI Web Control Plane & MCP Server Tests                                   │
│ • Uses Starlette/FastAPI `TestClient` to verify all 33 mounted routes                  │
│ • Tests health probes, audit endpoints, and MCP JSON-RPC 2.0 initialize/call_tool      │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ GATE 6: Marketplace Package & Unpacked Sandbox Validation                              │
│ • Verifies `marketplace.json` manifest syntax and skill directory references           │
│ • Generates `omniaudit-geo-marketplace.zip` and asserts file size $\le 50$ MB         │
│ • Unpacks the ZIP into a clean isolated sandbox directory and executes unit tests     │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## ⚡ Running Tests Locally

### 1. Run Complete 6-Gate Verification (Standard Developer Workflow)

```bash
# Via Unified CLI:
omni verify --ci

# Or via Python runner:
python3 scripts/verify.py --ci
```

### 2. Run Individual Test Suites via `unittest`

```bash
# Orchestrator & Scoring Invariant Tests
python3 -m unittest discover -s skills/audit-orchestrator/tests -p "test_*.py" -v

# Crawler, Safe Fetch & SSRF Security Tests
python3 -m unittest discover -s skills/crawl-render-audit/tests -p "test_*.py" -v

# Web Control Plane & FastAPI Route Tests
python3 -m unittest discover -s omniaudit-geo/tests -p "test_*.py" -v
```

---

## 📊 Summary of Test Suites

| Suite | File Location | Test Count | Focus |
| :--- | :--- | :---: | :--- |
| **SSRF & Security** | `skills/crawl-render-audit/tests/test_safe_fetch.py` | 8 | Private IP rejection, cloud metadata, redirect limits |
| **Adversarial Security** | `skills/crawl-render-audit/tests/test_security_adversarial.py` | 6 | Port scanning, ReDoS, malformed schemes |
| **Robots & Crawler** | `skills/crawl-render-audit/tests/test_robots.py` | 14 | User-agent parsing, wildcard fallbacks, allow/disallow |
| **Hydration Detector** | `skills/crawl-render-audit/tests/test_hydration_detector.py` | 12 | React/Next.js/Nuxt hydration gap vs false positives |
| **Structured Data** | `skills/audit-orchestrator/tests/test_structured_data.py` | 10 | JSON-LD parsing, sameAs verification, auto-remediation |
| **AEO Quotability** | `skills/audit-orchestrator/tests/test_aeo_quotability.py` | 11 | Atomic fact density, heading trees, locked non-text |
| **Freshness & Trust** | `skills/audit-orchestrator/tests/test_freshness_trust.py` | 10 | Date decay, copyright staleness, author bylines |
| **On-Site Retention** | `skills/audit-orchestrator/tests/test_engagement.py` | 12 | Value prop clarity, Flesch reading ease, CTA readiness |
| **Scoring Invariants** | `skills/audit-orchestrator/tests/test_scoring_invariance.py` | 8 | Damping logic, bounds $[0, 100]$, root-cause deduplication |
| **Schema Validation** | `skills/audit-orchestrator/tests/test_schema_validation.py` | 9 | Positive & negative JSON Schema enforcement |
| **MCP JSON-RPC** | `skills/audit-orchestrator/tests/test_mcp.py` | 10 | Stdio and HTTP RPC protocol methods and tool schemas |
| **Parser Invariants** | `skills/audit-orchestrator/tests/test_parser_invariants.py` | 10 | HTML tokenizer boundaries, encoding fallbacks |
| **Golden Benchmarks** | `skills/audit-orchestrator/tests/test_benchmark.py` | 16 | 16 Golden Fixtures regression assertion matrix |
| **FastAPI Web API** | `omniaudit-geo/tests/test_fastapi_app.py` | 11 | REST endpoints, rate limiting, concurrency, health |
| **Sandbox Packager** | `scripts/package_submission.py` | In-process | Isolated sandbox execution of unpacked archive |
| **Total Automated Tests** | | **167** | **100% Passing (0 failures)** |

---

## 🔄 Continuous Integration (GitHub Actions)

Every pull request and push to `main` triggers automated CI workflows:
* **`.github/workflows/verify.yml`:** Checks out code on `ubuntu-latest`, configures Python 3.12, installs dependencies, and runs `python3 scripts/verify.py --ci`.
* **`.github/workflows/publish-container.yml`:** Executes pre-flight verification, builds OCI Docker image, executes container health smoke checks, pushes image to GHCR, triggers Render deployment webhook, and verifies live service health.
