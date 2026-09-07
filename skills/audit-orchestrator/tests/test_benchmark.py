import json
import pathlib
import sys
import unittest
from unittest.mock import patch


SCRIPT_DIR = pathlib.Path(__file__).resolve().parents[1] / "scripts"
FIXTURES = pathlib.Path(__file__).parent / "fixtures" / "benchmark"
sys.path.insert(0, str(SCRIPT_DIR))
from audit_runner import run_full_audit


def page(name):
    return (FIXTURES / f"{name}.html").read_text(encoding="utf-8")


def response(body, headers=None, status=200, error=None):
    return {
        "status": status,
        "headers": headers or {"content-type": "text/html; charset=utf-8"},
        "body": body.encode(),
        "html": body,
        "url": "https://example.test/",
        "error": error,
        "error_code": None,
    }


def audit_fixture(name, robots="User-agent: *\nAllow: /\n"):
    html = page(name)

    def fake_fetch(url, **kwargs):
        if url.endswith("/robots.txt"):
            return response(robots, {"content-type": "text/plain"})
        return response(html)

    with patch("audit_runner.safe_fetch", side_effect=fake_fetch):
        return run_full_audit("https://example.test/")


class BenchmarkContractTests(unittest.TestCase):
    def assert_contract(self, report):
        self.assertIn("site", report)
        self.assertIn("findings", report)
        for finding in report["findings"]:
            for key in ("id", "title", "severity", "evidence", "suggested_action"):
                self.assertIn(key, finding)
            self.assertIn(finding["severity"], {"critical", "high", "medium", "low"})
            self.assertIn("summary", finding["suggested_action"])
            self.assertIn("priority", finding["suggested_action"])

    def test_good_business_page_is_clean_for_major_detectors(self):
        report = audit_fixture("good_business")
        self.assert_contract(report)
        ids = {item["id"] for item in report["findings"]}
        self.assertNotIn("F-011", ids)
        self.assertNotIn("F-019", ids)
        self.assertNotIn("F-009", ids)
        self.assertFalse(any(item["severity"] == "high" for item in report["findings"]))

    def test_crawler_blocked_page_reports_robots_only(self):
        report = audit_fixture("crawler_blocked", "User-agent: GPTBot\nDisallow: /\n")
        self.assert_contract(report)
        ids = {item["id"] for item in report["findings"]}
        self.assertIn("F-001-GPTBot", ids)
        self.assertNotIn("F-011", ids)

    def test_hydration_spa_and_partial_gap_are_detected(self):
        self.assertIn("F-011", {item["id"] for item in audit_fixture("hydration_spa")["findings"]})
        self.assertIn("F-011", {item["id"] for item in audit_fixture("partial_hydration")["findings"]})

    def test_good_and_bad_structured_data(self):
        good_ids = {item["id"] for item in audit_fixture("good_structured")["findings"]}
        bad_report = audit_fixture("bad_structured")
        bad_ids = {item["id"] for item in bad_report["findings"]}
        self.assertNotIn("F-004", good_ids)
        self.assertIn("F-003", bad_ids)
        self.assertIn("F-012", bad_ids)

    def test_aeo_and_freshness_cases(self):
        strong_ids = {item["id"] for item in audit_fixture("strong_aeo")["findings"]}
        weak_ids = {item["id"] for item in audit_fixture("weak_aeo")["findings"]}
        stale_ids = {item["id"] for item in audit_fixture("stale_article")["findings"]}
        current_ids = {item["id"] for item in audit_fixture("current_article")["findings"]}
        self.assertNotIn("F-015", strong_ids)
        self.assertIn("F-006", weak_ids)
        self.assertIn("F-009", stale_ids)
        self.assertNotIn("F-009", current_ids)

    def test_engagement_and_content_pages(self):
        strong_ids = {item["id"] for item in audit_fixture("strong_engagement")["findings"]}
        weak_ids = {item["id"] for item in audit_fixture("weak_engagement")["findings"]}
        docs_ids = {item["id"] for item in audit_fixture("documentation")["findings"]}
        noise_report = audit_fixture("navigation_noise")
        noise_ids = {item["id"] for item in noise_report["findings"]}
        self.assertNotIn("F-019", strong_ids)
        self.assertIn("F-019", weak_ids)
        self.assertNotIn("F-019", docs_ids)
        self.assertIn("F-019", noise_ids)

    def test_static_large_state_and_app_router_are_not_hydration_false_positives(self):
        self.assertNotIn("F-011", {item["id"] for item in audit_fixture("large_state_static")["findings"]})
        self.assertNotIn("F-011", {item["id"] for item in audit_fixture("app_router")["findings"]})


if __name__ == "__main__":
    unittest.main()
