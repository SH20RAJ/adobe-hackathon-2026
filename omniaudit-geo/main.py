#!/usr/bin/env python3
"""
OmniAudit-GEO — Fast, Deterministic Web Control Plane & MCP API.
Powered by FastAPI & Gradio 6. Shares the exact same canonical Python audit engine,
safe_fetch, and MCP server as the CLI and skills marketplace.
100% pure Python. Zero React, zero JavaScript build dependencies.
"""

import sys
import os
import time
import json
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, Request, Response, Query, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse, HTMLResponse

# Add repository root and skill directories to sys.path to ensure unified source of truth
REPO_ROOT = Path(__file__).resolve().parent.parent
SKILLS_DIR = REPO_ROOT / "skills"
ORCHESTRATOR_SCRIPTS = SKILLS_DIR / "audit-orchestrator" / "scripts"
CRAWL_SCRIPTS = SKILLS_DIR / "crawl-render-audit" / "scripts"
ROOT_SCRIPTS = REPO_ROOT / "scripts"

for p in [str(ORCHESTRATOR_SCRIPTS), str(CRAWL_SCRIPTS), str(ROOT_SCRIPTS)]:
    if p not in sys.path:
        sys.path.insert(0, p)

from audit_runner import (
    run_full_audit,
    fetch_url,
    HTMLContentExtractor,
    audit_crawl_render,
    audit_structured_data,
    audit_aeo_quotability,
    audit_freshness_trust,
    audit_on_site_engagement,
    enrich_findings_actions,
)
from safe_fetch import normalize_url, FetchValidationError
from mcp_server import handle_json_rpc, MCP_TOOLS
from schema_validator import validate_report
from eval_benchmarks import run_evals
from seo_config import SEO_HEAD_HTML, NOSCRIPT_SEMANTIC_BODY, SEO_TITLE, SEO_DESCRIPTION

app = FastAPI(
    title="OmniAudit-GEO — Brand AI-Readiness & GEO Engine",
    description="Deterministic evaluation platform and Anthropic Model Context Protocol (MCP) server for website AI discoverability and visitor retention.",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

PUBLIC_DIR = Path(__file__).resolve().parent / "public"

# In-memory rate limiting per client IP (60 requests per minute)
RATE_LIMIT_WINDOW_SECONDS = 60
MAX_REQUESTS_PER_WINDOW = 60
_rate_limit_store = {}

@app.middleware("http")
async def security_and_rate_limit_middleware(request: Request, call_next):
    # 1. Rate Limiter for /api/ routes
    if request.url.path.startswith("/api/"):
        client_ip = request.headers.get("x-forwarded-for", "").split(",")[0].strip() or (request.client.host if request.client else "unknown")
        now = time.time()
        record = _rate_limit_store.get(client_ip)

        if not record or now > record["reset_time"]:
            _rate_limit_store[client_ip] = {"count": 1, "reset_time": now + RATE_LIMIT_WINDOW_SECONDS}
        else:
            if record["count"] >= MAX_REQUESTS_PER_WINDOW:
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={
                        "error": "Rate Limit Exceeded",
                        "error_code": "rate_limit_exceeded",
                        "message": f"Maximum rate of {MAX_REQUESTS_PER_WINDOW} requests per minute exceeded.",
                    },
                    headers={"Retry-After": str(int(record["reset_time"] - now))},
                )
            record["count"] += 1

    # 2. Process Request
    response: Response = await call_next(request)

    # 3. Security Headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "accelerometer=(), camera=(), geolocation=(), microphone=(), payment=()"
    if request.url.path.startswith("/api/"):
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, proxy-revalidate"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"

    # 4. SEO, OpenGraph & Schema.org JSON-LD Enrichment for HTML views
    if "text/html" in response.headers.get("content-type", ""):
        try:
            body_chunks = [chunk async for chunk in response.body_iterator]
            body_bytes = b"".join(body_chunks)
            body_str = body_bytes.decode("utf-8", errors="ignore")
            if "<head>" in body_str and "<!-- OpenGraph Metadata -->" not in body_str:
                body_str = body_str.replace("<head>", f"<head>\n{SEO_HEAD_HTML}\n", 1)
            if "<body" in body_str and "<noscript>" not in body_str:
                idx = body_str.find("<body")
                close_idx = body_str.find(">", idx)
                if close_idx != -1:
                    body_str = body_str[:close_idx+1] + f"\n{NOSCRIPT_SEMANTIC_BODY}\n" + body_str[close_idx+1:]

            headers = dict(response.headers)
            headers.pop("content-length", None)
            return HTMLResponse(content=body_str, status_code=response.status_code, headers=headers)
        except Exception:
            pass

    return response

