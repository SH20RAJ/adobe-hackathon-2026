---
name: crawl-render-audit
description: Audits robots.txt AI crawler rules, HTTP headers, and evidence-based JavaScript hydration gaps.
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
1. Fetch the target page and `robots.txt` through the shared bounded, SSRF-safe HTTP
   utility used by the audit runner.
2. Inspect `robots.txt` against GPTBot, Google-Extended, ClaudeBot, PerplexityBot,
   anthropic-ai, ChatGPT-User, Bytespider, and CCBot. The parser supports grouped
   User-agent directives, path prefixes, `*` wildcards, `$` end markers, and
   longest-match Allow/Disallow precedence. A crawler-specific group takes
   precedence over the wildcard group; an absent group is reported as
   `NO_MATCH`, not blocked.
3. Check HTTP headers (`X-Robots-Tag`, `Content-Type`, `Cache-Control`).
4. Detect SSR/CSR content gaps using combined framework payload markers, visible static
   text, root/container occupancy, Nuxt `data-ssr` signals, and payload-to-text ratios.
   Treat individual hydration markers as evidence, not defects.
5. Return findings array with exact line numbers and remediation directives.

## Output
JSON array of crawl and rendering findings with severity and concrete remediation code.
