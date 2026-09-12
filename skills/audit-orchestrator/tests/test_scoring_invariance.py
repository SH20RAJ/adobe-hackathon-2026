#!/usr/bin/env python3
"""
Unit tests for scoring engine invariance, determinism, and bounds.
"""

import sys
import unittest
from pathlib import Path

SCRIPTS_DIR = Path(__file__).resolve().parent.parent / "scripts"
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

from scoring import compute_scores


class TestScoringInvariance(unittest.TestCase):
    def test_clean_site_perfect_scores(self):
        res = compute_scores([])
        self.assertEqual(res["acpi_score"], 100.0)
        self.assertEqual(res["crs_score"], 100.0)
        for score in res["component_scores"].values():
            self.assertEqual(score, 100.0)

    def test_score_bounds_floored(self):
        # Flood with critical findings
        severe_findings = [
            {"id": f"F-{i}", "severity": "critical", "category": "crawlability_ai_permissions"}
            for i in range(20)
        ]
        res = compute_scores(severe_findings)
        self.assertGreaterEqual(res["acpi_score"], 5.0)
        self.assertLessEqual(res["acpi_score"], 100.0)
        self.assertGreaterEqual(res["crs_score"], 10.0)
        self.assertLessEqual(res["crs_score"], 100.0)

    def test_confidence_scaling(self):
        high_finding = [{"severity": "high", "confidence": "high", "category": "structured_data_entity"}]
        low_finding = [{"severity": "high", "confidence": "low", "category": "structured_data_entity"}]

        res_high = compute_scores(high_finding)
        res_low = compute_scores(low_finding)

        self.assertLess(res_high["acpi_score"], res_low["acpi_score"])

    def test_duplicate_root_cause_diminishing_penalty(self):
        single_finding = [{"severity": "high", "confidence": "high", "category": "crawlability_ai_permissions"}]
        duplicate_findings = [
            {"severity": "high", "confidence": "high", "category": "crawlability_ai_permissions"},
            {"severity": "high", "confidence": "high", "category": "crawlability_ai_permissions"},
        ]

        res_single = compute_scores(single_finding)
        res_dup = compute_scores(duplicate_findings)

        single_ded = 100.0 - res_single["acpi_score"]
        dup_ded = 100.0 - res_dup["acpi_score"]

        # Duplicate deduction should be less than 2x single deduction
        self.assertLess(dup_ded, single_ded * 2.0)

    def test_proactive_zero_impact(self):
        # Category without severity deduction
        clean = compute_scores([])
        proactive = compute_scores([{"severity": "info", "category": "aeo_proactive"}])
        self.assertEqual(clean["acpi_score"], proactive["acpi_score"])
        self.assertEqual(clean["crs_score"], proactive["crs_score"])

    def test_determinism(self):
        sample = [
            {"severity": "high", "confidence": "high", "category": "crawlability_ai_permissions"},
            {"severity": "medium", "confidence": "medium", "category": "structured_data_disambiguation"},
            {"severity": "low", "confidence": "high", "category": "quotability_headings"},
        ]
        r1 = compute_scores(sample)
        r2 = compute_scores(sample)
        self.assertEqual(r1["acpi_score"], r2["acpi_score"])
        self.assertEqual(r1["crs_score"], r2["crs_score"])
        self.assertEqual(r1["component_scores"], r2["component_scores"])


if __name__ == "__main__":
    unittest.main()