# -------------------------------------------------------------
# REST API Endpoints
# -------------------------------------------------------------

@app.get("/api/health")
async def health_check():
    """Probe for service health and canonical Python engine readiness."""
    return {
        "status": "healthy",
        "service": "omniaudit-geo",
        "version": "1.0.0",
        "engine": "canonical-python-ast",
        "schema": "draft-07",
    }

@app.get("/api/audit")
async def audit_endpoint(url: str = Query(..., description="Target website URL to audit (e.g. 'https://adobe.com')")):
    """
    Executes the canonical brand AI-readiness and visitor engagement audit.
    Conforms strictly to skills/audit-orchestrator/references/audit_schema.json.
    """
    if not url or not url.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "Bad Request", "error_code": "missing_url", "message": "Query parameter 'url' is required."},
        )

    # Validate target against SSRF, loopback, private ranges, credentials, and non-web ports
    try:
        clean_url = normalize_url(url.strip())
    except FetchValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "Target Validation Error", "error_code": "ssrf_blocked", "message": str(exc)},
        )

    start_time = time.perf_counter()
    report = run_full_audit(clean_url)
    elapsed = time.perf_counter() - start_time
    report["latency"] = f"{elapsed:.2f}s"

    # Recursive schema validation assertion
    is_valid, schema_errors = validate_report(report)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "Schema Validation Error", "error_code": "schema_invalid", "details": schema_errors},
        )

    return report

@app.get("/api/audit/robots")
async def audit_robots_endpoint(url: str = Query(...)):
    """Specialist diagnostic: Crawl & robots.txt AI bot permissions."""
    clean_url = normalize_url(url.strip())
    fetch_res = fetch_url(clean_url)
    if fetch_res.get("error"):
        return {"site": clean_url, "error": fetch_res["error"], "findings": []}
    findings = audit_crawl_render(clean_url, fetch_res.get("html", ""), fetch_res.get("headers", {}))
    enrich_findings_actions(findings)
    return {"site": clean_url, "tool": "inspect_robots_and_rendering", "total_findings": len(findings), "findings": findings}

@app.get("/api/audit/structured")
async def audit_structured_endpoint(url: str = Query(...)):
    """Specialist diagnostic: Schema.org JSON-LD and sameAs entity disambiguation."""
    clean_url = normalize_url(url.strip())
    fetch_res = fetch_url(clean_url)
    if fetch_res.get("error"):
        return {"site": clean_url, "error": fetch_res["error"], "findings": []}
    extractor = HTMLContentExtractor()
    extractor.feed(fetch_res.get("html", ""))
    findings = audit_structured_data(clean_url, extractor)
    enrich_findings_actions(findings)
    return {"site": clean_url, "tool": "inspect_structured_data", "total_findings": len(findings), "findings": findings}

@app.get("/api/audit/aeo")
async def audit_aeo_endpoint(url: str = Query(...)):
    """Specialist diagnostic: AEO Quotability, fact density, and non-text assets."""
    clean_url = normalize_url(url.strip())
    fetch_res = fetch_url(clean_url)
    if fetch_res.get("error"):
        return {"site": clean_url, "error": fetch_res["error"], "findings": []}
    extractor = HTMLContentExtractor()
    extractor.feed(fetch_res.get("html", ""))
    findings = audit_aeo_quotability(extractor)
    enrich_findings_actions(findings)
    return {"site": clean_url, "tool": "inspect_aeo_quotability", "total_findings": len(findings), "findings": findings}

