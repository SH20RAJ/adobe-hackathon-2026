/**
 * Recursive JSON Schema Validation for OmniAudit-GEO Reports (TypeScript).
 * Strictly validates against skills/audit-orchestrator/references/audit_schema.json.
 */

import { AuditReport } from "./types";

export interface SchemaValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateAuditReport(report: any): SchemaValidationResult {
  const errors: string[] = [];

  if (!report || typeof report !== "object" || Array.isArray(report)) {
    return { valid: false, errors: ["Report must be a non-null object"] };
  }

  // 1. Required top-level fields
  const requiredTop = ["site", "audited_at", "summary", "findings"];
  for (const field of requiredTop) {
    if (!(field in report)) {
      errors.push(`Missing required top-level field: '${field}'`);
    }
  }

  // 2. 'site' type
  if (typeof report.site !== "string" || !report.site.trim()) {
    errors.push("Field 'site' must be a non-empty string");
  }

  // 3. 'audited_at' ISO 8601 date-time
  if (typeof report.audited_at !== "string" || isNaN(Date.parse(report.audited_at))) {
    errors.push("Field 'audited_at' must be a valid ISO 8601 date-time string");
  }

  // 4. 'summary' object
  if (!report.summary || typeof report.summary !== "object" || Array.isArray(report.summary)) {
    errors.push("Field 'summary' must be an object");
  } else {
    for (const countKey of ["total_findings", "critical", "high", "medium"]) {
      if (typeof report.summary[countKey] !== "number" || report.summary[countKey] < 0) {
        errors.push(`summary.${countKey} must be a non-negative integer`);
      }
    }
  }

  // 5. 'metrics' bounds
  if (report.metrics) {
    if (typeof report.metrics !== "object" || Array.isArray(report.metrics)) {
      errors.push("Field 'metrics' must be an object");
    } else {
      for (const scoreKey of ["acpi_score", "crs_score"]) {
        if (scoreKey in report.metrics) {
          const val = report.metrics[scoreKey];
          if (typeof val !== "number" || val < 0 || val > 100) {
            errors.push(`metrics.${scoreKey} must be a number between 0 and 100, got: ${val}`);
          }
        }
      }
    }
  }

  // 6. 'findings' array
  const validSeverities = new Set(["critical", "high", "medium", "low"]);
  if (!Array.isArray(report.findings)) {
    errors.push("Field 'findings' must be an array");
  } else {
    report.findings.forEach((f: any, idx: number) => {
      if (!f || typeof f !== "object" || Array.isArray(f)) {
        errors.push(`findings[${idx}] must be an object`);
        return;
      }
      for (const field of ["id", "title", "severity", "evidence", "suggested_action"]) {
        if (!(field in f)) {
          errors.push(`findings[${idx}] missing required property '${field}'`);
        }
      }
      if (typeof f.id !== "string" || !f.id) {
        errors.push(`findings[${idx}].id must be a non-empty string`);
      }
      if (typeof f.title !== "string" || !f.title) {
        errors.push(`findings[${idx}].title must be a non-empty string`);
      }
      if (!validSeverities.has(f.severity)) {
        errors.push(`findings[${idx}].severity must be one of critical, high, medium, low; got '${f.severity}'`);
      }
      if (typeof f.evidence !== "string") {
        errors.push(`findings[${idx}].evidence must be a string`);
      }
      if (!f.suggested_action || typeof f.suggested_action !== "object") {
        errors.push(`findings[${idx}].suggested_action must be an object`);
      } else {
        if (typeof f.suggested_action.summary !== "string" || !f.suggested_action.summary) {
          errors.push(`findings[${idx}].suggested_action.summary must be a non-empty string`);
        }
        if (!validSeverities.has(f.suggested_action.priority)) {
          errors.push(`findings[${idx}].suggested_action.priority must be one of critical, high, medium, low`);
        }
      }
    });
  }

  // 7. 'proactive_recommendations' array
  if (report.proactive_recommendations) {
    if (!Array.isArray(report.proactive_recommendations)) {
      errors.push("Field 'proactive_recommendations' must be an array");
    } else {
      report.proactive_recommendations.forEach((rec: any, idx: number) => {
        if (!rec || typeof rec !== "object") {
          errors.push(`proactive_recommendations[${idx}] must be an object`);
          return;
        }
        for (const field of ["id", "area", "recommendation", "expected_impact", "priority"]) {
          if (!(field in rec)) {
            errors.push(`proactive_recommendations[${idx}] missing required property '${field}'`);
          }
        }
        if (!validSeverities.has(rec.priority)) {
          errors.push(`proactive_recommendations[${idx}].priority must be one of critical, high, medium, low`);
        }
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
