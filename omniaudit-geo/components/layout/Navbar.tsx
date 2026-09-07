import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/85 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-xs shadow-sm">
              Ω
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight text-foreground">OmniAudit</span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20">GEO</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-full hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              Overview
            </Link>
            <Link
              href="/audit"
              className="px-3 py-1.5 rounded-full hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              Audit Studio
            </Link>
            <Link
              href="/marketplace"
              className="px-3 py-1.5 rounded-full hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              Skill Marketplace
            </Link>
            <Link
              href="/benchmarks"
              className="px-3 py-1.5 rounded-full hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              Benchmarks (14)
            </Link>
            <Link
              href="/docs"
              className="px-3 py-1.5 rounded-full hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              Docs & MCP
            </Link>
            <Link
              href="/enterprise"
              className="px-3 py-1.5 rounded-full hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              Enterprise
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono text-muted-foreground">Edge · 106 Evals Passed</span>
          </div>

          <Link href="/audit">
            <Button size="sm" variant="default" className="text-xs font-medium h-8 px-3.5">
              Run Audit
            </Button>
          </Link>

          <a
            href="https://github.com/SH20RAJ/adobe-hackathon-2026"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors hidden sm:block px-2"
          >
            GitHub ↗
          </a>
        </div>
      </div>
    </header>
  );
}
