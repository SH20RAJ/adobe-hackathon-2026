---
name: crawl-render-audit
description: Audits robots.txt AI crawler rules (GPTBot, ClaudeBot, PerplexityBot), HTTP headers, and JavaScript hydration gaps.
license: Apache-2.0
allowed-tools:
  - run_command
---

# Crawl & JS-Render Audit Skill

## When to use
Use to diagnose why AI assistants and search crawlers are blocked, throttled, or encounter blank/incomplete HTML due to client-side JavaScript rendering barriers.

## Inputs
* `url` (string, required): The target website URL.

## Procedure
1. Run `python3 skills/crawl-render-audit/scripts/crawl_inspector.py --url "<URL>"`.
2. Inspect `robots.txt` against all AI user agents defined in `references/ai_user_agents.md`.
3. Check HTTP headers (`X-Robots-Tag`, `Content-Type`, `Cache-Control`).
4. Detect Server-Side Rendering (SSR) vs. Client-Side Rendering (CSR) text gaps.
5. Return findings array with exact line numbers and remediation directives.

## Output
JSON array of crawl and rendering findings with severity and concrete remediation code.
