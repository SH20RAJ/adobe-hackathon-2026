#!/usr/bin/env python3
"""
Unit tests asserting HTMLContentExtractor parser state machine invariants.
Enforces:
- hidden_depth >= 0 at all times
- hidden_interface_depth >= 0 at all times
- navigation_depth >= 0 at all times
- region_depths >= 0 at all times
- Proper stack unwinding on malformed nesting
- Complete heading text extraction across inline child tags
"""

import sys
import os
import unittest
from pathlib import Path

SCRIPTS_DIR = Path(__file__).resolve().parent.parent / "scripts"
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

from audit_runner import HTMLContentExtractor


class TestParserInvariants(unittest.TestCase):
    def test_clean_nested_hidden_unwind(self):
        html = """
        <html>
          <body>
            <div>Visible 1</div>
            <div hidden>
              <span>Hidden 1</span>
              <div style="display:none">
                <p>Hidden 2</p>
              </div>
            </div>
            <div>Visible 2</div>
          </body>
        </html>
        """
        extractor = HTMLContentExtractor()
        extractor.feed(html)
        extractor.assert_invariants()
        self.assertEqual(extractor._hidden_depth, 0)
        self.assertEqual(extractor._hidden_interface_depth, 0)
        self.assertIn("Visible 1", extractor.text_chunks)
        self.assertIn("Visible 2", extractor.text_chunks)
        self.assertNotIn("Hidden 1", extractor.text_chunks)
        self.assertNotIn("Hidden 2", extractor.text_chunks)

    def test_malformed_unclosed_tags(self):
        html = """
        <div>
          <p hidden>Text
          <div>Another
        """
        extractor = HTMLContentExtractor()
        extractor.feed(html)
        extractor.assert_invariants()
        self.assertGreaterEqual(extractor._hidden_depth, 0)
        self.assertGreaterEqual(extractor._hidden_interface_depth, 0)

    def test_out_of_order_closing_tags(self):
        html = """
        <div>
          <span hidden>
            <section>
          </div> <!-- Closes out of order -->
          </section>
          </span>
        </div>
        """
        extractor = HTMLContentExtractor()
        extractor.feed(html)
        extractor.assert_invariants()
        self.assertEqual(extractor._hidden_depth, 0)

    def test_stray_closing_tags_do_not_go_negative(self):
        html = "</div></span></nav></header></footer></p>"
        extractor = HTMLContentExtractor()
        extractor.feed(html)
        extractor.assert_invariants()
        self.assertEqual(extractor._hidden_depth, 0)
        self.assertEqual(extractor._navigation_depth, 0)
        for d in extractor._region_depths.values():
            self.assertEqual(d, 0)

    def test_heading_extraction_with_inline_children(self):
        html = """
        <h1>Welcome to <em>Adobe</em> <strong>Experience</strong> Platform</h1>
        """
        extractor = HTMLContentExtractor()
        extractor.feed(html)
        self.assertEqual(len(extractor.headings), 1)
        self.assertEqual(
            extractor.headings[0]["text"],
            "Welcome to Adobe Experience Platform",
        )

    def test_interface_vs_content_hidden_words(self):
        html = """
        <nav class="mobile-drawer" hidden>
          <a href="/login">Sign In</a>
          <a href="/register">Register</a>
        </nav>
        <div hidden>
          <p>Secret content block with ten important words for evaluating extraction.</p>
        </div>
        """
        extractor = HTMLContentExtractor()
        extractor.feed(html)
        extractor.assert_invariants()
        self.assertEqual(extractor._hidden_depth, 0)
        self.assertGreater(extractor.hidden_interface_words, 0)
        self.assertGreater(extractor.hidden_content_words, 0)


if __name__ == "__main__":
    unittest.main()
