import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Documentation & MCP Integration — Developer Reference",
  description:
    "Comprehensive API, CLI, and Model Context Protocol (MCP) documentation for OmniAudit-GEO. Learn how to invoke the audit engine from Claude Code, Cursor, or your CI/CD pipeline.",
  openGraph: {
    title: "Developer Documentation — OmniAudit-GEO",
    description: "API, CLI, and MCP documentation for OmniAudit-GEO.",
  },
};

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="default" className="text-xs">Developer Guide</Badge>
          <span className="text-xs font-mono text-muted-foreground">Version 1.0.0</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Documentation & MCP Integration
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-3xl leading-relaxed">
          OmniAudit-GEO is designed for universal interoperability: as a zero-dependency Python CLI, an HTTP Edge API on Cloudflare Workers, and an MCP server for AI coding assistants.
        </p>
      </div>

      {/* Quickstart Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border bg-card/60">
          <CardHeader>
            <span className="text-xs font-mono text-primary font-bold">1. PYTHON CLI</span>
            <CardTitle className="text-base mt-1">Zero-Dependency Runner</CardTitle>
            <CardDescription className="text-xs">
              Execute audits completely offline or live against websites using only standard library modules.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="p-3 rounded-xl bg-background border border-border text-[11px] font-mono text-foreground overflow-x-auto">
              python3 skills/audit-orchestrator/scripts/audit_runner.py --url &quot;https://example.com&quot;
            </pre>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/60">
          <CardHeader>
            <span className="text-xs font-mono text-primary font-bold">2. CLOUDFLARE EDGE API</span>
            <CardTitle className="text-base mt-1">Live HTTP Endpoint</CardTitle>
            <CardDescription className="text-xs">
              Fetch real-time JSON audit reports globally from Cloudflare Workers edge nodes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="p-3 rounded-xl bg-background border border-border text-[11px] font-mono text-foreground overflow-x-auto">
              curl -s &quot;https://omniaudit-geo.shraj.workers.dev/api/audit?url=https://example.com&quot;
            </pre>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/60">
          <CardHeader>
            <span className="text-xs font-mono text-primary font-bold">3. MCP SERVER</span>
            <CardTitle className="text-base mt-1">AI IDE Integration</CardTitle>
            <CardDescription className="text-xs">
              Directly expose audit capabilities to Claude Desktop, Claude Code, and Cursor.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="p-3 rounded-xl bg-background border border-border text-[11px] font-mono text-foreground overflow-x-auto">
              python3 skills/audit-orchestrator/scripts/mcp_server.py
            </pre>
          </CardContent>
        </Card>
      </div>

      {/* Scoring Mathematical Formulation */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">Scoring Architecture & Weights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-border bg-card/40 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-foreground">AI Citation Probability Index (ACPI, 0–100)</h3>
              <Badge variant="default">Off-Site Discoverability</Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Formulated as a weighted linear combination of 5 specialist criteria:
            </p>
            <pre className="p-3 rounded-xl bg-background border border-border text-xs font-mono text-primary">
              ACPI = (0.30 × Crawl) + (0.15 × Render) + (0.20 × Entity) + (0.20 × Quotability) + (0.15 × Trust)
            </pre>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li><strong>Crawl (30%):</strong> robots.txt allowlist for GPTBot, ClaudeBot, PerplexityBot.</li>
              <li><strong>Render (15%):</strong> Absence of blank React/Vue hydration DOM gaps.</li>
              <li><strong>Entity (20%):</strong> Schema.org JSON-LD disambiguation with Wikidata/Wikipedia sameAs.</li>
              <li><strong>Quotability (20%):</strong> Atomic facts per paragraph, Q&amp;A headings, and semantic tables.</li>
              <li><strong>Trust (15%):</strong> Author bylines, editorial policies, and temporal freshness.</li>
            </ul>
          </Card>

          <Card className="border-border bg-card/40 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-foreground">Cognitive Retention Score (CRS, 0–100)</h3>
              <Badge variant="secondary">On-Site Retention</Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Formulated to predict visitor retention after an AI referral lands on-site:
            </p>
            <pre className="p-3 rounded-xl bg-background border border-border text-xs font-mono text-emerald-400">
              CRS = (0.35 × Orientation) + (0.25 × Intent) + (0.20 × Readability) + (0.20 × Action)
            </pre>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li><strong>Orientation (35%):</strong> Above-the-fold H1 clarity within 5 seconds.</li>
              <li><strong>Intent (25%):</strong> Continuity between search queries and landing copy.</li>
              <li><strong>Readability (20%):</strong> Flesch-Kincaid grade level 7–11 (optimal cognitive load).</li>
              <li><strong>Action (20%):</strong> High-contrast primary Call-to-Action within hero viewport.</li>
            </ul>
          </Card>
        </div>
      </section>

      {/* MCP Configuration JSON */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">Model Context Protocol (MCP) Setup</h2>
        <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
          Add the following configuration to your <code className="font-mono text-foreground">claude_desktop_config.json</code> or Cursor MCP settings:
        </p>
        <Card className="border-border bg-card/40">
          <CardContent className="p-5">
            <pre className="p-4 rounded-xl bg-background border border-border text-xs font-mono text-foreground overflow-x-auto">
{`{
  "mcpServers": {
    "omniaudit-geo": {
      "command": "python3",
      "args": [
        "/path/to/adobe-hackathon-2026/skills/audit-orchestrator/scripts/mcp_server.py"
      ],
      "description": "OmniAudit-GEO: Autonomous Brand AI Discoverability & Engagement Auditor"
    }
  }
}`}
            </pre>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
