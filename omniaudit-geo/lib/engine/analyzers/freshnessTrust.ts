/**
 * Skill 4: Freshness & Trust Corroboration Specialist Analyzer (TypeScript).
 * Zero divergence from Python audit_freshness_trust.
 */

import { Finding } from "../types";
import { HTMLContentExtractor } from "../htmlParser";

export function auditFreshnessTrust(
  parsedContent: HTMLContentExtractor,
  fullHtml: string,
  baseUrl = ""
): Finding[] {
  const findings: Finding[] = [];
  const today = new Date();
  const todayIso = today.toISOString().split("T")[0];
  const dateValues: Array<{ date: string; source: string; field: string }> = [];

  function parseDate(value: any): string | null {
    if (typeof value !== "string") return null;
    const candidate = value.trim();
    const parsed = Date.parse(candidate);
    if (!isNaN(parsed)) {
      return new Date(parsed).toISOString().split("T")[0];
    }
    // Handle YYYY-MM or YYYY
    const ymd = candidate.match(/^(\d{4})(?:-(\d{2}))?$/);
    if (ymd) {
      const year = ymd[1];
      const month = ymd[2] || "01";
      return `${year}-${month}-01`;
    }
    return null;
  }

  function addDate(val: any, source: string, field: string) {
    const d = parseDate(val);
    if (d) {
      dateValues.push({ date: d, source, field });
    }
  }

  function scanJsonDates(val: any, source = "article_jsonld") {
    if (typeof val === "object" && val !== null) {
      if (Array.isArray(val)) {
        for (const item of val) scanJsonDates(item, source);
      } else {
        for (const f of ["datePublished", "dateModified", "dateCreated"]) {
          if (val[f]) addDate(val[f], source, f);
        }
        for (const child of Object.values(val)) {
          scanJsonDates(child, source);
        }
      }
    }
  }

  for (const raw of parsedContent.json_ld_blocks) {
    try {
      scanJsonDates(JSON.parse(raw));
    } catch {
      // Ignored
    }
  }

  const metaFields: Array<[string, string]> = [
    ["article:modified_time", "meta_modified"],
    ["article:published_time", "meta_published"],
    ["datemodified", "meta_modified"],
    ["datepublished", "meta_published"],
    ["last-modified", "meta_modified"],
  ];
  for (const [field, source] of metaFields) {
    if (parsedContent.meta_tags[field]) {
      addDate(parsedContent.meta_tags[field], source, field);
    }
  }

  const timeRegex = /<time\b[^>]*\bdatetime=['"]([^'"]+)['"][^>]*>/gi;
  let tm: RegExpExecArray | null;
  while ((tm = timeRegex.exec(fullHtml)) !== null) {
    addDate(tm[1], "time_element", "datetime");
  }

  const visibleText = parsedContent.text_chunks.join(" ");
  const visibleDateRegex = /(?:published|updated|last updated|revised)\s*[:\-]\s*([A-Za-z]+\s+\d{1,2},\s+\d{4}|\d{4}-\d{2}(?:-\d{2})?)/gi;
  let vm: RegExpExecArray | null;
  while ((vm = visibleDateRegex.exec(visibleText)) !== null) {
    addDate(vm[1], "visible_text", "labelled_date");
  }

  const copyrightYears: number[] = [];
  const crRegex = /(?:copyright|©|&copy;)\s*(\d{4})/gi;
  let crm: RegExpExecArray | null;
  while ((crm = crRegex.exec(fullHtml)) !== null) {
    const yr = parseInt(crm[1], 10);
    if (yr >= 2000 && yr <= today.getFullYear() + 1) {
      copyrightYears.push(yr);
    }
  }

  const meaningfulDates = dateValues.filter((d) => d.date <= todayIso);
  let latest: { date: string; source: string; field: string } | null = null;
  if (meaningfulDates.length > 0) {
    meaningfulDates.sort((a, b) => b.date.localeCompare(a.date));
    latest = meaningfulDates[0];
  }

  let ageDays: number | null = null;
  if (latest) {
    const diffMs = today.getTime() - new Date(latest.date).getTime();
    ageDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  let freshnessStatus = "UNKNOWN";
  if (latest && ageDays !== null) {
    freshnessStatus = ageDays <= 365 ? "CURRENT_SIGNAL" : "AGED_SIGNAL";
    if (ageDays > 1095) {
      freshnessStatus = "STALE_SIGNAL";
    }
  }

  const freshnessEvidence = {
    published_date: dateValues.find((d) => d.field.toLowerCase().includes("published"))?.date || null,
    modified_date: dateValues.find((d) => d.field.toLowerCase().includes("modified"))?.date || null,
    visible_update_date: dateValues.find((d) => d.source === "visible_text")?.date || null,
    latest_meaningful_date: latest?.date || null,
    age_days: ageDays,
    date_sources: Array.from(new Set(meaningfulDates.map((d) => d.source))).sort(),
    copyright_years: copyrightYears,
    freshness_status: freshnessStatus,
    date_signal_count: meaningfulDates.length,
  };

  if (freshnessStatus === "STALE_SIGNAL") {
    findings.push({
      id: "F-009",
      title: "Aged Explicit Content Date Signal",
      severity: "medium",
      category: "freshness_temporal_signals",
      confidence: "high",
      evidence: JSON.stringify(freshnessEvidence),
      suggested_action: {
        summary: "Add or maintain an explicit dateModified value when the page content is materially updated.",
        priority: "medium",
        implementation_code: '<meta property="article:modified_time" content="2026-09-07T00:00:00Z">',
      },
    });
  }

  const lowerText = visibleText.toLowerCase();
  let pageHost = "";
  try {
    pageHost = new URL(baseUrl).hostname.toLowerCase();
  } catch {
    pageHost = baseUrl.toLowerCase();
  }

  const externalLinks: string[] = [];
  for (const href of parsedContent.links) {
    if (href.startsWith("http://") || href.startsWith("https://")) {
      try {
        const linkHost = new URL(href).hostname.toLowerCase();
        if (linkHost !== pageHost) {
          externalLinks.push(href);
        }
      } catch {
        // Ignored
      }
    }
  }

  const referenceLinks = externalLinks.filter(
    (href) => !/(facebook|twitter|x\.com|instagram|youtube|privacy|terms|cookie)/i.test(href)
  );
  const referencesSection = /\b(references|sources|citations|bibliography)\b/i.test(lowerText);
  const citationBlocks = (lowerText.match(/\[(?:\d{1,3})\]|\b(?:source|citation|according to)\s*[:\-]/gi) || []).length;
  const authorSignal = Boolean(
    parsedContent.meta_tags["author"] ||
    /\b(?:by|author)\s+[A-Z][A-Za-z .'-]{2,}/.test(visibleText)
  );

  let organizationSignal = false;
  for (const raw of parsedContent.json_ld_blocks) {
    try {
      if (raw.includes("Organization")) {
        organizationSignal = true;
        break;
      }
    } catch {
      // Ignored
    }
  }

  const sameAsSignal = parsedContent.json_ld_blocks.some((raw) => raw.includes('"sameAs"'));
  const contactSignal = /\b(contact|about us|address|phone|email)\b/i.test(lowerText);

  const trustSignalCount = [
    referenceLinks.length > 0,
    referencesSection,
    citationBlocks > 0,
    authorSignal,
    organizationSignal,
    sameAsSignal,
    contactSignal,
  ].filter(Boolean).length;

  const corroborationFactualMatches = lowerText.match(
    /(?:20\d{2}|[$€£]\s?\d+(?:[.,]\d+)?|\d+(?:[.,]\d+)?%|\d+(?:[.,]\d+)?\s?(?:GB|MB|kg|km|hours?|days?|users?))/gi
  ) || [];
  const corroborationFactualCount = corroborationFactualMatches.length;

  const corroborationStatus = (trustSignalCount >= 3 || referenceLinks.length > 0)
    ? "SUPPORTED"
    : (corroborationFactualCount >= 3 ? "LIMITED" : "UNKNOWN");

  const corroborationEvidence = {
    factual_signal_count: corroborationFactualCount,
    external_reference_links: referenceLinks.length,
    citation_blocks: citationBlocks,
    author_signal: authorSignal,
    organization_signal: organizationSignal,
    sameAs_signal: sameAsSignal,
    references_section: referencesSection,
    contact_or_about_signal: contactSignal,
    corroboration_status: corroborationStatus,
  };

  if (corroborationStatus === "LIMITED") {
    findings.push({
      id: "F-018",
      title: "Limited Corroboration and Trust Signals",
      severity: "medium",
      category: "freshness_corroboration",
      confidence: "high",
      evidence: JSON.stringify(corroborationEvidence),
      suggested_action: {
        summary: "Associate important factual claims with visible sources, author information, or a references section without implying that links prove factual accuracy.",
        priority: "medium",
      },
    });
  }

  return findings;
}
