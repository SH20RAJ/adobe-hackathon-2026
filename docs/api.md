# Web Control Plane & REST API Reference

OmniAudit-GEO provides a production-ready asynchronous REST API built with **FastAPI** (`omniaudit-geo/main.py`). The API mounts the audit engine, health checks, benchmark reports, and remote MCP server.

---

## 🌐 Server Endpoints Index

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Container & service liveness probe. |
| `GET` | `/api/audit` | Comprehensive master site audit across all 6 skills. |
| `GET` | `/api/audit/robots` | Specialist Skill 1: robots.txt AI permissions & hydration gaps. |
| `GET` | `/api/audit/structured`| Specialist Skill 2: Schema.org JSON-LD & sameAs graphs. |
| `GET` | `/api/audit/aeo` | Specialist Skill 3: AEO fact density & quotability. |
| `GET` | `/api/audit/freshness` | Specialist Skill 4: Publication dates & publisher trust. |
| `GET` | `/api/audit/engagement`| Specialist Skill 5: Value prop clarity & reading ease. |
| `GET` | `/api/benchmarks` | Current 16 Golden Benchmarks evaluation telemetry. |
| `POST`| `/api/mcp` | Remote Model Context Protocol (JSON-RPC 2.0) endpoint. |
| `GET` | `/api/mcp` | MCP tool catalog discovery information. |
| `GET` | `/api/docs` | Interactive Swagger UI API documentation. |
| `GET` | `/api/redoc` | Interactive ReDoc API documentation. |

---

## 🛠️ Detailed Endpoint Specifications

### 1. Health Check (`GET /api/health`)

Used by container orchestrators (Docker, Kubernetes, Render, DigitalOcean) to verify container readiness.

* **Response Status:** `200 OK`
* **Response Body:**
  ```json
  {
    "status": "healthy",
    "service": "omniaudit-geo",
    "version": "1.0.0",
    "timestamp": "2026-09-13T10:00:00Z"
  }
  ```

---

### 2. Master Audit (`GET /api/audit`)

Runs a full site audit across all 6 marketplace skills.

* **Query Parameters:**
  * `url` *(string, required)*: The target website URL (e.g. `https://example.com`).
* **Response Status:** `200 OK` (or `400 Bad Request` if URL is invalid/private)
* **Response Schema:** Conforms strictly to [`references/audit_schema.json`](../skills/audit-orchestrator/references/audit_schema.json).
* **Example Request:**
  ```bash
  curl "http://localhost:8000/api/audit?url=https://example.com"
  ```
* **Example Response Structure:**
  ```json
  {
    "site": "example.com",
    "url": "https://example.com",
    "audited_at": "2026-09-13T10:05:00.000Z",
    "scores": {
      "acpi": 92.4,
      "crs": 94.0,
      "acpi_breakdown": {
        "crawlability": 100.0,
        "renderability": 95.0,
        "entity": 88.0,
        "quotability": 85.0,
        "freshness": 90.0
      },
      "crs_breakdown": {
        "orientation": 95.0,
        "intent": 92.0,
        "readability": 94.0,
        "actionability": 95.0
      }
    },
    "summary": {
      "total_findings": 3,
      "critical": 0,
      "high": 1,
      "medium": 2,
      "low": 0
    },
    "findings": [
      {
        "id": "F-001",
        "category": "structured-data",
        "severity": "high",
        "title": "Missing Organization Schema.org JSON-LD",
        "description": "The page does not declare a structured Organization entity.",
        "evidence": "0 JSON-LD scripts found",
        "remediation": "Embed Schema.org Organization JSON-LD script block."
      }
    ],
    "remediation_assets": {
      "schema_jsonld": "{ ... }",
      "robots_txt": "User-agent: GPTBot\nAllow: / ...",
      "llms_txt": "# LLMs.txt ..."
    }
  }
  ```

---

### 3. Specialist Skill Endpoints

Execute individual diagnostic domains in isolation:

```bash
# Specialist 1: Crawl & Hydration
curl "http://localhost:8000/api/audit/robots?url=https://example.com"

# Specialist 2: Structured Data & Entities
curl "http://localhost:8000/api/audit/structured?url=https://example.com"

# Specialist 3: AEO & Fact Quotability
curl "http://localhost:8000/api/audit/aeo?url=https://example.com"

# Specialist 4: Freshness & Publisher Trust
curl "http://localhost:8000/api/audit/freshness?url=https://example.com"

# Specialist 5: On-Site Cognitive Retention
curl "http://localhost:8000/api/audit/engagement?url=https://example.com"
```

---

### 4. Benchmark Telemetry (`GET /api/benchmarks`)

Returns real-time statistical evaluation metrics across the 16 Golden Fixtures:

```bash
curl "http://localhost:8000/api/benchmarks"
```

---

### 5. Remote MCP Endpoint (`POST /api/mcp`)

Standard JSON-RPC 2.0 endpoint implementing the Anthropic Model Context Protocol.

* **Headers:** `Content-Type: application/json`
* **Initialize Request:**
  ```json
  {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "clientInfo": { "name": "claude-desktop", "version": "1.0.0" }
    }
  }
  ```

---

## 🛡️ Guardrails, Rate Limiting & Concurrency

All API requests pass through the unified guard (`omniaudit-geo/audit_guard.py`):

1. **Anti-SSRF Validation:** Rejects any target URL resolving to localhost (`127.0.0.1`), private RFC 1918 networks (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), link-local metadata (`169.254.169.254`), or IPv6 loopback (`::1`). Returns `400 Bad Request`.
2. **Rate Limiting:** Sliding-window rate limit enforced per client IP address (default: **30 requests per minute**). Exceeding limits returns `429 Too Many Requests`.
3. **Concurrency Semaphore:** Maximum **10 simultaneous audit executions** to prevent resource starvation. Subsequent requests return `503 Service Unavailable`.
4. **Timeouts & Size Limits:** External page fetches timeout at **10 seconds** and are capped at **5 MB**.
