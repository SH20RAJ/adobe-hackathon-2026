export async function GET(request: Request) {
  const info = {
    name: "omniaudit-geo",
    version: "1.0.0",
    protocolVersion: "2024-11-05",
    description: "OmniAudit-GEO: Enterprise Brand AI-Readiness & GEO Audit MCP Server on Cloudflare Workers",
    endpoint: "https://omniaudit-geo.shraj.workers.dev/api/mcp",
    tools: [
      {
        name: "audit_website",
        description: "Audits a website for AI Discoverability (GEO/AEO, robots.txt, Schema.org JSON-LD, hydration gaps) and On-site Retention (CRS). Returns ACPI score and prioritized remediation actions.",
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "The full target URL to audit (e.g. https://example.com)"
            }
          },
          required: ["url"]
        }
      },
      {
        name: "inspect_robots_ai",
        description: "Checks robots.txt for AI crawler allow/disallow directives (GPTBot, ClaudeBot, PerplexityBot).",
        inputSchema: {
          type: "object",
          properties: {
            url: { type: "string", description: "Target domain URL" }
          },
          required: ["url"]
        }
      }
    ]
  };

  return Response.json(info, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    }
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, method, params } = body;

    // JSON-RPC 2.0 Handling
    if (method === "initialize") {
      return Response.json({
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: {
            tools: {}
          },
          serverInfo: {
            name: "omniaudit-geo",
            version: "1.0.0"
          }
        }
      }, {
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    }

    if (method === "tools/list") {
      return Response.json({
        jsonrpc: "2.0",
        id,
        result: {
          tools: [
            {
              name: "audit_website",
              description: "Audits a website for AI Discoverability (GEO/AEO, robots.txt, Schema.org JSON-LD, hydration gaps) and On-site Retention (CRS). Returns ACPI score and prioritized remediation actions.",
              inputSchema: {
                type: "object",
                properties: {
                  url: {
                    type: "string",
                    description: "Target URL to audit (e.g. https://example.com)"
                  }
                },
                required: ["url"]
              }
            }
          ]
        }
      }, {
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    }

    if (method === "tools/call") {
      const toolName = params?.name;
      const targetUrl = params?.arguments?.url || "https://example.com";

      // Call our internal audit API
      const origin = new URL(request.url).origin;
      const auditRes = await fetch(`${origin}/api/audit?url=${encodeURIComponent(targetUrl)}`);
      const report = await auditRes.json();

      const summaryText = `## OmniAudit-GEO Report for ${report.site}
- **ACPI Score (AI Citation Probability):** ${report.summary.acpi_score} / 100
- **CRS Score (Cognitive Retention):** ${report.summary.crs_score} / 100
- **Total Findings:** ${report.summary.total_findings} (${report.summary.critical} critical, ${report.summary.high} high)

### Key Findings:
${report.findings.map((f: any) => `* **[${f.severity.toUpperCase()}] ${f.title}**: ${f.description || f.evidence}\n  * Fix: ${f.suggested_action?.summary || f.suggested_action?.title}`).join("\n")}
`;

      return Response.json({
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "text",
              text: summaryText
            }
          ]
        }
      }, {
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    }

    return Response.json({
      jsonrpc: "2.0",
      id,
      error: { code: -32601, message: `Method '${method}' not found` }
    }, {
      status: 404,
      headers: { "Access-Control-Allow-Origin": "*" }
    });

  } catch (err: any) {
    return Response.json({
      jsonrpc: "2.0",
      id: null,
      error: { code: -32603, message: err.message || "Internal server error" }
    }, {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" }
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    }
  });
}
