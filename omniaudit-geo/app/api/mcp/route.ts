/**
 * Model Context Protocol (MCP) Remote Endpoint for OmniAudit-GEO
 * Protocol Version: 2024-11-05 (JSON-RPC 2.0)
 *
 * Synchronized with skills/audit-orchestrator/scripts/mcp_server.py
 */

const MCP_TOOLS = [
  {
    name: "audit_website",
    description:
      "Comprehensive master audit of website AI Discoverability (GEO/AEO, robots.txt, Schema.org JSON-LD, JS hydration) and On-site Retention (CRS).",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The target website URL to audit (e.g. 'https://adobe.com').",
        },
      },
      required: ["url"],
    },
  },
  {
    name: "audit_brand_ai_readiness",
    description: "Alias for audit_website. Audits off-site AI Discoverability and on-site visitor retention.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The target website URL to audit.",
        },
      },
      required: ["url"],
    },
  },
  {
    name: "inspect_robots_and_rendering",
    description:
      "Audits robots.txt AI bot directives (GPTBot, ClaudeBot, PerplexityBot) and detects client-side hydration gaps in JavaScript SPAs.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "Target website URL.",
        },
      },
      required: ["url"],
    },
  },
  {
    name: "inspect_structured_data",
    description:
      "Validates Schema.org JSON-LD graph, verifying sameAs Wikidata and entity disambiguation to prevent LLM hallucinations.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "Target website URL.",
        },
      },
      required: ["url"],
    },
  },
  {
    name: "inspect_aeo_quotability",
    description:
      "Evaluates sentence-level atomic fact density, interrogative Q&A headers, and tabular accessibility for answer engines.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "Target website URL.",
        },
      },
      required: ["url"],
    },
  },
  {
    name: "inspect_freshness_trust",
    description:
      "Audits temporal freshness, copyright decay, author bylines, and citations for AI knowledge graph credibility.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "Target website URL.",
        },
      },
      required: ["url"],
    },
  },
  {
    name: "inspect_on_site_retention",
    description:
      "Evaluates hero section orientation, H1 conciseness, Flesch-Kincaid reading ease, CTA contrast, and bounce risk.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "Target website URL.",
        },
      },
      required: ["url"],
    },
  },
] as const;

export async function GET() {
  const info = {
    name: "omniaudit-geo",
    version: "1.0.0",
    protocolVersion: "2024-11-05",
    description: "Adobe OmniAudit GEO: Enterprise Brand AI-Readiness & GEO Audit MCP Server on Cloudflare Workers",
    endpoint: "https://omniaudit-geo.shraj.workers.dev/api/mcp",
    tools: MCP_TOOLS,
  };

  return Response.json(info, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, any>;
    const { id, method, params } = body;

    // JSON-RPC 2.0 initialize
    if (method === "initialize") {
      return Response.json(
        {
          jsonrpc: "2.0",
          id,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: {
              tools: {},
            },
            serverInfo: {
              name: "omniaudit-geo",
              version: "1.0.0",
            },
          },
        },
        {
          headers: { "Access-Control-Allow-Origin": "*" },
        }
      );
    }

    // JSON-RPC 2.0 tools/list
    if (method === "tools/list") {
      return Response.json(
        {
          jsonrpc: "2.0",
          id,
          result: {
            tools: MCP_TOOLS,
          },
        },
        {
          headers: { "Access-Control-Allow-Origin": "*" },
        }
      );
    }

    // JSON-RPC 2.0 tools/call
    if (method === "tools/call") {
      const toolName = params?.name;
      const targetUrl = params?.arguments?.url || "https://adobe.com";

      const matchedTool = MCP_TOOLS.find((t) => t.name === toolName);
      if (!matchedTool) {
        return Response.json(
          {
            jsonrpc: "2.0",
            id,
            error: { code: -32601, message: `Tool '${toolName}' not found` },
          },
          {
            status: 404,
            headers: { "Access-Control-Allow-Origin": "*" },
          }
        );
      }

      // Invoke internal audit API
      const origin = new URL(request.url).origin;
      const auditRes = await fetch(`${origin}/api/audit?url=${encodeURIComponent(targetUrl)}`);
      const report = (await auditRes.json()) as any;

      let responseText = "";
      if (toolName === "audit_website" || toolName === "audit_brand_ai_readiness") {
        responseText = `## Adobe OmniAudit GEO Report for ${report.site}
- **ACPI Score (AI Citation Probability):** ${report.summary?.acpi_score ?? "N/A"} / 100
- **CRS Score (Cognitive Retention):** ${report.summary?.crs_score ?? "N/A"} / 100
- **Total Findings:** ${report.summary?.total_findings ?? report.findings?.length ?? 0} (${report.summary?.critical ?? 0} critical, ${report.summary?.high ?? 0} high)

### Key Findings:
${(report.findings || [])
  .map(
    (f: any) =>
      `* **[${f.severity.toUpperCase()}] ${f.title}**: ${f.evidence}\n  * Remediation: ${f.suggested_action?.summary || f.suggested_action?.title}`
  )
  .join("\n")}
`;
      } else {
        // Filter findings relevant to sub-audit
        const categoryMap: Record<string, string[]> = {
          inspect_robots_and_rendering: ["crawlability", "hydration", "crawlability_ai_permissions", "crawlability_headers"],
          inspect_structured_data: ["structured", "schema", "structured_entity", "entity"],
          inspect_aeo_quotability: ["quotability", "aeo", "atomic", "aeo_quotability"],
          inspect_freshness_trust: ["freshness", "trust", "temporal", "freshness_trust"],
          inspect_on_site_retention: ["retention", "engagement", "readability", "hero"],
        };

        const allowedPrefixes = categoryMap[toolName] || [];
        const filteredFindings = (report.findings || []).filter((f: any) =>
          allowedPrefixes.some((prefix) => (f.category || "").toLowerCase().includes(prefix))
        );

        responseText = `## Tool: ${toolName} for ${report.site}
Total Relevant Findings: ${filteredFindings.length}

${
  filteredFindings.length === 0
    ? "No critical defects detected for this diagnostic domain."
    : filteredFindings
        .map(
          (f: any) =>
            `* **[${f.severity.toUpperCase()}] ${f.title}**: ${f.evidence}\n  * Fix: ${f.suggested_action?.summary || f.suggested_action?.title}`
        )
        .join("\n")
}
`;
      }

      return Response.json(
        {
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: responseText,
              },
            ],
          },
        },
        {
          headers: { "Access-Control-Allow-Origin": "*" },
        }
      );
    }

    return Response.json(
      {
        jsonrpc: "2.0",
        id,
        error: { code: -32601, message: `Method '${method}' not found` },
      },
      {
        status: 404,
        headers: { "Access-Control-Allow-Origin": "*" },
      }
    );
  } catch (err: any) {
    return Response.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: { code: -32603, message: err.message || "Internal server error" },
      },
      {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
      }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
