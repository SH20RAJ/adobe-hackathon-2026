/**
 * Skill 3: AEO & Quotability Specialist Analyzer (TypeScript).
 * Evaluates atomic factual density, Q&A headings, table accessibility,
 * and text-to-graphics ratio. Zero divergence from Python audit_aeo_quotability.
 */

import { Finding } from "../types";
import { HTMLContentExtractor } from "../htmlParser";

export function auditAeoQuotability(parsedContent: HTMLContentExtractor): Finding[] {
  const findings: Finding[] = [];
  const fullText = parsedContent.text_chunks.join(" ");
  const words = fullText.split(/\s+/).filter(Boolean);

  const headings = parsedContent.headings.filter((h) => h.text.trim().length > 0);
  const headingLevels = headings.map((h) => parseInt(h.level[1], 10));

  let skippedHeadingJumps = 0;
  for (let i = 0; i < headingLevels.length - 1; i++) {
    if (headingLevels[i + 1] - headingLevels[i] > 1) {
      skippedHeadingJumps++;
    }
  }

  const substantiveBlocks = parsedContent.aeo_blocks.filter(
    (b) => b.text.split(/\s+/).filter(Boolean).length >= 8
  );

  const descriptiveHeadings = headings.filter((h) => h.level === "h2" || h.level === "h3").length;
  const answerParagraphs = parsedContent.aeo_blocks.filter(
    (b) => ["p", "blockquote", "dd"].includes(b.tag) && b.text.split(/\s+/).filter(Boolean).length >= 8
  ).length;

  const directAnswerBlocks = Math.min(descriptiveHeadings, answerParagraphs);

  // Factual regex matching years, currency, percentages, units
  const factualRegex = /\b(?:20\d{2}|[$€£]\s?\d+(?:[.,]\d+)?|\d+(?:[.,]\d+)?%|\d+(?:[.,]\d+)?\s?(?:GB|MB|kg|km|hours?|days?|users?))\b/gi;
  const factualMatches = fullText.match(factualRegex) || [];
  const factualSignalCount = factualMatches.length;

  const informativeImages = parsedContent.images.filter(
    (img) => img.src && !/(?:icon|logo|avatar|sprite|spacer|pixel|tracking|favicon)/i.test(img.src)
  );
  const missingAlt = informativeImages.filter((img) => !img.has_alt);

  const meaningfulHeadingScore = Math.min(20, headings.length * 4);
  const blockScore = Math.min(25, substantiveBlocks.length * 5);
  const answerScore = Math.min(20, directAnswerBlocks * 5);
  const factualScore = Math.min(15, factualSignalCount * 2);
  const listTableScore = Math.min(10, (parsedContent.list_blocks + parsedContent.table_blocks) * 5);
  const imageScore = informativeImages.length === 0
    ? 10
    : Number((10 * (informativeImages.length - missingAlt.length) / informativeImages.length).toFixed(1));

  const quotabilityScore = Math.round(
    meaningfulHeadingScore + blockScore + answerScore + factualScore + listTableScore + imageScore
  );

  const h1Count = headings.filter((h) => h.level === "h1").length;

  const evidence = {
    visible_words: words.length,
    h1_count: h1Count,
    h2_count: headings.filter((h) => h.level === "h2").length,
    h3_count: headings.filter((h) => h.level === "h3").length,
    heading_levels: headingLevels,
    skipped_heading_jumps: skippedHeadingJumps,
    substantive_sections: substantiveBlocks.length,
    direct_answer_blocks: directAnswerBlocks,
    list_blocks: parsedContent.list_blocks,
    table_blocks: parsedContent.table_blocks,
    faq_like_blocks: parsedContent.faq_pairs,
    factual_signal_count: factualSignalCount,
    informative_images: informativeImages.length,
    informative_images_missing_alt: missingAlt.length,
    hidden_text_words: parsedContent.hidden_text_words,
    hidden_content_words: parsedContent.hidden_content_words,
    hidden_interface_words: parsedContent.hidden_interface_words,
    quotability_score: quotabilityScore,
    score_components: {
      heading_clarity: meaningfulHeadingScore,
      substantive_blocks: blockScore,
      direct_answers: answerScore,
      factual_explicitness: factualScore,
      lists_and_tables: listTableScore,
      image_accessibility: imageScore,
    },
  };

  if (missingAlt.length > 0 && missingAlt.length / Math.max(informativeImages.length, 1) > 0.3) {
    findings.push({
      id: "F-006",
      title: "Facts Trapped in Non-Text Graphical Assets",
      severity: "medium",
      category: "aeo_non_text_facts",
      confidence: "high",
      evidence: JSON.stringify(evidence),
      suggested_action: {
        summary: "Add descriptive alt text to informative images so diagrams, specifications, and product details also exist as extractable text.",
        priority: "medium",
        implementation_code: '<img src="product-specs.png" alt="Detailed technical specification table showing bandwidth, storage, and pricing tiers.">',
      },
    });
  }

  if (h1Count === 0) {
    findings.push({
      id: "F-007",
      title: "Missing Primary H1 Heading for Topic Framing",
      severity: "medium",
      category: "aeo_heading_structure",
      confidence: "high",
      evidence: JSON.stringify(evidence),
      suggested_action: {
        summary: "Add one clear H1 headline defining the page's core entity or subject.",
        priority: "medium",
        implementation_code: "<h1>Enterprise AI Discoverability Platform</h1>",
      },
    });
  } else if (h1Count > 1) {
    findings.push({
      id: "F-014",
      title: "Multiple Competing H1 Headings",
      severity: "medium",
      category: "aeo_heading_structure",
      confidence: "high",
      evidence: JSON.stringify(evidence),
      suggested_action: {
        summary: "Keep one primary H1 and convert secondary page topics to descriptive H2 headings.",
        priority: "medium",
      },
    });
  }

  if (words.length >= 40 && quotabilityScore < 35) {
    findings.push({
      id: "F-015",
      title: "Low Machine-Readable Quotability Signals",
      severity: "medium",
      category: "aeo_quotability",
      confidence: "high",
      evidence: JSON.stringify(evidence),
      suggested_action: {
        summary: "Add descriptive section headings followed by concise answer paragraphs, factual lists, or tables for the page's key topics.",
        priority: "medium",
        implementation_code: "<h2>Pricing</h2>\n<p>The Pro plan costs $49 per month and includes...</p>",
      },
    });
  }

  if (parsedContent.hidden_content_words >= 20 && parsedContent.hidden_interface_words === 0) {
    findings.push({
      id: "F-016",
      title: "Important Content Appears Hidden in Initial HTML",
      severity: "medium",
      category: "aeo_content_extractability",
      confidence: "high",
      evidence: JSON.stringify(evidence),
      suggested_action: {
        summary: "Expose essential facts in visible HTML instead of relying on hidden panels or state-dependent content.",
        priority: "medium",
      },
    });
  }

  findings.push({
    id: "F-008",
    title: "Proactive Opportunity: Publish an llms.txt Manifest",
    severity: "low",
    category: "aeo_proactive_enhancement",
    confidence: "high",
    evidence: "Site does not yet provide a standardized /llms.txt summary for LLM context ingestion.",
    suggested_action: {
      summary: "Deploy an /llms.txt file at the domain root containing an atomic markdown summary of products, docs, and APIs.",
      priority: "low",
      implementation_code: "# Title: Brand Summary\n> High-density summary for LLM ingestion.\n\n## Products & Capabilities\n- Feature A: Direct atomic definition.",
    },
  });

  return findings;
}
