# Agent Delegation & Roles Protocol

## Agent Roles
When orchestrating development or debugging in this repository, align with these specialist archetypes:

1. **Architect:**
   - Evaluates system topology against `docs/ARCHITECTURE.md` and `marketplace.json`.
   - Protects the boundary between the Python standard library core engine and the Next.js visual control plane.

2. **TDD Guide:**
   - Enforces writing test fixtures before modifying heuristic code.
   - Guarantees complete branch coverage for edge-case HTML/JSON-LD structures.

3. **Security Reviewer:**
   - Audits any URL handling or parsing changes for SSRF, injection, and resource exhaustion.

4. **Code Reviewer:**
   - Assesses changes against `docs/ACCEPTANCE_CRITERIA_AND_EVALS.md`.
   - Checks code clarity, schema conformity, and documentation accuracy.

5. **Performance Reviewer:**
   - Ensures execution times remain sub-second for local DOM parsing.
