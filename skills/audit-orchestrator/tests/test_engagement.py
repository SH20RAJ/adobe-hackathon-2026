import json
import pathlib
import sys
import unittest


SCRIPT_DIR = pathlib.Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPT_DIR))
from audit_runner import HTMLContentExtractor, audit_on_site_engagement


def analyze(html):
    parsed = HTMLContentExtractor()
    parsed.feed(html)
    findings = audit_on_site_engagement(parsed)
    evidence = {}
    for finding in findings:
        try:
            evidence[finding["id"]] = json.loads(finding["evidence"])
        except json.JSONDecodeError:
            pass
    return findings, evidence


class EngagementTests(unittest.TestCase):
    def test_strong_ctas_are_healthy(self):
        findings, evidence = analyze("<h1>Platform</h1><p>" + ("Useful product information " * 20) + "</p><a href='/demo'>Request a demo</a><a href='/trial'>Start free trial</a>")
        self.assertNotIn("F-019", evidence)
        self.assertEqual(evidence.get("F-010"), None)

    def test_contact_form_is_healthy(self):
        findings, evidence = analyze("<h1>Contact sales</h1><form><label for='email'>Work email</label><input id='email'><button type='submit'>Send request</button></form>")
        self.assertNotIn("F-019", evidence)

    def test_labelled_form_controls_are_counted(self):
        parsed = HTMLContentExtractor()
        parsed.feed("<form><label>Email</label><input><button>Submit</button></form>")
        self.assertEqual(parsed.forms[0]["controls"], 1)
        self.assertEqual(parsed.forms[0]["labels"], 1)
        self.assertEqual(parsed.forms[0]["submit_controls"], 1)

    def test_weak_ctas_produce_low_finding(self):
        findings, evidence = analyze("<h1>Information</h1><p>" + ("Detailed content " * 30) + "</p><a href='/more'>Click here</a><a href='/x'>More</a>")
        self.assertIn("F-019", evidence)
        self.assertEqual(next(item for item in findings if item["id"] == "F-019")["severity"], "low")

    def test_article_without_cta_is_not_high_severity(self):
        findings, _ = analyze("<article><h1>Article</h1><p>" + ("This is a long article about documentation and history. " * 20) + "</p></article>")
        self.assertNotIn("F-019", {item["id"] for item in findings})

    def test_navigation_only_links_are_ignored(self):
        findings, evidence = analyze("<nav><a href='/pricing'>Pricing</a><a href='/contact'>Contact</a></nav><p>" + ("Content " * 45) + "</p><footer><a href='/privacy'>Privacy</a></footer>")
        self.assertIn("F-019", evidence)
        self.assertEqual(evidence["F-019"]["ignored_navigation_links"], 2)

    def test_social_only_links_are_ignored(self):
        findings, evidence = analyze("<h1>Brand</h1><p>" + ("Content " * 45) + "</p><a href='https://linkedin.com/company/example'>LinkedIn</a>")
        self.assertIn("F-019", evidence)
        self.assertEqual(evidence["F-019"]["cta_count"], 0)

    def test_multiple_action_categories_are_reported(self):
        parsed = HTMLContentExtractor()
        parsed.feed("<h1>Platform</h1><p>Choose a plan.</p><a href='/pricing'>View pricing</a><a href='/download'>Download report</a><a href='/book'>Book a demo</a>")
        labels = {item["label"] for item in parsed.action_candidates}
        self.assertEqual(labels, {"View pricing", "Download report", "Book a demo"})

    def test_empty_and_hidden_links_are_ignored(self):
        findings, evidence = analyze("<h1>Information</h1><p>" + ("Content " * 45) + "</p><a href='#'></a><a href='javascript:void(0)'>Continue</a><a style='display:none' href='/demo'>Request a demo</a>")
        self.assertIn("F-019", evidence)
        self.assertEqual(evidence["F-019"]["cta_count"], 0)


if __name__ == "__main__":
    unittest.main()
