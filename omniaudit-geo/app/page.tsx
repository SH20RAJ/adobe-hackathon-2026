import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { AuditConsole } from "@/components/audit/AuditConsole";
import { McpSetupCard } from "@/components/mcp/McpSetupCard";

export const metadata: Metadata = {
  title: "Adobe OmniAudit GEO — Autonomous Brand AI-Readiness & Search Engine Optimization",
  description:
    "Autonomous Edge & Agentic Audit Engine for Generative Engine Optimization (GEO), Answer Engine Optimization (AEO), and On-site Retention (CRS). Built on the agentskills.io standard with native Model Context Protocol (MCP).",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Adobe OmniAudit GEO — Autonomous Brand AI-Readiness & Search Optimization",
    description: "Diagnose why generative AI assistants cite competitors instead of your enterprise brand.",
    url: siteConfig.url,
    images: ["/og-image.png"],
  },
};

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Subtle Adobe Red ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[#EB1000]/10 blur-[130px] pointer-events-none rounded-full" />

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-4 pt-14 pb-10 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#EB1000]/30 bg-[#EB1000]/10 px-3.5 py-1 text-xs font-semibold text-[#EB1000] mb-6">
          <span className="flex h-2 w-2 rounded-full bg-[#EB1000] animate-pulse" />
          <span>Adobe University Hackathon 2026 · Round 3 (CRP)</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Brand AI-Readiness & <span className="text-[#EB1000]">GEO Discoverability</span> Studio
        </h1>

        <p className="mt-5 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Autonomous audit engine built on the <strong className="text-white">agentskills.io</strong> standard and <strong className="text-white">Adobe Spectrum 2</strong> design principles. Diagnoses why generative AI assistants (ChatGPT, Perplexity, Claude) cite competitors instead of your brand.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/audit">
            <Button size="lg" className="h-11 px-7 text-xs font-semibold bg-[#EB1000] hover:bg-[#D40F00] text-white rounded-md shadow-md">
              Launch Live Audit Studio →
            </Button>
          </Link>
          <Link href="/marketplace">
            <Button variant="outline" size="lg" className="h-11 px-6 text-xs font-medium border-[#383838] bg-[#1E1E1E] text-white hover:bg-[#282828] rounded-md">
              Explore 6 Specialist Skills
            </Button>
          </Link>
          <Link href="/docs">
            <Button variant="ghost" size="lg" className="h-11 px-6 text-xs font-medium text-muted-foreground hover:text-white rounded-md">
              Connect Remote MCP URL ↗
            </Button>
          </Link>
        </div>

        {/* Proof metrics bar */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
          {[
            { metric: "117 / 117", label: "Automated Evals Passed", sub: "Gate 1–6 verification suite" },
            { metric: "< 50ms", label: "Local AST/DOM Parser", sub: "Zero-dependency Python stdlib" },
            { metric: "0 Keys", label: "External API Required", sub: "Air-gapped & private evaluation" },
            { metric: "Edge Ready", label: "Cloudflare Workers", sub: "Sub-second global latency" },
          ].map((item) => (
            <div key={item.label} className="p-4 rounded-xl border border-border bg-[#1E1E1E] transition-all hover:border-[#3E3E3E]">
              <div className="text-2xl font-bold font-mono text-white">{item.metric}</div>
              <div className="text-xs font-semibold text-white/90 mt-1">{item.label}</div>
              <div className="text-[11px] text-muted-foreground">{item.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Live Playground */}
      <section className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-2 border-b border-border/60 pb-4">
          <div>
            <div className="text-xs font-bold tracking-wider text-[#EB1000] uppercase font-mono">Adobe Spectrum 2 Studio</div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5">
              Live Edge Audit Console
            </h2>
          </div>
          <div className="text-xs text-muted-foreground">
            Powered by <code className="font-mono text-white bg-[#222222] px-1.5 py-0.5 rounded border border-border">audit-orchestrator</code> on Cloudflare Workers Edge
          </div>
        </div>

        <AuditConsole />
      </section>

      {/* How Generative Search Evaluates Websites */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 border-t border-border/60">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="outline" className="mb-3 text-[11px] text-[#EB1000] border-[#EB1000]/30 bg-[#EB1000]/10">The New Search Reality</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Traditional SEO is Dead. Meet Generative Engine Optimization (GEO).
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            AI search models do not rank backlinks; they synthesize answers from authoritative entity graphs, clean server-rendered DOMs, and atomic verifiable claims.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-border bg-[#1E1E1E]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#FF5252] font-mono uppercase">Traditional Googlebot (2015–2023)</span>
                <Badge variant="secondary" className="bg-[#262626] text-muted-foreground border-border">Keyword Era</Badge>
              </div>
              <CardTitle className="text-base mt-2 text-white">Rankings Based on Links & Keywords</CardTitle>
              <CardDescription className="text-xs leading-relaxed text-muted-foreground">
                Pages could rank with thin client-rendered JavaScript SPAs, ambiguous brand names, and long marketing copy loaded with targeted keywords.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="text-[#FF5252] font-bold">✗</span>
                <span>Crawlers wait minutes for headless JS execution or accept blank HTML</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#FF5252] font-bold">✗</span>
                <span>Entities guessed from page headings without canonical Wikidata IDs</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#FF5252] font-bold">✗</span>
                <span>Wall-of-text marketing answers lead to user bounces upon arrival</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#EB1000]/40 bg-[#1E1E1E] relative shadow-[0_0_30px_rgba(235,16,0,0.06)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#EB1000] font-mono uppercase">Perplexity & ChatGPT Search (2026)</span>
                <Badge variant="adobe">GEO / AEO Era</Badge>
              </div>
              <CardTitle className="text-base mt-2 text-white">Ground-Truth Synthesis & Quotability</CardTitle>
              <CardDescription className="text-xs leading-relaxed text-muted-foreground">
                LLMs extract atomic facts in <strong className="text-white">under 200ms</strong> directly from static HTML streams and Schema.org JSON-LD ontology graphs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="text-[#27C281] font-bold">✓</span>
                <span>Instant SSR/RSC text streams cited directly in model reasoning tokens</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#27C281] font-bold">✓</span>
                <span>Disambiguated entity authorities linked via Schema.org sameAs</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#27C281] font-bold">✓</span>
                <span>Atomic Q&A pairs with structured tables quotable directly in synthesis</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 6 Specialist Skills Grid */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 border-t border-border/60">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-bold tracking-wider text-[#EB1000] uppercase font-mono">agentskills.io Marketplace</div>
            <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
              Decomposed Audit Architecture
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Each specialist skill runs independently via CLI, MCP, or composed via the master orchestrator.
            </p>
          </div>
          <Link href="/marketplace">
            <Button variant="outline" size="sm" className="text-xs border-[#383838] bg-[#1E1E1E] text-white hover:bg-[#282828] rounded-md">
              View Skills Directory →
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              id: "audit-orchestrator",
              role: "Entrypoint",
              name: "Master Dispatcher & Aggregator",
              desc: "Composes sub-skills, aggregates findings, and validates against audit_schema.json.",
              time: "124ms",
              href: "/audit",
            },
            {
              id: "crawl-render-audit",
              role: "Off-Site",
              name: "Robots AI & Hydration Gap",
              desc: "Audits robots.txt AI bot directives and detects DOM-to-JS hydration gaps in SPAs.",
              time: "38ms",
              href: "/audit",
            },
            {
              id: "structured-entity-audit",
              role: "Off-Site",
              name: "Schema.org & Entity Graph",
              desc: "Validates JSON-LD markup and authoritative sameAs entity disambiguation links.",
              time: "22ms",
              href: "/audit",
            },
            {
              id: "aeo-quotability-audit",
              role: "Off-Site",
              name: "AEO & Atomic Fact Density",
              desc: "Measures factual density, heading Q&A pairings, and tabular accessibility.",
              time: "29ms",
              href: "/audit",
            },
            {
              id: "freshness-corroboration-audit",
              role: "On-Site",
              name: "Freshness & Trust Corroboration",
              desc: "Detects temporal decay, outdated copyright years, and author editorial bylines.",
              time: "18ms",
              href: "/audit",
            },
            {
              id: "on-site-engagement-audit",
              role: "On-Site",
              name: "Hero Clarity & Readability",
              desc: "Evaluates above-the-fold value prop clarity and Flesch-Kincaid reading ease.",
              time: "25ms",
              href: "/audit",
            },
          ].map((s) => (
            <Card key={s.id} className="border-border bg-[#1E1E1E] transition-all hover:border-[#3E3E3E]">
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant={s.role === "Entrypoint" ? "adobe" : "secondary"} className="text-[10px]">
                    {s.role}
                  </Badge>
                  <span className="text-[11px] font-mono text-muted-foreground">{s.time}</span>
                </div>
                <CardTitle className="text-sm font-semibold mt-2 text-white font-mono">{s.id}</CardTitle>
                <div className="text-xs font-medium text-white/80">{s.name}</div>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">{s.desc}</p>
                <Link href={s.href} className="text-xs font-semibold text-[#EB1000] hover:underline">
                  Inspect in Studio →
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Remote MCP Connection Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 border-t border-border/60">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-bold tracking-wider text-[#EB1000] uppercase font-mono">Direct Agent IDE Connection</div>
            <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
              Model Context Protocol (Remote URL)
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Connect OmniAudit-GEO directly into Cursor, Claude Desktop, Claude Code, and Windsurf via live HTTP/SSE.
            </p>
          </div>
          <Link href="/docs">
            <Button variant="outline" size="sm" className="text-xs border-[#383838] bg-[#1E1E1E] text-white hover:bg-[#282828] rounded-md">
              View Full Documentation →
            </Button>
          </Link>
        </div>

        <McpSetupCard />
      </section>
    </div>
  );
}
