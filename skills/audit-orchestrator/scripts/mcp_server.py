#!/usr/bin/env python3
"""
Model Context Protocol (MCP) Server Adapter for OmniAudit-GEO.
Enables Claude Desktop, Cursor, and Antigravity agents to discover and invoke
the Brand AI-Readiness Audit Marketplace natively via JSON-RPC.
"""

import sys
import json
import os

# Import orchestrator logic
from audit_runner import run_full_audit

def handle_json_rpc(request_str):
    try:
        req = json.loads(request_str)
        method = req.get("method")
        req_id = req.get("id")

        if method == "tools/list":
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "tools": [
                        {
                            "name": "audit_brand_ai_readiness",
                            "description": "Comprehensive audit of website AI Discoverability (GEO/AEO, robots.txt, Schema.org JSON-LD, JS hydration) and On-site Visitor Engagement.",
                            "inputSchema": {
                                "type": "object",
                                "properties": {
                                    "url": {
                                        "type": "string",
                                        "description": "The target website URL to audit (e.g. 'https://example.com')."
                                    }
                                },
                                "required": ["url"]
                            }
                        }
                    ]
                }
            }

        elif method == "tools/call":
            params = req.get("params", {})
            name = params.get("name")
            arguments = params.get("arguments", {})

            if name == "audit_brand_ai_readiness":
                target_url = arguments.get("url", "https://example.com")
                report = run_full_audit(target_url)
                return {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "result": {
                        "content": [
                            {
                                "type": "text",
                                "text": json.dumps(report, indent=2)
                            }
                        ]
                    }
                }
            else:
                return {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "error": {"code": -32601, "message": f"Tool '{name}' not found"}
                }

        elif method == "initialize":
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "protocolVersion": "2024-11-05",
                    "capabilities": {"tools": {}},
                    "serverInfo": {
                        "name": "omniaudit-geo-mcp-server",
                        "version": "1.0.0"
                    }
                }
            }

        else:
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "error": {"code": -32601, "message": f"Method '{method}' not implemented"}
            }

    except Exception as e:
        return {
            "jsonrpc": "2.0",
            "id": None,
            "error": {"code": -32700, "message": str(e)}
        }

def main():
    """Reads JSON-RPC messages line by line from stdin and responds on stdout."""
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        response = handle_json_rpc(line)
        sys.stdout.write(json.dumps(response) + "\n")
        sys.stdout.flush()

if __name__ == "__main__":
    main()
