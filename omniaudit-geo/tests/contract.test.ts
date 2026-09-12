import { describe, expect, it } from "bun:test";
import { runFullAudit } from "../lib/engine/orchestrator";
import { validateAuditReport } from "../lib/engine/schema";
import { GET } from "../app/api/audit/route";
import { POST } from "../app/api/mcp/route";

const FIXTURE_CLEAN = `<!DOCTYPE html>
<html>
<head>
  <title>Acme AI Intelligence</title>
  <meta property="article:modified_time" content="2026-09-01T00:00:00Z">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "name": "Acme AI Corp",
        "url": "https://acme.example.com",
        "sameAs": ["https://www.wikidata.org/wiki/Q12345"]
      },
      {
        "@type": "WebSite",
        "name": "Acme Official",
        "url": "https://acme.example.com"
      }
    ]
  }
  </script>
</head>
<body>
  <h1>Autonomous Brand Intelligence Platform</h1>
  <p>Acme delivers high-speed AI discoverability evaluation with 99.9% uptime across 5000 enterprise users.</p>
  <a href="/contact" class="btn">Contact sales</a>
</body>
</html>`;

describe("Canonical Audit Engine Contract Parity", () => {
  it("produces schema-compliant report from orchestrator", async () => {
    const report = await runFullAudit("https://acme.example.com", {
      html: FIXTURE_CLEAN,
    });

    expect(report.site).toBe("acme.example.com");
    expect(report.summary.total_findings).toBe(report.findings.length);
    expect(report.metrics.acpi_score).toBeGreaterThanOrEqual(0);
    expect(report.metrics.acpi_score).toBeLessThanOrEqual(100);
    expect(report.metrics.crs_score).toBeGreaterThanOrEqual(0);
    expect(report.metrics.crs_score).toBeLessThanOrEqual(100);

    const schemaResult = validateAuditReport(report);
    expect(schemaResult.valid).toBe(true);
    expect(schemaResult.errors).toEqual([]);
  });

  it("produces deterministic, invariant finding IDs across runs", async () => {
    const report1 = await runFullAudit("https://acme.example.com", { html: FIXTURE_CLEAN });
    const report2 = await runFullAudit("https://acme.example.com", { html: FIXTURE_CLEAN });

    expect(report1.metrics.acpi_score).toBe(report2.metrics.acpi_score);
    expect(report1.metrics.crs_score).toBe(report2.metrics.crs_score);
    expect(report1.findings.map((f) => f.id)).toEqual(report2.findings.map((f) => f.id));
  });

  it("MCP tools/call returns same structure and findings as direct audit", async () => {
    const directReport = await runFullAudit("https://acme.example.com", { html: FIXTURE_CLEAN });

    const mcpReq = new Request("http://localhost/api/mcp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 42,
        method: "tools/call",
        params: {
          name: "audit_website",
          arguments: { url: "https://acme.example.com" },
        },
      }),
    });

    const mcpRes = await POST(mcpReq);
    expect(mcpRes.status).toBe(200);
    const mcpData = (await mcpRes.json()) as any;
    expect(mcpData.jsonrpc).toBe("2.0");
    expect(mcpData.id).toBe(42);
    expect(Array.isArray(mcpData.result.content)).toBe(true);

    const parsedMcpPayload = JSON.parse(mcpData.result.content[0].text);
    expect(parsedMcpPayload.site).toBe("acme.example.com");
    expect(parsedMcpPayload.summary).toBeDefined();
    expect(parsedMcpPayload.metrics).toBeDefined();
  });
});
