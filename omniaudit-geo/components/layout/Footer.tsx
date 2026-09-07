import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background py-10 text-xs text-muted-foreground transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-primary text-primary-foreground font-black text-[10px]">
                Ω
              </div>
              <span className="font-bold text-foreground text-sm">OmniAudit-GEO</span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Standard-compliant Agent Skill Marketplace for evaluating AI Discoverability (GEO/AEO) and Visitor Engagement.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Badge variant="secondary" className="text-[10px] font-mono">agentskills.io spec</Badge>
              <Badge variant="secondary" className="text-[10px] font-mono">Adobe Hackathon 2026</Badge>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3 text-xs tracking-wider uppercase">Marketplace Skills</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/audit" className="hover:text-foreground transition-colors">audit-orchestrator</Link></li>
              <li><Link href="/audit" className="hover:text-foreground transition-colors">crawl-render-audit</Link></li>
              <li><Link href="/audit" className="hover:text-foreground transition-colors">structured-entity-audit</Link></li>
              <li><Link href="/audit" className="hover:text-foreground transition-colors">aeo-quotability-audit</Link></li>
              <li><Link href="/audit" className="hover:text-foreground transition-colors">freshness-corroboration-audit</Link></li>
              <li><Link href="/audit" className="hover:text-foreground transition-colors">on-site-engagement-audit</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3 text-xs tracking-wider uppercase">Verification & Evals</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/benchmarks" className="hover:text-foreground transition-colors">14 Golden Benchmark Fixtures</Link></li>
              <li><Link href="/docs" className="hover:text-foreground transition-colors">ACPI Scoring Model (0–100)</Link></li>
              <li><Link href="/docs" className="hover:text-foreground transition-colors">CRS Cognitive Retention Model</Link></li>
              <li><Link href="/docs" className="hover:text-foreground transition-colors">SSRF Safe Fetch Specification</Link></li>
              <li><Link href="/docs" className="hover:text-foreground transition-colors">Unified 5-Gate Test Runner</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3 text-xs tracking-wider uppercase">Team & Codebase</h4>
            <p className="text-xs leading-relaxed mb-2">
              Engineered by <strong>Shaswat Raj</strong> (<a href="https://github.com/sh20raj" target="_blank" rel="noreferrer" className="text-primary hover:underline">@sh20raj</a>) & <strong>Prithvi</strong> (<a href="https://github.com/chikolavosaki-sys" target="_blank" rel="noreferrer" className="text-primary hover:underline">@chikolavosaki-sys</a>).
            </p>
            <p className="text-xs text-muted-foreground/80 font-mono text-[11px]">
              Built with Python stdlib AST/DOM + Next.js App Router on Cloudflare Workers.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <div>
            © 2026 OmniAudit-GEO. Apache-2.0 License. Adobe University Hackathon Round 3.
          </div>
          <div className="flex items-center gap-4">
            <a href="https://github.com/SH20RAJ/adobe-hackathon-2026" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">GitHub Repository</a>
            <a href="https://sh20raj.github.io/adobe-hackathon-2026/" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">Showcase & Pitch</a>
            <Link href="/docs" className="hover:text-foreground transition-colors">API Docs</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
