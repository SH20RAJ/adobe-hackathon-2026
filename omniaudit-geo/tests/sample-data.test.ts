import { describe, expect, it } from "bun:test";
import { SAMPLE_AUDITS, BENCHMARK_FIXTURES, MARKETPLACE_SKILLS } from "../lib/sample-data";

describe("Sample Audits & Benchmarks Data Integrity", () => {
  it("contains valid sample audits with required summary fields", () => {
    expect(SAMPLE_AUDITS["adobe.com"]).toBeDefined();
    expect(SAMPLE_AUDITS["linear.app"]).toBeDefined();
    expect(SAMPLE_AUDITS["react-spa-sample.internal"]).toBeDefined();

    for (const [key, report] of Object.entries(SAMPLE_AUDITS)) {
      expect(report.site).toBeTruthy();
      expect(report.audited_at).toBeTruthy();
      expect(report.summary.acpi_score).toBeGreaterThanOrEqual(0);
      expect(report.summary.acpi_score).toBeLessThanOrEqual(100);
      expect(report.summary.crs_score).toBeGreaterThanOrEqual(0);
      expect(report.summary.crs_score).toBeLessThanOrEqual(100);
      expect(report.findings.length).toBeGreaterThan(0);
    }
  });

  it("contains exactly 14 golden benchmark fixtures matching test suite", () => {
    expect(BENCHMARK_FIXTURES.length).toBe(14);
    
    BENCHMARK_FIXTURES.forEach((bm, idx) => {
      expect(bm.id).toBe(`BM-${String(idx + 1).padStart(2, "0")}`);
      expect(bm.name).toBeTruthy();
      expect(bm.fixture_file).toMatch(/\.html$/);
      expect(bm.actual_acpi).toBeGreaterThanOrEqual(0);
      expect(bm.actual_acpi).toBeLessThanOrEqual(100);
      expect(["pass", "optimal", "fail"]).toContain(bm.status);
    });
  });

  it("contains 6 marketplace skills with an entrypoint", () => {
    expect(MARKETPLACE_SKILLS.length).toBe(6);
    const entrypoint = MARKETPLACE_SKILLS.find((s) => s.entrypoint === true);
    expect(entrypoint).toBeDefined();
    expect(entrypoint?.id).toBe("audit-orchestrator");
    
    for (const skill of MARKETPLACE_SKILLS) {
      expect(skill.id).toBeTruthy();
      expect(skill.description).toBeTruthy();
      expect(skill.path).toStartWith("skills/");
      expect(skill.execution_time_ms).toBeGreaterThan(0);
    }
  });
});
