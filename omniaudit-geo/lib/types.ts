export interface FindingAction {
  title?: string;
  summary?: string;
  priority?: "critical" | "high" | "medium" | "low" | string;
  code_patch?: string;
  implementation_code?: string;
  explanation?: string;
}

export interface Finding {
  id: string;
  category: string;
  title: string;
  description?: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  score_impact?: number;
  confidence?: "high" | "medium" | "low" | string;
  evidence?: string | {
    snippet?: string;
    target?: string;
    selector?: string;
    raw_data?: any;
  };
  suggested_action: FindingAction;
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

export interface AuditSummary {
  acpi_score?: number;
  crs_score?: number;
  total_findings: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  component_scores?: ComponentScores;
}

export interface AuditReport {
  site: string;
  audited_at: string;
  latency?: string;
  summary: AuditSummary;
  metrics?: {
    acpi_score: number;
    crs_score: number;
    component_scores?: ComponentScores;
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
