# Unified Command-Line Interface (CLI) Reference

The OmniAudit-GEO CLI (`omni` / `omniaudit` / `cli.py`) is the single command-line entrypoint for auditing websites, running specialist diagnostics, starting the local web server, running benchmarks, and executing verification gates.

---

## ⚡ Command Invocation Shorthand

The CLI can be invoked using any of the following aliases:

```bash
# If installed via install.sh or pip install -e .:
omni <command> [options]
omniaudit <command> [options]

# Direct invocation from repository root without installation:
python3 cli.py <command> [options]
```

---

## 📖 Command Index

| Command | Description | Example |
| :--- | :--- | :--- |
| `[--url]` | Fast full audit shorthand (text output to terminal). | `omni --url https://example.com` |
| `audit` | Comprehensive master audit with format and file options. | `omni audit --url https://example.com --format json` |
| `specialist` | Run an isolated diagnostic skill against a target URL. | `omni specialist crawl --url https://example.com` |
| `serve` | Launch FastAPI web control plane and Gradio 6 UI. | `omni serve --port 8000` |
| `mcp` | Start Anthropic Model Context Protocol server (stdio). | `omni mcp --test` |
| `benchmark` | Run 16 Golden Benchmarks with latency telemetry. | `omni benchmark` |
| `verify` | Run the unified 6-gate automated verification loop. | `omni verify --ci` |
| `package` | Build and sandbox-verify the submission ZIP package. | `omni package` |

---

## 🛠️ Detailed Command Reference

### 1. Master Audit (`audit`)

Runs the full orchestration pipeline across all 6 skills, computes ACPI/CRS scores, and outputs findings.

```bash
omni audit --url <URL> [--format text|json|markdown] [--output <FILE>] [--quiet]
```

**Options:**
* `--url`, `-u` *(required)*: The target website URL (e.g., `https://example.com`).
* `--format`, `-f`: Output format. Choices: `text` (default, formatted terminal cards), `json` (strict `audit_schema.json`), `markdown` (formatted report table).
* `--output`, `-o`: File path to write the output report.
* `--quiet`, `-q`: Suppress banners and decorative headers.

**Examples:**
```bash
# Terminal view with ANSI colors
omni audit --url https://example.com

# Save strict JSON for programmatic CI ingestion
omni audit --url https://example.com --format json --output report.json

# Save Markdown report for GitHub PR comments
omni audit --url https://example.com --format markdown --output audit-summary.md
```

---

### 2. Specialist Diagnostics (`specialist`)

Runs an isolated diagnostic skill against the target URL.

```bash
omni specialist <skill> --url <URL> [--format text|json]
```

**Available Skills:**
* `crawl`: AI bot crawler policies (`robots.txt`) and JavaScript hydration content gaps.
* `structured`: Schema.org JSON-LD microdata extraction and `sameAs` entity disambiguation.
* `aeo`: Atomic fact density, question-and-answer headings, and facts locked in non-text images.
* `freshness`: Temporal freshness decay, copyright dates, and publisher trust corroboration.
* `engagement`: Above-the-fold value proposition clarity, reading ease grades, and CTA readiness.

**Examples:**
```bash
# Check only robots.txt and hydration gaps
omni specialist crawl --url https://example.com

# Check only Schema.org JSON-LD
omni specialist structured --url https://example.com --format json
```

---

### 3. Web Control Plane & UI Server (`serve`)

Launches the local web server.

```bash
omni serve [--port <PORT>] [--host <HOST>] [--reload] [--gradio-only]
```

**Options:**
* `--port`, `-p`: Port to bind (default: `8000`).
* `--host`: Host interface to bind (default: `0.0.0.0`).
* `--reload`: Enable auto-reload for local development.
* `--gradio-only`: Launch standalone Gradio interface on port 7860 without mounting FastAPI.

**Examples:**
```bash
# Run production web server
omni serve --port 8000

# Run with development auto-reload
omni serve --port 8000 --reload
```

---

### 4. Model Context Protocol Server (`mcp`)

Runs the Anthropic MCP server adapter for Claude Desktop, Cursor, Antigravity, and Windsurf.

```bash
omni mcp [--test]
```

**Options:**
* `--test`: Runs an internal protocol self-test verifying tool listing and mock execution.
* *(omitted)*: Starts the JSON-RPC 2.0 stdio server listening on standard input/output.

**Example:**
```bash
omni mcp --test
```

---

### 5. Benchmark Evaluation Suite (`benchmark`)

Evaluates the audit engine against the **16 Golden Fixtures** test matrix with precision, recall, and execution latency telemetry:

```bash
omni benchmark
```

---

### 6. Verification Loop (`verify`)

Executes the automated 6-gate verification loop:

```bash
omni verify [--ci]
```

**Options:**
* `--ci`: Enables strict CI mode (exits with code 1 if any gate or test assertion fails).

---

### 7. Submission Packager (`package`)

Assembles the official `omniaudit-geo-marketplace.zip` submission archive, enforces the $\le 50$ MB constraint, and verifies the package inside an unzipped sandbox:

```bash
omni package
```

---

## 💻 Piping & Shell Scripting Examples

Because `omni` outputs clean JSON when `--format json` is requested, it can be combined with standard Unix utilities:

```bash
# Extract ACPI score using jq
omni audit --url https://example.com --format json | jq '.scores.acpi'

# Count critical severity findings
omni audit --url https://example.com --format json | jq '.summary.critical'

# Fail CI build if critical findings exist
CRITICAL_COUNT=$(omni audit --url https://example.com --format json | jq '.summary.critical')
if [ "$CRITICAL_COUNT" -gt 0 ]; then
  echo "Audit failed: $CRITICAL_COUNT critical defects found"
  exit 1
fi
```
