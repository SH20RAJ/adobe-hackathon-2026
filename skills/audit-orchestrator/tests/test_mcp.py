#!/usr/bin/env python3
"""
Unit tests for OmniAudit-GEO Model Context Protocol (MCP) server adapter.
Exercises protocol lifecycle, all 7 tool calls, schema conformity,
and error handling (SSRF, missing params, invalid types, unknown tools).
"""

import os
import sys
import json
import unittest
from unittest.mock import patch

SCRIPTS_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "scripts")
)
if SCRIPTS_DIR not in sys.path:
    sys.path.insert(0, SCRIPTS_DIR)

from mcp_server import handle_json_rpc

SAMPLE_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
    <title>Acme AI Solutions - Enterprise Knowledge Platform</title>
    <meta name="description" content="Acme delivers real-time AI knowledge graph infrastructure.">
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Acme AI Corp",
        "url": "https://example.test",
        "sameAs": ["https://www.wikidata.org/wiki/Q12345"]
    }
    </script>
</head>
<body>
    <header>
        <nav><a href="/">Home</a><a href="/pricing">Pricing</a></nav>
    </header>
    <main>
        <h1>Next-Generation Knowledge Discovery Platform</h1>
        <p>Acme Corp deploys 5,000 enterprise neural graph indices with sub-millisecond retrieval latency across 42 availability zones.</p>
        <h2>What is Acme's verified deployment speed?</h2>
        <p>Acme deploys full federated cluster topologies in under 180 seconds with automated failover redundancy.</p>
        <a href="/demo">Schedule Enterprise Demo</a>
        <a href="/trial">Start Free Trial</a>
    </main>
    <footer>
        <p>&copy; 2026 Acme Corp. Updated on September 1, 2026.</p>
    </footer>
