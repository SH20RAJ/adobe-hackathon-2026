# Getting Started with OmniAudit-GEO

Welcome to **OmniAudit-GEO**. This guide walks you through system requirements, installation methods, running your first site audit, launching the local web control plane, and verifying your installation.

---

## 📋 System Prerequisites

* **Python:** Python 3.10 or higher (`python3 --version`).
* **Operating System:** Linux, macOS, or Windows (WSL recommended).
* **Dependencies:**
  * **Core CLI & Audit Engine:** **Zero pip dependencies.** Uses 100% Python standard library (`urllib`, `html.parser`, `re`, `json`, `math`).
  * **Optional Web Control Plane & MCP HTTP Server:** FastAPI, Uvicorn, Gradio 6, Pydantic, HTTPX (`omniaudit-geo/requirements.txt`).
* **Containerization (Optional):** Docker 24.0+ or Podman.

---

## ⚡ Installation Methods

OmniAudit-GEO provides four flexible installation paths:

### Method 1: Instant One-Liner (Recommended for Quick Evaluation)

Run directly from your terminal. This downloads the latest release archive, unpacks the skills and runtime into `~/.local/share/omniaudit-geo`, and links `omni` and `omniaudit` into `~/.local/bin` without requiring `git`:

```bash
curl -fsSL https://raw.githubusercontent.com/SH20RAJ/adobe-hackathon-2026/main/install.sh | bash
```

*Note: Ensure `~/.local/bin` is in your `$PATH` (e.g. `export PATH="$HOME/.local/bin:$PATH"`).*

### Method 2: Cloned Repository & Editable Python Package

For developers contributing to the codebase or modifying skills:

```bash
# 1. Clone the repository
git clone https://github.com/SH20RAJ/adobe-hackathon-2026.git
cd adobe-hackathon-2026

# 2. Install editable CLI wrapper in your active Python environment
pip install -e .

# 3. (Optional) Install Web UI & API control plane dependencies
pip install -e ".[web]"
```

Now `omni` and `omniaudit` are available directly in your terminal.

### Method 3: Zero-Install Immediate Execution

If you cannot install packages or symlinks, run the unified CLI script directly from the repository root:

```bash
python3 cli.py --url https://example.com
```

### Method 4: Docker / OCI Container

Run the production image published to the GitHub Container Registry:

```bash
docker run --rm -p 8000:8000 -e PORT=8000 ghcr.io/sh20raj/omniaudit-geo:stable
```

Open your browser at `http://localhost:8000` to interact with the Gradio UI and REST API.

---

## 🚀 Running Your First Audit

### 1. Full Master Audit (Terminal View)

Run an end-to-end audit across all 6 skills. The output displays colorized terminal summary cards, ACPI/CRS score badges, and prioritized findings:

```bash
omni --url https://example.com
# or:
python3 cli.py --url https://example.com
```

### 2. Exporting Audit Reports

Export the structured audit data in schema-validated JSON or formatted Markdown:

```bash
# Export strictly compliant JSON report
omni audit --url https://example.com --format json --output report.json

# Export formatted Markdown summary
omni audit --url https://example.com --format markdown --output report.md
```

### 3. Running Specialist Skills in Isolation

Diagnose specific failure modes independently:

```bash
# Skill 1: robots.txt AI permissions & JS hydration gaps
omni specialist crawl --url https://example.com

# Skill 2: Schema.org JSON-LD & sameAs entity links
omni specialist structured --url https://example.com

# Skill 3: LLM quotability & atomic fact density
omni specialist aeo --url https://example.com

# Skill 4: Publication freshness & publisher trust signals
omni specialist freshness --url https://example.com

# Skill 5: Above-the-fold value prop clarity & reading ease
omni specialist engagement --url https://example.com
```

---

## 🌐 Launching the Web Control Plane

OmniAudit-GEO includes a pure Python web interface built with Gradio 6 and FastAPI:

### Option A: Complete Web Control Plane (FastAPI + Gradio UI)

```bash
omni serve --port 8000
# or:
python3 cli.py serve --port 8000
```

Access services:
* **Interactive Gradio 6 UI:** `http://localhost:8000/`
* **Auditing API:** `http://localhost:8000/api/audit?url=https://example.com`
* **MCP JSON-RPC Endpoint:** `http://localhost:8000/api/mcp`
* **Interactive Swagger Documentation:** `http://localhost:8000/api/docs`
* **Health Probe:** `http://localhost:8000/api/health`

### Option B: Standalone Gradio UI (Port 7860)

```bash
python3 app.py
```
Open `http://localhost:7860` in your browser.

---

## ✅ Verifying Your Installation

Run the unified 6-gate verification loop to test anti-SSRF defenses, unittests, 16 golden benchmarks, schema compliance, FastAPI endpoints, and package sandbox execution:

```bash
omni verify --ci
# or:
python3 scripts/verify.py --ci
```

Expected output: `✅ ALL 6 VERIFICATION GATES PASSED — SUBMISSION READY` (167/167 tests passed).

---

## 🧭 Where to Go Next

* **[Master Architecture](architecture.md):** Learn how AST parsing, scoring synthesis, and progressive disclosure operate.
* **[Marketplace Specification](marketplace.md):** Understand the Adobe Hackathon submission boundary and `marketplace.json` manifest.
* **[Specialist Skills Catalog](skills.md):** Detailed algorithms and detection rules for each of the 6 skills.
* **[CLI Reference](cli.md):** Full documentation of all commands, options, and output formats.
* **[API Documentation](api.md):** REST endpoints, query parameters, and OpenAPI schema.
* **[Model Context Protocol (MCP)](mcp.md):** Integrate OmniAudit-GEO tools into Claude Desktop, Cursor, Antigravity, or Windsurf.
