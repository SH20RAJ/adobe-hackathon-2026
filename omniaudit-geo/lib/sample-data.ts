import { AuditReport, BenchmarkItem, SkillItem } from "./types";

export const SAMPLE_AUDITS: Record<string, AuditReport> = {
  "adobe.com": {
    site: "https://www.adobe.com",
    audited_at: "2026-09-08T00:15:00Z",
    summary: {
      acpi_score: 91.4,
      crs_score: 88.5,
      total_findings: 4,
      critical: 0,
      high: 1,
      medium: 2,
      low: 1,
      component_scores: {
        crawlability: 96.0,
        renderability: 92.0,
        entity_clarity: 94.0,
        quotability: 86.0,
        trust_freshness: 90.0,
        orientation: 92.0,
        intent_continuity: 88.0,
        readability: 85.0,
        actionability: 89.0,
      },
    },
    findings: [
      {
        id: "geo-ent-sameas-wikidata",
        category: "structured_entity",
        title: "Wikidata Entity Disambiguation Missing in Root Graph",
        description: "Adobe Organization Schema contains official website and social links, but lacks direct sameAs claim to Wikidata Q11463.",
        severity: "medium",
        score_impact: -5.0,
        confidence: "high",
        evidence: {
          target: "script[type='application/ld+json']",
          snippet: `"@type": "Organization", "name": "Adobe Inc.", "sameAs": ["https://twitter.com/Adobe"]`,
        },
        suggested_action: {
          title: "Inject Authoritative Wikidata URI to sameAs",
          code_patch: `{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "@id": "https://www.adobe.com/#organization",\n  "name": "Adobe",\n  "sameAs": [\n    "https://www.wikidata.org/wiki/Q11463",\n    "https://en.wikipedia.org/wiki/Adobe_Inc."\n  ]\n}`,
          explanation: "Adding Wikidata Q11463 allows Perplexity, Gemini, and ChatGPT knowledge graphs to instantly link Adobe products to verified enterprise ontology.",
        },
      },
      {
        id: "geo-aeo-table-accessibility",
        category: "aeo_quotability",
        title: "Comparison Tables Omit Explicit THEAD Scope Attributes",
        description: "Feature comparison tables in Creative Cloud landing sub-pages lack explicit scope='col' on table headers, degrading AI agent tabular quotability.",
        severity: "low",
        score_impact: -3.6,
        confidence: "medium",
        evidence: {
          target: "table.pricing-matrix",
          snippet: `<table><tr><td>Plan</td><td>Price</td></tr>...</table>`,
        },
        suggested_action: {
          title: "Use Semantic THEAD with Scope Headers",
          code_patch: `<thead>\n  <tr>\n    <th scope="col">Plan Tier</th>\n    <th scope="col">Monthly Price</th>\n    <th scope="col">Enterprise Cloud</th>\n  </tr>\n</thead>`,
          explanation: "LLM crawlers parse tabular facts 4.2x more reliably when semantic <thead> and scope attributes are explicitly defined.",
        },
      },
    ],
  },
  "linear.app": {
    site: "https://linear.app",
    audited_at: "2026-09-08T00:18:00Z",
    summary: {
      acpi_score: 87.2,
      crs_score: 94.0,
      total_findings: 3,
      critical: 0,
      high: 1,
      medium: 1,
      low: 1,
      component_scores: {
        crawlability: 98.0,
        renderability: 90.0,
        entity_clarity: 82.0,
        quotability: 84.0,
        trust_freshness: 82.0,
        orientation: 98.0,
        intent_continuity: 96.0,
        readability: 91.0,
        actionability: 92.0,
      },
    },
    findings: [
      {
        id: "geo-crawl-ai-allow",
        category: "crawl_render",
        title: "Explicit AI Bot Permissions Fully Allowed",
        description: "robots.txt explicitly permits GPTBot, ClaudeBot, and PerplexityBot with unrestricted access to public product docs.",
        severity: "info",
        score_impact: 0.0,
        confidence: "high",
        evidence: {
          target: "https://linear.app/robots.txt",
          snippet: "User-agent: GPTBot\nAllow: /\nUser-agent: ClaudeBot\nAllow: /",
        },
        suggested_action: {
          title: "Maintain Clear AI Crawler Policies",
          explanation: "Clear crawler allowlist ensures real-time model synthesis and up-to-date documentation citations in Claude Code and ChatGPT Search.",
        },
      },
    ],
  },
  "react-spa-sample.internal": {
    site: "https://spa-unrendered.sample",
    audited_at: "2026-09-08T00:20:00Z",
    summary: {
      acpi_score: 34.2,
      crs_score: 41.0,
      total_findings: 6,
      critical: 2,
      high: 2,
      medium: 1,
      low: 1,
      component_scores: {
        crawlability: 80.0,
        renderability: 20.0,
        entity_clarity: 25.0,
        quotability: 18.0,
        trust_freshness: 30.0,
        orientation: 45.0,
        intent_continuity: 40.0,
        readability: 50.0,
        actionability: 35.0,
      },
    },
    findings: [
      {
        id: "geo-crawl-hydration-gap",
        category: "crawl_render",
        title: "Severe Client-Side Hydration Gap Detected",
        description: "Raw HTML body contains only 38 words while mounting React bundle. AI search crawlers without full headless JS rendering index an empty white page.",
        severity: "critical",
        score_impact: -35.0,
        confidence: "high",
        evidence: {
          target: "div#root",
          snippet: `<body><div id="root"></div><script src="/bundle.js"></script></body>`,
        },
        suggested_action: {
          title: "Implement Server-Side Rendering (SSR) or Static Site Generation (SSG)",
          code_patch: `// Before: Client only SPA\n// After: Next.js Server Component or Cloudflare Worker SSR\nexport default async function Page() {\n  return (\n    <main>\n      <h1>Enterprise AI Readiness Audit</h1>\n      <p>Pre-rendered text available to all LLM crawlers without JS.</p>\n    </main>\n  );\n}`,
          explanation: "Search bots like PerplexityBot and ClaudeBot prioritize fast static DOM streams. SSR guarantees 100% indexing parity.",
        },
      },
    ],
  },
};

export { BENCHMARK_FIXTURES, MARKETPLACE_SKILLS } from "@/const";

