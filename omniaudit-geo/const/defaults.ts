/**
 * Defaults & Diagnostic Preset Constants
 */

export interface SamplePreset {
  label: string;
  url: string;
  category: string;
}

export const SAMPLE_PRESETS: readonly SamplePreset[] = [
  { label: "Adobe", url: "https://adobe.com", category: "Creative & Enterprise" },
  { label: "Stripe", url: "https://stripe.com", category: "Developer & Fintech" },
  { label: "Linear", url: "https://linear.app", category: "Modern SaaS" },
  { label: "GitHub", url: "https://github.com", category: "Code Platform" },
  { label: "Airbnb", url: "https://airbnb.com", category: "Marketplace & Travel" },
] as const;

export const SCORING_WEIGHTS = {
  acpi: {
    crawl_permissions: 0.30,
    hydration_integrity: 0.15,
    entity_disambiguation: 0.20,
    aeo_quotability: 0.20,
    freshness_trust: 0.15,
  },
  crs: {
    hero_orientation: 0.35,
    intent_continuity: 0.25,
    cognitive_readability: 0.20,
    call_to_action: 0.20,
  },
} as const;

export const PROACTIVE_RECOMMENDATIONS_CATALOG = [
  {
    id: "PROACTIVE-001",
    area: "ai_context_ingestion",
    priority: "medium" as const,
    recommendation: "Deploy a standardized /llms.txt and /llms-full.txt markdown manifest at the domain root.",
    expected_impact:
      "Permits frontier LLM agents (ChatGPT, Claude, Cursor) to ingest canonical brand facts in under 1,000 tokens without web scraping overhead.",
    implementation_code:
      "# /llms.txt specification\n# Title: Brand AI Context Manifest\n> Comprehensive overview of core services, APIs, and canonical entity claims.\n\n- [Product Capabilities](/docs/features.md): Overview of primary value props\n- [API Reference](/api/spec): Deterministic endpoints and schema definitions\n- [Company Info](/about): Executive team, founding year, and legal entity identifiers",
  },
  {
    id: "PROACTIVE-002",
    area: "entity_corroboration",
    priority: "high" as const,
    recommendation: "Publish authoritative sameAs Wikidata and industry registry entity triples.",
    expected_impact:
      "Reinforces agreement across the wider web, establishing persistent subject-predicate-object ground truth that shields the brand from LLM hallucinations.",
    implementation_code:
      '<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "name": "Brand",\n  "url": "https://example.com",\n  "sameAs": [\n    "https://www.wikidata.org/wiki/QXXXXX",\n    "https://en.wikipedia.org/wiki/Brand",\n    "https://www.linkedin.com/company/brand"\n  ]\n}\n</script>',
  },
  {
    id: "PROACTIVE-003",
    area: "visitor_retention",
    priority: "medium" as const,
    recommendation: "Equip all sub-pages with self-contained context headers and micro-summaries.",
    expected_impact:
      "Accommodates AI assistant referral behavior where users are linked directly to deep sub-pages without seeing the homepage.",
    implementation_code:
      '<div class="context-anchor" role="region" aria-label="Context Anchor">\n  <nav aria-label="Breadcrumb">\n    <ol><li>Home</li><li>Solutions</li><li aria-current="page">Feature Overview</li></ol>\n  </nav>\n  <p class="text-sm text-muted">Part of OmniAudit-GEO: Automated Brand AI-Readiness Evaluation.</p>\n</div>',
  },
  {
    id: "PROACTIVE-004",
    area: "aeo_summarization",
    priority: "medium" as const,
    recommendation: "Front-load quantifiable metrics into the initial 40 words of each major content section.",
    expected_impact:
      "Prevents AI email and document summarizers from dropping crucial value propositions when aggressive context window compression occurs.",
    implementation_code:
      "<!-- Lead with quantifiable high-entropy facts -->\n<p><strong>Platform delivers enterprise AI discoverability evaluation with sub-second analysis and zero external API dependencies.</strong></p>",
  },
  {
    id: "PROACTIVE-005",
    area: "answer_engine_quotability",
    priority: "medium" as const,
    recommendation: "Encase key definitions and benchmark conclusions in semantic <aside> or <figure> blocks.",
    expected_impact:
      "Significantly boosts the extraction probability for Perplexity citations and Google AI Overviews soundbites.",
    implementation_code:
      '<figure class="key-takeaway">\n  <blockquote>Enterprise platform delivering automated AI discoverability audits and visitor retention optimization.</blockquote>\n  <figcaption>— Key Architectural Definition</figcaption>\n</figure>',
  },
] as const;
