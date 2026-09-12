/**
 * Master Orchestrator for OmniAudit-GEO (TypeScript).
 * Unifies CLI, Web API, and MCP endpoints under one single authoritative contract.
 * Zero divergence from Python skills/audit-orchestrator/scripts/audit_runner.py.
 */

import { AuditReport, Finding } from "./types";
import { safeFetch } from "./safeFetch";
import { HTMLContentExtractor } from "./htmlParser";
import { computeScores } from "./scoring";
import { auditCrawlRender } from "./analyzers/crawlRender";
import { auditStructuredData } from "./analyzers/structuredData";
import { auditAeoQuotability } from "./analyzers/aeoQuotability";
import { auditFreshnessTrust } from "./analyzers/freshnessTrust";
import { auditOnSiteEngagement } from "./analyzers/onSiteEngagement";
import { enrichFindingsActions, generateProactiveRecommendations } from "./recommendations";
import { validateAuditReport } from "./schema";

export interface AuditRunnerOptions {
  html?: string;
  headers?: Record<string, string>;
  robotsTxt?: string;
}

export async function runFullAudit(
  targetUrl: string,
  options: AuditRunnerOptions = {}
): Promise<AuditReport> {
  const startTime = Date.now();
  let normalizedUrl = targetUrl.trim();
  if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
    normalizedUrl = "https://" + normalizedUrl;
  }

  let domain = "";
  try {
    domain = new URL(normalizedUrl).hostname;
  } catch {
    domain = targetUrl;
  }

  const allFindings: Finding[] = [];
  let parsedContent = new HTMLContentExtractor();

  if (options.html !== undefined) {
    // Deterministic fixture execution
    const html = options.html;
    const headers = options.headers || {};
    parsedContent.feed(html);

    const crawlFindings = await auditCrawlRender(normalizedUrl, html, headers, options.robotsTxt || "");
    allFindings.push(...crawlFindings);
    allFindings.push(...auditStructuredData(normalizedUrl, parsedContent));
    allFindings.push(...auditAeoQuotability(parsedContent));
    allFindings.push(...auditFreshnessTrust(parsedContent, html, normalizedUrl));
    allFindings.push(...auditOnSiteEngagement(parsedContent));
  } else {
    // Network execution via SSRF-hardened safeFetch
    const fetchResult = await safeFetch(normalizedUrl, {
      timeoutMs: 6000,
      requireHtml: true,
    });

    if (fetchResult.error) {
      allFindings.push({
        id: "F-000",
        title: "Target Website Inaccessible or Connection Failed",
        severity: "critical",
        category: "crawlability_network",
        confidence: "high",
        evidence: `Failed to fetch ${normalizedUrl}: ${fetchResult.error} (${fetchResult.error_code || "network_error"})`,
        suggested_action: {
          summary: "Ensure DNS, SSL certificate, network connectivity, and web server are operational.",
          priority: "critical",
        },
      });
    } else {
      const html = fetchResult.html;
      const headers = fetchResult.headers;
      parsedContent.feed(html);

      const crawlFindings = await auditCrawlRender(normalizedUrl, html, headers);
      allFindings.push(...crawlFindings);
      allFindings.push(...auditStructuredData(normalizedUrl, parsedContent));
      allFindings.push(...auditAeoQuotability(parsedContent));
      allFindings.push(...auditFreshnessTrust(parsedContent, html, normalizedUrl));
      allFindings.push(...auditOnSiteEngagement(parsedContent));
    }
  }

  enrichFindingsActions(allFindings);

  const severityCounts = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const f of allFindings) {
    const sev = (f.severity || "medium").toLowerCase() as keyof typeof severityCounts;
    if (sev in severityCounts) {
      severityCounts[sev]++;
    }
  }

  const metrics = computeScores(allFindings);
  const proactiveRecs = generateProactiveRecommendations(normalizedUrl, parsedContent, allFindings);
  const latency = `${((Date.now() - startTime) / 1000).toFixed(2)}s`;

  const report: AuditReport = {
    site: domain,
    audited_at: new Date().toISOString(),
    latency,
    summary: {
      total_findings: allFindings.length,
      critical: severityCounts.critical,
      high: severityCounts.high,
      medium: severityCounts.medium,
      low: severityCounts.low,
      acpi_score: metrics.acpi_score,
      crs_score: metrics.crs_score,
      component_scores: metrics.component_scores,
    },
    metrics,
    findings: allFindings,
    proactive_recommendations: proactiveRecs,
  };

  const validation = validateAuditReport(report);
  if (!validation.valid) {
    console.error("[OmniAudit Engine] Internal Schema Invalidation:", validation.errors);
  }

  return report;
}
