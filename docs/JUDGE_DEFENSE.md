# OmniAudit-GEO — Judge Defense & Technical Architecture Q&A
**Adobe University Hackathon 2026 (Round 3 Campus Recruitment Program)**  
**Engineering Team:** Shaswat Raj ([@sh20raj](https://github.com/sh20raj)) & Prithvi ([@chikolavosaki-sys](https://github.com/chikolavosaki-sys))

---

### 1. Why this problem? (Brand AI-Readiness & GEO)
The web discovery landscape has experienced an irreversible structural shift:
* **The Transition:** Search is moving from ten blue links (SEO) to synthetic answers emitted by autonomous AI agents, SearchGPT, Perplexity, and Google Gemini AI Overviews (Generative Engine Optimization — GEO).
* **The Dual Vulnerability:** Brands face two fatal points of failure:
  1. **Off-site AI Invisibility (Discovery):** Generative assistants cannot discover, parse, or quote the brand due to robots.txt blocks, empty client-rendered JS shells, or unlinked entity data.
  2. **On-site Referral Bounce (Retention):** When an AI assistant refers a user deep into a subpage, the visitor immediately bounces due to lack of context orientation, weak hero value propositions, and vague CTAs.
* **Our Solution:** OmniAudit-GEO provides the first automated, standard-compliant agent skill marketplace to diagnose both discovery (ACPI) and retention (CRS) in sub-second time.

---

### 2. Why agent skills instead of one monolithic application?
* **Decoupled Diagnostics:** A brand's infrastructure team cares about robots.txt and SSR hydration (`crawl-render-audit`), its SEO agency cares about Schema.org entity graphs (`structured-entity-audit`), while the growth/marketing team cares about hero value props and CTA retention (`on-site-engagement-audit`).
* **Agent Composability:** In accordance with the `agentskills.io` standard, autonomous agents (Claude Code, Cursor, Antigravity) can discover and invoke individual diagnostic specialists or compose the master orchestrator (`audit-orchestrator`) dynamically based on user intent.
* **Independent Scalability:** Each skill encapsulates dedicated deterministic heuristics, tests, and remediation code without monolithic entanglement.

---

### 3. Why deterministic AST/DOM analysis instead of an LLM?
* **Zero Hallucination:** Deterministic heuristics never invent findings or directives. If GPTBot is blocked, the exact `Disallow: /` line in robots.txt is cited.
* **100% Reproducibility:** Auditing the same URL or DOM fixture yields identical finding IDs, scores, and evidence every single time.
* **Extreme Speed & Cost:** Analyzing a DOM AST takes `<1ms` with zero token cost or external API latency, enabling continuous pre-commit CI/CD execution.
* **Offline Resiliency:** The Python engine relies strictly on the standard library (`html.parser`, `urllib`, `re`, `json`) with zero pip dependencies.

---

### 4. How do you prevent Server-Side Request Forgery (SSRF)?
Implemented in both Python (`safe_fetch.py`) and TypeScript (`safeFetch.ts`):
1. **Host & IP Blacklisting:** Explicitly blocks `localhost`, loopback IPs (`127.0.0.0/8`, `::1`), RFC 1918 private ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), link-local/cloud metadata (`169.254.169.254`), broadcast, and multicast.
2. **Encoding Bypass Neutralization:** Reconstructs and validates decimal, octal, and integer representations of private IPs (e.g. `http://2130706433`).
3. **IPv4-Mapped IPv6 Inspection:** Checks for `::ffff:127.0.0.1` and non-public IPv6 allocations.
4. **Port & Scheme Restriction:** Restricts protocols strictly to `http:` and `https:`, and ports strictly to `80` and `443`. Disallows embedded URL credentials (`user:pass@host`).
5. **Redirect Destination Re-validation:** Disallows automatic redirect following; every redirect target is re-validated through the full SSRF pipeline up to a maximum of 5 hops.
6. **Bounded Resource Limits:** Enforces strict response size limits (1MB for HTML, 256KB for robots.txt) and timeouts (default 6s).

---

### 5. How do you deal with JavaScript-heavy websites without running a headless browser?
* **The Insight:** Generative search indexers (GPTBot, ClaudeBot, Perplexity) operate at web scale and do not execute full Chromium rendering pipelines for everyday crawl updates. If critical brand facts are missing from the server-rendered HTML response, AI crawlers see an empty shell.
* **Multi-Signal Heuristic:** Rather than executing JS, `detect_hydration_gap` inspects:
  1. Application root occupancy (`#root`, `#__next`, `#app` length `<= 60` chars).
  2. Framework state markers (`__NEXT_DATA__`, `__NUXT_DATA__`, `window.__INITIAL_STATE__`).
  3. Client-rendering markers (`createRoot`, `ReactDOM.render`).
  4. Nuxt `data-ssr="false"` attribute flags.
  5. Script payload-to-visible-text ratio (`>= 3.0`).
* **False Positive Immunity:** Verified against Next.js App Router RSC payloads (`app_router.html`) and large static state (`large_state_static.html`) to ensure rich SSR applications are never misclassified.

---

### 6. How do you reduce false positives across unseen websites?
* **Documentation Immunity:** Technical API docs and knowledge bases are not penalized for lacking a commercial "Buy Now" CTA if an article/content region is detected.
* **Copyright Staleness Decoupling:** Copyright years alone (e.g. "© 2024") do not trigger a stale content finding if explicit `dateModified` or article timestamps are present.
* **DIMINISHING Root-Cause Deductions:** Redundant findings sharing the same component and root-cause (e.g. multiple robots blocks) apply a 50% diminishing return penalty, preventing artificial score collapse.

---

### 7. How are ACPI and CRS scores calculated?
Scores are bounded between `0.0` and `100.0` with guaranteed baseline floors:
* **ACPI (AI Citation Probability Index):**
  $$\text{ACPI} = 0.30 \times \text{Crawlability} + 0.15 \times \text{Renderability} + 0.20 \times \text{Entity Clarity} + 0.20 \times \text{Quotability} + 0.15 \times \text{Trust Freshness}$$
  *Baseline floor: 5.0.*
* **CRS (Cognitive Retention Score):**
  $$\text{CRS} = 0.35 \times \text{Orientation} + 0.25 \times \text{Intent Continuity} + 0.20 \times \text{Readability} + 0.20 \times \text{Actionability}$$
  *Baseline floor: 10.0.*
* **Severity Deductions:** Critical (-30), High (-15), Medium (-8), Low (-3), scaled by confidence multiplier (High 1.0, Medium 0.7, Low 0.4).

---

### 8. Why `sameAs` entity disambiguation?
* **LLM Hallucination Shield:** When an LLM encounters a company named "Acme", it may conflate it with hundreds of other entities.
* **Persistent Knowledge Graph:** Schema.org `sameAs` links pointing to authoritative persistent URIs (Wikidata QIDs, Crunchbase, Wikipedia) anchor the entity in global knowledge graphs, eliminating ambiguity during generative retrieval.

---

### 9. How do you handle malformed JSON-LD?
* `audit_structured_data` safely iterates through all `<script type="application/ld+json">` blocks.
* Malformed JSON generates an explicit high-severity finding `F-003` ("Syntax Error in Embedded JSON-LD Script Block") with the exact block index, without crashing the audit or halting subsequent analyzers.
* Valid blocks in the same document continue to be parsed via `@graph` flattening.

---

### 10. What is a "Defect" vs. a "Proactive Recommendation"?
* **Defect (`findings`):** An observed non-compliance with established standards (e.g. Disallowed robots.txt directive, malformed JSON-LD, missing H1). Deducts points from ACPI/CRS.
* **Proactive Recommendation (`proactive_recommendations`):** Beyond-defect strategic optimizations that strengthen AI readiness even on perfectly clean websites (e.g. deploying `/llms.txt`, knowledge graph triples, deep-link orientation anchors). **Has 0 penalty on scores.**

---

### 11. Why is the system provider-neutral?
* Rather than auditing solely for OpenAI or Google, OmniAudit-GEO audits for the entire frontier AI ecosystem: OpenAI (GPTBot, ChatGPT-User), Anthropic (ClaudeBot, anthropic-ai), Perplexity (PerplexityBot), Google (Google-Extended), ByteDance (Bytespider), and Common Crawl (CCBot).
* Standards-based: Relies on `robots.txt` RFC 9309, W3C Schema.org, OpenGraph, and W3C HTML5.

---

### 12. How does Model Context Protocol (MCP) fit in?
* OmniAudit-GEO implements the official Anthropic MCP specification (JSON-RPC 2.0 version `2024-11-05`).
* Exposes all 6 modular tools natively to Cursor, Claude Desktop, and Antigravity agents:
  `audit_website`, `inspect_robots_and_rendering`, `inspect_structured_data`, `inspect_aeo_quotability`, `inspect_freshness_trust`, and `inspect_on_site_retention`.
* Runs both as a local Python stdio server and as a remote Edge endpoint on Cloudflare Workers (`/api/mcp`).

---

### 13. How would this scale in production?
* The deterministic engine executes in `<1ms` of CPU time.
* Deployed as serverless Cloudflare Workers with Edge caching, each regional node can process tens of thousands of audits per second.
* Can be scheduled as an automated GitHub Action or pre-push hook to prevent regressions in AI discoverability during web deployments.

---

### 14. What would you add in Round 4?
1. **Multi-page Sitemap Crawler:** Automated depth-2 BFS crawl following `sitemap.xml` to audit an entire enterprise domain's surface.
2. **Visual Contrast & Viewport Rendering:** Headless browser integration for measuring actual pixel contrast and responsive hero fold geometry on mobile vs desktop.
3. **Synthetic Perplexity/SearchGPT Benchmark Probe:** Provider API probes to compare predicted ACPI scores against actual model citation frequencies in real-time.