@app.get("/api/audit/freshness")
async def audit_freshness_endpoint(url: str = Query(...)):
    """Specialist diagnostic: Freshness metadata and trust corroboration signals."""
    clean_url = normalize_url(url.strip())
    fetch_res = fetch_url(clean_url)
    if fetch_res.get("error"):
        return {"site": clean_url, "error": fetch_res["error"], "findings": []}
    html = fetch_res.get("html", "")
    extractor = HTMLContentExtractor()
    extractor.feed(html)
    findings = audit_freshness_trust(extractor, html, clean_url)
    enrich_findings_actions(findings)
    return {"site": clean_url, "tool": "inspect_freshness_trust", "total_findings": len(findings), "findings": findings}

@app.get("/api/audit/engagement")
async def audit_engagement_endpoint(url: str = Query(...)):
    """Specialist diagnostic: On-site retention, hero clarity, and CTA specificity."""
    clean_url = normalize_url(url.strip())
    fetch_res = fetch_url(clean_url)
    if fetch_res.get("error"):
        return {"site": clean_url, "error": fetch_res["error"], "findings": []}
    extractor = HTMLContentExtractor()
    extractor.feed(fetch_res.get("html", ""))
    findings = audit_on_site_engagement(extractor)
    enrich_findings_actions(findings)
    return {"site": clean_url, "tool": "inspect_on_site_retention", "total_findings": len(findings), "findings": findings}

# -------------------------------------------------------------
# Anthropic Model Context Protocol (MCP) Endpoints
# -------------------------------------------------------------

@app.get("/mcp")
@app.get("/api/mcp")
async def mcp_info_endpoint():
    """Model Context Protocol (MCP) server capabilities and tool registry."""
    return {
        "name": "omniaudit-geo-mcp-server",
        "version": "1.0.0",
        "protocolVersion": "2024-11-05",
        "description": "OmniAudit-GEO: Brand AI-Readiness & GEO Audit MCP Server (FastAPI)",
        "endpoint": "/mcp",
        "tools": MCP_TOOLS,
    }

@app.post("/mcp")
@app.post("/api/mcp")
async def mcp_rpc_endpoint(request: Request):
    """
    JSON-RPC 2.0 handler for MCP tools/list, tools/call, and initialize.
    Directly invokes skills/audit-orchestrator/scripts/mcp_server.py.
    """
    try:
        raw_body = await request.body()
        body_str = raw_body.decode("utf-8")
        rpc_response = handle_json_rpc(body_str)
        return rpc_response
    except Exception as exc:
        return {
            "jsonrpc": "2.0",
            "id": None,
            "error": {"code": -32700, "message": f"Parse error: {str(exc)}"},
        }

@app.get("/api/benchmarks")
async def benchmarks_endpoint():
    """Runs the 16 Golden Fixtures benchmark harness and returns statistical metrics."""
    results = run_evals(return_dict=True)
    return results

# -------------------------------------------------------------
# Web Navigation & Redirect Handlers (Frontend is Pure Gradio)
# -------------------------------------------------------------

REDIRECT_HTML_CONTENT = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0; url=/">
{SEO_HEAD_HTML}
  <style>
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #0b0f19;
      color: #f8fafc;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 1rem;
      box-sizing: border-box;
    }}
    .card {{
      text-align: center;
      padding: 2.5rem;
      background: #111827;
      border: 1px solid #1f2937;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      max-width: 480px;
      width: 100%;
    }}
    a {{
      color: #38bdf8;
      text-decoration: none;
      font-weight: 600;
    }}
    a:hover {{
      text-decoration: underline;
    }}
  </style>
</head>
<body>
  <div class="card">
    <h2 style="margin-top:0; color:#ffffff;">OmniAudit<span style="color:#eb1000;">.GEO</span></h2>
    <p style="color:#94a3b8; line-height:1.5;">Navigating to the unified Gradio interface...</p>
    <p><a href="/">Click here to open OmniAudit-GEO</a></p>
  </div>
{NOSCRIPT_SEMANTIC_BODY}
  <script>window.location.replace('/');</script>
