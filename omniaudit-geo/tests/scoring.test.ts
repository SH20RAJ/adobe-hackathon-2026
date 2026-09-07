import { describe, expect, it } from "bun:test";

function calculateAcpi(critical: number, high: number, medium: number): number {
  const deductions = (critical * 30) + (high * 15) + (medium * 5);
  return Number(Math.max(5.0, Math.min(100.0, 100.0 - deductions)).toFixed(1));
}

function calculateCrs(high: number, medium: number): number {
  const deductions = (high * 20) + (medium * 10);
  return Number(Math.max(10.0, Math.min(100.0, 100.0 - deductions)).toFixed(1));
}

describe("ACPI and CRS Scoring Calculations", () => {
  it("returns 100 for clean audit with 0 findings", () => {
    expect(calculateAcpi(0, 0, 0)).toBe(100.0);
    expect(calculateCrs(0, 0)).toBe(100.0);
  });

  it("applies expected severity deductions for ACPI", () => {
    // 1 high (-15) + 1 medium (-5) = -20 => 80
    expect(calculateAcpi(0, 1, 1)).toBe(80.0);

    // 1 critical (-30) => 70
    expect(calculateAcpi(1, 0, 0)).toBe(70.0);

    // 2 critical (-60) + 1 high (-15) = -75 => 25
    expect(calculateAcpi(2, 1, 0)).toBe(25.0);
  });

  it("enforces lower bound floor of 5.0 for ACPI", () => {
    expect(calculateAcpi(5, 5, 5)).toBe(5.0);
  });

  it("enforces lower bound floor of 10.0 for CRS", () => {
    expect(calculateCrs(5, 5)).toBe(10.0);
  });
});
