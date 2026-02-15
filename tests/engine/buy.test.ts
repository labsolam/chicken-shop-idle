import { describe, it, expect } from "vitest";
import {
  getUpgradeCost,
  buyUpgrade,
  getEffectiveCookTime,
  getEffectiveChickenPrice,
} from "@engine/buy";
import { createInitialState, GameState } from "../../src/types/game-state";

function stateWith(overrides: Partial<GameState>): GameState {
  return { ...createInitialState(), ...overrides };
}

describe("getUpgradeCost", () => {
  it("returns base cost at level 0", () => {
    expect(getUpgradeCost("cookSpeed", 0)).toBe(500);
    expect(getUpgradeCost("chickenValue", 0)).toBe(500);
  });

  it("increases cost with level", () => {
    const cost0 = getUpgradeCost("cookSpeed", 0);
    const cost1 = getUpgradeCost("cookSpeed", 1);
    const cost2 = getUpgradeCost("cookSpeed", 2);
    expect(cost1).toBeGreaterThan(cost0);
    expect(cost2).toBeGreaterThan(cost1);
  });
});

describe("buyUpgrade", () => {
  it("deducts cost and increments cook speed level", () => {
    const cost = getUpgradeCost("cookSpeed", 0);
    const state = stateWith({ money: cost, cookSpeedLevel: 0 });
    const result = buyUpgrade(state, "cookSpeed");
    expect(result.cookSpeedLevel).toBe(1);
    expect(result.money).toBe(0);
  });

  it("deducts cost and increments chicken value level", () => {
    const cost = getUpgradeCost("chickenValue", 0);
    const state = stateWith({ money: cost, chickenValueLevel: 0 });
    const result = buyUpgrade(state, "chickenValue");
    expect(result.chickenValueLevel).toBe(1);
    expect(result.money).toBe(0);
  });

  it("returns unchanged state when money is insufficient", () => {
    const state = stateWith({ money: 0, cookSpeedLevel: 0 });
    const result = buyUpgrade(state, "cookSpeed");
    expect(result.cookSpeedLevel).toBe(0);
    expect(result.money).toBe(0);
  });

  it("keeps leftover money after purchase", () => {
    const cost = getUpgradeCost("cookSpeed", 0);
    const state = stateWith({ money: cost + 200, cookSpeedLevel: 0 });
    const result = buyUpgrade(state, "cookSpeed");
    expect(result.money).toBe(200);
  });

  it("uses correct cost for the current level", () => {
    const cost1 = getUpgradeCost("cookSpeed", 1);
    const state = stateWith({ money: cost1, cookSpeedLevel: 1 });
    const result = buyUpgrade(state, "cookSpeed");
    expect(result.cookSpeedLevel).toBe(2);
    expect(result.money).toBe(0);
  });

  it("returns a new object without mutating the input", () => {
    const cost = getUpgradeCost("cookSpeed", 0);
    const state = stateWith({ money: cost });
    const original = { ...state };
    buyUpgrade(state, "cookSpeed");
    expect(state).toEqual(original);
  });
});

describe("getEffectiveCookTime", () => {
  it("returns base cook time at level 0", () => {
    expect(getEffectiveCookTime(5, 0)).toBe(5);
  });

  it("decreases cook time with higher levels", () => {
    const base = getEffectiveCookTime(5, 0);
    const lvl1 = getEffectiveCookTime(5, 1);
    const lvl2 = getEffectiveCookTime(5, 2);
    expect(lvl1).toBeLessThan(base);
    expect(lvl2).toBeLessThan(lvl1);
  });

  it("never goes below 0.5 seconds", () => {
    expect(getEffectiveCookTime(5, 100)).toBeGreaterThanOrEqual(0.5);
  });
});

describe("getEffectiveChickenPrice", () => {
  it("returns base price at level 0", () => {
    expect(getEffectiveChickenPrice(100, 0)).toBe(100);
  });

  it("increases price with higher levels", () => {
    const base = getEffectiveChickenPrice(100, 0);
    const lvl1 = getEffectiveChickenPrice(100, 1);
    const lvl2 = getEffectiveChickenPrice(100, 2);
    expect(lvl1).toBeGreaterThan(base);
    expect(lvl2).toBeGreaterThan(lvl1);
  });
});