</body>
</html>
"""

@app.get("/audit", response_class=HTMLResponse)
async def serve_audit(request: Request, url: Optional[str] = None):
    return HTMLResponse(content=REDIRECT_HTML_CONTENT, status_code=200)

@app.get("/benchmarks", response_class=HTMLResponse)
async def serve_benchmarks(request: Request):
    return HTMLResponse(content=REDIRECT_HTML_CONTENT, status_code=200)

@app.get("/marketplace", response_class=HTMLResponse)
async def serve_marketplace(request: Request):
    return HTMLResponse(content=REDIRECT_HTML_CONTENT, status_code=200)

@app.get("/docs", response_class=HTMLResponse)
async def serve_docs(request: Request):
    return HTMLResponse(content=REDIRECT_HTML_CONTENT, status_code=200)

# Public static root files (favicons, logos, manifests, SEO robots & sitemaps)
@app.get("/favicon.ico")
async def serve_favicon():
    f = PUBLIC_DIR / "favicon.ico"
    return FileResponse(f) if f.is_file() else Response(status_code=404)

@app.get("/favicon.svg")
async def serve_favicon_svg():
    f = PUBLIC_DIR / "favicon.svg"
    return FileResponse(f, media_type="image/svg+xml") if f.is_file() else Response(status_code=404)

@app.get("/logo.svg")
async def serve_logo():
    f = PUBLIC_DIR / "logo.svg"
    return FileResponse(f, media_type="image/svg+xml") if f.is_file() else Response(status_code=404)

@app.get("/og-image.png")
async def serve_og():
    f = PUBLIC_DIR / "og-image.png"
    return FileResponse(f, media_type="image/png") if f.is_file() else Response(status_code=404)

@app.get("/manifest.json")
async def serve_manifest():
    f = PUBLIC_DIR / "manifest.json"
    return FileResponse(f, media_type="application/json") if f.is_file() else Response(status_code=404)

@app.get("/robots.txt", response_class=FileResponse)
async def serve_robots():
    f = PUBLIC_DIR / "robots.txt"
    return FileResponse(f, media_type="text/plain; charset=utf-8") if f.is_file() else Response(status_code=404)

@app.get("/sitemap.xml", response_class=FileResponse)
async def serve_sitemap():
    f = PUBLIC_DIR / "sitemap.xml"
    return FileResponse(f, media_type="application/xml; charset=utf-8") if f.is_file() else Response(status_code=404)

@app.get("/llms.txt", response_class=FileResponse)
async def serve_llms():
    f = PUBLIC_DIR / "llms.txt"
    return FileResponse(f, media_type="text/markdown; charset=utf-8") if f.is_file() else Response(status_code=404)

@app.get("/apple-touch-icon.png")
@app.get("/apple-touch-icon-precomposed.png")
async def serve_apple_touch_icon():
    f = PUBLIC_DIR / "apple-touch-icon.png"
    return FileResponse(f, media_type="image/png") if f.is_file() else Response(status_code=404)

@app.get("/icon-192.png")
async def serve_icon_192():
    f = PUBLIC_DIR / "icon-192.png"
    return FileResponse(f, media_type="image/png") if f.is_file() else Response(status_code=404)

@app.get("/icon-512.png")
async def serve_icon_512():
    f = PUBLIC_DIR / "icon-512.png"
    return FileResponse(f, media_type="image/png") if f.is_file() else Response(status_code=404)

# -------------------------------------------------------------
# Pure Gradio Frontend Mounting (Root / and Standalone)
# -------------------------------------------------------------
import gradio as gr
from gradio_ui import create_gradio_app

gradio_blocks = create_gradio_app()
app = gr.mount_gradio_app(
    app,
    gradio_blocks,
    path="/",
    head=SEO_HEAD_HTML,
    favicon_path=str(PUBLIC_DIR / "favicon.svg"),
)

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    print(f"🚀 Starting OmniAudit-GEO FastAPI Server on http://localhost:{port}")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
