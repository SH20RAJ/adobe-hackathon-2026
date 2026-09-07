import json
import pathlib
import sys
import unittest


SCRIPT_DIR = pathlib.Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPT_DIR))
from crawl_inspector import evaluate_robots, robots_findings, robots_response_findings


class RobotsParserTests(unittest.TestCase):
    def evaluate(self, text, crawler, path="/"):
        return evaluate_robots(text, crawler, path)

    def test_wildcard_user_agent(self):
        result = self.evaluate("User-agent: *\nDisallow: /private/", "GPTBot", "/private/")
        self.assertEqual(result["status"], "BLOCKED")
        self.assertEqual(result["user_agent_group"], "*")

    def test_crawler_specific_group_overrides_wildcard(self):
        text = "User-agent: *\nDisallow: /\n\nUser-agent: GPTBot\nAllow: /\n"
        self.assertEqual(self.evaluate(text, "GPTBot")["status"], "ALLOWED")
        self.assertEqual(self.evaluate(text, "ClaudeBot")["status"], "BLOCKED")

    def test_multiple_user_agents_share_a_group(self):
        text = "User-agent: GPTBot\nUser-agent: ClaudeBot\nDisallow: /private/"
        self.assertEqual(self.evaluate(text, "GPTBot", "/private/")["status"], "BLOCKED")
        self.assertEqual(self.evaluate(text, "ClaudeBot", "/private/")["status"], "BLOCKED")

    def test_allow_overrides_broader_disallow(self):
        text = "User-agent: *\nDisallow: /private/\nAllow: /private/public/"
        self.assertEqual(self.evaluate(text, "GPTBot", "/private/")["status"], "BLOCKED")
        self.assertEqual(self.evaluate(text, "GPTBot", "/private/public/")["status"], "ALLOWED")

    def test_longest_matching_rule_wins(self):
        text = "User-agent: *\nDisallow: /a/*\nAllow: /a/public/"
        result = self.evaluate(text, "GPTBot", "/a/public/page")
        self.assertEqual(result["status"], "ALLOWED")
        self.assertEqual(result["matched_directive"], "Allow: /a/public/")

    def test_wildcard_path_matching(self):
        text = "User-agent: *\nDisallow: /*.json"
        self.assertEqual(self.evaluate(text, "GPTBot", "/data/page.json")["status"], "BLOCKED")
        self.assertEqual(self.evaluate(text, "GPTBot", "/data/page.html")["status"], "ALLOWED")

    def test_end_of_path_marker(self):
        text = "User-agent: *\nDisallow: /private$"
        self.assertEqual(self.evaluate(text, "GPTBot", "/private")["status"], "BLOCKED")
        self.assertEqual(self.evaluate(text, "GPTBot", "/private/page")["status"], "ALLOWED")

    def test_comments_and_blank_lines(self):
        text = "# comment\n\nUser-agent: * # wildcard\nDisallow: /private/ # hidden\n"
        self.assertEqual(self.evaluate(text, "GPTBot", "/private/x")["status"], "BLOCKED")

    def test_crawler_without_matching_group_is_not_specified(self):
        result = self.evaluate("User-agent: GPTBot\nDisallow: /\n", "ClaudeBot")
        self.assertEqual(result["status"], "NO_MATCH")

    def test_gptbot_blocked(self):
        result = self.evaluate("User-agent: GPTBot\nDisallow: /", "GPTBot")
        self.assertEqual(result["status"], "BLOCKED")

    def test_gptbot_allowed(self):
        result = self.evaluate("User-agent: GPTBot\nAllow: /", "GPTBot")
        self.assertEqual(result["status"], "ALLOWED")

    def test_another_crawler_blocked_while_gptbot_allowed(self):
        text = "User-agent: GPTBot\nAllow: /\n\nUser-agent: ClaudeBot\nDisallow: /"
        self.assertEqual(self.evaluate(text, "GPTBot")["status"], "ALLOWED")
        self.assertEqual(self.evaluate(text, "ClaudeBot")["status"], "BLOCKED")

    def test_odd_directives_are_ignored_safely(self):
        text = "this is not valid\nUser-agent:\nDisallow\nUser-agent: *\nDisallow:\n"
        self.assertEqual(self.evaluate(text, "GPTBot")["status"], "ALLOWED")

    def test_blocked_finding_has_structured_evidence(self):
        findings = robots_findings(
            "https://fixture.test/robots.txt",
            "User-agent: GPTBot\nDisallow: /\n",
        )
        self.assertEqual(len(findings), 1)
        self.assertEqual(findings[0]["id"], "F-001-GPTBot")
        evidence = json.loads(findings[0]["evidence"])
        self.assertEqual(evidence["status"], "BLOCKED")
        self.assertEqual(evidence["tested_path"], "/")
        self.assertEqual(evidence["robots_url"], "https://fixture.test/robots.txt")

    def test_fetch_failure_is_controlled(self):
        findings = robots_response_findings(
            "https://fixture.test/robots.txt",
            {"status": 0, "error": "hidden", "error_code": "dns_resolution_failed"},
        )
        self.assertEqual(findings[0]["id"], "F-001-ROBOTS")
        evidence = json.loads(findings[0]["evidence"])
        self.assertEqual(evidence["status"], "FETCH_ERROR")
        self.assertNotIn("hidden", findings[0]["evidence"])

    def test_missing_robots_is_not_reported_as_failure(self):
        self.assertEqual(
            robots_response_findings(
                "https://fixture.test/robots.txt",
                {"status": 404, "error": "http_error"},
            ),
            [],
        )


if __name__ == "__main__":
    unittest.main()
