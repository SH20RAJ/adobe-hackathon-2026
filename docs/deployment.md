# Deployment & Operations Architecture

This document details the deployment environments, container specifications, orchestration configs, and operational health checks for **OmniAudit-GEO**.

---

## 🚀 Live Canonical Production Deployment

* **Live Demo URL:** [https://omniaudit-geo.onrender.com/](https://omniaudit-geo.onrender.com/)
* **Platform:** Render Web Service (Standard Web Service, auto-deployed via webhook)
* **Image Registry:** GitHub Container Registry (`ghcr.io/sh20raj/omniaudit-geo:stable`)
* **Health Probe Endpoint:** `https://omniaudit-geo.onrender.com/api/health`
* **MCP Remote Endpoint:** `https://omniaudit-geo.onrender.com/api/mcp`
* **API Documentation:** `https://omniaudit-geo.onrender.com/docs`

---

## 🐳 Container Architecture (`Dockerfile`)

The production container is built using a minimal, secure, non-root base image:

```dockerfile
FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000 \
    HOST=0.0.0.0

RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

RUN groupadd -g 1001 appgroup && \
    useradd -u 1001 -g appgroup -m -s /bin/bash appuser

WORKDIR /app

COPY omniaudit-geo/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY marketplace.json ./marketplace.json
COPY README.md ./README.md
COPY cli.py ./cli.py
COPY app.py ./app.py
COPY skills/ ./skills/
COPY scripts/ ./scripts/
COPY omniaudit-geo/ ./omniaudit-geo/

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT}/api/health || exit 1

CMD ["sh", "-c", "python3 -m uvicorn main:app --app-dir omniaudit-geo --host 0.0.0.0 --port ${PORT}"]
```

---

## 📦 Deployment Methods

### 1. Running Pre-Built Container from GHCR

The GitHub Container Registry hosts the official production image:

```bash
docker run -d \
  --name omniaudit-geo \
  -p 8000:8000 \
  -e PORT=8000 \
  ghcr.io/sh20raj/omniaudit-geo:stable
```

### 2. Building & Running Locally with Docker

```bash
# Build local image
docker build -t omniaudit-geo:local .

# Run container
docker run --rm -p 8000:8000 -e PORT=8000 omniaudit-geo:local
```

### 3. Docker Compose

Run with `docker-compose.yml`:

```bash
docker compose up -d
```

Verify service:
```bash
curl http://localhost:8000/api/health
```

---

## ☁️ Cloud Platform Configurations

### DigitalOcean App Platform (`.do/app.yaml`)
OmniAudit-GEO includes a native DigitalOcean App Platform specification:

```yaml
name: omniaudit-geo
region: nyc
services:
- name: web
  image:
    registry_type: GHCR
    repository: sh20raj/omniaudit-geo
    tag: stable
  http_port: 8000
  instance_count: 1
  instance_size_slug: basic-xxs
  health_check:
    http_path: /api/health
    initial_delay_seconds: 10
    period_seconds: 30
    timeout_seconds: 5
  routes:
  - path: /
```

### Render Automated Deployment Webhook
The CI/CD pipeline (`.github/workflows/publish-container.yml`) automatically triggers deployment on Render upon successful push to `main` via the Render Deploy Hook. After triggering, the CI job polls `https://omniaudit-geo.onrender.com/api/health` and verifies the live audit and MCP endpoints.

---

## 🔧 Environment Variables

| Variable | Default | Purpose |
| :--- | :--- | :--- |
| `PORT` | `8000` | Port for the Uvicorn ASGI server. Dynamically injected by cloud hosts. |
| `HOST` | `0.0.0.0` | Host binding interface. |
| `PYTHONUNBUFFERED` | `1` | Ensures standard output logs flush immediately to stdout/stderr. |
| `NO_COLOR` | *(unset)* | When set, disables ANSI color codes in terminal CLI outputs. |

---

## 🩺 Operational Health Checks & Smoke Probes

To verify a running deployment:

```bash
# 1. Health liveness check
curl -f http://localhost:8000/api/health

# 2. Live audit execution smoke check
curl -f "http://localhost:8000/api/audit?url=https://example.com"

# 3. Live MCP JSON-RPC initialize check
curl -f -X POST http://localhost:8000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize"}'
```
