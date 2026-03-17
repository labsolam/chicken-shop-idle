import { describe, it, expect } from "vitest";
import { getIdleEfficiency } from "@engine/idle";

const HOUR_MS = 60 * 60 * 1000;

describe("getIdleEfficiency", () => {
  it("returns 1.0 at 0 idle time", () => {
    expect(getIdleEfficiency(0)).toBe(1.0);
  });

  it("returns 1.0 at 4 hours idle", () => {
    expect(getIdleEfficiency(4 * HOUR_MS)).toBe(1.0);
  });

  it("returns 1.0 at just under 8 hours", () => {
    expect(getIdleEfficiency(8 * HOUR_MS - 1)).toBe(1.0);
  });

  it("returns 1.0 at exactly 8 hours (boundary — still full)", () => {
    // At exactly 8h, condition is <=, so still 1.0
    expect(getIdleEfficiency(8 * HOUR_MS)).toBe(1.0);
  });

  it("starts diminishing just after 8 hours", () => {
    // 1ms past 8h — barely into ramp, should be just under 1.0
    expect(getIdleEfficiency(8 * HOUR_MS + 1)).toBeLessThan(1.0);
    expect(getIdleEfficiency(8 * HOUR_MS + 1)).toBeGreaterThan(0.99);
  });

  it("returns 0.8 at 9 hours (midpoint of ramp)", () => {
    expect(getIdleEfficiency(9 * HOUR_MS)).toBeCloseTo(0.8);
  });

  it("returns 0.6 at exactly 10 hours", () => {
    expect(getIdleEfficiency(10 * HOUR_MS)).toBeCloseTo(0.6);
  });

  it("returns 0.6 at 12 hours (capped)", () => {
    expect(getIdleEfficiency(12 * HOUR_MS)).toBe(0.6);
  });

  it("returns 0.6 at 24 hours (capped)", () => {
    expect(getIdleEfficiency(24 * HOUR_MS)).toBe(0.6);
  });

  it("linearly interpolates within 8-10h range", () => {
    const quarter = 8 * HOUR_MS + 0.25 * (2 * HOUR_MS); // 8.5h
    // Expected: 1.0 - 0.25 * 0.4 = 0.9
    expect(getIdleEfficiency(quarter)).toBeCloseTo(0.9);
  });
});