</body>
</html>"""

def mock_safe_fetch(url, **kwargs):
    if "127.0.0.1" in url or "localhost" in url or "169.254" in url:
        return {
            "status": 0,
            "headers": {},
            "body": b"",
            "html": "",
            "url": url,
            "error": "SSRF Blocked: Private IP or invalid target",
            "error_code": "SSRF_BLOCKED",
        }
    if url.endswith("/robots.txt"):
        return {
            "status": 200,
            "headers": {"content-type": "text/plain"},
            "body": b"User-agent: *\nAllow: /\n",
            "html": "User-agent: *\nAllow: /\n",
            "url": url,
            "error": None,
            "error_code": None,
        }
    return {
        "status": 200,
        "headers": {"content-type": "text/html; charset=utf-8"},
        "body": SAMPLE_HTML.encode("utf-8"),
        "html": SAMPLE_HTML,
        "url": url,
        "error": None,
        "error_code": None,
    }


class TestMCPServer(unittest.TestCase):
    def test_initialize(self):
        req = json.dumps({"jsonrpc": "2.0", "id": 1, "method": "initialize"})
        res = handle_json_rpc(req)
        self.assertEqual(res["jsonrpc"], "2.0")
        self.assertEqual(res["id"], 1)
        self.assertIn("serverInfo", res["result"])
        self.assertEqual(res["result"]["serverInfo"]["name"], "omniaudit-geo-mcp-server")

    def test_tools_list(self):
        req = json.dumps({"jsonrpc": "2.0", "id": 2, "method": "tools/list"})
        res = handle_json_rpc(req)
        self.assertEqual(res["jsonrpc"], "2.0")
        self.assertEqual(res["id"], 2)
        tools = res["result"]["tools"]
        self.assertEqual(len(tools), 7)
        tool_names = [t["name"] for t in tools]
        self.assertIn("audit_website", tool_names)
        self.assertIn("audit_brand_ai_readiness", tool_names)
        self.assertIn("inspect_robots_and_rendering", tool_names)
        self.assertIn("inspect_structured_data", tool_names)
        self.assertIn("inspect_aeo_quotability", tool_names)
        self.assertIn("inspect_freshness_trust", tool_names)
        self.assertIn("inspect_on_site_retention", tool_names)

    def test_unknown_method(self):
        req = json.dumps({"jsonrpc": "2.0", "id": 99, "method": "non_existent_method"})
        res = handle_json_rpc(req)
        self.assertEqual(res["error"]["code"], -32601)

    def test_unknown_tool_call(self):
        req = json.dumps({
            "jsonrpc": "2.0",
            "id": 100,
            "method": "tools/call",
            "params": {"name": "fake_tool", "arguments": {"url": "https://example.test"}}
        })
        res = handle_json_rpc(req)
        self.assertEqual(res["error"]["code"], -32601)

    def test_malformed_json(self):
        res = handle_json_rpc("{not valid json}")
        self.assertEqual(res["error"]["code"], -32700)

    # -------------------------------------------------------------
    # Deep Parameter Validation Tests
    # -------------------------------------------------------------
    def test_missing_params_object(self):
        req = json.dumps({
            "jsonrpc": "2.0",
            "id": 101,
            "method": "tools/call"
        })
        res = handle_json_rpc(req)
        self.assertEqual(res["error"]["code"], -32602)

    def test_missing_url_parameter(self):
        req = json.dumps({
            "jsonrpc": "2.0",
            "id": 102,
            "method": "tools/call",
            "params": {"name": "audit_website", "arguments": {}}
        })
        res = handle_json_rpc(req)
        self.assertEqual(res["error"]["code"], -32602)
        self.assertIn("url", res["error"]["message"])

    def test_non_string_url_parameter(self):
        req = json.dumps({
            "jsonrpc": "2.0",
            "id": 103,
            "method": "tools/call",
            "params": {"name": "audit_website", "arguments": {"url": 12345}}
        })
        res = handle_json_rpc(req)
        self.assertEqual(res["error"]["code"], -32602)

    def test_empty_string_url_parameter(self):
        req = json.dumps({
            "jsonrpc": "2.0",
            "id": 104,
            "method": "tools/call",
            "params": {"name": "audit_website", "arguments": {"url": "   "}}
        })
        res = handle_json_rpc(req)
        self.assertEqual(res["error"]["code"], -32602)

    # -------------------------------------------------------------
    # Tool Execution Tests (All 7 Tools with Deterministic Fixture)
    # -------------------------------------------------------------
    @patch("audit_runner.safe_fetch", side_effect=mock_safe_fetch)
    def test_call_audit_website_master(self, mock_fetch):
        req = json.dumps({
            "jsonrpc": "2.0",
            "id": 200,
            "method": "tools/call",
            "params": {"name": "audit_website", "arguments": {"url": "https://example.test"}}
        })
        res = handle_json_rpc(req)
        self.assertNotIn("error", res)
        content = json.loads(res["result"]["content"][0]["text"])
        # Master report must satisfy BrandAIReadinessAuditReport schema
        self.assertEqual(content["site"], "example.test")
        self.assertIn("audited_at", content)
        self.assertIn("summary", content)
        self.assertIn("findings", content)
        self.assertIn("metrics", content)
        self.assertIn("acpi_score", content["metrics"])
        self.assertIn("crs_score", content["metrics"])
        self.assertIn("proactive_recommendations", content)

    @patch("audit_runner.safe_fetch", side_effect=mock_safe_fetch)
    def test_call_audit_brand_ai_readiness_alias(self, mock_fetch):
        req = json.dumps({
            "jsonrpc": "2.0",
            "id": 201,
            "method": "tools/call",
            "params": {"name": "audit_brand_ai_readiness", "arguments": {"url": "https://example.test"}}
        })
        res = handle_json_rpc(req)
        self.assertNotIn("error", res)
        content = json.loads(res["result"]["content"][0]["text"])
        self.assertEqual(content["site"], "example.test")
        self.assertIn("metrics", content)

    @patch("audit_runner.safe_fetch", side_effect=mock_safe_fetch)
    def test_call_inspect_robots_and_rendering(self, mock_fetch):
        req = json.dumps({
            "jsonrpc": "2.0",
            "id": 202,
            "method": "tools/call",
            "params": {"name": "inspect_robots_and_rendering", "arguments": {"url": "https://example.test"}}
        })
        res = handle_json_rpc(req)
        self.assertNotIn("error", res)
        content = json.loads(res["result"]["content"][0]["text"])
        # Specialist tool must satisfy SpecialistAuditResult schema
        self.assertEqual(content["site"], "example.test")
        self.assertEqual(content["tool"], "inspect_robots_and_rendering")
        self.assertIn("total_findings", content)
        self.assertIsInstance(content["findings"], list)

    @patch("audit_runner.safe_fetch", side_effect=mock_safe_fetch)
    def test_call_inspect_structured_data(self, mock_fetch):
        req = json.dumps({
            "jsonrpc": "2.0",
            "id": 203,
            "method": "tools/call",
            "params": {"name": "inspect_structured_data", "arguments": {"url": "https://example.test"}}
        })
        res = handle_json_rpc(req)
        self.assertNotIn("error", res)
        content = json.loads(res["result"]["content"][0]["text"])
        self.assertEqual(content["tool"], "inspect_structured_data")
        self.assertIn("total_findings", content)

    @patch("audit_runner.safe_fetch", side_effect=mock_safe_fetch)
    def test_call_inspect_aeo_quotability(self, mock_fetch):
        req = json.dumps({
            "jsonrpc": "2.0",
            "id": 204,
            "method": "tools/call",
            "params": {"name": "inspect_aeo_quotability", "arguments": {"url": "https://example.test"}}
        })
        res = handle_json_rpc(req)
        self.assertNotIn("error", res)
        content = json.loads(res["result"]["content"][0]["text"])
        self.assertEqual(content["tool"], "inspect_aeo_quotability")
        self.assertIn("total_findings", content)

    @patch("audit_runner.safe_fetch", side_effect=mock_safe_fetch)
    def test_call_inspect_freshness_trust(self, mock_fetch):
        req = json.dumps({
            "jsonrpc": "2.0",
            "id": 205,
            "method": "tools/call",
            "params": {"name": "inspect_freshness_trust", "arguments": {"url": "https://example.test"}}
        })
        res = handle_json_rpc(req)
        self.assertNotIn("error", res)
        content = json.loads(res["result"]["content"][0]["text"])
        self.assertEqual(content["tool"], "inspect_freshness_trust")
        self.assertIn("total_findings", content)

    @patch("audit_runner.safe_fetch", side_effect=mock_safe_fetch)
    def test_call_inspect_on_site_retention(self, mock_fetch):
        req = json.dumps({
            "jsonrpc": "2.0",
            "id": 206,
            "method": "tools/call",
            "params": {"name": "inspect_on_site_retention", "arguments": {"url": "https://example.test"}}
        })
        res = handle_json_rpc(req)
        self.assertNotIn("error", res)
        content = json.loads(res["result"]["content"][0]["text"])
        self.assertEqual(content["tool"], "inspect_on_site_retention")
        self.assertIn("total_findings", content)

    # -------------------------------------------------------------
    # SSRF & Network Fault Toleration Tests
    # -------------------------------------------------------------
    @patch("audit_runner.safe_fetch", side_effect=mock_safe_fetch)
    def test_ssrf_blocked_private_ip(self, mock_fetch):
        req = json.dumps({
            "jsonrpc": "2.0",
            "id": 300,
            "method": "tools/call",
            "params": {"name": "inspect_robots_and_rendering", "arguments": {"url": "http://127.0.0.1"}}
        })
        res = handle_json_rpc(req)
        self.assertNotIn("error", res)
        content = json.loads(res["result"]["content"][0]["text"])
        self.assertIn("error", content)
        self.assertIn("SSRF Blocked", content["error"])
        self.assertEqual(content["total_findings"], 0)


if __name__ == "__main__":
    unittest.main()
