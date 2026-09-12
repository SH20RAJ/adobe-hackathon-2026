import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-[#141414]/90 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-95">
            {/* Adobe Brand Monogram Icon */}
            <div className="flex h-7 w-8 items-center justify-center rounded-md bg-[#EB1000] text-white shadow-sm p-1.5">
              <svg viewBox="0 0 32 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
                <path d="M12.8 0H0V28L12.8 0Z" fill="white"/>
                <path d="M19.2 0H32V28L19.2 0Z" fill="white"/>
                <path d="M16 11.2L22.4 28H16.8L14.4 22H11.2L16 11.2Z" fill="white"/>
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-white">Adobe OmniAudit</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#EB1000]/15 text-[#EB1000] border border-[#EB1000]/25 font-mono">
                GEO
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-md hover:text-white hover:bg-[#222222] transition-colors"
            >
              Overview
            </Link>
            <Link
              href="/audit"
              className="px-3 py-1.5 rounded-md hover:text-white hover:bg-[#222222] transition-colors"
            >
              Audit Studio
            </Link>
            <Link
              href="/marketplace"
              className="px-3 py-1.5 rounded-md hover:text-white hover:bg-[#222222] transition-colors"
            >
              Skill Marketplace
            </Link>
            <Link
              href="/benchmarks"
              className="px-3 py-1.5 rounded-md hover:text-white hover:bg-[#222222] transition-colors"
            >
              Benchmarks (16)
            </Link>
            <Link
              href="/docs"
              className="px-3 py-1.5 rounded-md hover:text-white hover:bg-[#222222] transition-colors"
            >
              Docs & MCP
            </Link>
            <Link
              href="/enterprise"
              className="px-3 py-1.5 rounded-md hover:text-white hover:bg-[#222222] transition-colors"
            >
              Enterprise
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#1E1E1E] border border-border/80">
            <div className="h-2 w-2 rounded-full bg-[#27C281] animate-pulse" />
            <span className="text-[11px] font-mono text-muted-foreground">Spectrum 2 · 117 Evals Passed</span>
          </div>

          <Link href="/audit">
            <Button size="sm" variant="default" className="text-xs font-semibold h-8 px-4 bg-[#EB1000] hover:bg-[#D40F00] text-white rounded-md shadow-sm">
              Run Audit
            </Button>
          </Link>

          <a
            href="https://github.com/SH20RAJ/adobe-hackathon-2026"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-muted-foreground hover:text-white transition-colors hidden sm:block px-2 font-medium"
          >
            GitHub ↗
          </a>
        </div>
      </div>
    </header>
  );
}
