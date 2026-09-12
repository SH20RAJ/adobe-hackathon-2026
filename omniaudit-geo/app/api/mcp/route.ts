/**
 * Model Context Protocol (MCP) Remote Endpoint for OmniAudit-GEO.
 * Protocol Version: 2024-11-05 (JSON-RPC 2.0).
 * True adapter over the canonical audit engine, with exact parity to Python mcp_server.py.
 */

import {
  runFullAudit,
  safeFetch,
  HTMLContentExtractor,
  auditCrawlRender,
  auditStructuredData,
  auditAeoQuotability,
  auditFreshnessTrust,
  auditOnSiteEngagement,
  enrichFindingsActions,
  validateTargetUrl,
} from "@/lib/engine";

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

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json; charset=utf-8",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  return Response.json(
    {
      name: "omniaudit-geo-mcp-server",
      version: "1.0.0",
      protocolVersion: "2024-11-05",
      description: "OmniAudit-GEO: Brand AI-Readiness & GEO Audit MCP Server",
      endpoint: "https://omniaudit-geo.shraj.workers.dev/api/mcp",
      tools: MCP_TOOLS,
    },
    { headers: CORS_HEADERS }
  );
}

export async function POST(request: Request) {
  let body: Record<string, any>;
  try {
    body = (await request.json()) as Record<string, any>;
  } catch (err) {
    return Response.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: { code: -32700, message: "Parse error: Invalid JSON payload" },
      },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const { id = null, method, params } = body;

  // JSON-RPC 2.0 initialize
  if (method === "initialize") {
    return Response.json(
      {
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: { tools: {} },
          serverInfo: {
            name: "omniaudit-geo-mcp-server",
            version: "1.0.0",
          },
        },
      },
      { headers: CORS_HEADERS }
    );
  }

  // JSON-RPC 2.0 tools/list
  if (method === "tools/list") {
    return Response.json(
      {
        jsonrpc: "2.0",
        id,
        result: { tools: MCP_TOOLS },
      },
      { headers: CORS_HEADERS }
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
        { status: 404, headers: CORS_HEADERS }
      );
    }

    const validation = validateTargetUrl(targetUrl);
    if (!validation.valid || !validation.normalized) {
      return Response.json(
        {
          jsonrpc: "2.0",
          id,
          error: {
            code: -32602,
            message: `Invalid URL argument: ${validation.error}`,
          },
        },
        { status: 400, headers: CORS_HEADERS }
      );
    }
    const cleanUrl = validation.normalized;

    try {
      let resultData: any;

      if (toolName === "audit_website" || toolName === "audit_brand_ai_readiness") {
        resultData = await runFullAudit(cleanUrl);
      } else {
        // Sub-audit execution directly invoking specialist analyzer
        const fetchRes = await safeFetch(cleanUrl, { timeoutMs: 5000, requireHtml: true });
        let domain = "";
        try {
          domain = new URL(cleanUrl).hostname;
        } catch {
          domain = cleanUrl;
        }

        if (fetchRes.error) {
          resultData = {
            site: domain,
            tool: toolName,
            error: fetchRes.error,
            findings: [],
          };
        } else {
          const html = fetchRes.html;
          const headers = fetchRes.headers;
          const extractor = new HTMLContentExtractor();
          extractor.feed(html);

          let findings: any[] = [];
          if (toolName === "inspect_robots_and_rendering") {
            findings = await auditCrawlRender(cleanUrl, html, headers);
          } else if (toolName === "inspect_structured_data") {
            findings = auditStructuredData(cleanUrl, extractor);
          } else if (toolName === "inspect_aeo_quotability") {
            findings = auditAeoQuotability(extractor);
          } else if (toolName === "inspect_freshness_trust") {
            findings = auditFreshnessTrust(extractor, html, cleanUrl);
          } else if (toolName === "inspect_on_site_retention") {
            findings = auditOnSiteEngagement(extractor);
          }

          enrichFindingsActions(findings);
          resultData = {
            site: domain,
            tool: toolName,
            total_findings: findings.length,
            findings,
          };
        }
      }

      return Response.json(
        {
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(resultData, null, 2),
              },
            ],
          },
        },
        { headers: CORS_HEADERS }
      );
    } catch (err: any) {
      return Response.json(
        {
          jsonrpc: "2.0",
          id,
          error: { code: -32603, message: "Internal tool execution failed" },
        },
        { status: 500, headers: CORS_HEADERS }
      );
    }
  }

  return Response.json(
    {
      jsonrpc: "2.0",
      id,
      error: { code: -32601, message: `Method '${method}' not found` },
    },
    { status: 404, headers: CORS_HEADERS }
  );
}
