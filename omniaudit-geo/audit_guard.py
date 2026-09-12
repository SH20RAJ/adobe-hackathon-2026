#!/usr/bin/env python3
"""
OmniAudit-GEO — Unified Audit Service Guard & Execution Layer.
Provides shared security invariants across FastAPI REST, Gradio Web UI, and JSON-RPC MCP:
  1. Thread-safe IP rate limiting (token bucket / sliding window)
  2. Concurrency limiting (bounded semaphore preventing denial of service)
  3. Strict SSRF validation and URL normalization (RFC 1918 / loopback / cloud metadata protection)
  4. Execution timeout policy (mitigates slowloris / target site hangs)
  5. Standardized error reporting and telemetry
"""

from __future__ import annotations

import os
import sys
import time
import threading
from concurrent.futures import ThreadPoolExecutor, TimeoutError
from pathlib import Path
from typing import Dict, Any, Tuple, Optional, List

# Ensure sibling directories are on sys.path
REPO_ROOT = Path(__file__).resolve().parent.parent
SKILLS_DIR = REPO_ROOT / "skills"
ORCHESTRATOR_SCRIPTS = SKILLS_DIR / "audit-orchestrator" / "scripts"
CRAWL_SCRIPTS = SKILLS_DIR / "crawl-render-audit" / "scripts"
ROOT_SCRIPTS = REPO_ROOT / "scripts"

for p in [str(ORCHESTRATOR_SCRIPTS), str(CRAWL_SCRIPTS), str(ROOT_SCRIPTS), str(REPO_ROOT / "omniaudit-geo")]:
    if p not in sys.path:
        sys.path.insert(0, p)

from safe_fetch import normalize_url, FetchValidationError
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
from mcp_server import handle_json_rpc

# ---------------------------------------------------------------------------
# Configuration & Guards
# ---------------------------------------------------------------------------

RATE_LIMIT_WINDOW_SECONDS = int(os.environ.get("OMNIAUDIT_RATE_LIMIT_WINDOW", 60))
MAX_REQUESTS_PER_WINDOW = int(os.environ.get("OMNIAUDIT_RATE_LIMIT_MAX", 60))
MAX_CONCURRENT_AUDITS = int(os.environ.get("OMNIAUDIT_MAX_CONCURRENT_AUDITS", 5))
AUDIT_TIMEOUT_SECONDS = float(os.environ.get("OMNIAUDIT_AUDIT_TIMEOUT", 15.0))

_rate_limit_lock = threading.Lock()
_rate_limit_store: Dict[str, Dict[str, Any]] = {}
_audit_semaphore = threading.BoundedSemaphore(MAX_CONCURRENT_AUDITS)
_executor = ThreadPoolExecutor(max_workers=MAX_CONCURRENT_AUDITS + 2, thread_name_prefix="audit-worker")


def check_rate_limit(client_ip: str) -> Tuple[bool, Optional[int]]:
    """
    Thread-safe rate limit verification for an IP address.
    Returns (is_allowed, retry_after_seconds).
    """
    if not client_ip or client_ip in ("127.0.0.1", "localhost", "testclient", "local"):
        # Local and testing clients are granted elevated limits
        limit = MAX_REQUESTS_PER_WINDOW * 5
    else:
        limit = MAX_REQUESTS_PER_WINDOW

    now = time.time()
    with _rate_limit_lock:
        record = _rate_limit_store.get(client_ip)
        if not record or now > record["reset_time"]:
            _rate_limit_store[client_ip] = {"count": 1, "reset_time": now + RATE_LIMIT_WINDOW_SECONDS}
            return True, None

        if record["count"] >= limit:
            retry_after = max(1, int(record["reset_time"] - now))
            return False, retry_after

        record["count"] += 1
        return True, None


def execute_guarded_audit(url: str, client_ip: str = "local") -> Dict[str, Any]:
    """
    Executes a complete website audit through the unified security guard layer.
    Enforces rate limiting, SSRF protection, concurrency control, and timeout bounds.
    """
    # 1. Rate limiting check
    allowed, retry_after = check_rate_limit(client_ip)
    if not allowed:
        return {
            "error": f"Rate limit exceeded. Maximum {MAX_REQUESTS_PER_WINDOW} requests per minute.",
            "error_code": "rate_limit_exceeded",
            "status_code": 429,
            "retry_after": retry_after,
        }

    # 2. Input validation & anti-SSRF URL normalization
    if not url or not url.strip():
        return {
            "error": "URL parameter is required and cannot be empty.",
            "error_code": "missing_url",
            "status_code": 422,
        }

    try:
        clean_url = normalize_url(url.strip())
    except FetchValidationError as exc:
        return {
            "error": f"Security Validation Block: {exc}",
            "error_code": "ssrf_blocked",
            "status_code": 400,
        }

    # 3. Concurrency Semaphore (prevent resource starvation)
    acquired = _audit_semaphore.acquire(blocking=True, timeout=5.0)
    if not acquired:
        return {
            "error": f"Server busy: Maximum concurrent audits ({MAX_CONCURRENT_AUDITS}) active. Please retry in a moment.",
            "error_code": "concurrency_limit_exceeded",
            "status_code": 429,
            "retry_after": 5,
        }

    try:
        # 4. Timeout-bounded execution
        future = _executor.submit(run_full_audit, clean_url)
        report = future.result(timeout=AUDIT_TIMEOUT_SECONDS)
        return report
    except TimeoutError:
        return {
            "error": f"Audit execution timed out after {AUDIT_TIMEOUT_SECONDS}s while analyzing {clean_url}.",
            "error_code": "audit_timeout",
            "status_code": 504,
        }
    except Exception as exc:
        return {
            "error": f"Audit execution failed: {str(exc)}",
            "error_code": "execution_failed",
            "status_code": 500,
        }
    finally:
        _audit_semaphore.release()


