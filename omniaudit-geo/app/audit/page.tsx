import type { Metadata } from "next";
import { AuditConsole } from "@/components/audit/AuditConsole";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Audit Studio — Autonomous GEO & AEO Diagnostics",
  description:
    "Deep-dive inspection studio for analyzing website AI Discoverability (ACPI) and On-site Retention (CRS). Real-time evaluation of robots.txt, Schema.org, hydration gaps, and atomic fact quotability.",
  alternates: {
    canonical: "/audit",
  },
  openGraph: {
    title: "Audit Studio — Adobe OmniAudit GEO",
    description: "Run an autonomous GEO & AEO audit on any web property in seconds.",
    url: "/audit",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Audit Studio — Adobe OmniAudit GEO",
    description: "Real-time autonomous audit of AI Discoverability and Visitor Engagement.",
    images: ["/og-image.png"],
  },
};

export default function AuditPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Badge variant="default" className="text-xs">Edge Engine</Badge>
          <span className="text-xs font-mono text-muted-foreground">skills/audit-orchestrator/scripts/audit_runner.py</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Brand GEO Audit Studio
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-3xl leading-relaxed">
          Autonomous diagnosis across off-site AI discoverability (crawler directives, hydration gaps, Schema.org ontology) and on-site visitor retention (hero clarity, cognitive readability, bounce risk).
        </p>
      </div>

      {/* Main Console */}
      <AuditConsole />
    </div>
  );
}
