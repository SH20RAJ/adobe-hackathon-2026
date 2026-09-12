import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { McpSetupCard } from "@/components/mcp/McpSetupCard";

export const metadata: Metadata = {
  title: "Documentation & MCP Integration — Developer Reference",
  description:
    "Comprehensive API, CLI, and Model Context Protocol (MCP) documentation for OmniAudit-GEO. Learn how to invoke the audit engine from Claude Code, Cursor, or your CI/CD pipeline.",
  openGraph: {
    title: "Developer Documentation & MCP Integration — OmniAudit-GEO",
    description: "API, CLI, and Remote URL MCP integration guide for OmniAudit-GEO.",
  },
};

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="border-b border-border pb-8">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="default" className="text-xs font-semibold px-2.5 py-0.5">
            Developer Reference
          </Badge>
          <span className="text-xs font-mono text-muted-foreground">Version 1.0.0 · Remote MCP Ready</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Documentation & MCP Integration
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-3xl leading-relaxed">
          OmniAudit-GEO offers universal integration: connect in seconds via a <strong className="text-foreground">Remote MCP URL</strong> in Cursor and Claude Desktop, execute via our <strong className="text-foreground">Cloudflare Edge API</strong>, or run the zero-dependency <strong className="text-foreground">Python CLI</strong> offline.
        </p>
      </div>

      {/* Modern MCP Setup Card (Prominently featured) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">Model Context Protocol (MCP) Setup</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Connect your AI agent directly to OmniAudit-GEO over HTTP/SSE or local CLI.
            </p>
          </div>
        </div>
        <McpSetupCard />
      </section>

      {/* Integration Options Grid */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Invocation Methods</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card className="border-border bg-card/60 flex flex-col justify-between">
            <CardHeader className="p-5 pb-3">
              <span className="text-[11px] font-mono text-primary font-bold uppercase tracking-wider">1. Remote MCP (URL)</span>
              <CardTitle className="text-sm font-bold mt-1 text-foreground">Instant IDE Connection</CardTitle>
              <CardDescription className="text-xs leading-relaxed mt-1">
                Zero installation. Paste the remote URL directly into Cursor or Claude config.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <pre className="p-3 rounded-xl bg-background border border-border text-[11px] font-mono text-primary overflow-x-auto">
                https://omniaudit-geo.shraj.workers.dev/api/mcp
              </pre>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/60 flex flex-col justify-between">
            <CardHeader className="p-5 pb-3">
              <span className="text-[11px] font-mono text-primary font-bold uppercase tracking-wider">2. Edge HTTP API</span>
              <CardTitle className="text-sm font-bold mt-1 text-foreground">Global REST Endpoint</CardTitle>
              <CardDescription className="text-xs leading-relaxed mt-1">
                Invoke real-time audits globally via Cloudflare Workers with JSON response.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <pre className="p-3 rounded-xl bg-background border border-border text-[11px] font-mono text-foreground overflow-x-auto">
                curl -s &quot;https://omniaudit-geo.shraj.workers.dev/api/audit?url=https://example.com&quot;
              </pre>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/60 flex flex-col justify-between">
            <CardHeader className="p-5 pb-3">
              <span className="text-[11px] font-mono text-primary font-bold uppercase tracking-wider">3. Python CLI Runner</span>
              <CardTitle className="text-sm font-bold mt-1 text-foreground">Air-Gapped Offline AST</CardTitle>
              <CardDescription className="text-xs leading-relaxed mt-1">
                Standard library execution without pip dependencies or external network calls.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <pre className="p-3 rounded-xl bg-background border border-border text-[11px] font-mono text-foreground overflow-x-auto">
                python3 skills/audit-orchestrator/scripts/audit_runner.py --url &quot;https://example.com&quot;
              </pre>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Scoring Mathematical Formulation (Clean, refined layout) */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Scoring Formulation & Weights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-border bg-card/50 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-foreground">AI Citation Probability Index (ACPI, 0–100)</h3>
              <Badge variant="default" className="text-[10px]">Off-Site</Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Weighted linear composition measuring off-site search engine quotability and crawler accessibility:
            </p>
            <div className="p-3 rounded-xl bg-background border border-border text-xs font-mono text-primary leading-relaxed">
              ACPI = (0.30 × Crawl) + (0.15 × Render) + (0.20 × Entity) + (0.20 × Quote) + (0.15 × Trust)
            </div>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="font-mono text-foreground font-semibold min-w-[70px]">Crawl (30%):</span>
                <span>Explicit allow rules in robots.txt for GPTBot, ClaudeBot, and PerplexityBot.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-foreground font-semibold min-w-[70px]">Render (15%):</span>
                <span>Absence of client-side hydration gaps and blank React/Vue initial DOM mounts.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-foreground font-semibold min-w-[70px]">Entity (20%):</span>
                <span>Schema.org JSON-LD disambiguation linked to Wikidata and official profiles.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-foreground font-semibold min-w-[70px]">Quote (20%):</span>
                <span>Atomic facts per paragraph, Q&amp;A headers, and accessible tables.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-foreground font-semibold min-w-[70px]">Trust (15%):</span>
                <span>Author editorial bylines, temporal freshness, and transparent publisher details.</span>
              </div>
            </div>
          </Card>

          <Card className="border-border bg-card/50 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-foreground">Cognitive Retention Score (CRS, 0–100)</h3>
              <Badge variant="secondary" className="text-[10px]">On-Site</Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Weighted linear composition predicting visitor orientation and conversion readiness post-referral:
            </p>
            <div className="p-3 rounded-xl bg-background border border-border text-xs font-mono text-[#27C281] leading-relaxed">
              CRS = (0.35 × Orient) + (0.25 × Intent) + (0.20 × Read) + (0.20 × Action)
            </div>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="font-mono text-foreground font-semibold min-w-[70px]">Orient (35%):</span>
                <span>5-second hero value prop clarity; prominent H1 headline under 7 words.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-foreground font-semibold min-w-[70px]">Intent (25%):</span>
                <span>Continuity between referred search query and above-the-fold content.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-foreground font-semibold min-w-[70px]">Read (20%):</span>
                <span>Flesch-Kincaid Reading Ease (60–80) and optimal paragraph length.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-foreground font-semibold min-w-[70px]">Action (20%):</span>
                <span>High-contrast, singular primary Call-to-Action within initial hero viewport.</span>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
