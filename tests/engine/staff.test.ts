import { describe, it, expect } from "vitest";
import {
  STAFF,
  STAFF_IDS,
  isStaffUnlocked,
  getStaffCost,
  hireStaff,
  getStaffCookSpeedMultiplier,
  getStaffSellSpeedMultiplier,
  getStaffSaleValueMultiplier,
  getAccountantDiscount,
} from "@engine/staff";
import { createInitialState, GameState } from "../../src/types/game-state";

function stateWith(overrides: Partial<GameState>): GameState {
  return { ...createInitialState(), ...overrides };
}

describe("STAFF definitions", () => {
  it("has 6 staff members", () => {
    expect(STAFF_IDS.length).toBe(6);
  });

  it("all IDs in STAFF_IDS exist in STAFF", () => {
    for (const id of STAFF_IDS) {
      expect(STAFF[id]).toBeDefined();
    }
  });

  it("all staff have positive maxLevel, baseCostCents, and costScaling", () => {
    for (const id of STAFF_IDS) {
      const def = STAFF[id];
      expect(def).toBeDefined();
      expect(def?.maxLevel).toBeGreaterThan(0);
      expect(def?.baseCostCents).toBeGreaterThan(0);
      expect(def?.costScaling).toBeGreaterThan(1);
    }
  });
});

describe("isStaffUnlocked", () => {
  it("returns false for unknown staff", () => {
    expect(isStaffUnlocked(createInitialState(), "nobody")).toBe(false);
  });

  it("returns false when revenue below threshold", () => {
    const state = stateWith({ totalRevenueCents: 0 });
    expect(isStaffUnlocked(state, "line_cook")).toBe(false);
  });

  it("returns true when revenue meets threshold", () => {
    const state = stateWith({ totalRevenueCents: 100_000 });
    expect(isStaffUnlocked(state, "line_cook")).toBe(true);
  });
});

describe("getStaffCost", () => {
  it("returns base cost at level 0", () => {
    // line_cook: $1K = 100_000 cents
    expect(getStaffCost("line_cook", 0)).toBe(100_000);
  });

  it("scales with level", () => {
    // line_cook: 100_000 * 2.5^1 = 250_000
    expect(getStaffCost("line_cook", 1)).toBe(250_000);
  });

  it("returns Infinity for unknown staff", () => {
    expect(getStaffCost("nonexistent", 0)).toBe(Infinity);
  });
});

describe("hireStaff", () => {
  it("hires staff when affordable and unlocked", () => {
    const state = stateWith({
      money: 200_000,
      totalRevenueCents: 100_000,
    });
    const result = hireStaff(state, "line_cook");
    expect(result.staff.line_cook).toEqual({ hired: true, level: 1 });
    expect(result.money).toBe(200_000 - 100_000);
  });

  it("upgrades staff from level 1 to 2", () => {
    const state = stateWith({
      money: 500_000,
      totalRevenueCents: 100_000,
      staff: { line_cook: { hired: true, level: 1 } },
    });
    const result = hireStaff(state, "line_cook");
    expect(result.staff.line_cook).toEqual({ hired: true, level: 2 });
  });

  it("returns unchanged state when not unlocked", () => {
    const state = stateWith({ money: 999_999_999, totalRevenueCents: 0 });
    const result = hireStaff(state, "line_cook");
    expect(result.staff.line_cook).toBeUndefined();
  });

  it("returns unchanged state when at max level", () => {
    const state = stateWith({
      money: 999_999_999,
      totalRevenueCents: 100_000,
      staff: { line_cook: { hired: true, level: 10 } },
    });
    const result = hireStaff(state, "line_cook");
    expect(result.staff.line_cook?.level).toBe(10);
  });

  it("returns unchanged state when cannot afford", () => {
    const state = stateWith({ money: 1, totalRevenueCents: 100_000 });
    const result = hireStaff(state, "line_cook");
    expect(result.staff.line_cook).toBeUndefined();
  });

  it("does not mutate input state", () => {
    const state = stateWith({
      money: 200_000,
      totalRevenueCents: 100_000,
    });
    const before = JSON.stringify(state);
    hireStaff(state, "line_cook");
    expect(JSON.stringify(state)).toBe(before);
  });
});

describe("getStaffCookSpeedMultiplier", () => {
  it("returns 1.0 with no staff", () => {
    expect(getStaffCookSpeedMultiplier(createInitialState())).toBe(1.0);
  });

  it("returns 1.15 with line cook level 1", () => {
    const state = stateWith({
      staff: { line_cook: { hired: true, level: 1 } },
    });
    expect(getStaffCookSpeedMultiplier(state)).toBeCloseTo(1.15);
  });

  it("returns 1.3 with line cook level 2", () => {
    const state = stateWith({
      staff: { line_cook: { hired: true, level: 2 } },
    });
    expect(getStaffCookSpeedMultiplier(state)).toBeCloseTo(1.3);
  });

  it("ignores non-hired staff", () => {
    const state = stateWith({
      staff: { line_cook: { hired: false, level: 5 } },
    });
    expect(getStaffCookSpeedMultiplier(state)).toBe(1.0);
  });
});

describe("getStaffSellSpeedMultiplier", () => {
  it("returns 1.0 with no staff", () => {
    expect(getStaffSellSpeedMultiplier(createInitialState())).toBe(1.0);
  });

  it("stacks cashier and marketing intern", () => {
    const state = stateWith({
      staff: {
        cashier: { hired: true, level: 2 }, // +15% * 2 = +30%
        marketing_intern: { hired: true, level: 1 }, // +10% * 1 = +10%
      },
    });
    // 1.0 + 0.30 + 0.10 = 1.40
    expect(getStaffSellSpeedMultiplier(state)).toBeCloseTo(1.4);
  });
});

describe("getStaffSaleValueMultiplier", () => {
  it("returns 1.0 with no staff", () => {
    expect(getStaffSaleValueMultiplier(createInitialState())).toBe(1.0);
  });

  it("stacks sous chef and health inspector", () => {
    const state = stateWith({
      staff: {
        sous_chef: { hired: true, level: 2 }, // +10% * 2 = +20%
        health_inspector: { hired: true, level: 1 }, // +5% * 1 = +5%
      },
    });
    // 1.0 + 0.20 + 0.05 = 1.25
    expect(getStaffSaleValueMultiplier(state)).toBeCloseTo(1.25);
  });
});

describe("getAccountantDiscount", () => {
  it("returns 1.0 with no accountant", () => {
    expect(getAccountantDiscount(createInitialState())).toBe(1.0);
  });

  it("returns 0.95 with accountant level 1", () => {
    const state = stateWith({
      staff: { accountant: { hired: true, level: 1 } },
    });
    expect(getAccountantDiscount(state)).toBeCloseTo(0.95);
  });

  it("caps at 0.7 (30% discount) at max level 6", () => {
    const state = stateWith({
      staff: { accountant: { hired: true, level: 6 } },
    });
    expect(getAccountantDiscount(state)).toBeCloseTo(0.7);
  });

  it("does not apply when accountant is not hired", () => {
    const state = stateWith({
      staff: { accountant: { hired: false, level: 3 } },
    });
    expect(getAccountantDiscount(state)).toBe(1.0);
  });
});
