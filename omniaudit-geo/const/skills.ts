/**
 * Marketplace Skills Registry
 * Standardized to the agentskills.io specification
 */

export interface MarketplaceSkill {
  id: string;
  name: string;
  description: string;
  version: string;
  tags: readonly string[];
  execution_time_ms: number;
  entrypoint?: boolean;
  path: string;
  output_schema: string;
}

export const MARKETPLACE_SKILLS: readonly MarketplaceSkill[] = [
  {
    id: "audit-orchestrator",
    name: "Master Audit Dispatcher & Aggregator",
    description:
      "Root orchestrator that coordinates all 5 specialized audit skills, runs parallel evaluations, and computes composite ACPI and CRS scores with prioritization.",
    version: "1.0.0",
    tags: ["orchestrator", "aggregator", "acpi", "crs"],
    execution_time_ms: 12,
    entrypoint: true,
    path: "skills/audit-orchestrator",
    output_schema: "references/audit_schema.json",
  },
  {
    id: "crawl-render-audit",
    name: "AI Crawlability & Hydration Gap Inspector",
    description:
      "Audits robots.txt for AI assistant crawlers (GPTBot, ClaudeBot, PerplexityBot) and detects client-side hydration gaps causing LLM content blindness.",
    version: "1.0.0",
    tags: ["crawler-directives", "robots.txt", "hydration-gaps", "spa-detection"],
    execution_time_ms: 6,
    path: "skills/crawl-render-audit",
    output_schema: "references/crawl_schema.json",
  },
  {
    id: "structured-entity-audit",
    name: "Schema.org & Entity Disambiguation Inspector",
    description:
      "Extracts and validates JSON-LD microdata, verifying sameAs Wikidata linkage, entity graphs, and schema completeness to prevent LLM hallucinations.",
    version: "1.0.0",
    tags: ["json-ld", "schema-org", "wikidata", "sameAs", "knowledge-graph"],
    execution_time_ms: 8,
    path: "skills/structured-entity-audit",
    output_schema: "references/entity_schema.json",
  },
  {
    id: "aeo-quotability-audit",
    name: "LLM Quotability & Atomic Fact Extractor",
    description:
      "Analyzes sentence-level entropy, factual density, Q&A heading formats, and table accessibility to guarantee direct quotability by answer engines.",
    version: "1.0.0",
    tags: ["aeo", "quotability", "atomic-facts", "answer-engines", "fact-density"],
    execution_time_ms: 9,
    path: "skills/aeo-quotability-audit",
    output_schema: "references/aeo_schema.json",
  },
  {
    id: "freshness-corroboration-audit",
    name: "Freshness Signals & Trust Corroborator",
    description:
      "Evaluates copyright ranges, article timestamps, author attribution bylines, and citations to verify freshness and web-wide corroboration.",
    version: "1.0.0",
    tags: ["freshness", "temporal-decay", "author-byline", "trust-corroboration"],
    execution_time_ms: 5,
    path: "skills/freshness-corroboration-audit",
    output_schema: "references/freshness_schema.json",
  },
  {
    id: "on-site-engagement-audit",
    name: "Value Prop Clarity & Visitor Retention Inspector",
    description:
      "Evaluates hero section orientation, H1 word count, Flesch-Kincaid readability, CTA contrast, and bounce risk for visitors referred by AI assistants.",
    version: "1.0.0",
    tags: ["visitor-retention", "crs", "value-prop", "flesch-kincaid", "cta-clarity"],
    execution_time_ms: 7,
    path: "skills/on-site-engagement-audit",
    output_schema: "references/engagement_schema.json",
  },
] as const;
