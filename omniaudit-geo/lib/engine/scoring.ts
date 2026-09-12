/**
 * Deterministic, Component-Based Scoring Engine for OmniAudit-GEO (TypeScript).
 * Zero divergence from skills/audit-orchestrator/scripts/scoring.py.
 */

import { Finding, MetricScores } from "./types";

export const ACPI_WEIGHTS: Record<string, number> = {
  crawlability: 0.30,
  renderability: 0.15,
  entity_clarity: 0.20,
  quotability: 0.20,
  trust_freshness: 0.15,
};

export const CRS_WEIGHTS: Record<string, number> = {
  orientation: 0.35,
  intent_continuity: 0.25,
  readability: 0.20,
  actionability: 0.20,
};

export const CATEGORY_MAP: Record<string, [string, string, string]> = {
  // Crawl & Render
  crawlability_ai_permissions: ["acpi", "crawlability", "robots"],
  crawlability_headers: ["acpi", "crawlability", "headers"],
  crawlability_network: ["acpi", "crawlability", "network"],
  crawlability_hydration: ["acpi", "renderability", "hydration"],
  crawlability_rendering: ["acpi", "renderability", "hydration"],
  // Structured Entity
  structured_data_entity: ["acpi", "entity_clarity", "schema_org"],
  structured_data_syntax: ["acpi", "entity_clarity", "syntax"],
  structured_data_disambiguation: ["acpi", "entity_clarity", "sameas"],
  structured_data_corroboration: ["acpi", "entity_clarity", "sameas"],
  structured_entity: ["acpi", "entity_clarity", "schema_org"],
  // AEO Quotability
  quotability_atomic_facts: ["acpi", "quotability", "atomic_facts"],
  quotability_headings: ["acpi", "quotability", "qa_headings"],
  non_text_assets: ["acpi", "quotability", "non_text"],
  aeo_non_text_facts: ["acpi", "quotability", "non_text"],
  aeo_heading_structure: ["acpi", "quotability", "qa_headings"],
  aeo_quotability: ["acpi", "quotability", "atomic_facts"],
  aeo_content_extractability: ["acpi", "quotability", "atomic_facts"],
  // Freshness & Trust
  freshness_temporal: ["acpi", "trust_freshness", "timestamps"],
  freshness_temporal_signals: ["acpi", "trust_freshness", "timestamps"],
  authority_corroboration: ["acpi", "trust_freshness", "byline"],
  freshness_trust: ["acpi", "trust_freshness", "timestamps"],
  freshness_corroboration: ["acpi", "trust_freshness", "byline"],
  // On-Site Engagement
  engagement_orientation: ["crs", "orientation", "hero"],
  engagement_intent: ["crs", "intent_continuity", "intent"],
  paywall_gate: ["crs", "intent_continuity", "paywall"],
  engagement_readability: ["crs", "readability", "flesch_kincaid"],
  engagement_cognitive_load: ["crs", "readability", "cognitive_load"],
  engagement_actionability: ["crs", "actionability", "cta"],
  engagement_action_clarity: ["crs", "actionability", "cta"],
  engagement_form_accessibility: ["crs", "actionability", "forms"],
  on_site_retention: ["crs", "orientation", "hero"],
};

export const SEVERITY_DEDUCTION: Record<string, number> = {
  critical: 30.0,
  high: 15.0,
  medium: 8.0,
  low: 3.0,
};

export const CONFIDENCE_MULTIPLIER: Record<string, number> = {
  high: 1.0,
  medium: 0.7,
  low: 0.4,
};

export const CATEGORY_MAX_DEDUCTION: Record<string, number> = {
  crawlability: 70.0,
  renderability: 70.0,
  entity_clarity: 60.0,
  quotability: 60.0,
  trust_freshness: 55.0,
  orientation: 60.0,
  intent_continuity: 60.0,
  readability: 50.0,
  actionability: 50.0,
};

export function computeScores(findings: Finding[]): MetricScores {
  const componentDeductions: Record<string, number> = {
    crawlability: 0.0,
    renderability: 0.0,
    entity_clarity: 0.0,
    quotability: 0.0,
    trust_freshness: 0.0,
    orientation: 0.0,
    intent_continuity: 0.0,
    readability: 0.0,
    actionability: 0.0,
  };

  const seenCauses: Record<string, number> = {};

  for (const f of findings) {
    const severity = String(f.severity || "medium").toLowerCase();
    if (!(severity in SEVERITY_DEDUCTION)) {
      continue;
    }

    const category = String(f.category || "").toLowerCase();
    let mapping = CATEGORY_MAP[category];
    if (!mapping) {
      if (category.includes("crawl") || category.includes("robot")) {
        mapping = ["acpi", "crawlability", "crawl"];
      } else if (category.includes("schema") || category.includes("entity")) {
        mapping = ["acpi", "entity_clarity", "entity"];
      } else if (category.includes("fresh") || category.includes("trust")) {
        mapping = ["acpi", "trust_freshness", "freshness"];
      } else if (category.includes("read") || category.includes("engage") || category.includes("hero")) {
        mapping = ["crs", "orientation", "engagement"];
      } else {
        mapping = ["acpi", "quotability", "quotability"];
      }
    }

    const [, component, rootCause] = mapping;
    const baseDed = SEVERITY_DEDUCTION[severity];
    const conf = String(f.confidence || "high").toLowerCase();
    const confMult = CONFIDENCE_MULTIPLIER[conf] ?? 1.0;
    const netDed = baseDed * confMult;

    const causeKey = `${component}:${rootCause}`;
    let effectiveDed = netDed;
    if (causeKey in seenCauses) {
      effectiveDed = netDed * 0.5;
    } else {
      seenCauses[causeKey] = netDed;
    }

    componentDeductions[component] = (componentDeductions[component] || 0) + effectiveDed;
  }

  // Compute capped component scores (0 to 100)
  const componentScores: Record<string, number> = {};
  for (const [comp, ded] of Object.entries(componentDeductions)) {
    const maxCap = CATEGORY_MAX_DEDUCTION[comp] ?? 60.0;
    const cappedDed = Math.min(ded, maxCap);
    componentScores[comp] = Number(Math.max(0.0, 100.0 - cappedDed).toFixed(1));
  }

  // Composite ACPI
  let acpiRaw = 0.0;
  for (const [comp, weight] of Object.entries(ACPI_WEIGHTS)) {
    acpiRaw += (componentScores[comp] ?? 100.0) * weight;
  }
  const acpiScore = Number(Math.max(5.0, Math.min(100.0, acpiRaw)).toFixed(1));

  // Composite CRS
  let crsRaw = 0.0;
  for (const [comp, weight] of Object.entries(CRS_WEIGHTS)) {
    crsRaw += (componentScores[comp] ?? 100.0) * weight;
  }
  const crsScore = Number(Math.max(10.0, Math.min(100.0, crsRaw)).toFixed(1));

  return {
    acpi_score: acpiScore,
    crs_score: crsScore,
    component_scores: componentScores,
  };
}
