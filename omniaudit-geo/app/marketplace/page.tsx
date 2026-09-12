import type { Metadata } from "next";
import Link from "next/link";
import { MARKETPLACE_SKILLS } from "@/lib/sample-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Agent Skills Marketplace — agentskills.io Specification",
  description:
    "Explore the 6 modular skills registered in the OmniAudit-GEO marketplace. Zero external API dependencies, sub-50ms local execution, and native MCP support.",
  openGraph: {
    title: "Agent Skills Marketplace — OmniAudit-GEO",
    description: "Modular, high-performance skills for AI Discoverability and Visitor Engagement.",
  },
};

export default function MarketplacePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="border-b border-border pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="default" className="text-xs">agentskills.io v1.0</Badge>
            <span className="text-xs font-mono text-muted-foreground">marketplace.json</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Agent Skills Marketplace
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Standard-compliant skills built for autonomous agents (Claude Code, Antigravity, Cursor, Windsurf). Discover, compose, and execute audit skills locally or via Edge APIs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/audit">
            <Button size="sm" className="text-xs">
              Execute Master Pipeline →
            </Button>
          </Link>
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MARKETPLACE_SKILLS.map((skill) => (
          <Card key={skill.id} className="border-border bg-card/60 transition-all hover:border-border/90 flex flex-col justify-between">
            <CardHeader className="p-6 pb-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant={skill.entrypoint ? "default" : "secondary"} className="text-[11px]">
                    {skill.entrypoint ? "Master Orchestrator" : "Specialist Skill"}
                  </Badge>
                  <span className="text-xs font-mono text-muted-foreground">v{skill.version}</span>
                </div>
                <span className="text-xs font-mono text-[#27C281] font-semibold">{skill.execution_time_ms}ms avg</span>
              </div>

              <CardTitle className="text-base font-bold mt-3 text-foreground font-mono">
                {skill.id}
              </CardTitle>
              <div className="text-xs font-semibold text-foreground/80">{skill.name}</div>
              <CardDescription className="text-xs leading-relaxed mt-2 text-muted-foreground">
                {skill.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 pt-2 space-y-4">
              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {skill.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-full bg-background border border-border/60 text-[10px] text-muted-foreground font-mono"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* Path & Schemas */}
              <div className="p-3 rounded-xl bg-background border border-border text-xs font-mono text-muted-foreground space-y-1.5">
                <div>
                  <span className="text-foreground/70 font-semibold">Location:</span> {skill.path}
                </div>
                <div>
                  <span className="text-foreground/70 font-semibold">Output:</span> {skill.output_schema}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-border/40">
                <code className="text-[11px] font-mono text-muted-foreground">
                  python3 {skill.path}/scripts/*.py
                </code>
                <Link href="/audit">
                  <Button variant="outline" size="sm" className="text-xs h-8 px-3">
                    Run in Studio
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Integration Callout */}
      <Card className="border-border bg-card/40 border-primary/20 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-foreground">Model Context Protocol (MCP) Ready</h3>
            <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
              Run OmniAudit-GEO directly inside Claude Desktop, Cursor, or your local agent IDE with zero network egress. The MCP adapter exposes all 6 skills with typed JSON schemas.
            </p>
          </div>
          <Link href="/docs">
            <Button size="sm" className="whitespace-nowrap text-xs">
              View MCP Configuration →
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
