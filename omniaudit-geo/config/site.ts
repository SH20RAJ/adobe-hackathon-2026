/**
 * Site Configuration & Global Constants
 * OmniAudit-GEO — Adobe University Hackathon 2026
 */

export const siteConfig = {
  name: "Adobe OmniAudit GEO",
  shortName: "OmniAudit",
  title: "Adobe OmniAudit GEO — Autonomous Brand AI-Readiness & Search Engine Optimization",
  description:
    "Autonomous Edge & Agentic Audit Engine for Generative Engine Optimization (GEO), Answer Engine Optimization (AEO), and On-site Retention (CRS). Built on the agentskills.io standard with native Model Context Protocol (MCP).",
  url: "https://omniaudit-geo.shraj.workers.dev",
  ogImage: "/og-image.png",
  version: "1.0.0",
  authors: [
    {
      name: "Shaswat Raj",
      github: "https://github.com/sh20raj",
      role: "Product & Architecture Lead",
    },
    {
      name: "Prithvi",
      github: "https://github.com/chikolavosaki-sys",
      role: "Audit-Engine Hardening & Security Lead",
    },
  ],
  links: {
    github: "https://github.com/SH20RAJ/adobe-hackathon-2026",
    docs: "/docs",
    marketplace: "/marketplace",
    audit: "/audit",
    benchmarks: "/benchmarks",
    enterprise: "/enterprise",
    spec: "https://agentskills.io",
    mcpEndpoint: "https://omniaudit-geo.shraj.workers.dev/api/mcp",
    auditApi: "https://omniaudit-geo.shraj.workers.dev/api/audit",
  },
  keywords: [
    "Adobe Experience Cloud",
    "Generative Engine Optimization",
    "GEO",
    "Answer Engine Optimization",
    "AEO",
    "AI Discoverability",
    "ACPI Score",
    "Cognitive Retention Score",
    "CRS Score",
    "Model Context Protocol",
    "MCP",
    "Agent Skills Marketplace",
    "agentskills.io",
    "Schema.org JSON-LD",
    "robots.txt AI bots",
    "Hydration Gaps",
    "Claude Code",
    "Cursor AI",
  ],
  theme: {
    adobeRed: "#EB1000",
    charcoalBase: "#141414",
    charcoalSurface: "#1E1E1E",
    charcoalElevated: "#262626",
    celeryGreen: "#27C281",
    indigoBlue: "#1473E6",
    amberOrange: "#E68619",
  },
} as const;

export const navItems = [
  { href: "/audit", label: "Audit Studio", badge: "Live" },
  { href: "/marketplace", label: "Skills Marketplace" },
  { href: "/benchmarks", label: "16 Benchmarks", badge: "100%" },
  { href: "/docs", label: "Docs & MCP" },
  { href: "/enterprise", label: "Adobe Enterprise" },
] as const;

export const footerLinks = {
  product: [
    { label: "Audit Studio", href: "/audit" },
    { label: "Skills Registry", href: "/marketplace" },
    { label: "16 Golden Benchmarks", href: "/benchmarks" },
    { label: "Live Edge API", href: "/api/audit?url=https://adobe.com" },
  ],
  resources: [
    { label: "MCP Remote Endpoint", href: "/api/mcp" },
    { label: "Developer Docs", href: "/docs" },
    { label: "Enterprise GEO Architecture", href: "/enterprise" },
    { label: "agentskills.io Spec", href: "https://agentskills.io", external: true },
  ],
  connect: [
    { label: "GitHub Repository", href: "https://github.com/SH20RAJ/adobe-hackathon-2026", external: true },
    { label: "Shaswat Raj (GitHub)", href: "https://github.com/sh20raj", external: true },
    { label: "Prithvi (GitHub)", href: "https://github.com/chikolavosaki-sys", external: true },
  ],
} as const;
