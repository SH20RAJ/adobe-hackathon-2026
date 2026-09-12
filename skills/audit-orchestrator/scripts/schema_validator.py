#!/usr/bin/env python3
"""
schema_validator.py — Recursive JSON Schema Validator for OmniAudit-GEO.
Zero external dependencies (Python standard library only).
Validates reports strictly against skills/audit-orchestrator/references/audit_schema.json.
"""

import json
from datetime import datetime
from typing import Any, List, Tuple

SEVERITY_ENUM = {"critical", "high", "medium", "low"}
PRIORITY_ENUM = {"critical", "high", "medium", "low"}

def is_valid_iso8601(timestamp_str: str) -> bool:
    """Validate ISO 8601 date-time format (e.g. 2026-09-12T17:30:00Z)."""
    if not isinstance(timestamp_str, str):
        return False
    try:
        clean = timestamp_str.replace("Z", "+00:00")
        datetime.fromisoformat(clean)
        return True
    except (ValueError, TypeError):
        return False

def validate_finding(finding: Any, path: str) -> List[str]:
    errors = []
    if not isinstance(finding, dict):
        return [f"{path}: expected finding to be object, got {type(finding).__name__}"]

    for req in ["id", "title", "severity", "evidence", "suggested_action"]:
        if req not in finding:
            errors.append(f"{path}: missing required field '{req}'")

    if "id" in finding and not isinstance(finding["id"], str):
        errors.append(f"{path}.id: expected string, got {type(finding['id']).__name__}")

    if "title" in finding and not isinstance(finding["title"], str):
        errors.append(f"{path}.title: expected string, got {type(finding['title']).__name__}")

    if "severity" in finding:
        sev = str(finding["severity"]).lower()
        if sev not in SEVERITY_ENUM:
            errors.append(f"{path}.severity: invalid enum value '{finding['severity']}', expected one of {sorted(SEVERITY_ENUM)}")

    if "evidence" in finding and not isinstance(finding["evidence"], str):
        errors.append(f"{path}.evidence: expected string, got {type(finding['evidence']).__name__}")

    if "suggested_action" in finding:
        act = finding["suggested_action"]
        if not isinstance(act, dict):
            errors.append(f"{path}.suggested_action: expected object, got {type(act).__name__}")
        else:
            if "summary" not in act or not isinstance(act["summary"], str):
                errors.append(f"{path}.suggested_action: missing or invalid string 'summary'")
            if "priority" not in act or str(act["priority"]).lower() not in PRIORITY_ENUM:
                errors.append(f"{path}.suggested_action: missing or invalid enum 'priority'")

    return errors

def validate_proactive_recommendation(rec: Any, path: str) -> List[str]:
    errors = []
    if not isinstance(rec, dict):
        return [f"{path}: expected object, got {type(rec).__name__}"]

    for req in ["id", "area", "recommendation", "expected_impact", "priority"]:
        if req not in rec:
            errors.append(f"{path}: missing required field '{req}'")

    if "priority" in rec and str(rec["priority"]).lower() not in PRIORITY_ENUM:
        errors.append(f"{path}.priority: invalid enum value '{rec['priority']}', expected one of {sorted(PRIORITY_ENUM)}")

    for str_field in ["id", "area", "recommendation", "expected_impact"]:
        if str_field in rec and not isinstance(rec[str_field], str):
            errors.append(f"{path}.{str_field}: expected string, got {type(rec[str_field]).__name__}")

    return errors

def validate_report(report: Any) -> Tuple[bool, List[str]]:
    """
    Recursively validates an audit report dictionary against audit_schema.json.
    Returns (True, []) on pass, or (False, [error_messages]) on failure.
    """
    errors: List[str] = []

    if not isinstance(report, dict):
        return False, [f"Root must be a JSON object, got {type(report).__name__}"]

    # 1. Top-level required keys
    for key in ["site", "audited_at", "summary", "findings"]:
        if key not in report:
            errors.append(f"Missing required top-level key: '{key}'")

    # 2. Site
    if "site" in report and (not isinstance(report["site"], str) or not report["site"].strip()):
        errors.append("Field 'site' must be a non-empty string")

    # 3. Audited At
    if "audited_at" in report and not is_valid_iso8601(report["audited_at"]):
        errors.append(f"Field 'audited_at' must be a valid ISO 8601 date-time, got '{report.get('audited_at')}'")

    # 4. Summary
    if "summary" in report:
        summary = report["summary"]
        if not isinstance(summary, dict):
            errors.append("Field 'summary' must be an object")
        else:
            for count_key in ["total_findings", "critical", "high", "medium"]:
                if count_key not in summary:
                    errors.append(f"summary: missing required key '{count_key}'")
                elif not isinstance(summary[count_key], int) or summary[count_key] < 0:
                    errors.append(f"summary.{count_key}: must be a non-negative integer, got {summary[count_key]}")

            if "low" in summary and (not isinstance(summary["low"], int) or summary["low"] < 0):
                errors.append(f"summary.low: must be a non-negative integer, got {summary['low']}")

    # 5. Metrics
    if "metrics" in report:
        metrics = report["metrics"]
        if not isinstance(metrics, dict):
            errors.append("Field 'metrics' must be an object")
        else:
            for score_key in ["acpi_score", "crs_score"]:
                if score_key in metrics:
                    val = metrics[score_key]
                    if not isinstance(val, (int, float)) or val < 0 or val > 100:
                        errors.append(f"metrics.{score_key}: must be a number between 0 and 100, got {val}")

    # 6. Findings
    if "findings" in report:
        findings = report["findings"]
        if not isinstance(findings, list):
            errors.append("Field 'findings' must be an array")
        else:
            for i, f in enumerate(findings):
                errors.extend(validate_finding(f, f"findings[{i}]"))

    # 7. Proactive Recommendations
    if "proactive_recommendations" in report:
        recs = report["proactive_recommendations"]
        if not isinstance(recs, list):
            errors.append("Field 'proactive_recommendations' must be an array")
        else:
            for i, r in enumerate(recs):
                errors.extend(validate_proactive_recommendation(r, f"proactive_recommendations[{i}]"))

    return len(errors) == 0, errors

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python3 schema_validator.py <path_to_report.json>")
        sys.exit(1)

    target_file = sys.argv[1]
    with open(target_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    is_valid, errs = validate_report(data)
    if is_valid:
        print("SCHEMA PASS")
        sys.exit(0)
    else:
        print("SCHEMA FAIL:")
        for e in errs:
            print(f"  - {e}")
        sys.exit(1)