def execute_guarded_specialist_audit(skill_name: str, url: str, client_ip: str = "local") -> Tuple[str, List[Dict[str, Any]], Dict[str, Any]]:
    """
    Executes an individual specialist audit skill through the unified security guard layer.
    """
    # 1. Rate limiting check
    allowed, retry_after = check_rate_limit(client_ip)
    if not allowed:
        err = {"error": "Rate limit exceeded", "error_code": "rate_limit_exceeded", "status_code": 429, "retry_after": retry_after}
        return f"Rate limit exceeded (retry in {retry_after}s)", [], err

    # 2. Input validation & anti-SSRF
    if not url or not url.strip():
        err = {"error": "URL parameter is required", "error_code": "missing_url", "status_code": 422}
        return "URL parameter is required.", [], err

    try:
        clean_url = normalize_url(url.strip())
    except FetchValidationError as exc:
        err = {"error": str(exc), "error_code": "ssrf_blocked", "status_code": 400}
        return f"SSRF Intercept: {exc}", [], err

    # 3. Concurrency Semaphore
    acquired = _audit_semaphore.acquire(blocking=True, timeout=5.0)
    if not acquired:
        err = {"error": "Server busy", "error_code": "concurrency_limit_exceeded", "status_code": 429}
        return "Server busy: concurrent audit limit reached.", [], err

    try:
        def _run_specialist():
            fetch_res = fetch_url(clean_url)
            if fetch_res.get("error"):
                return f"Fetch Error: {fetch_res['error']}", [], fetch_res

            html = fetch_res.get("html", "")
            headers = fetch_res.get("headers", {})

            if "Crawl" in skill_name:
                findings = audit_crawl_render(clean_url, html, headers)
                desc = "Audited robots.txt crawler permissions across 7 major AI user-agents and checked client-side SPA hydration gaps."
            elif "Structured" in skill_name:
                extractor = HTMLContentExtractor()
                extractor.feed(html)
                findings = audit_structured_data(clean_url, extractor)
                desc = "Extracted and validated Schema.org JSON-LD microdata and authoritative sameAs entity disambiguation."
            elif "Quotability" in skill_name:
                extractor = HTMLContentExtractor()
                extractor.feed(html)
                findings = audit_aeo_quotability(extractor)
                desc = "Evaluated sentence-level atomic fact density, interrogative heading-to-answer structures, and non-text tabular assets."
            elif "Freshness" in skill_name:
                extractor = HTMLContentExtractor()
                extractor.feed(html)
                findings = audit_freshness_trust(extractor, html, clean_url)
                desc = "Audited publication timestamps vs. current year 2026, copyright recency, and author bylines/trust corroboration signals."
            else:
                extractor = HTMLContentExtractor()
                extractor.feed(html)
                findings = audit_on_site_engagement(extractor)
                desc = "Audited above-the-fold hero value prop clarity, Flesch-Kincaid & ARI readability grades, and CTA specificity."

            enrich_findings_actions(findings)
            meta = {
                "site": clean_url,
                "skill": skill_name,
                "total_findings": len(findings),
                "findings": findings,
            }
            summary = f"### {skill_name}\n**Diagnostic Scope:** {desc}\n\n**Total Diagnostic Findings:** `{len(findings)}`"
            return summary, findings, meta

        future = _executor.submit(_run_specialist)
        return future.result(timeout=AUDIT_TIMEOUT_SECONDS)
    except TimeoutError:
        err = {"error": "Timeout", "error_code": "audit_timeout", "status_code": 504}
        return f"Audit timed out after {AUDIT_TIMEOUT_SECONDS}s.", [], err
    except Exception as exc:
        err = {"error": str(exc), "error_code": "execution_failed", "status_code": 500}
        return f"Execution Error: {exc}", [], err
    finally:
        _audit_semaphore.release()


def execute_guarded_mcp(request_data: Dict[str, Any], client_ip: str = "local") -> Dict[str, Any]:
    """
    Executes a Model Context Protocol (MCP) JSON-RPC request through the security guard layer.
    """
    allowed, retry_after = check_rate_limit(client_ip)
    if not allowed:
        return {
            "jsonrpc": "2.0",
            "id": request_data.get("id"),
            "error": {
                "code": -32000,
                "message": f"Rate limit exceeded. Retry in {retry_after}s.",
            },
        }

    # If method is tools/call with a url, normalize and validate it
    method = request_data.get("method")
    if method == "tools/call":
        params = request_data.get("params", {})
        args = params.get("arguments", {})
        target_url = args.get("url")
        if target_url:
            try:
                args["url"] = normalize_url(target_url)
            except FetchValidationError as exc:
                return {
                    "jsonrpc": "2.0",
                    "id": request_data.get("id"),
                    "error": {
                        "code": -32602,
                        "message": f"SSRF Security Violation: {exc}",
                    },
                }

    try:
        return handle_json_rpc(request_data)
    except Exception as exc:
        return {
            "jsonrpc": "2.0",
            "id": request_data.get("id"),
            "error": {
                "code": -32603,
                "message": f"Internal MCP Server Error: {str(exc)}",
            },
        }
