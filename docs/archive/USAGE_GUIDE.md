# OmniAudit-GEO — Complete Installation, CLI, MCP & Deployment Guide

> **Adobe University Hackathon 2026 (Round 3 CRP)**  
> **Repository:** [github.com/SH20RAJ/adobe-hackathon-2026](https://github.com/SH20RAJ/adobe-hackathon-2026)  
> **Live Web Demo & API:** [omniaudit-geo.onrender.com](https://omniaudit-geo.onrender.com/)

---

## 📑 Table of Contents

1. [Architectural Highlights](#1-architectural-highlights)
2. [Quickstart & Installation](#2-quickstart--installation)
3. [Unified Command-Line Interface (`cli.py`)](#3-unified-command-line-interface-clipy)
4. [Anthropic Model Context Protocol (MCP) Integration](#4-anthropic-model-context-protocol-mcp-integration)
5. [Web Control Plane & Gradio 6 UI](#5-web-control-plane--gradio-6-ui)
6. [REST API Reference](#6-rest-api-reference)
7. [Container & Cloud Deployment (Docker, GHCR, Render)](#7-container--cloud-deployment-docker-ghcr-render)
8. [Automated 6-Gate Verification & Benchmarking](#8-automated-6-gate-verification--benchmarking)
9. [Scoring Models & Remediation Taxonomy](#9-scoring-models--remediation-taxonomy)

---

## 1. Architectural Highlights

OmniAudit-GEO is designed around a **Single Source of Truth** architecture:

```text
                        ┌───────────────────────────────┐
                        │   skills/ (Canonical AST)     │
                        │ • audit-orchestrator          │
                        │ • crawl-render-audit          │
                        │ • structured-entity-audit     │
                        │ • aeo-quotability-audit       │
                        │ • freshness-corroboration     │
                        │ • on-site-engagement          │
                        └───────────────┬───────────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           │                            │                            │
           ▼                            ▼                            ▼
  Unified CLI (`cli.py`)       Gradio UI & FastAPI           MCP Server (stdio & HTTP)
  • Immediate terminal audits  • Full web control plane     • Claude Desktop
  • Specialist skill runners   • Responsive card UI         • Cursor IDE / Windsurf
  • JSON / Markdown output     • Interactive MCP sandbox    • Antigravity / Gemini
```

* **Zero Duplication:** Every interface (CLI, Web UI, REST API, MCP Server) imports from the exact same canonical Python AST scripts in `skills/`. Updating a scoring weight or adding a heuristic in `skills/` immediately updates all entry points.
* **Pure Python Standard Library Core:** Core DOM extraction, robots.txt parsing, schema validation, and scoring require zero pip dependencies (`html.parser`, `urllib`, `re`, `json`, `math`).
* **Sub-Millisecond Engine Latency:** Local AST benchmark fixtures analyze in ~0.47 ms on average.

---

## 2. Quickstart & Installation

OmniAudit-GEO offers four setup options depending on your environment:

### Option A: One-Liner Automated Setup (Zero Git Required — Recommended)
Run directly from your terminal to download, unpack, and configure `omni` and `omniaudit` globally via Python:
```bash
curl -fsSL https://raw.githubusercontent.com/SH20RAJ/adobe-hackathon-2026/main/install.sh | bash
```
Or from inside a cloned repository:
```bash
./install.sh
```

### Option B: Editable Python Package (`pip install -e .`)
Install into your current virtual environment or user space with standard Python packaging:
```bash
pip install -e .
# Or with optional web control plane dependencies:
pip install -e ".[web]"
```
Now run directly:
```bash
omni --url https://example.com
omniaudit --url https://example.com
```

### Option C: Zero-Install Standalone Execution (Standard Library Only)
If you only need immediate terminal audits without installing anything:
```bash
python3 cli.py --url https://example.com
```

### Option D: Docker / OCI Container
```bash
docker run --rm -p 8000:8000 ghcr.io/sh20raj/omniaudit-geo:stable
```

---

## 3. Unified Command-Line Interface (`omni` / `omniaudit` / `cli.py`)

The unified CLI provides rich ANSI terminal colorization, JSON pipeability, and markdown report generation. You can invoke it using `omni`, `omniaudit`, or `python3 cli.py` interchangeably.

### 3.1. Immediate Full Master Audit
Run an end-to-end audit across all 6 skills:

```bash
# Shorthand audit with colorized terminal summary
omni --url https://example.com

# Strict JSON output conforming to audit_schema.json
omni audit --url https://example.com --format json

# Export GitHub Markdown report directly to a file
omni audit --url https://example.com --format markdown --output audit-report.md
```

### 3.2. Specialist Skill Audits
Run any of the 5 specialist skills independently:

```bash
# 1. Crawl & JS-Render Inspector (robots.txt AI bot policies + SPA hydration gaps)
omni specialist crawl --url https://example.com

# 2. Structured Entity & JSON-LD Validator (Schema.org graphs + sameAs links)
omni specialist structured --url https://example.com

# 3. AEO Quotability Scorer (Atomic facts, table headers, llms.txt)
omni specialist aeo --url https://example.com

# 4. Freshness & Publisher Trust (Publication timestamps + bylines + privacy policies)
omni specialist freshness --url https://example.com

# 5. On-Site Engagement Evaluator (Hero value prop, reading ease, CTA clarity)
omni specialist engagement --url https://example.com
```

### 3.3. Launching Servers & Running Tests via CLI

```bash
# Launch FastAPI + Gradio 6 web server on port 8000
omni serve --port 8000

# Launch standalone Gradio interface
omni serve --gradio-only --port 7860

# Run internal MCP server self-test
omni mcp --test

# Run the official 6-Gate verification loop
omni verify --ci

# Run the 16 Golden Benchmarks evaluation harness
omni benchmark

# Rebuild and sandbox-verify the official submission package (omniaudit-geo-marketplace.zip)
omni package
```

---

## 4. Anthropic Model Context Protocol (MCP) Integration

OmniAudit-GEO implements the official [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) specification (2024-11-05), exposing **7 deterministic tools**:

| MCP Tool Name | Description |
|---|---|
| `audit_website` | Comprehensive master audit returning ACPI/CRS scores, findings, and remediation. |
| `audit_brand_ai_readiness` | High-level executive synthesis for brand managers and SEO teams. |
| `inspect_robots_and_rendering` | Inspects AI crawler access policies and JavaScript hydration gaps. |
| `inspect_structured_data` | Evaluates Schema.org JSON-LD and entity authority triples (`sameAs`). |
| `inspect_aeo_quotability` | Assesses atomic facts, tabular data accessibility, and `llms.txt`. |
| `inspect_freshness_trust` | Validates publication decay and publisher trust signals. |
| `inspect_on_site_retention` | Measures reading ease, hero clarity, and bounce resistance. |

---

### 4.1. Claude Desktop Configuration
Add OmniAudit-GEO to your Claude Desktop configuration file:
* **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
* **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "omniaudit-geo": {
      "command": "python3",
      "args": [
        "/ABSOLUTE/PATH/TO/adobe-hackathon-2026/skills/audit-orchestrator/scripts/mcp_server.py"
      ]
    }
  }
}
```

---

### 4.2. Cursor IDE Configuration
In Cursor (`Settings -> Features -> MCP -> Add New MCP Server`):
* **Name:** `omniaudit-geo`
* **Type:** `command`
* **Command:** `python3 skills/audit-orchestrator/scripts/mcp_server.py`

Alternatively, configure the remote live HTTP endpoint:
* **Type:** `sse`
* **URL:** `https://omniaudit-geo.onrender.com/api/mcp`

---

### 4.3. Windsurf / Cascade Configuration
In your `mcp_config.json`:

```json
{
  "mcpServers": {
    "omniaudit-geo": {
      "command": "python3",
      "args": ["skills/audit-orchestrator/scripts/mcp_server.py"]
    }
  }
}
```

---

### 4.4. Testing MCP Over Stdio & HTTP
To verify your MCP server locally:

```bash
# Run stdio self-test
python3 cli.py mcp --test

# Query remote live endpoint via JSON-RPC 2.0
curl -s -X POST https://omniaudit-geo.onrender.com/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {}}'
```

---

## 5. Web Control Plane & Gradio 6 UI

Access the interactive web UI either locally or via the hosted cloud instance:
* **Live Cloud UI:** [https://omniaudit-geo.onrender.com/](https://omniaudit-geo.onrender.com/)
* **Local UI:** Run `python3 cli.py serve` and open `http://localhost:8000/`.

### UI Features
1. **Live Web Audit Tab:** Interactive URL input, real-time audit execution, composite ACPI and CRS score gauges, and responsive finding cards with expandable evidence blocks and actionable remediation code snippets.
2. **6 Specialist Skills Tab:** Dedicated diagnostic tabs for running individual audits (Crawl/Render, Structured Data, AEO, Freshness, Retention).
3. **MCP Protocol Sandbox Tab:** Real-time JSON-RPC 2.0 console enabling users to execute raw `tools/list` and `tools/call` requests with syntax-highlighted responses.
4. **Architecture & Methodology Tab:** Mathematical formulation of scoring rubrics, benchmark precision/recall metrics, and security invariants.

---

## 6. REST API Reference

The FastAPI control plane provides production-grade endpoints with Swagger documentation at `/api/docs`.

### 6.1. Health Check
```http
GET /api/health
```
**Response:**
```json
{
  "status": "healthy",
  "service": "omniaudit-geo",
  "version": "1.0.0",
  "engine": "canonical-python-ast",
  "schema": "draft-07"
}
```

### 6.2. Execute Guarded Audit
```http
GET /api/audit?url=https://example.com
```
* Protected by sliding-window rate limiting (30 req/min per IP)
* Bounded concurrency semaphore (max 5 simultaneous external audits)
* Strict SSRF normalization (blocks loopback, link-local, private RFC 1918 addresses)
* Response conforms strictly to `references/audit_schema.json`

### 6.3. Model Context Protocol JSON-RPC Endpoint
```http
POST /api/mcp
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "audit_website",
    "arguments": {
      "url": "https://example.com"
    }
  }
}
```

---

## 7. Container & Cloud Deployment (Docker, GHCR, Render)

### 7.1. Docker Build & Run
The repository includes an optimized, non-root multi-stage `Dockerfile`:

```bash
# Build container image locally
docker build -t omniaudit-geo .

# Run container exposing port 8000
docker run --rm -p 8000:8000 -e PORT=8000 omniaudit-geo
```

### 7.2. Docker Compose
```bash
docker compose up -d
docker compose logs -f
```

### 7.3. Continuous Deployment via GitHub Actions & Render
The repository is wired with a production release pipeline (`.github/workflows/publish-container.yml`):
1. **Pre-flight Gate:** Runs all 6 verification gates; failure aborts container building.
2. **Container Smoke Test:** Builds container, boots local test daemon, validates `/api/health`, `/api/audit`, and MCP `initialize`.
3. **GHCR Publishing:** Publishes immutable OCI image to `ghcr.io/sh20raj/omniaudit-geo:latest` and `:vYYYY.MM.DD`.
4. **Render Auto-Deploy:** Triggers Render deploy webhook and polls `https://omniaudit-geo.onrender.com/api/health` until the deployment is verified live.

---

## 8. Automated 6-Gate Verification & Benchmarking

Every pull request and commit is validated through the unified 6-gate verification runner:

```bash
python3 scripts/verify.py --ci
```

### The 6 Verification Gates

```text
Gate 1: Hostile Security & SSRF Invariants (Private IPs, loopback, IPv6 obfuscation)
  └── 61 Unit Tests Passed
Gate 2: Core Audit Engine Invariants (Robots, Hydration, Schema, AEO, Readability)
  └── 95 Unit Tests Passed
Gate 3: 16 Golden Benchmarks Evaluation Harness
  └── 16/16 Passed | 100% Precision | 100% Recall | ~0.47 ms latency
Gate 4: Recursive JSON Schema Validation (audit_schema.json draft-07)
  └── 100% Schema Valid across all fixtures & negative tests
Gate 5: FastAPI Web Control Plane & MCP Server Integration
  └── 11 Unit Tests Passed | 33 Endpoints/Routes Mounted
Gate 6: Marketplace Package Packaging & Sandbox Verification
  └── omniaudit-geo-marketplace.zip built (0.09 MB) and executed in clean sandbox
```

Total Test Suite: **167 tests passed, 0 failed**.

---

## 9. Scoring Models & Remediation Taxonomy

### Composite Scores
1. **AI Citation Probability Index (ACPI, 0–100):**
   $$\text{ACPI} = 0.30 \times S_{\text{crawl}} + 0.25 \times S_{\text{entity}} + 0.25 \times S_{\text{aeo}} + 0.20 \times S_{\text{freshness}}$$
   Measures whether AI crawlers can fetch your content, understand entity context via Schema.org, extract atomic facts, and verify publisher authority.

2. **Cognitive Retention Score (CRS, 0–100):**
   $$\text{CRS} = 0.40 \times S_{\text{hero}} + 0.30 \times S_{\text{readability}} + 0.30 \times S_{\text{actionability}}$$
   Measures whether a human visitor referred by an AI search engine quickly understands what the brand does, finds clear answers, and encounters unambiguous next steps.

### Finding Severity Levels
* **`CRITICAL` (-15 to -20 pts):** Complete blockage of AI crawlers in `robots.txt` or total empty SPA hydration shell.
* **`HIGH` (-8 to -12 pts):** Missing `Organization` Schema.org entity, missing viewport, or major readability barriers.
* **`MEDIUM` (-4 to -6 pts):** Missing `sameAs` entity links, inaccessible tables, or weak heading structure.
* **`LOW` (-2 to -3 pts):** Missing `/llms.txt`, vague CTA labels ("Click here"), or image alt text gaps.

---

*Authored by Shaswat Raj ([@sh20raj](https://github.com/sh20raj)) & Prithvi ([@chikolavosaki-sys](https://github.com/chikolavosaki-sys)) for Adobe University Hackathon 2026.*
