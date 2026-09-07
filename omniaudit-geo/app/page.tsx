import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { AuditConsole } from "@/components/audit/AuditConsole";

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Background glow ambient effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-primary/5 blur-[120px] pointer-events-none rounded-full" />

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-4 pt-12 pb-8 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-xs font-medium text-primary mb-6">
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span>Adobe University Hackathon 2026 · Round 3 CRP</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-tight">
          Brand AI-Readiness & <span className="text-primary">GEO Discoverability</span> Marketplace
        </h1>

        <p className="mt-5 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Autonomous audit engine compliant with the <strong className="text-foreground">agentskills.io</strong> standard. Evaluates why generative AI search engines (ChatGPT, Perplexity, Claude) cite your competitors instead of you.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/audit">
            <Button size="lg" className="h-11 px-6 text-xs font-semibold">
              Launch Live Audit Studio →
            </Button>
          </Link>
          <Link href="/marketplace">
            <Button variant="outline" size="lg" className="h-11 px-6 text-xs font-medium">
              Explore 6 Specialist Skills
            </Button>
          </Link>
          <Link href="/benchmarks">
            <Button variant="ghost" size="lg" className="h-11 px-6 text-xs font-medium text-muted-foreground hover:text-foreground">
              14 Golden Benchmarks
            </Button>
          </Link>
        </div>

        {/* Proof metrics bar */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
          {[
            { metric: "106 / 106", label: "Automated Evals Passed", sub: "Unit & Benchmark tests" },
            { metric: "< 50ms", label: "Local AST/DOM Parser", sub: "Zero-dependency speed" },
            { metric: "0 Keys", label: "External API Required", sub: "100% deterministic & private" },
            { metric: "Edge Ready", label: "Cloudflare Workers", sub: "Sub-second global latency" },
          ].map((item) => (
            <div key={item.label} className="p-3.5 rounded-2xl border border-border bg-card/40 backdrop-blur-sm">
              <div className="text-xl font-bold font-mono text-foreground">{item.metric}</div>
              <div className="text-xs font-semibold text-foreground/90 mt-0.5">{item.label}</div>
              <div className="text-[11px] text-muted-foreground">{item.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Live Playground */}
      <section className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-2 border-b border-border/60 pb-4">
          <div>
            <div className="text-xs font-semibold tracking-wider text-primary uppercase">Interactive Playground</div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-0.5">
              Live Edge Audit Console
            </h2>
          </div>
          <div className="text-xs text-muted-foreground">
            Powered by <code className="font-mono text-foreground">audit-orchestrator</code> on Cloudflare Workers Edge
          </div>
        </div>

        <AuditConsole />
      </section>

      {/* How Generative Search Evaluates Websites */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 border-t border-border/60">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="outline" className="mb-3 text-[11px]">The New Search Reality</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Traditional SEO is Dead. Meet Generative Engine Optimization (GEO).
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            AI search models do not rank backlinks; they synthesize answers from authoritative entity graphs, clean server-rendered DOMs, and atomic verifiable claims.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-border bg-card/40">
            <CardHeader>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-destructive font-mono uppercase">Traditional Googlebot (2015–2023)</span>
                <Badge variant="secondary">Keyword Era</Badge>
              </div>
              <CardTitle className="text-base mt-2">Rankings Based on Links & Keywords</CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                Pages could rank with thin client-rendered JavaScript SPAs, ambiguous brand names, and long marketing copy loaded with targeted keywords.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="text-destructive font-bold">✗</span>
                <span>Crawlers wait minutes for headless JS execution or accept blank HTML</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-destructive font-bold">✗</span>
                <span>Entities guessed from page headings without canonical Wikidata IDs</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-destructive font-bold">✗</span>
                <span>Wall-of-text marketing answers lead to user bounces upon arrival</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/40 border-primary/30 relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary font-mono uppercase">Perplexity & ChatGPT Search (2026)</span>
                <Badge variant="default">GEO / AEO Era</Badge>
              </div>
              <CardTitle className="text-base mt-2">Ground-Truth Synthesis & Quotability</CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                LLMs extract atomic facts in <strong className="text-foreground">under 200ms</strong> directly from static HTML streams and Schema.org JSON-LD ontology graphs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Instant SSR/RSC text streams cited directly in model reasoning tokens</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Disambiguated entity authorities linked via Schema.org sameAs</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
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
            <div className="text-xs font-semibold tracking-wider text-primary uppercase">agentskills.io Marketplace</div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground mt-1">
              Decomposed Audit Architecture
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Each specialist skill can run independently via CLI, MCP, or composed via the master orchestrator.
            </p>
          </div>
          <Link href="/marketplace">
            <Button variant="outline" size="sm" className="text-xs">
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
            <Card key={s.id} className="border-border bg-card/40 transition-all hover:border-border/80">
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant={s.role === "Entrypoint" ? "default" : "secondary"} className="text-[10px]">
                    {s.role}
                  </Badge>
                  <span className="text-[11px] font-mono text-muted-foreground">{s.time}</span>
                </div>
                <CardTitle className="text-sm font-semibold mt-2 text-foreground font-mono">{s.id}</CardTitle>
                <div className="text-xs font-medium text-foreground/80">{s.name}</div>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">{s.desc}</p>
                <Link href={s.href} className="text-xs font-semibold text-primary hover:underline">
                  Inspect in Studio →
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
