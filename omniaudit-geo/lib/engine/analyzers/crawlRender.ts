/**
 * Skill 1: Crawl & Render Specialist Analyzer (TypeScript).
 * Validates robots.txt AI bot permissions (GPTBot, ClaudeBot, PerplexityBot, etc.),
 * X-Robots-Tag HTTP headers, and detects client-side hydration gaps.
 */

import { Finding } from "../types";
import { safeFetch, DEFAULT_MAX_ROBOTS_BYTES } from "../safeFetch";

export const ROBOTS_CRAWLERS = [
  "GPTBot",
  "ClaudeBot",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
  "Bytespider",
  "CCBot",
  "Diffbot",
  "FacebookBot",
  "Cohere-ai",
  "anthropic-ai",
  "Omgilibot",
];

interface RobotsRule {
  directive: "Allow" | "Disallow";
  path: string;
  raw: string;
}

interface RobotsGroup {
  user_agents: string[];
  rules: RobotsRule[];
}

export function parseRobotsTxt(robotsText: string): RobotsGroup[] {
  const groups: RobotsGroup[] = [];
  let userAgents: string[] = [];
  let rules: RobotsRule[] = [];

  function finishGroup() {
    if (userAgents.length > 0) {
      groups.push({
        user_agents: userAgents.map((a) => a.toLowerCase()),
        rules: [...rules],
      });
    }
  }

  for (const rawLine of robotsText.split(/\r?\n/)) {
    const line = rawLine.split("#")[0].trim();
    if (!line) {
      finishGroup();
      userAgents = [];
      rules = [];
      continue;
    }
    if (!line.includes(":")) continue;
    const [rawField, ...rest] = line.split(":");
    const field = rawField.trim().toLowerCase();
    const value = rest.join(":").trim();

    if (field === "user-agent") {
      if (rules.length > 0) {
        finishGroup();
        userAgents = [];
        rules = [];
      }
      if (value) userAgents.push(value);
    } else if ((field === "allow" || field === "disallow") && userAgents.length > 0) {
      rules.push({
        directive: field === "allow" ? "Allow" : "Disallow",
        path: value,
        raw: `${field === "allow" ? "Allow" : "Disallow"}: ${value}`,
      });
    }
  }
  finishGroup();
  return groups;
}

