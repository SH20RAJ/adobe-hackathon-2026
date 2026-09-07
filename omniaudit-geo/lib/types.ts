export interface Finding {
  id: string;
  category: "crawl_render" | "structured_entity" | "aeo_quotability" | "freshness_trust" | "on_site_engagement";
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  score_impact: number;
  confidence: "high" | "medium" | "low";
  evidence?: {
    snippet?: string;
    target?: string;
    selector?: string;
    raw_data?: any;
  };
  suggested_action: {
    title: string;
    code_patch?: string;
    explanation: string;
  };
}

export interface ComponentScores {
  crawlability: number;
  renderability: number;
  entity_clarity: number;
  quotability: number;
  trust_freshness: number;
  orientation: number;
  intent_continuity: number;
  readability: number;
  actionability: number;
}

export interface AuditReport {
  site: string;
  audited_at: string;
  summary: {
    acpi_score: number; // 0 - 100 AI Citation Probability Index
    crs_score: number;  // 0 - 100 Cognitive Retention Score
    total_findings: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    component_scores: ComponentScores;
  };
  findings: Finding[];
}

export interface BenchmarkItem {
  id: string;
  name: string;
  description: string;
  architecture: string;
  category: string;
  expected_acpi: string;
  expected_crs: string;
  actual_acpi: number;
  actual_crs: number;
  key_finding: string;
  status: "pass" | "fail" | "optimal";
  fixture_file: string;
}

export interface SkillItem {
  id: string;
  name: string;
  entrypoint?: boolean;
  version: string;
  description: string;
  path: string;
  input_schema: string;
  output_schema: string;
  execution_time_ms: number;
  tags: string[];
}
