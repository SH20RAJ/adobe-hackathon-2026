import { describe, expect, it } from "bun:test";
import { cn } from "../lib/utils";

describe("lib/utils cn() helper", () => {
  it("merges class names correctly", () => {
    const result = cn("text-sm", "font-bold");
    expect(result).toBe("text-sm font-bold");
  });

  it("handles conditional classes", () => {
    const isActive = true;
    const isError = false;
    const result = cn("btn", isActive && "btn-active", isError && "btn-error");
    expect(result).toBe("btn btn-active");
  });

  it("resolves conflicting tailwind classes with tailwind-merge", () => {
    const result = cn("px-2 py-1", "px-4");
    expect(result).toBe("py-1 px-4");
  });

  it("handles empty and falsy arguments cleanly", () => {
    const result = cn("base", null, undefined, false, "");
    expect(result).toBe("base");
  });
});
