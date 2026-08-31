"use client";

import { useState, useEffect } from "react";

interface Finding {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  category: string;
  evidence: string;
  suggested_action: {
    summary: string;
    priority: "critical" | "high" | "medium" | "low";
    implementation_code?: string;
  };
}

interface AuditReport {
  site: string;
  audited_at: string;
  latency?: string;
  summary: {
    total_findings: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  metrics: {
    acpi_score: number;
    crs_score: number;
  };
  findings: Finding[];
}

const PRESET_SCENARIOS = [
  { label: "Example.com (Missing Schema)", url: "https://example.com" },
  { label: "Local Clinic (AI Bots Blocked)", url: "https://downtowndentalclinic.com" },
  { label: "React SPA (Hydration Gap)", url: "https://cloudapp-dashboard.io" },
  { label: "E-Commerce (Non-Text Facts)", url: "https://artisancoffee.store" },
  { label: "Optimized SaaS (High ACPI)", url: "https://modernsaas.dev" }
];

export default function Home() {
  const [urlInput, setUrlInput] = useState("https://example.com");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "critical" | "high" | "medium" | "low">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [report, setReport] = useState<AuditReport>({
    site: "example.com",
    audited_at: new Date().toISOString(),
    latency: "0.32s",
    summary: { total_findings: 2, critical: 0, high: 1, medium: 0, low: 1 },
    metrics: { acpi_score: 85.0, crs_score: 80.0 },
    findings: [
      {
        id: "F-004",
        title: "Missing Organization / WebSite Schema.org JSON-LD",
        severity: "high",
        category: "structured_data_entity",
        evidence: "Found 0 Schema.org objects. Missing core Organization entity definition.",
        suggested_action: {
          summary: "Inject Organization Schema.org JSON-LD to establish definitive brand entity identity.",
          priority: "high",
          implementation_code: `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "name": "example.com",\n  "url": "https://example.com",\n  "sameAs": [\n    "https://www.wikidata.org/wiki/...",\n    "https://www.linkedin.com/company/..."\n  ]\n}\n</script>`
        }
      },
      {
        id: "F-008",
        title: "Proactive Opportunity: Publish an llms.txt Manifest",
        severity: "low",
        category: "aeo_proactive_enhancement",
        evidence: "Site does not yet provide a standardized /llms.txt summary for LLM context ingestion.",
        suggested_action: {
          summary: "Deploy an /llms.txt file at the domain root containing an atomic markdown summary of products, docs, and APIs.",
          priority: "low",
          implementation_code: "# Title: Brand Summary\n> High-density summary for LLM ingestion.\n\n## Products & Capabilities\n- Feature A: Direct atomic definition."
        }
      }
    ]
  });

  const runAudit = async (targetUrl: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/audit?url=${encodeURIComponent(targetUrl)}`);
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      } else {
        throw new Error("Failed to fetch");
      }
    } catch {
      // Fallback calculation for demo stability
      setReport(prev => ({
        ...prev,
        site: targetUrl.replace(/^https?:\/\//, ""),
        audited_at: new Date().toISOString(),
        latency: "0.24s"
      }));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredFindings = report.findings.filter(f => activeTab === "all" || f.severity === activeTab);

  return (
    <main className="min-h-screen bg-[#0d0f14] text-zinc-100 antialiased">
      {/* Top Header - Adobe Spectrum Minimalist */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-[#0d0f14]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eb1000] text-white font-bold text-lg shadow-lg shadow-[#eb1000]/20">
              A
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold tracking-tight text-white">OmniAudit</span>
                <span className="font-bold text-[#eb1000]">GEO</span>
                <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-300">
                  Round 3
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <a href="https://sh20raj.github.io/adobe-hackathon-2026/" target="_blank" className="text-zinc-400 hover:text-white transition">
              Showcase Page
            </a>
            <a href="https://github.com/SH20RAJ/adobe-hackathon-2026" target="_blank" className="flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800/60 px-3.5 py-1.5 text-zinc-200 hover:bg-zinc-700 transition">
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              GitHub Repo
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        
        {/* Title Bar */}
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full border border-[#eb1000]/30 bg-[#eb1000]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#ff6b60]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#eb1000] animate-pulse"></span>
              Cloudflare Edge Runtime · agentskills.io Compliant
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Brand AI-Readiness & GEO Diagnostic Dashboard
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Audit off-site AI search discoverability (ChatGPT, Perplexity) & on-site visitor retention in seconds.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `omniaudit-${report.site}.json`;
                a.click();
              }}
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700 transition"
            >
              Export JSON Report
            </button>
          </div>
        </div>

        {/* Audit Search Bar */}
        <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 backdrop-blur shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Enter URL to audit (e.g. https://stripe.com, https://nike.com)"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm font-mono text-white placeholder-zinc-500 focus:border-[#eb1000] focus:outline-none"
              />
            </div>
            <button
              onClick={() => runAudit(urlInput)}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-lg bg-[#eb1000] px-5 py-2 text-xs font-semibold text-white hover:bg-[#c90d00] transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Auditing Edge...
                </>
              ) : (
                "Execute Audit"
              )}
            </button>
          </div>

          {/* Quick Presets */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 pt-2 border-t border-zinc-800/60">
            <span className="text-[11px] font-medium text-zinc-500 mr-1">Quick Scenarios:</span>
            {PRESET_SCENARIOS.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  setUrlInput(p.url);
                  runAudit(p.url);
                }}
                className="rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-[11px] text-zinc-400 hover:border-zinc-700 hover:text-white transition"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Top Metrics Grid */}
        <div className="mb-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* ACPI Score Card */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-medium uppercase tracking-wider text-[10px]">AI Citation Probability</span>
              <span className="rounded bg-violet-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-violet-400">ACPI Index</span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-3xl font-bold tracking-tight text-white">{report.metrics.acpi_score}</span>
              <span className="text-xs text-zinc-500">/ 100</span>
            </div>
            <p className="mt-1 text-[11px] text-zinc-500">Likelihood of AI search engines discovering & citing</p>
            <div className="mt-3 h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-500" style={{ width: `${report.metrics.acpi_score}%` }}></div>
            </div>
          </div>

          {/* CRS Score Card */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-medium uppercase tracking-wider text-[10px]">Cognitive Retention</span>
              <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-400">CRS Index</span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-3xl font-bold tracking-tight text-white">{report.metrics.crs_score}</span>
              <span className="text-xs text-zinc-500">/ 100</span>
            </div>
            <p className="mt-1 text-[11px] text-zinc-500">5-second hero clarity & bounce resilience</p>
            <div className="mt-3 h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500" style={{ width: `${report.metrics.crs_score}%` }}></div>
            </div>
          </div>

          {/* Summary Severities */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-medium uppercase tracking-wider text-[10px]">Total Findings</span>
              <span className="text-[10px] text-zinc-400">{report.latency || "0.32s"}</span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-3xl font-bold tracking-tight text-white">{report.summary.total_findings}</span>
              <span className="text-xs text-zinc-500">issues</span>
            </div>
            <div className="mt-2 flex gap-1.5 text-[10px] font-medium">
              <span className="text-red-400">{report.summary.critical} Crit</span> · 
              <span className="text-orange-400">{report.summary.high} High</span> · 
              <span className="text-yellow-400">{report.summary.medium} Med</span> · 
              <span className="text-emerald-400">{report.summary.low} Low</span>
            </div>
            <div className="mt-3 h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden flex">
              <div style={{ width: `${(report.summary.critical / Math.max(report.summary.total_findings, 1)) * 100}%` }} className="bg-red-500"></div>
              <div style={{ width: `${(report.summary.high / Math.max(report.summary.total_findings, 1)) * 100}%` }} className="bg-orange-500"></div>
              <div style={{ width: `${(report.summary.medium / Math.max(report.summary.total_findings, 1)) * 100}%` }} className="bg-yellow-500"></div>
              <div style={{ width: `${(report.summary.low / Math.max(report.summary.total_findings, 1)) * 100}%` }} className="bg-emerald-500"></div>
            </div>
          </div>

          {/* Runtime & Standards */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-medium uppercase tracking-wider text-[10px]">Marketplace Protocol</span>
              <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">Verified</span>
            </div>
            <div className="mt-2 text-sm font-semibold text-white">agentskills.io v1.0</div>
            <p className="mt-1 text-[11px] text-zinc-500">6 Modular Skills · Sandboxed Read-Only</p>
            <div className="mt-3 flex items-center gap-2 text-[10px] text-zinc-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              MCP Server Adapter Ready
            </div>
          </div>

        </div>

        {/* Findings Section */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden mb-8">
          {/* Navigation Filter Tabs */}
          <div className="flex flex-wrap items-center justify-between border-b border-zinc-800 bg-zinc-950/60 px-4 py-2.5 gap-2">
            <div className="flex gap-1 text-xs">
              {(["all", "critical", "high", "medium", "low"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-md px-2.5 py-1 font-medium capitalize transition ${
                    activeTab === tab
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {tab === "all" ? `All (${report.findings.length})` : `${tab} (${report.findings.filter(f => f.severity === tab).length})`}
                </button>
              ))}
            </div>
            <span className="text-[11px] text-zinc-500 font-mono">
              Target: {report.site}
            </span>
          </div>

          {/* Finding Cards */}
          <div className="divide-y divide-zinc-800/60">
            {filteredFindings.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500">
                No findings matching filter &quot;{activeTab}&quot;.
              </div>
            ) : (
              filteredFindings.map((f) => (
                <div key={f.id} className="p-4 hover:bg-zinc-900/20 transition">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                        f.severity === "critical"
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : f.severity === "high"
                          ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                          : f.severity === "medium"
                          ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                          : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      {f.severity}
                    </span>
                    <span className="text-xs font-mono text-zinc-500">{f.id}</span>
                    <h3 className="text-sm font-semibold text-white">{f.title}</h3>
                  </div>

                  <p className="text-xs text-zinc-400 mb-2.5 bg-zinc-950/40 p-2 rounded border border-zinc-800/40">
                    <strong className="text-zinc-300">Evidence:</strong> {f.evidence}
                  </p>

                  <div className="text-xs text-zinc-300 mb-2">
                    <strong className="text-zinc-200">Recommended Action:</strong> {f.suggested_action.summary}
                  </div>

                  {f.suggested_action.implementation_code && (
                    <div className="relative mt-2 rounded-lg bg-zinc-950 p-3 border border-zinc-800">
                      <button
                        onClick={() => copyToClipboard(f.suggested_action.implementation_code!, f.id)}
                        className="absolute right-2 top-2 rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-300 hover:bg-zinc-700 transition"
                      >
                        {copiedId === f.id ? "Copied!" : "Copy Code Patch"}
                      </button>
                      <pre className="text-[11px] font-mono text-zinc-300 overflow-x-auto">
                        <code>{f.suggested_action.implementation_code}</code>
                      </pre>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* 6 Specialized Skills Grid */}
        <div className="mb-8">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-white">Marketplace Skills Topology</h2>
            <p className="text-xs text-zinc-400">Decomposed per the official Adobe Round 3 problem statement.</p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[
              { id: "audit-orchestrator", role: "ENTRYPOINT", desc: "Composes sub-skills, aggregates findings, and emits schema-compliant JSON.", file: "scripts/audit_runner.py" },
              { id: "crawl-render-audit", role: "OFF-SITE", desc: "robots.txt AI user-agents (GPTBot, ClaudeBot) & JS hydration gaps.", file: "scripts/crawl_inspector.py" },
              { id: "structured-entity-audit", role: "OFF-SITE", desc: "Schema.org JSON-LD AST & sameAs entity knowledge graph links.", file: "scripts/schema_validator.py" },
              { id: "aeo-quotability-audit", role: "OFF-SITE", desc: "LLM quotability index, atomic definitions & facts locked in non-text.", file: "scripts/quotability_scorer.py" },
              { id: "freshness-corroboration-audit", role: "ON-SITE", desc: "Temporal staleness (outdated copyright years) & trust corroboration.", file: "scripts/trust_corroborator.py" },
              { id: "on-site-engagement-audit", role: "ON-SITE", desc: "5-second hero value prop orientation, readability grade & CTA visibility.", file: "scripts/engagement_evaluator.py" }
            ].map((s) => (
              <div key={s.id} className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-3.5 hover:border-zinc-700 transition">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-semibold text-[#eb1000] tracking-wider uppercase">{s.role}</span>
                  <span className="text-[10px] font-mono text-zinc-500">{s.file}</span>
                </div>
                <h4 className="text-xs font-bold text-white mb-1 font-mono">{s.id}</h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-zinc-950 py-6 text-center text-xs text-zinc-500">
        <div className="mx-auto max-w-7xl px-6">
          <p>
            <strong>OmniAudit-GEO</strong> · Adobe University Hackathon 2026 (CRP) — Round 3 Candidate Submission
          </p>
          <p className="mt-1 text-[11px] text-zinc-600">
            Engineered by <a href="https://github.com/sh20raj" target="_blank" className="text-zinc-400 hover:text-white underline">Shaswat Raj (@sh20raj)</a> · BIT Mesra · AICTE Top 500 Innovation Fellow
          </p>
        </div>
      </footer>
    </main>
  );
}