function robotsRuleMatch(rulePath: string, testedPath: string): boolean {
  if (!rulePath) return false;
  let pattern = "^";
  for (let i = 0; i < rulePath.length; i++) {
    const c = rulePath[i];
    if (c === "*") {
      pattern += ".*";
    } else if (c === "$" && i === rulePath.length - 1) {
      pattern += "$";
    } else {
      pattern += c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
  }
  return new RegExp(pattern).test(testedPath);
}

export function evaluateRobots(robotsText: string, crawler: string, testedPath = "/") {
  const groups = parseRobotsTxt(robotsText);
  const crawlerKey = crawler.toLowerCase();
  const exactGroups = groups.filter((g) => g.user_agents.includes(crawlerKey));
  const applicable = exactGroups.length > 0 ? exactGroups : groups.filter((g) => g.user_agents.includes("*"));

  if (applicable.length === 0) {
    return {
      crawler,
      tested_path: testedPath,
      status: "NO_MATCH",
      matched_directive: null,
      user_agent_group: null,
    };
  }

  const matchingRules: RobotsRule[] = [];
  for (const group of applicable) {
    for (const rule of group.rules) {
      if (robotsRuleMatch(rule.path, testedPath)) {
        matchingRules.push(rule);
      }
    }
  }

  let status = "ALLOWED";
  let matched: RobotsRule | null = null;

  if (matchingRules.length > 0) {
    // Sort by path specificity (length without wildcards) then Allow precedence
    matchingRules.sort((a, b) => {
      const lenA = a.path.replace(/[*$]/g, "").length;
      const lenB = b.path.replace(/[*$]/g, "").length;
      if (lenB !== lenA) return lenB - lenA;
      if (a.directive === "Allow" && b.directive !== "Allow") return -1;
      if (b.directive === "Allow" && a.directive !== "Allow") return 1;
      return 0;
    });
    matched = matchingRules[0];
    status = matched.directive === "Disallow" ? "BLOCKED" : "ALLOWED";
  }

  const groupNames = Array.from(new Set(applicable.flatMap((g) => g.user_agents))).sort();
  return {
    crawler,
    tested_path: testedPath,
    status,
    matched_directive: matched ? matched.raw : null,
    user_agent_group: groupNames.join(", "),
  };
}

export function robotsFindings(robotsUrl: string, robotsText: string, testedPath = "/"): Finding[] {
  const findings: Finding[] = [];
  const statuses = ROBOTS_CRAWLERS.map((crawler) => evaluateRobots(robotsText, crawler, testedPath));

  for (const s of statuses) {
    if (s.status !== "BLOCKED") continue;
    const severity = ROBOTS_CRAWLERS.slice(0, 6).includes(s.crawler) ? "high" : "medium";
    findings.push({
      id: `F-001-${s.crawler}`,
      title: `${s.crawler} Blocked by robots.txt`,
      severity,
      category: "crawlability_ai_permissions",
      evidence: JSON.stringify({ robots_url: robotsUrl, ...s }),
      confidence: "high",
      suggested_action: {
        summary: `Allow ${s.crawler} to access ${testedPath} because the current ${s.user_agent_group} group matches ${s.matched_directive}.`,
        priority: severity,
        implementation_code: `User-agent: ${s.crawler}\nAllow: ${testedPath}`,
      },
    });
  }
  return findings;
}

export function detectHydrationGap(url: string, html: string): Finding | null {
  // Extract text and script content
  const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  const scripts: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = scriptRegex.exec(html)) !== null) {
    scripts.push(m[2] || "");
  }

  const cleanText = html.replace(/<script\b[\s\S]*?<\/script>/gi, "")
                        .replace(/<style\b[\s\S]*?<\/style>/gi, "")
                        .replace(/<!--[\s\S]*?-->/g, "")
                        .replace(/<[^>]+>/g, " ")
                        .trim();
  const words = cleanText.split(/\s+/).filter(Boolean);
  const staticWords = words.length;
  const staticChars = cleanText.length;

  // Framework & CSR markers
  const markers: string[] = [];
  const csrMarkers: string[] = [];
  const strongCsrMarkers: string[] = [];

  const checkMarker = (needle: string, arr: string[]) => {
    if (html.includes(needle)) arr.push(needle);
  };

  checkMarker("__NEXT_DATA__", markers);
  checkMarker("__NUXT_DATA__", markers);
  checkMarker("window.__NUXT__", markers);
  checkMarker("window.__INITIAL_STATE__", markers);
  checkMarker("createRoot", csrMarkers);
  checkMarker("ReactDOM.render", strongCsrMarkers);
  checkMarker("createApp", csrMarkers);

  const hasNuxtFalse = html.includes('data-ssr="false"');
  const hasNuxtTrue = html.includes('data-ssr="true"');

  // Check root containers
  const rootMatches = [
    { name: "#__next", match: /<div\s+id=["']__next["'][^>]*>([\s\S]*?)<\/div>/i.exec(html) },
    { name: "#root", match: /<div\s+id=["']root["'][^>]*>([\s\S]*?)<\/div>/i.exec(html) },
    { name: "#app", match: /<div\s+id=["']app["'][^>]*>([\s\S]*?)<\/div>/i.exec(html) },
  ];

  let rootEmpty = false;
  let rootName = "";
  let rootChars = 0;

  for (const rm of rootMatches) {
    if (rm.match) {
      rootName = rm.name;
      const inner = rm.match[1].replace(/<[^>]+>/g, "").trim();
      rootChars = inner.length;
      if (rootChars <= 60) {
        rootEmpty = true;
      }
      break;
    }
  }

  let totalPayloadChars = 0;
  for (const s of scripts) totalPayloadChars += s.length;
  const payloadRatio = totalPayloadChars / Math.max(staticChars, 1);

  const lowStatic = staticWords <= 60;
  const partialStatic = staticWords <= 180;
  const frameworkEvidence = markers.length > 0;
  const strongCsrEvidence = strongCsrMarkers.length > 0;

  const strongGap = (
    (hasNuxtFalse && lowStatic) ||
    (rootEmpty && (frameworkEvidence || strongCsrEvidence)) ||
    (lowStatic && (frameworkEvidence || strongCsrEvidence) && payloadRatio >= 3.0)
  );

  const partialGap = (
    partialStatic &&
    payloadRatio >= 3.0 &&
    (hasNuxtFalse || (frameworkEvidence && (rootEmpty || strongCsrEvidence)))
  );

  if (!strongGap && !partialGap) return null;

  const confidence = (strongGap) ? "high" : "medium";
  const severity = (strongGap) ? "high" : "medium";

  return {
    id: "F-011",
    title: "Likely Client-Side Rendering Content Gap",
    severity,
    category: "crawlability_rendering",
    confidence,
    evidence: JSON.stringify({
      target_url: url,
      meaningful_static_word_count: staticWords,
      payload_to_text_ratio: Number(payloadRatio.toFixed(2)),
      root_selector: rootName,
      near_empty_root: rootEmpty,
      markers,
      csr_markers: [...csrMarkers, ...strongCsrMarkers],
    }),
    suggested_action: {
      summary: "Render primary value proposition and essential facts in initial HTML response, retaining hydration for interactive behavior.",
      priority: severity,
      implementation_code: "Ensure page renders its H1, core description, and essential facts server-side before client-side JS hydration.",
    },
  };
}

export async function auditCrawlRender(
  baseUrl: string,
  html: string,
  headers: Record<string, string>,
  robotsTxtOverride?: string
): Promise<Finding[]> {
  const findings: Finding[] = [];
  const parsed = new URL(baseUrl);
  const robotsUrl = `${parsed.protocol}//${parsed.host}/robots.txt`;

  // 1. Fetch & evaluate robots.txt
  let robotsText = robotsTxtOverride;
  if (robotsText === undefined) {
    const robotsRes = await safeFetch(robotsUrl, {
      timeoutMs: 4000,
      maxBytes: DEFAULT_MAX_ROBOTS_BYTES,
      requireHtml: false,
    });
    if (robotsRes.status === 200 && !robotsRes.error) {
      robotsText = robotsRes.html;
    }
  }

  if (robotsText) {
    findings.push(...robotsFindings(robotsUrl, robotsText));
  }

  // 2. Inspect X-Robots-Tag headers
  const xRobots = headers["x-robots-tag"] || headers["X-Robots-Tag"] || "";
  if (xRobots.toLowerCase().includes("noindex") || xRobots.toLowerCase().includes("noai")) {
    findings.push({
      id: "F-002",
      title: "HTTP Header X-Robots-Tag Restricts AI Indexing",
      severity: "critical",
      category: "crawlability_headers",
      confidence: "high",
      evidence: `Server response included header 'X-Robots-Tag: ${xRobots}'.`,
      suggested_action: {
        summary: "Remove noindex / noai directives from public response headers.",
        priority: "critical",
        implementation_code: "# Remove 'X-Robots-Tag: noindex' from web server configuration",
      },
    });
  }

  // 3. Hydration Gap
  const hydration = detectHydrationGap(baseUrl, html);
  if (hydration) {
    findings.push(hydration);
  }

  return findings;
}
