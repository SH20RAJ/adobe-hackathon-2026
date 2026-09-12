# Coding Style & Architecture Standards

## Python Core Engine (`skills/`)
1. **Standard Library Priority:** Use Python standard library modules (`urllib.request`, `html.parser`, `re`, `json`, `math`, `dataclasses`, `argparse`). Avoid adding heavy pip dependencies to the core engine.
2. **Schema Conformity:** Every audit skill script must return data matching `references/audit_schema.json` with keys: `site`, `audited_at`, `summary`, and `findings`.
3. **Explicit Error States:** Never swallow exceptions or use bare `except: pass`. If an inspection fails due to network or malformed HTML, emit `status: "unknown"` with an actionable `failure_reason`.
4. **Deterministic Math:** Score calculations for ACPI (0–100) and CRS (0–100) must be deterministic and bounded in `[0.0, 100.0]`.

## FastAPI Web Control Plane & Templates (`omniaudit-geo/`)
1. **Adobe Spectrum Alignment:** Follow Adobe Spectrum Design Principles: Clear, Focused, Accessible, and Harmonious using semantic HTML and vanilla CSS tokens.
2. **Zero Runtime Side Effects:** Keep route handlers clean, synchronous or async without blocking, and deterministic.
3. **Clean Code:** Ensure all routes handle validation and exceptions cleanly.
