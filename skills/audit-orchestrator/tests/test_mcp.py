#!/usr/bin/env python3
"""
Unit tests for OmniAudit-GEO Model Context Protocol (MCP) server adapter.
"""

import os
import sys
import json
import unittest

SCRIPTS_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "scripts")
)
if SCRIPTS_DIR not in sys.path:
    sys.path.insert(0, SCRIPTS_DIR)

from mcp_server import handle_json_rpc, MCP_TOOLS

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
            "params": {"name": "fake_tool", "arguments": {}}
        })
        res = handle_json_rpc(req)
        self.assertEqual(res["error"]["code"], -32601)

    def test_malformed_json(self):
        res = handle_json_rpc("{not valid json}")
        self.assertEqual(res["error"]["code"], -32700)

if __name__ == "__main__":
    unittest.main()
