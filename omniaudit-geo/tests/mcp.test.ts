import { describe, expect, it } from "bun:test";
import { GET, POST } from "../app/api/mcp/route";

describe("Model Context Protocol (MCP) Edge API", () => {
  it("GET /api/mcp returns protocol metadata and all 7 tools", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const data = (await res.json()) as any;
    expect(data.name).toBe("omniaudit-geo-mcp-server");
    expect(data.protocolVersion).toBe("2024-11-05");
    expect(Array.isArray(data.tools)).toBe(true);
    expect(data.tools.length).toBe(7);

    const toolNames = data.tools.map((t: any) => t.name);
    expect(toolNames).toContain("audit_website");
    expect(toolNames).toContain("audit_brand_ai_readiness");
    expect(toolNames).toContain("inspect_robots_and_rendering");
    expect(toolNames).toContain("inspect_structured_data");
    expect(toolNames).toContain("inspect_aeo_quotability");
    expect(toolNames).toContain("inspect_freshness_trust");
    expect(toolNames).toContain("inspect_on_site_retention");
  });

  it("POST /api/mcp handles 'initialize' JSON-RPC method", async () => {
    const req = new Request("http://localhost/api/mcp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = (await res.json()) as any;
    expect(data.jsonrpc).toBe("2.0");
    expect(data.id).toBe(1);
    expect(data.result.serverInfo.name).toBe("omniaudit-geo-mcp-server");
    expect(data.result.protocolVersion).toBe("2024-11-05");
  });

  it("POST /api/mcp handles 'tools/list' JSON-RPC method", async () => {
    const req = new Request("http://localhost/api/mcp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/list",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = (await res.json()) as any;
    expect(data.jsonrpc).toBe("2.0");
    expect(data.id).toBe(2);
    expect(data.result.tools.length).toBe(7);
  });

  it("POST /api/mcp returns -32601 for unknown method", async () => {
    const req = new Request("http://localhost/api/mcp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 3,
        method: "unknown_method",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(404);
    const data = (await res.json()) as any;
    expect(data.error.code).toBe(-32601);
  });
});
