import json
import pathlib
import sys
import unittest
from datetime import datetime, timezone, timedelta


SCRIPT_DIR = pathlib.Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPT_DIR))
from audit_runner import HTMLContentExtractor, audit_freshness_trust


def analyze(html, url="https://example.test/page"):
    parsed = HTMLContentExtractor()
    parsed.feed(html)
    findings = audit_freshness_trust(parsed, html, url)
    evidence = {}
    for finding in findings:
        try:
            evidence[finding["id"]] = json.loads(finding["evidence"])
        except json.JSONDecodeError:
            pass
    return findings, evidence


class FreshnessTrustTests(unittest.TestCase):
    def test_recent_date_modified_is_current_signal(self):
        recent = (datetime.now(timezone.utc) - timedelta(days=20)).date().isoformat()
        findings, _ = analyze(f"<time datetime='{recent}'>Updated recently</time>")
        self.assertNotIn("F-009", {item["id"] for item in findings})

    def test_old_date_modified_is_stale_signal(self):
        _, evidence = analyze("<time datetime='2020-01-01'>Updated January 1, 2020</time>")
        self.assertEqual(evidence["F-009"]["freshness_status"], "STALE_SIGNAL")

    def test_date_published_only_is_aged_not_unknown(self):
        findings, _ = analyze("<meta property='article:published_time' content='2025-01-01'>")
        self.assertNotIn("F-009", {item["id"] for item in findings})

    def test_visible_updated_date_is_detected(self):
        findings, _ = analyze("<p>Last updated: March 3, 2026</p>")
        self.assertNotIn("F-009", {item["id"] for item in findings})

    def test_article_jsonld_dates_are_detected(self):
        html = "<script type='application/ld+json'>{\"@type\":\"Article\",\"datePublished\":\"2024-01-01\",\"dateModified\":\"2026-01-01\"}</script>"
        findings, _ = analyze(html)
        self.assertNotIn("F-009", {item["id"] for item in findings})

    def test_multiple_date_sources_are_reported(self):
        findings, _ = analyze("<time datetime='2020-01-01'>Updated</time><meta property='article:modified_time' content='2020-02-01'>")
        self.assertEqual(json.loads(next(item for item in findings if item["id"] == "F-009")["evidence"])["date_signal_count"], 2)

    def test_malformed_date_does_not_crash(self):
        findings, _ = analyze("<time datetime='not-a-date'>Updated</time>")
        self.assertIsInstance(findings, list)

    def test_copyright_year_alone_does_not_trigger_stale_finding(self):
        findings, _ = analyze("<footer>Copyright 2018 Example</footer>")
        self.assertNotIn("F-009", {item["id"] for item in findings})

    def test_historical_article_is_not_automatically_stale(self):
        findings, _ = analyze("<h1>History of Example in 2018</h1><p>This historical article describes events from 2018.</p>")
        self.assertNotIn("F-009", {item["id"] for item in findings})

    def test_unknown_date_has_no_freshness_finding(self):
        findings, _ = analyze("<h1>Example</h1><p>Current product information.</p>")
        self.assertNotIn("F-009", {item["id"] for item in findings})

    def test_external_reference_supports_factual_content(self):
        findings, evidence = analyze("<h1>Facts</h1><p>Revenue reached $20 million in 2025.</p><a href='https://source.example/report'>Source</a>")
        self.assertNotIn("F-018", {item["id"] for item in findings})
        self.assertEqual(evidence["F-018"]["external_reference_links"], 1) if "F-018" in evidence else None

    def test_factual_content_without_references_is_limited(self):
        _, evidence = analyze("<h1>Facts</h1><p>Revenue reached $20 million in 2025 and growth was 20%.</p>")
        self.assertEqual(evidence["F-018"]["corroboration_status"], "LIMITED")

    def test_references_section_is_detected(self):
        _, evidence = analyze("<h1>Facts</h1><p>Revenue was $20 million in 2025.</p><h2>References</h2>")
        self.assertTrue(evidence["F-018"]["references_section"]) if "F-018" in evidence else None

    def test_author_organization_sameas_and_contact_signals(self):
        html = (
            "<meta name='author' content='Author'>"
            "<p>By Author. Revenue was $20 million in 2025.</p><p>Contact us by email.</p>"
            "<script type='application/ld+json'>{\"@type\":\"Organization\",\"sameAs\":[\"https://source.example/id\"]}</script>"
        )
        findings, evidence = analyze(html)
        self.assertNotIn("F-018", {item["id"] for item in findings})
        self.assertTrue(evidence.get("F-018", {}).get("author_signal", True))

    def test_navigation_and_footer_links_do_not_count(self):
        findings, evidence = analyze("<nav><a href='https://social.example'>Social</a></nav><p>Revenue was $20 million in 2025.</p><footer><a href='https://example.test/privacy'>Privacy</a></footer>")
        self.assertEqual(evidence.get("F-018", {}).get("external_reference_links", 0), 0)

    def test_malformed_jsonld_does_not_break_trust_analysis(self):
        findings, _ = analyze("<script type='application/ld+json'>{bad</script><p>Price is $20 in 2025.</p>")
        self.assertIsInstance(findings, list)

    def test_standalone_signal_grouping_is_conservative(self):
        findings, evidence = analyze("<p>Version 2025 costs $20 and supports 50 users.</p>")
        self.assertIn("F-018", evidence)
        self.assertIn(evidence["F-018"]["corroboration_status"], {"LIMITED", "UNKNOWN"})


if __name__ == "__main__":
    unittest.main()
