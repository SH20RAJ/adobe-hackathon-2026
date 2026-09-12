# Performance & Resource Standards

## 1. Fast Deterministic Engine
- DOM and AST evaluations must be executed efficiently using single-pass regex and stream-based parsers.
- Avoid recursive regexes that can trigger catastrophic backtracking.
- Pre-compile compiled regex patterns at module top-level.

## 2. Token & Context Conservation
- When returning audit results or intermediate states, adhere strictly to the JSON schema without verbose boilerplate.
- Prefer deterministic calculations over generative LLM calls for parsing and scoring.

## 3. Web Control Plane Performance
- Keep the FastAPI server lightweight with zero blocking I/O on async event loops.
- Jinja2 templates are rendered server-side with zero client-side JavaScript bundling overhead.
