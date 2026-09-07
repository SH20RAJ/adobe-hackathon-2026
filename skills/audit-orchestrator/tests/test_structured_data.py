import json
import pathlib
import sys
import unittest


SCRIPT_DIR = pathlib.Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPT_DIR))
from audit_runner import HTMLContentExtractor, audit_structured_data


def findings_for(*blocks):
    parsed = HTMLContentExtractor()
    parsed.json_ld_blocks = list(blocks)
    return audit_structured_data("https://example.test/", parsed)


def evidence(findings, finding_id):
    return json.loads(next(item for item in findings if item["id"] == finding_id)["evidence"])


class StructuredDataTests(unittest.TestCase):
    def test_single_organization_object(self):
        findings = findings_for(json.dumps({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Example",
            "url": "https://example.test",
            "logo": "https://example.test/logo.png",
        }))
        details = evidence(findings, "F-005")
        self.assertEqual(details["parsed_node_count"], 1)
        self.assertIn("Organization", details["recognized_entity_types"])
        self.assertFalse(any(item["id"] == "F-012" for item in findings))

    def test_graph_flattens_organization_and_website(self):
        findings = findings_for(json.dumps({
            "@graph": [
                {"@type": "Organization", "@id": "https://example.test/#org", "name": "Example", "url": "https://example.test"},
                {"@type": "WebSite", "@id": "https://example.test/#site", "name": "Example", "url": "https://example.test", "potentialAction": {"@type": "SearchAction"}, "publisher": {"@id": "https://example.test/#org"}},
            ]
        }))
        details = evidence(findings, "F-005")
        self.assertEqual(details["parsed_node_count"], 2)
        self.assertTrue(details["graph_detected"])
        self.assertEqual(details["@id_values"], ["https://example.test/#org", "https://example.test/#site"])
        self.assertIn("https://example.test/#org", details["@id_references"])

    def test_top_level_array_and_type_array(self):
        findings = findings_for(json.dumps([
            {"@type": ["Organization", "Thing"], "name": "Example", "url": "https://example.test"},
            {"@type": ["Person"], "name": "A Person", "sameAs": "not-a-url"},
        ]))
        details = evidence(findings, "F-013")
        self.assertEqual(details["parsed_node_count"], 2)
        self.assertEqual(set(details["recognized_entity_types"]), {"Organization", "Person"})

    def test_entity_field_summaries_cover_article_product_person(self):
        findings = findings_for(
            json.dumps({"@type": "Article", "headline": "Story", "author": {"@id": "#person"}, "datePublished": "2026-01-01", "image": "https://example.test/story.jpg"}),
            json.dumps({"@type": "Product", "name": "Widget", "description": "Useful", "image": "https://example.test/widget.jpg", "brand": {"name": "Example"}, "offers": {}}),
            json.dumps({"@type": "Person", "name": "Author", "url": "https://example.test/author", "sameAs": ["https://www.wikidata.org/entity/Q2", "not-a-url"]}),
        )
        details = evidence(findings, "F-004")
        self.assertEqual(details["parsed_node_count"], 3)
        self.assertIn("Article", details["recognized_entity_types"])
        self.assertIn("Product", details["recognized_entity_types"])
        self.assertIn("Person", details["recognized_entity_types"])
        self.assertEqual(details["sameAs_urls"], ["https://www.wikidata.org/entity/Q2"])
        self.assertEqual(details["malformed_sameAs_values"], ["not-a-url"])
        self.assertTrue(any(item["id"] == "F-013" for item in findings))

    def test_malformed_json_ld_is_structured(self):
        findings = findings_for('{"@type":"Organization",')
        details = evidence(findings, "F-003")
        self.assertEqual(details["malformed_block_indexes"], [1])
        self.assertEqual(details["parsed_node_count"], 0)

    def test_multiple_blocks_and_unknown_type_are_safe(self):
        findings = findings_for(
            json.dumps({"@type": "Thing", "name": "Unknown"}),
            json.dumps({"@type": "WebSite", "name": "Example", "url": "https://example.test"}),
        )
        details = evidence(findings, "F-005")
        self.assertEqual(details["json_ld_blocks"], 2)
        self.assertNotIn("Thing", details["recognized_entity_types"])
        self.assertIn("WebSite", details["recognized_entity_types"])

    def test_no_json_ld_reports_missing_core_entities(self):
        findings = findings_for()
        self.assertEqual(evidence(findings, "F-004")["parsed_node_count"], 0)

    def test_missing_optional_fields_is_not_noisy(self):
        findings = findings_for(json.dumps({
            "@type": "Organization",
            "name": "Example",
            "url": "https://example.test",
        }))
        self.assertFalse(any(item["id"] == "F-012" for item in findings))
        self.assertTrue(any(item["id"] == "F-005" for item in findings))


if __name__ == "__main__":
    unittest.main()
