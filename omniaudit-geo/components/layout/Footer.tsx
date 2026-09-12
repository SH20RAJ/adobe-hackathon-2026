import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export function Footer() {
  return (
    <footer className="border-t border-border bg-[#101010] py-12 text-xs text-muted-foreground transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-5 w-6 items-center justify-center rounded bg-[#EB1000] text-white p-1">
                <svg viewBox="0 0 32 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
                  <path d="M12.8 0H0V28L12.8 0Z" fill="white"/>
                  <path d="M19.2 0H32V28L19.2 0Z" fill="white"/>
                  <path d="M16 11.2L22.4 28H16.8L14.4 22H11.2L16 11.2Z" fill="white"/>
                </svg>
              </div>
              <span className="font-bold text-white text-sm tracking-tight">Adobe OmniAudit</span>
              <span className="text-[10px] font-mono font-bold text-[#EB1000] px-1.5 py-0.5 rounded bg-[#EB1000]/10 border border-[#EB1000]/20">GEO</span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Enterprise Agent Skill Marketplace adhering to the <strong>agentskills.io</strong> and <strong>Adobe Spectrum 2</strong> design specifications.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Badge variant="secondary" className="text-[10px] font-mono bg-[#1E1E1E] text-muted-foreground border-border">agentskills.io spec</Badge>
              <Badge variant="secondary" className="text-[10px] font-mono bg-[#1E1E1E] text-muted-foreground border-border">Spectrum 2 System</Badge>
              <Badge variant="secondary" className="text-[10px] font-mono bg-[#1E1E1E] text-muted-foreground border-border">Adobe Hackathon 2026</Badge>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 text-xs tracking-wider uppercase">Marketplace Skills</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/audit" className="hover:text-white transition-colors">audit-orchestrator (Entrypoint)</Link></li>
              <li><Link href="/audit" className="hover:text-white transition-colors">crawl-render-audit</Link></li>
              <li><Link href="/audit" className="hover:text-white transition-colors">structured-entity-audit</Link></li>
              <li><Link href="/audit" className="hover:text-white transition-colors">aeo-quotability-audit</Link></li>
              <li><Link href="/audit" className="hover:text-white transition-colors">freshness-corroboration-audit</Link></li>
              <li><Link href="/audit" className="hover:text-white transition-colors">on-site-engagement-audit</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 text-xs tracking-wider uppercase">Verification & Evals</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/benchmarks" className="hover:text-white transition-colors">16 Golden Benchmarks Matrix</Link></li>
              <li><Link href="/docs" className="hover:text-white transition-colors">ACPI Scoring Model (0–100)</Link></li>
              <li><Link href="/docs" className="hover:text-white transition-colors">CRS Click-to-Retention Model</Link></li>
              <li><Link href="/docs" className="hover:text-white transition-colors">SSRF Safe Fetch Guardrails</Link></li>
              <li><Link href="/docs" className="hover:text-white transition-colors">Master 6-Gate Test Loop</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 text-xs tracking-wider uppercase">Team & Engineering</h4>
            <p className="text-xs leading-relaxed mb-2 text-muted-foreground">
              Engineered by <strong className="text-white">Shaswat Raj</strong> (<a href="https://github.com/sh20raj" target="_blank" rel="noreferrer" className="text-[#EB1000] hover:underline font-medium">@sh20raj</a>) & <strong className="text-white">Prithvi</strong> (<a href="https://github.com/chikolavosaki-sys" target="_blank" rel="noreferrer" className="text-[#EB1000] hover:underline font-medium">@chikolavosaki-sys</a>).
            </p>
            <p className="text-xs text-muted-foreground/80 font-mono text-[11px]">
              Powered by Python stdlib AST/DOM + Cloudflare Workers Next.js App Router Edge.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <div>
            © 2026 Adobe OmniAudit-GEO. Apache-2.0 License. Built for Adobe University Hackathon 2026 Round 3.
          </div>
          <div className="flex items-center gap-5">
            <a href="https://github.com/SH20RAJ/adobe-hackathon-2026" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub Repo</a>
            <a href="https://sh20raj.github.io/adobe-hackathon-2026/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Pitch & Showcase</a>
            <a href="https://spectrum.adobe.com/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Adobe Spectrum ↗</a>
            <Link href="/docs" className="hover:text-white transition-colors">API & MCP Spec</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
