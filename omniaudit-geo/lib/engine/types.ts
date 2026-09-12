/**
 * Canonical Audit Engine Type Definitions.
 * Conforms strictly to skills/audit-orchestrator/references/audit_schema.json.
 */

export type Severity = "critical" | "high" | "medium" | "low";
export type Priority = "critical" | "high" | "medium" | "low";

export interface SuggestedAction {
  summary: string;
  priority: Priority;
  implementation_code?: string;
  proactive_enhancement?: string;
}

export interface Finding {
  id: string;
  title: string;
  severity: Severity;
  category: string;
  evidence: string;
  suggested_action: SuggestedAction;
  score_impact?: number;
  confidence?: "high" | "medium" | "low";
}

export interface ProactiveRecommendation {
  id: string;
  area: string;
  recommendation: string;
  expected_impact: string;
  priority: Priority;
  implementation_code?: string;
}

export interface AuditSummary {
  total_findings: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  acpi_score?: number;
  crs_score?: number;
  component_scores?: Record<string, number>;
}

export interface MetricScores {
  acpi_score: number;
  crs_score: number;
  component_scores?: Record<string, number>;
}

export interface AuditReport {
  site: string;
  audited_at: string;
  latency?: string;
  summary: AuditSummary;
  metrics: MetricScores;
  findings: Finding[];
  proactive_recommendations: ProactiveRecommendation[];
}

export interface FetchResult {
  html: string;
  headers: Record<string, string>;
  status: number;
  error: string | null;
  error_code?: string;
  bytes_read: number;
}
