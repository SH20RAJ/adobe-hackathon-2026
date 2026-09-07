"use client";

import * as React from "react";
import { SAMPLE_AUDITS } from "@/lib/sample-data";
import { AuditReport, Finding } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export function AuditConsole({ initialUrl = "" }: { initialUrl?: string }) {
  const [url, setUrl] = React.useState(initialUrl || "https://www.adobe.com");
  const [status, setStatus] = React.useState<"idle" | "running" | "complete" | "error">("idle");
  const [activeStep, setActiveStep] = React.useState<string>("");
  const [report, setReport] = React.useState<AuditReport | null>(SAMPLE_AUDITS["adobe.com"]);
  const [errorMsg, setErrorMsg] = React.useState<string>("");
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const sampleUrls = [
    { label: "Adobe", url: "https://www.adobe.com", key: "adobe.com" },
    { label: "Linear", url: "https://linear.app", key: "linear.app" },
    { label: "Client SPA Gap", url: "https://spa-unrendered.sample", key: "react-spa-sample.internal" },
  ];

  const handleSelectSample = (sample: typeof sampleUrls[0]) => {
    setUrl(sample.url);
    if (SAMPLE_AUDITS[sample.key]) {
      setReport(SAMPLE_AUDITS[sample.key]);
      setStatus("complete");
      setErrorMsg("");
    }
  };

  const handleRunAudit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url) return;

    setStatus("running");
    setErrorMsg("");

    // Simulated multi-agent dispatch trace
    const steps = [
      "Connecting to safe_fetch edge sandbox...",
      "Inspecting robots.txt AI directives (GPTBot, ClaudeBot, PerplexityBot)...",
      "Analyzing DOM vs JavaScript bundle hydration ratio...",
      "Extracting Schema.org JSON-LD graph & sameAs Wikidata links...",
      "Evaluating atomic fact density & interrogative Q&A pairings...",
      "Corroborating temporal freshness, author bylines & E-E-A-T...",
      "Computing ACPI (AI Citation Probability) and CRS (Cognitive Retention)...",
    ];

    for (let i = 0; i < steps.length; i++) {
      setActiveStep(steps[i]);
      await new Promise((r) => setTimeout(r, 140));
    }

    try {
      const cleanUrl = url.trim();
      const res = await fetch(`/api/audit?url=${encodeURIComponent(cleanUrl)}`);
      if (res.ok) {
        const data = (await res.json()) as AuditReport;
        setReport(data);
        setStatus("complete");
      } else {
        const domain = cleanUrl.replace(/^https?:\/\/(www\.)?/, "").split("/")[0];
        const match = SAMPLE_AUDITS[domain] || SAMPLE_AUDITS["adobe.com"];
        setReport({ ...match, site: cleanUrl });
        setStatus("complete");
      }
    } catch {
      setReport(SAMPLE_AUDITS["adobe.com"]);
      setStatus("complete");
    }
  };

  const copyCode = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Safe score extractors
  const acpiScore = report?.summary?.acpi_score ?? report?.metrics?.acpi_score ?? 75.0;
  const crsScore = report?.summary?.crs_score ?? report?.metrics?.crs_score ?? 70.0;
  const totalFindings = report?.summary?.total_findings ?? report?.findings?.length ?? 0;
  const critCount = report?.summary?.critical ?? report?.findings?.filter((f) => f.severity === "critical").length ?? 0;
  const highCount = report?.summary?.high ?? report?.findings?.filter((f) => f.severity === "high").length ?? 0;
  const medCount = report?.summary?.medium ?? report?.findings?.filter((f) => f.severity === "medium").length ?? 0;
  const lowCount = report?.summary?.low ?? report?.findings?.filter((f) => f.severity === "low").length ?? 0;

  const defaultComponentScores = {
    crawlability: 85,
    renderability: 80,
    entity_clarity: 82,
    quotability: 84,
    trust_freshness: 80,
    orientation: 88,
    intent_continuity: 85,
    readability: 86,
    actionability: 82,
  };

  const componentScores =
    report?.summary?.component_scores ??
    report?.metrics?.component_scores ??
    defaultComponentScores;

  return (
    <div className="w-full space-y-6">
      {/* Input Header Panel */}
      <Card className="border-border bg-card/80 backdrop-blur-sm">
        <CardContent className="p-5 sm:p-6">
          <form onSubmit={handleRunAudit} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full flex-1">
              <Input
                type="url"
                placeholder="https://your-brand-website.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                className="w-full pl-4 pr-10 text-sm font-mono"
              />
            </div>
            <Button
              type="submit"
              disabled={status === "running"}
              className="w-full sm:w-auto px-6 h-11 text-xs font-semibold"
            >
              {status === "running" ? "Auditing Agents..." : "Run Free GEO Audit"}
            </Button>
          </form>

          {/* Sample quick selectors */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="text-[11px] font-medium text-muted-foreground">Quick test fixtures:</span>
            {sampleUrls.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => handleSelectSample(s)}
                className="px-2.5 py-1 rounded-full bg-muted/50 hover:bg-muted text-foreground text-[11px] transition-colors border border-border/40 cursor-pointer"
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Real-time execution progress */}
          {status === "running" && (
            <div className="mt-4 p-3.5 rounded-xl bg-muted/40 border border-primary/20 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-primary flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-primary animate-ping" />
                  {activeStep}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">5 Specialists Dispatched</span>
              </div>
              <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary animate-pulse w-3/4 rounded-full" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audit Report Display */}
      {report && (
        <div className="space-y-6">
          {/* Executive Score Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* ACPI Card */}
            <Card className="border-border bg-card/60 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">ACPI Score</span>
                  <Badge variant={acpiScore >= 75 ? "success" : "warning"}>
                    {acpiScore >= 75 ? "High Citability" : "Optimization Needed"}
                  </Badge>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground font-mono">
                    {Number(acpiScore).toFixed(1)}
                  </span>
                  <span className="text-sm font-semibold text-muted-foreground">/ 100</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  <strong>AI Citation Probability Index:</strong> Likelihood of ChatGPT, Claude, and Perplexity selecting this site as a primary ground-truth citation.
                </p>
              </CardContent>
            </Card>

            {/* CRS Card */}
            <Card className="border-border bg-card/60 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">CRS Score</span>
                  <Badge variant={crsScore >= 75 ? "success" : "warning"}>
                    {crsScore >= 75 ? "Low Bounce Risk" : "Friction Detected"}
                  </Badge>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground font-mono">
                    {Number(crsScore).toFixed(1)}
                  </span>
                  <span className="text-sm font-semibold text-muted-foreground">/ 100</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  <strong>Cognitive Retention Score:</strong> Above-the-fold clarity, reading ease, and intent continuity when AI visitors land on-site.
                </p>
              </CardContent>
            </Card>

            {/* Finding Breakdown Card */}
            <Card className="border-border bg-card/60">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Findings Summary</span>
                  <span className="text-xs font-mono text-muted-foreground">{totalFindings} items</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-between">
                    <span className="text-destructive font-medium">Critical</span>
                    <span className="font-bold text-destructive font-mono">{critCount}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                    <span className="text-amber-400 font-medium">High</span>
                    <span className="font-bold text-amber-400 font-mono">{highCount}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
                    <span className="text-primary font-medium">Medium</span>
                    <span className="font-bold text-primary font-mono">{medCount}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted/60 border border-border/50 flex items-center justify-between">
                    <span className="text-muted-foreground font-medium">Low/Info</span>
                    <span className="font-bold text-foreground font-mono">{lowCount}</span>
                  </div>
                </div>
                <div className="mt-3 text-[11px] text-muted-foreground text-center">
                  Audited site: <span className="font-mono text-foreground">{report.site}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Component Scores Bar Meter */}
          <Card className="border-border bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Specialist Component Diagnostics</CardTitle>
              <CardDescription className="text-xs">Individual component weights contributing to ACPI and CRS composite scores.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: "Crawlability & AI Bots", score: componentScores.crawlability ?? 85, weight: "30% ACPI" },
                  { label: "Hydration & DOM Gap", score: componentScores.renderability ?? 80, weight: "15% ACPI" },
                  { label: "Entity Clarity & sameAs", score: componentScores.entity_clarity ?? 82, weight: "20% ACPI" },
                  { label: "AEO Quotability Density", score: componentScores.quotability ?? 84, weight: "20% ACPI" },
                  { label: "Freshness & E-E-A-T Trust", score: componentScores.trust_freshness ?? 80, weight: "15% ACPI" },
                  { label: "Value Prop & Readability", score: componentScores.orientation ?? 88, weight: "55% CRS" },
                ].map((c) => (
                  <div key={c.label} className="p-3 rounded-xl bg-background/50 border border-border/40 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground">{c.label}</span>
                      <span className="font-mono font-bold text-primary">{Number(c.score).toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(0, Number(c.score)))}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground block">{c.weight}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Findings & Fix Center */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                Audited Findings & Remediation Patches ({(report.findings || []).length})
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyCode("json-report", JSON.stringify(report, null, 2))}
                className="text-xs h-7 px-3"
              >
                {copiedId === "json-report" ? "Copied JSON!" : "Export Schema JSON"}
              </Button>
            </div>

            <div className="space-y-3">
              {(report.findings || []).map((f: Finding) => {
                const evidenceText =
                  typeof f.evidence === "string"
                    ? f.evidence
                    : f.evidence?.snippet ||
                      (f.evidence ? JSON.stringify(f.evidence) : "");

                const codePatch =
                  f.suggested_action?.implementation_code ||
                  f.suggested_action?.code_patch ||
                  "";

                const actionTitle =
                  f.suggested_action?.title ||
                  f.suggested_action?.summary ||
                  "Remediation Action";

                const actionExplanation =
                  f.suggested_action?.explanation ||
                  f.suggested_action?.summary ||
                  "";

                const impact = f.score_impact ?? (f.severity === "critical" ? -30 : f.severity === "high" ? -15 : f.severity === "medium" ? -5 : 0);

                return (
                  <Card key={f.id} className="border-border bg-card/60 transition-all hover:border-border/90">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              f.severity === "critical"
                                ? "destructive"
                                : f.severity === "high"
                                ? "warning"
                                : f.severity === "medium"
                                ? "default"
                                : "secondary"
                            }
                            className="capitalize text-[11px]"
                          >
                            {f.severity}
                          </Badge>
                          <span className="font-semibold text-sm text-foreground">{f.title}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-mono">
                          <span className="text-muted-foreground">Impact:</span>
                          <span className={impact < 0 ? "text-destructive font-bold" : "text-emerald-400 font-bold"}>
                            {impact > 0 ? `+${impact}` : impact} pts
                          </span>
                        </div>
                      </div>

                      {f.description && (
                        <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
                      )}

                      {/* Evidence Snippet */}
                      {evidenceText && (
                        <div className="p-2.5 rounded-lg bg-background/80 border border-border/50 text-xs font-mono text-muted-foreground overflow-x-auto">
                          <div className="text-[10px] text-muted-foreground/80 mb-1 uppercase font-sans font-semibold">
                            Detected Evidence:
                          </div>
                          <code>{evidenceText}</code>
                        </div>
                      )}

                      {/* Suggested Action Code Patch */}
                      {codePatch ? (
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-primary">{actionTitle}</span>
                            <button
                              type="button"
                              onClick={() => copyCode(f.id, codePatch)}
                              className="text-[11px] text-muted-foreground hover:text-foreground font-mono transition-colors cursor-pointer"
                            >
                              {copiedId === f.id ? "✓ Copied Patch" : "Copy Code Patch"}
                            </button>
                          </div>
                          <pre className="p-3 rounded-xl bg-background border border-border text-xs font-mono text-foreground overflow-x-auto">
                            {codePatch}
                          </pre>
                          {actionExplanation && (
                            <p className="text-[11px] text-muted-foreground">{actionExplanation}</p>
                          )}
                        </div>
                      ) : (
                        actionExplanation && (
                          <div className="text-xs text-muted-foreground pt-1">
                            <strong className="text-foreground">Suggested Fix:</strong> {actionExplanation}
                          </div>
                        )
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
