#!/usr/bin/env python3
"""
Unit tests for the OmniAudit-GEO FastAPI control plane and MCP API.
Validates all endpoints, SSRF blocks, JSON-RPC MCP adapter, and SSR HTML views.
"""

import sys
import os
import json
import unittest
from pathlib import Path
from unittest.mock import patch

from starlette.testclient import TestClient

WEBAPP_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(WEBAPP_DIR))

from main import app

class TestFastAPIApp(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_health_check(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["service"], "omniaudit-geo")

    def test_audit_missing_url(self):
        res = self.client.get("/api/audit")
        self.assertEqual(res.status_code, 422)  # FastAPI validation error for missing query param

    def test_audit_ssrf_blocking(self):
        # Adversarial targets that must be rejected with 400
        for bad_url in [
            "http://127.0.0.1",
            "http://localhost",
            "http://169.254.169.254",
            "http://10.0.0.1",
            "http://192.168.1.1",
            "http://2130706433",
            "http://[::1]",
            "http://user:pass@example.com",
            "ftp://example.com",
        ]:
            res = self.client.get(f"/api/audit?url={bad_url}")
            self.assertEqual(res.status_code, 400, f"Expected 400 for {bad_url}, got {res.status_code}")
            data = res.json()
            self.assertIn("error_code", data["detail"])
            self.assertEqual(data["detail"]["error_code"], "ssrf_blocked")

    def test_audit_successful_mocked(self):
        def fake_fetch(url, **kwargs):
            return {
                "status": 200,
                "headers": {"content-type": "text/html"},
                "body": b"<html><h1>Test Heading</h1><p>Test paragraph content for audit.</p></html>",
                "html": "<html><h1>Test Heading</h1><p>Test paragraph content for audit.</p></html>",
                "url": url,
                "error": None,
                "error_code": None
            }

        with patch("audit_runner.safe_fetch", side_effect=fake_fetch):
            res = self.client.get("/api/audit?url=https://acme.example.com")
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertEqual(data["site"], "acme.example.com")
            self.assertIn("metrics", data)
            self.assertIn("summary", data)
            self.assertIn("findings", data)
            self.assertIn("proactive_recommendations", data)

    def test_mcp_get_info(self):
        for path in ["/mcp", "/api/mcp"]:
            res = self.client.get(path)
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertEqual(data["name"], "omniaudit-geo-mcp-server")
            self.assertEqual(data["protocolVersion"], "2024-11-05")
            self.assertEqual(len(data["tools"]), 7)

    def test_mcp_post_initialize(self):
        req = {"jsonrpc": "2.0", "id": 1, "method": "initialize"}
        res = self.client.post("/api/mcp", json=req)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["jsonrpc"], "2.0")
        self.assertEqual(data["id"], 1)
        self.assertEqual(data["result"]["serverInfo"]["name"], "omniaudit-geo-mcp-server")

    def test_mcp_post_tools_list(self):
        req = {"jsonrpc": "2.0", "id": 2, "method": "tools/list"}
        res = self.client.post("/api/mcp", json=req)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(len(data["result"]["tools"]), 7)
        tool_names = [t["name"] for t in data["result"]["tools"]]
        self.assertIn("audit_website", tool_names)
        self.assertIn("inspect_robots_and_rendering", tool_names)

    def test_ssr_html_routes(self):
        for path in ["/", "/audit", "/benchmarks", "/marketplace", "/docs"]:
            res = self.client.get(path)
            self.assertEqual(res.status_code, 200, f"Expected 200 for {path}")
            self.assertIn("text/html", res.headers["content-type"])
            self.assertIn("OmniAudit", res.text)

if __name__ == "__main__":
    unittest.main()
