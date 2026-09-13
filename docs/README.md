# OmniAudit-GEO Documentation Hub

Welcome to the canonical technical documentation suite for **OmniAudit-GEO**, developed for the **Adobe University Hackathon 2026 (Campus Recruitment Program — Round 3)**.

This documentation is organized into focused, single-source-of-truth references designed for rapid navigation by judges, developers, deployment engineers, and AI coding agents.

---

## 🧭 Canonical Documentation Index

| Topic | Canonical Document | Primary Focus |
| :--- | :--- | :--- |
| **🚀 Getting Started** | **[getting-started.md](getting-started.md)** | Prerequisites, 1-line curl install, pip editable mode, first audit, Web UI. |
| **🏛️ Architecture** | **[architecture.md](architecture.md)** | Master system topology, AST parsing pipeline, core engine vs adapters, scoring formulas. |
| **📦 Marketplace & Submission** | **[marketplace.md](marketplace.md)** | Adobe challenge boundaries, `marketplace.json` manifest, submission ZIP vs repo. |
| **🧰 Specialist Skills** | **[skills.md](skills.md)** | Deep dive into all 6 skills: inputs, outputs, detection logic, severity matrix. |
| **💻 Command-Line Interface** | **[cli.md](cli.md)** | Unified CLI reference (`omni` / `omniaudit` / `cli.py`): commands, flags, examples. |
| **🌐 REST API** | **[api.md](api.md)** | FastAPI control plane: endpoints, request/response models, rate limiting, OpenAPI docs. |
| **🤖 Model Context Protocol** | **[mcp.md](mcp.md)** | Anthropic MCP server: tool schemas, stdio and HTTP transports, IDE configs (Claude, Cursor, Antigravity). |
| **🛡️ Security Model** | **[security.md](security.md)** | Anti-SSRF defense, private IP blocking, resource bounds, ReDoS immunity, known limitations. |
| **🧪 Testing & Quality Gates** | **[testing.md](testing.md)** | 6-Gate verification loop, 167 unit/integration tests, offline fixture execution, CI workflows. |
| **📊 Benchmark Evaluation** | **[benchmarking.md](benchmarking.md)** | 16 Golden Fixtures test matrix, precision/recall metrics, local AST vs network latency. |
| **☁️ Deployment & Operations** | **[deployment.md](deployment.md)** | Dockerfile, GHCR registry, Render webhook auto-deploy, DigitalOcean App Platform, health checks. |
| **⚖️ Judge & Jury Defense** | **[judging.md](judging.md)** | 90-second executive summary, 15 comprehensive jury defenses, team engineering ownership. |
| **📂 Historical Archive** | **[archive/](archive/)** | Preserved early hackathon planning, ideation, and initial research documents. |

---

## 🎯 Quick Reference Links
* **Interactive Documentation Portal:** [https://omniaudit-geo.onrender.com/docs](https://omniaudit-geo.onrender.com/docs)
* **Live Web Demo:** [https://omniaudit-geo.onrender.com/](https://omniaudit-geo.onrender.com/)
* **Live Health Probe:** [https://omniaudit-geo.onrender.com/api/health](https://omniaudit-geo.onrender.com/api/health)
* **GitHub Repository:** [https://github.com/SH20RAJ/omniaudit](https://github.com/SH20RAJ/omniaudit)
* **Official Submission Archive:** `omniaudit-geo-marketplace.zip` (0.09 MB / $\le 50$ MB limit)
* **Challenge Portal:** [Unstop - Adobe University Hackathon 2026](https://unstop.com/hackathons/crp-adobe-university-hackathon-2026-adobe-1715333)
