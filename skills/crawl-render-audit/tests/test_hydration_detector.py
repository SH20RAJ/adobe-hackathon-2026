import json
import pathlib
import sys
import unittest


SCRIPT_DIR = pathlib.Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPT_DIR))
from crawl_inspector import detect_hydration_gap


FIXTURES = pathlib.Path(__file__).parent / "fixtures"


def fixture(name):
    return (FIXTURES / name).read_text(encoding="utf-8")


class HydrationDetectorTests(unittest.TestCase):
    def assert_no_finding(self, name):
        self.assertIsNone(detect_hydration_gap("https://fixture.test/" + name, fixture(name)))

    def assert_finding(self, name):
        finding = detect_hydration_gap("https://fixture.test/" + name, fixture(name))
        self.assertIsNotNone(finding)
        self.assertEqual(finding["id"], "F-011")
        evidence = json.loads(finding["evidence"])
        self.assertIn("combined_signals", evidence)
        self.assertIn("confidence", evidence)

    def test_static_content_has_no_gap(self):
        self.assert_no_finding("static.html")

    def test_next_ssr_with_hydration_data_has_no_gap(self):
        self.assert_no_finding("next-ssr.html")

    def test_next_app_router_with_static_content_has_no_gap(self):
        self.assert_no_finding("next-rsc.html")

    def test_empty_react_shell_is_reported(self):
        self.assert_finding("empty-react.html")

    def test_nuxt_client_rendered_shell_is_reported(self):
        self.assert_finding("nuxt-client.html")

    def test_nuxt_ssr_content_has_no_gap(self):
        self.assert_no_finding("nuxt-ssr.html")

    def test_partial_content_gap_is_reported(self):
        self.assert_finding("partial-gap.html")

    def test_terse_page_with_unrelated_json_has_no_gap(self):
        self.assert_no_finding("terse-unrelated-json.html")

    def test_modern_react_without_data_reactroot_has_no_false_positive(self):
        self.assert_no_finding("modern-react.html")

    def test_non_nuxt_data_ssr_false_has_no_false_positive(self):
        self.assert_no_finding("non-nuxt-data-ssr-false.html")

    def test_weak_dom_javascript_has_no_false_positive(self):
        self.assert_no_finding("weak-dom-javascript.html")

    def test_empty_application_root_wins_over_other_root_candidates(self):
        self.assert_finding("multiple-roots.html")

    def test_large_state_payload_with_legitimate_content_has_no_false_positive(self):
        self.assert_no_finding("large-state-legitimate-content.html")


if __name__ == "__main__":
    unittest.main()
