# Model Context Protocol (MCP) Integration Guide

OmniAudit-GEO implements a full **Model Context Protocol (MCP)** server adapter conforming to the Anthropic MCP specification (`protocolVersion: 2024-11-05`). This enables any modern AI assistant or IDE agent to discover and invoke audit tools directly.

---

## 🧰 Available MCP Tools

The MCP server exposes 6 dedicated diagnostic tools corresponding to the marketplace skills:

| Tool Name | Marketplace Skill | Description |
| :--- | :--- | :--- |
| **`audit_website`** | `audit-orchestrator` | Full master audit (ACPI, CRS, findings, and remediation assets). *(Alias: `audit_brand_ai_readiness`)* |
| **`inspect_robots_and_rendering`** | `crawl-render-audit` | Audits `robots.txt` AI crawler rules and client-side JS hydration gaps. |
| **`inspect_structured_data`** | `structured-entity-audit` | Validates Schema.org JSON-LD and entity `sameAs` graph anchors. |
| **`inspect_aeo_quotability`** | `aeo-quotability-audit` | Evaluates atomic fact density, Q&A headings, and table accessibility. |
| **`inspect_freshness_trust`** | `freshness-corroboration-audit` | Evaluates publication timestamp decay and on-page publisher trust markers. |
| **`inspect_on_site_retention`** | `on-site-engagement-audit` | Evaluates hero value proposition clarity, reading ease, and CTA readiness. |

---

## 🚀 Connection Methods

### Method 1: Remote HTTP Transport (Instant Connection)

Connect your AI agent directly to the live cloud endpoint without installing local dependencies:

```text
URL: https://omniaudit-geo.onrender.com/api/mcp
Transport: HTTP (POST) / SSE
```

### Method 2: Stdio Local Transport (Air-Gapped & Offline)

Run the Python MCP server locally via standard input/output:

```bash
# Launch stdio MCP server
omni mcp
# or:
python3 skills/audit-orchestrator/scripts/mcp_server.py
```

To run the built-in MCP self-test suite:
```bash
omni mcp --test
```

---

## ⚙️ Client Configurations

### 1. Claude Desktop

Add this configuration to your Claude Desktop config file:
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

Or via the remote HTTP endpoint:
```json
{
  "mcpServers": {
    "omniaudit-geo-remote": {
      "url": "https://omniaudit-geo.onrender.com/api/mcp"
    }
  }
}
```

---

### 2. Cursor IDE

In Cursor, navigate to **Settings $\rightarrow$ Features $\rightarrow$ MCP Servers $\rightarrow$ Add New MCP Server**, or configure `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "omniaudit-geo": {
      "command": "python3",
      "args": [
        "${workspaceFolder}/skills/audit-orchestrator/scripts/mcp_server.py"
      ]
    }
  }
}
```

---

### 3. Google Antigravity IDE

Configure in `.agents/mcp_config.json`:

```json
{
  "mcpServers": {
    "omniaudit": {
      "command": "python3",
      "args": [
        "${workspaceFolder}/skills/audit-orchestrator/scripts/mcp_server.py"
      ]
    }
  }
}
```

---

### 4. Windsurf / Codeium Cascade

In `~/.codeium/windsurf/mcp_config.json`:

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

## 💬 Example Agent Prompting

Once configured, simply ask your agent:

> *"Audit https://example.com for AI discoverability and on-site engagement using OmniAudit-GEO. Provide the ACPI score, any blocked AI crawlers in robots.txt, and recommend missing Schema.org JSON-LD markup."*

The agent will autonomously invoke `audit_website`, inspect the findings, and generate a tailored response.
