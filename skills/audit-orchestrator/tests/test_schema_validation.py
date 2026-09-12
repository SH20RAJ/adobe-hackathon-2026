#!/usr/bin/env python3
"""
Unit tests for recursive schema_validator.py.
Validates valid reports, and ensures malformed reports fail with descriptive errors.
"""

import sys
import unittest
from pathlib import Path

SCRIPTS_DIR = Path(__file__).resolve().parents[1] / "scripts"
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

from schema_validator import validate_report

class TestSchemaValidation(unittest.TestCase):
    def setUp(self):
        self.valid_report = {
            "site": "example.com",
            "audited_at": "2026-09-12T17:30:00Z",
            "summary": {
                "total_findings": 1,
                "critical": 0,
                "high": 1,
                "medium": 0,
                "low": 0
            },
            "metrics": {
                "acpi_score": 85.0,
                "crs_score": 90.0
            },
            "findings": [
                {
                    "id": "F-001",
                    "title": "Robots Restriction",
                    "severity": "high",
                    "category": "crawlability_robots",
                    "evidence": "Disallow: /",
                    "suggested_action": {
                        "summary": "Allow AI bots in robots.txt",
                        "priority": "high",
                        "implementation_code": "User-agent: GPTBot\nAllow: /"
                    }
                }
            ],
            "proactive_recommendations": [
                {
                    "id": "PROACTIVE-001",
                    "area": "ai_context",
                    "recommendation": "Deploy /llms.txt manifest",
                    "expected_impact": "Fast ingestion for LLMs",
                    "priority": "medium"
                }
            ]
        }

    def test_valid_report_passes(self):
        valid, errors = validate_report(self.valid_report)
        self.assertTrue(valid)
        self.assertEqual(errors, [])

    def test_missing_top_level_key_fails(self):
        report = dict(self.valid_report)
        del report["site"]
        valid, errors = validate_report(report)
        self.assertFalse(valid)
        self.assertTrue(any("Missing required top-level key: 'site'" in e for e in errors))

    def test_invalid_timestamp_format_fails(self):
        report = dict(self.valid_report)
        report["audited_at"] = "invalid-date-time-format"
        valid, errors = validate_report(report)
        self.assertFalse(valid)
        self.assertTrue(any("audited_at" in e for e in errors))

    def test_negative_score_fails(self):
        report = dict(self.valid_report)
        report["metrics"] = {"acpi_score": -5.0, "crs_score": 90.0}
        valid, errors = validate_report(report)
        self.assertFalse(valid)
        self.assertTrue(any("acpi_score" in e for e in errors))

    def test_score_exceeding_100_fails(self):
        report = dict(self.valid_report)
        report["metrics"] = {"acpi_score": 105.0, "crs_score": 90.0}
        valid, errors = validate_report(report)
        self.assertFalse(valid)
        self.assertTrue(any("acpi_score" in e for e in errors))

    def test_invalid_finding_severity_enum_fails(self):
        report = dict(self.valid_report)
        report["findings"] = [
            {
                "id": "F-001",
                "title": "Bad Severity",
                "severity": "catastrophic",  # invalid enum
                "evidence": "bad",
                "suggested_action": {"summary": "fix", "priority": "high"}
            }
        ]
        valid, errors = validate_report(report)
        self.assertFalse(valid)
        self.assertTrue(any("severity: invalid enum" in e for e in errors))

    def test_missing_finding_suggested_action_fails(self):
        report = dict(self.valid_report)
        report["findings"] = [
            {
                "id": "F-001",
                "title": "No Action",
                "severity": "medium",
                "evidence": "evidence"
            }
        ]
        valid, errors = validate_report(report)
        self.assertFalse(valid)
        self.assertTrue(any("missing required field 'suggested_action'" in e for e in errors))

if __name__ == "__main__":
    unittest.main()
