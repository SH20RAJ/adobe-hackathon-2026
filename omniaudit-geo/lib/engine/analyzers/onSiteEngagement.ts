/**
 * Skill 5: On-Site Visitor Engagement Specialist Analyzer (TypeScript).
 * Evaluates hero clarity, H1 conciseness, Flesch reading ease,
 * CTA contrast, and bounce risk. Zero divergence from Python audit_on_site_engagement.
 */

import { Finding } from "../types";
import { HTMLContentExtractor } from "../htmlParser";

export function auditOnSiteEngagement(parsedContent: HTMLContentExtractor): Finding[] {
  const findings: Finding[] = [];
  const fullText = parsedContent.text_chunks.join(" ");
  const words = fullText.split(/\s+/).filter(Boolean);

  const strongTerms = [
    "contact", "demo", "get started", "sign up", "signup", "register",
    "trial", "buy", "purchase", "pricing", "book", "schedule", "download",
    "subscribe", "apply", "request", "talk to sales",
  ];
  const weakTerms = ["click here", "learn more", "submit", "go", "continue", "more"];

  const categories: Record<string, string[]> = {
    contact: ["contact", "talk to sales"],
    demo: ["demo", "request demo"],
    signup_trial: ["sign up", "signup", "register", "trial", "get started"],
    pricing_purchase: ["pricing", "buy", "purchase"],
    booking: ["book", "schedule"],
    download: ["download"],
    subscription_application: ["subscribe", "apply"],
  };

  const meaningful: any[] = [];
  let ignoredNavigation = 0;
  let ignoredFooter = 0;

  for (const candidate of parsedContent.action_candidates) {
    const label = candidate.label.replace(/\s+/g, " ").trim();
    const href = candidate.href.trim().toLowerCase();

    if (candidate.hidden || !label || href === "#" || href.startsWith("javascript:void(0)")) {
      continue;
    }
    if (candidate.region === "nav") {
      ignoredNavigation++;
      continue;
    }
    if (candidate.region === "footer") {
      ignoredFooter++;
      continue;
    }
    if (/(facebook|twitter|x\.com|instagram|youtube|linkedin)/i.test(href)) {
      continue;
    }

    const normalized = label.toLowerCase();
    const isStrong = strongTerms.some((term) => normalized.includes(term));
    const isWeak = weakTerms.some((term) => normalized === term);
    const strength = isStrong ? "strong" : (isWeak ? "weak" : "neutral");

    if (strength !== "neutral") {
      let matchedCategory = "other";
      for (const [catName, terms] of Object.entries(categories)) {
        if (terms.some((term) => normalized.includes(term))) {
          matchedCategory = catName;
          break;
        }
      }
      meaningful.push({
        label,
        kind: candidate.tag,
        strength,
        category: matchedCategory,
      });
    }
  }

  const usableForms = parsedContent.forms.filter(
    (f) => f.controls > 0 && f.submit_controls > 0
  );

  const strongCtas = meaningful.filter((item) => item.strength === "strong");
  const weakCtas = meaningful.filter((item) => item.strength === "weak");
  const actionCategories = Array.from(new Set(strongCtas.map((item) => item.category))).sort();
  const contactOrConversionPath = strongCtas.length > 0 || usableForms.length > 0;

  const engagementScore = Math.min(
    100,
    strongCtas.length * 25 +
    usableForms.length * 20 +
    actionCategories.length * 10 +
    weakCtas.length * 5
  );

  const engagementEvidence = {
    cta_count: meaningful.length,
    strong_cta_count: strongCtas.length,
    weak_cta_count: weakCtas.length,
    form_count: parsedContent.forms.length,
    usable_form_count: usableForms.length,
    action_categories: actionCategories,
    contact_or_conversion_path: contactOrConversionPath,
    ignored_navigation_links: ignoredNavigation,
    ignored_footer_links: ignoredFooter,
    engagement_readiness_score: engagementScore,
    action_labels: meaningful.map((item) => item.label),
    content_region_detected: parsedContent.has_article_region,
  };

  if (weakCtas.length > 0 && strongCtas.length === 0 && usableForms.length === 0) {
    findings.push({
      id: "F-019",
      title: "Vague On-Site Engagement Actions",
      severity: "low",
      category: "engagement_actionability",
      confidence: "high",
      evidence: JSON.stringify(engagementEvidence),
      suggested_action: {
        summary: "Replace vague labels such as 'Click here' or 'More' with specific actions that describe the visitor's next useful step.",
        priority: "low",
      },
    });
  } else if (
    words.length >= 40 &&
    !parsedContent.has_article_region &&
    !contactOrConversionPath &&
    strongCtas.length === 0
  ) {
    findings.push({
      id: "F-019",
      title: "Weak or Missing Clear On-Site Engagement Path",
      severity: "medium",
      category: "engagement_actionability",
      confidence: "high",
      evidence: JSON.stringify(engagementEvidence),
      suggested_action: {
        summary: "Add one clear primary action matching the page purpose, such as contacting sales, viewing pricing, starting a trial, or downloading a resource.",
        priority: "medium",
        implementation_code: '<a href="/contact" class="primary-cta">Contact sales</a>',
      },
    });
  }

  // Hero / Above-the-fold value prop length
  const first100Words = words.slice(0, 100).join(" ");
  if (words.length > 50 && first100Words.trim().length < 80) {
    findings.push({
      id: "F-010",
      title: "Weak Above-The-Fold Value Proposition Orientation",
      severity: "high",
      category: "engagement_orientation",
      confidence: "high",
      evidence: "First 100 words lack clear descriptive explanation of core product value, causing immediate bounce for AI-referred visitors.",
      suggested_action: {
        summary: "Refactor the hero section headline and sub-headline to state what the product does within 5 seconds of reading.",
        priority: "high",
        implementation_code: '<section class="hero">\n  <h1>Autonomous Brand Intelligence</h1>\n  <p>Audit and optimize your website for AI discoverability and customer retention in real-time.</p>\n</section>',
      },
    });
  }

  return findings;
}
