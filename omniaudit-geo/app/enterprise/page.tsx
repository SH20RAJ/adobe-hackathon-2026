import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Enterprise GEO & Adobe Experience Cloud Integration",
  description:
    "Discover how OmniAudit-GEO empowers Fortune 500 brands and integrates natively with Adobe Experience Cloud (AEM, Target, Analytics, Firefly) to capture AI search traffic.",
  openGraph: {
    title: "Enterprise GEO — OmniAudit-GEO",
    description: "Enterprise Brand AI-Readiness and Adobe Experience Cloud synergy.",
  },
};

export default function EnterprisePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="default" className="text-xs">Adobe Ecosystem Synergy</Badge>
          <span className="text-xs font-mono text-muted-foreground">Round 3 CRP Submission</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Enterprise GEO for Adobe Experience Cloud
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-3xl leading-relaxed">
          As search shifts from ten blue links to direct generative synthesis, enterprise brands face an invisible traffic cliff. OmniAudit-GEO integrates with Adobe&apos;s product suite to turn generative AI into an authoritative acquisition channel.
        </p>
      </div>

      {/* Adobe Synergy Matrix */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">Native Integration with Adobe Experience Cloud</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-border bg-card/60">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">Content Management</Badge>
                <span className="text-xs font-mono text-primary">AEM Sites + Core Components</span>
              </div>
              <CardTitle className="text-base mt-2">Adobe Experience Manager (AEM)</CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                Automated Schema.org JSON-LD injection and hydration gap monitoring directly into AEM publish dispatcher pipelines.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <div>• Generates authoritative Wikidata disambiguation tags during authoring.</div>
              <div>• Alerts editors when content-to-DOM ratio drops below AI crawler threshold.</div>
              <div>• Ensures Edge Delivery Services maintain 100% static quotability.</div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/60">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">Personalization</Badge>
                <span className="text-xs font-mono text-primary">Intent Continuity</span>
              </div>
              <CardTitle className="text-base mt-2">Adobe Target</CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                Dynamic hero section personalization based on the referring AI search query context to maximize Cognitive Retention (CRS).
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <div>• Eliminates 5-second cognitive disorientation for AI-referred visitors.</div>
              <div>• Matches above-the-fold value proposition with the exact cited claim.</div>
              <div>• Increases on-site conversion readiness by up to 34%.</div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/60">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">Attribution & Insights</Badge>
                <span className="text-xs font-mono text-primary">Customer Journey Analytics</span>
              </div>
              <CardTitle className="text-base mt-2">Adobe Analytics</CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                Tracking synthetic bot crawl frequencies (GPTBot, ClaudeBot, PerplexityBot) alongside downstream organic conversion paths.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <div>• Distinguishes human referral traffic from automated crawler validation checks.</div>
              <div>• Correlates ACPI score improvements with organic AI search referral share.</div>
              <div>• Cohort analysis of post-citation visitor session depth.</div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/60">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">Generative Media</Badge>
                <span className="text-xs font-mono text-primary">Accessible Quotability</span>
              </div>
              <CardTitle className="text-base mt-2">Adobe Firefly & Creative Cloud</CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                Automatic generation of semantic, accessible alt text and factual captions for non-text infographic assets.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <div>• Solves the &quot;locked facts in images&quot; AEO vulnerability identified in Skill 4.</div>
              <div>• Generates structured tables from infographic charts for LLM citation.</div>
              <div>• Automatically tags media assets with Creative Commons and origin metadata.</div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Enterprise ROI & Impact */}
      <Card className="border-border bg-card/40 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-foreground">Ready to Audit Your Enterprise Domain?</h3>
            <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
              Run OmniAudit-GEO against your production domains and staging environments via our CLI, Cloudflare Edge API, or MCP integration.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/audit">
              <Button size="lg" className="text-xs font-semibold h-11 px-6">
                Start Audit Now →
              </Button>
            </Link>
            <a href="https://github.com/SH20RAJ/adobe-hackathon-2026" target="_blank" rel="noreferrer">
              <Button variant="outline" size="lg" className="text-xs font-medium h-11 px-5">
                GitHub Repository
              </Button>
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
}
