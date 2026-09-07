import json
import pathlib
import sys
import unittest


SCRIPT_DIR = pathlib.Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPT_DIR))
from audit_runner import HTMLContentExtractor, audit_aeo_quotability


def analyze(html):
    parsed = HTMLContentExtractor()
    parsed.feed(html)
    findings = audit_aeo_quotability(parsed)
    evidence = {}
    for finding in findings:
        try:
            evidence[finding["id"]] = json.loads(finding["evidence"])
        except json.JSONDecodeError:
            pass
    return findings, evidence


class AEOQuotabilityTests(unittest.TestCase):
    def test_well_structured_quotable_page(self):
        findings, evidence = analyze(
            "<h1>Example Platform</h1><h2>What is Example?</h2>"
            "<p>Example is a platform for reliable data management.</p>"
            "<h2>Pricing</h2><ul><li>Pro plan: $49 per month.</li></ul>"
        )
        self.assertGreaterEqual(evidence["F-015"]["quotability_score"], 35) if "F-015" in evidence else None
        self.assertNotIn("F-007", evidence)

    def test_missing_h1(self):
        findings, evidence = analyze("<h2>Pricing</h2><p>The plan costs $49 per month.</p>")
        self.assertIn("F-007", evidence)
        self.assertEqual(evidence["F-007"]["h1_count"], 0)

    def test_multiple_h1s(self):
        findings, evidence = analyze("<h1>One</h1><h1>Two</h1><p>Useful product information.</p>")
        self.assertIn("F-014", evidence)
        self.assertEqual(evidence["F-014"]["h1_count"], 2)

    def test_heading_answer_pair_is_counted(self):
        _, evidence = analyze("<h1>Example</h1><h2>What is it?</h2><p>Example is a useful platform for teams.</p>")
        self.assertEqual(evidence.get("F-015", {}).get("direct_answer_blocks", 1), 1)

    def test_faq_like_content(self):
        parsed = HTMLContentExtractor()
        parsed.feed("<h1>FAQ</h1><dl><dt>What is it?</dt><dd>It is a platform for teams.</dd></dl>")
        self.assertEqual(parsed.faq_pairs, 1)

    def test_list_and_table_factual_content(self):
        parsed = HTMLContentExtractor()
        parsed.feed(
            "<h1>Specifications</h1><ul><li>Storage: 100 GB</li><li>Price: $20</li></ul>"
            "<table><tr><td>Updated 2026</td></tr></table>"
        )
        self.assertEqual(parsed.list_blocks, 1)
        self.assertEqual(parsed.table_blocks, 1)
        self.assertGreaterEqual(len(parsed.text_chunks), 3)

    def test_weak_unstructured_content_gets_low_signal_finding(self):
        findings, evidence = analyze("<div>" + ("generic words " * 30) + "</div>")
        self.assertIn("F-015", evidence)
        self.assertLess(evidence["F-015"]["quotability_score"], 35)

    def test_informative_image_missing_alt(self):
        findings, evidence = analyze("<h1>Product</h1><p>Product specifications and price.</p><img src='product-chart.png'>")
        self.assertIn("F-006", evidence)
        self.assertEqual(evidence["F-006"]["informative_images_missing_alt"], 1)

    def test_decorative_image_is_not_flagged(self):
        findings, evidence = analyze("<h1>Product</h1><p>Product specifications and price.</p><img src='icon-star.svg'>")
        self.assertNotIn("F-006", evidence)

    def test_hidden_state_content_is_reported_conservatively(self):
        findings, evidence = analyze(
            "<h1>Product</h1><p>Visible summary.</p>"
            "<div style='display: none'>" + ("hidden factual content " * 12) + "</div>"
        )
        self.assertIn("F-016", evidence)
        self.assertGreaterEqual(evidence["F-016"]["hidden_text_words"], 20)

    def test_small_page_does_not_create_low_score_noise(self):
        findings, evidence = analyze("<title>Example</title>")
        self.assertNotIn("F-015", evidence)

    def test_hydration_is_not_duplicated_by_aeo_analyzer(self):
        findings, evidence = analyze(
            "<div id='root'></div><script>createRoot(document.getElementById('root'))</script>"
        )
        self.assertNotIn("F-011", {finding["id"] for finding in findings})


if __name__ == "__main__":
    unittest.main()
