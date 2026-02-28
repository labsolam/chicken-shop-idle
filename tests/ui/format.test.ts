import { describe, it, expect } from "vitest";
import { formatMoney } from "../../src/ui/format";

describe("formatMoney", () => {
  it("formats zero as $0.00", () => {
    expect(formatMoney(0)).toBe("$0.00");
  });

  it("formats cents below $1000 as $X.XX", () => {
    expect(formatMoney(100)).toBe("$1.00");
    expect(formatMoney(50)).toBe("$0.50");
    expect(formatMoney(1050)).toBe("$10.50");
    expect(formatMoney(99999)).toBe("$999.99");
  });

  it("formats $1K-$999.99K with K suffix", () => {
    expect(formatMoney(100000)).toBe("$1.00K");
    expect(formatMoney(123450)).toBe("$1.23K");
    expect(formatMoney(99999000)).toBe("$999.99K"); // $999,990 = 99999000 cents
  });

  it("formats $1M-$999.99M with M suffix", () => {
    expect(formatMoney(100000000)).toBe("$1.00M");
    expect(formatMoney(12345000000)).toBe("$123.45M");
  });

  it("formats $1B-$999.99B with B suffix", () => {
    expect(formatMoney(100000000000)).toBe("$1.00B");
    expect(formatMoney(12345000000000)).toBe("$123.45B");
  });

  it("formats $1T-$999.99T with T suffix", () => {
    expect(formatMoney(100000000000000)).toBe("$1.00T");
    expect(formatMoney(5000000000000000)).toBe("$50.00T");
  });

  it("formats $1Qa+ in scientific notation", () => {
    // 1Qa = 10^15 dollars = 10^17 cents
    const oneQa = 100_000_000_000_000_000;
    const result = formatMoney(oneQa);
    expect(result).toMatch(/^\$/);
    expect(result).toMatch(/e/);
  });

  it("formats upgrade costs correctly (level 0 cookSpeed: $5.00)", () => {
    expect(formatMoney(500)).toBe("$5.00");
  });

  it("formats cold storage cost level 0 ($15.00)", () => {
    expect(formatMoney(1500)).toBe("$15.00");
  });
});
