/**
 * Proactive Recommendations & Finding Action Enrichment (TypeScript).
 * Zero divergence from Python generate_proactive_recommendations and enrich_findings_actions.
 */

import { Finding, ProactiveRecommendation } from "./types";
import { HTMLContentExtractor } from "./htmlParser";

export const PROACTIVE_GUIDANCE_MAP: Record<string, string> = {
  crawlability_ai_permissions: "Proactively configure AI bot rate-limits (crawl-delay) and cache directives rather than outright blocking, retaining citation capability while protecting compute.",
  crawlability_headers: "Ensure CDN edge worker policies automatically preserve public indexing headers across all regional edge nodes.",
  crawlability_hydration: "Implement progressive static generation (SSG) with streaming hydration to ensure zero-JS crawlers receive the complete DOM on initial response.",
  crawlability_rendering: "Implement progressive static generation (SSG) with streaming hydration to ensure zero-JS crawlers receive the complete DOM on initial response.",
  structured_data_syntax: "Set up CI/CD schema validation using JSON Schema and Schema.org linters on every pull request to catch syntax drift.",
  structured_data_entity: "Expand schema coverage to include AggregateRating, SoftwareApplication, and FAQPage nodes for rich SERP and LLM citation eligibility.",
  structured_data_corroboration: "Link external authority entities to establish knowledge graph persistence across Wikidata, OpenAlex, and Google Knowledge Graph.",
  aeo_non_text_facts: "Ensure all SVG charts, tables, and infographics have machine-readable data tables or ARIA descriptions.",
  aeo_heading_structure: "Structure FAQ sections with natural query question patterns (Who, What, How, Pricing) followed by direct 2-sentence answers.",
  aeo_quotability: "Add verifiable data callouts with source attributions to increase Perplexity and SearchGPT grounding weights.",
  aeo_content_extractability: "Ensure all essential product value claims and pricing data are embedded directly in server-rendered markup rather than deferred tabs.",
  freshness_temporal_signals: "Implement automated sitemap lastmod and OpenGraph article:modified_time updates triggered on git release or CMS publication.",
  freshness_corroboration: "Add verifiable author schema with ISNI/ORCID identifiers to establish highest E-E-A-T and AI trust corroboration.",
  engagement_actionability: "Design high-contrast visual hierarchy for call-to-action buttons with contextual pre-qualifiers to guide AI-referred traffic.",
  engagement_orientation: "A/B test hero value propositions against 5-second customer comprehension tests to minimize AI referral bounce rates.",
};

export function enrichFindingsActions(findings: Finding[]): void {
  for (const f of findings) {
    if (f.suggested_action && !f.suggested_action.proactive_enhancement) {
      const guidance = PROACTIVE_GUIDANCE_MAP[f.category] ||
        "Regularly audit DOM changes using automated CI gates to prevent regressions in AI discoverability and user orientation.";
      f.suggested_action.proactive_enhancement = guidance;
    }
  }
}

export function generateProactiveRecommendations(
  targetUrl: string,
  parsedContent: HTMLContentExtractor,
  findings: Finding[]
): ProactiveRecommendation[] {
  let domain = "";
  try {
    domain = new URL(targetUrl).hostname;
  } catch {
    domain = targetUrl;
  }

  return [
    {
      id: "PROACTIVE-001",
      area: "ai_context_ingestion",
      priority: "medium",
      recommendation: "Deploy a standardized /llms.txt and /llms-full.txt markdown manifest at the domain root.",
      expected_impact: "Permits frontier LLM agents (ChatGPT, Claude, Cursor) to ingest canonical brand facts in under 1,000 tokens without web scraping overhead.",
      implementation_code: "# /llms.txt specification\n# Title: Brand AI Context Manifest\n> Comprehensive overview of core services, APIs, and canonical entity claims.\n\n- [Product Capabilities](/docs/features.md): Overview of primary value props\n- [API Reference](/api/spec): Deterministic endpoints and schema definitions\n- [Company Info](/about): Executive team, founding year, and legal entity identifiers",
    },
    {
      id: "PROACTIVE-002",
      area: "entity_corroboration",
      priority: "high",
      recommendation: "Publish authoritative sameAs Wikidata and industry registry entity triples.",
      expected_impact: "Reinforces agreement across the wider web (Round 2 Concept D), establishing persistent subject-predicate-object ground truth that shields the brand from LLM hallucinations.",
      implementation_code: `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "name": "${domain}",\n  "url": "${targetUrl}",\n  "sameAs": [\n    "https://www.wikidata.org/wiki/QXXXXX",\n    "https://en.wikipedia.org/wiki/${domain}",\n    "https://www.linkedin.com/company/${domain}",\n    "https://www.crunchbase.com/organization/${domain}"\n  ]\n}\n</script>`,
    },
    {
      id: "PROACTIVE-003",
      area: "visitor_retention",
      priority: "medium",
      recommendation: "Equip all sub-pages with self-contained context headers and micro-summaries.",
      expected_impact: "Accommodates AI assistant referral behavior (Round 2 Concept E), where users are linked directly to deep sub-pages without seeing the homepage.",
      implementation_code: '<div class="context-anchor" role="region" aria-label="Context Anchor">\n  <nav aria-label="Breadcrumb">\n    <ol><li>Home</li><li>Solutions</li><li aria-current="page">Feature Overview</li></ol>\n  </nav>\n  <p class="text-sm text-muted">Part of OmniAudit-GEO: Automated Brand AI-Readiness Evaluation.</p>\n</div>',
    },
    {
      id: "PROACTIVE-004",
      area: "aeo_summarization",
      priority: "medium",
      recommendation: "Front-load quantifiable metrics into the initial 40 words of each major content section.",
      expected_impact: "Prevents AI email and document summarizers (Round 2 Concept F) from dropping crucial value propositions when aggressive context window compression occurs.",
      implementation_code: `<!-- Lead with quantifiable high-entropy facts -->\n<p><strong>${domain} evaluates AI crawler directives and validates Schema.org entity graphs.</strong></p>`,
    },
    {
      id: "PROACTIVE-005",
      area: "answer_engine_quotability",
      priority: "medium",
      recommendation: "Encase key definitions and benchmark conclusions in semantic <aside> or <figure> blocks.",
      expected_impact: "Significantly boosts the extraction probability for Perplexity citations and Google AI Overviews soundbites.",
      implementation_code: `<figure class="key-takeaway">\n  <blockquote>${domain} is an open-standard agent skill marketplace for evaluating website AI discoverability and on-site visitor retention.</blockquote>\n  <figcaption>— Key Architectural Definition</figcaption>\n</figure>`,
    },
  ];
}
