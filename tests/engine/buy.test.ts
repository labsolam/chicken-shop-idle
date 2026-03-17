import { describe, it, expect } from "vitest";
import {
  getUpgradeCost,
  buyUpgrade,
  getEffectiveCookTime,
  getEffectiveSellTime,
  getEffectiveChickenPrice,
  getColdStorageCapacity,
  getCookingSlots,
  getSellingRegisters,
  getTipChance,
  getTipBonus,
} from "@engine/buy";
import { createInitialState, GameState } from "../../src/types/game-state";

function stateWith(overrides: Partial<GameState>): GameState {
  return { ...createInitialState(), ...overrides };
}

describe("getUpgradeCost", () => {
  it("returns base cost for cookSpeed at level 0: floor(500 * 2.3^0) = 500", () => {
    expect(getUpgradeCost("cookSpeed", 0)).toBe(500);
  });

  it("returns base cost for sellSpeed at level 0: 500", () => {
    expect(getUpgradeCost("sellSpeed", 0)).toBe(500);
  });

  it("returns base cost for chickenValue at level 0: floor(1000 * 3.5^0) = 1000", () => {
    expect(getUpgradeCost("chickenValue", 0)).toBe(1000);
  });

  it("returns first cold storage cost: 1500 cents ($15)", () => {
    expect(getUpgradeCost("coldStorage", 0)).toBe(1500);
  });

  it("returns second cold storage cost: 7500 cents ($75)", () => {
    expect(getUpgradeCost("coldStorage", 1)).toBe(7500);
  });

  it("returns cooking slots cost at level 0: floor(5000 * 10^0) = 5000 ($50)", () => {
    expect(getUpgradeCost("cookingSlots", 0)).toBe(5000);
  });

  it("returns cooking slots cost at level 1: floor(5000 * 10^1) = 50000 ($500)", () => {
    expect(getUpgradeCost("cookingSlots", 1)).toBe(50000);
  });

  it("returns selling registers cost at level 0: floor(3000 * 10^0) = 3000 ($30)", () => {
    expect(getUpgradeCost("sellingRegisters", 0)).toBe(3000);
  });

  it("returns selling registers cost at level 1: floor(3000 * 10^1) = 30000 ($300)", () => {
    expect(getUpgradeCost("sellingRegisters", 1)).toBe(30000);
  });

  it("cookSpeed cost increases with level (exponential)", () => {
    const cost0 = getUpgradeCost("cookSpeed", 0);
    const cost1 = getUpgradeCost("cookSpeed", 1);
    const cost2 = getUpgradeCost("cookSpeed", 2);
    expect(cost1).toBeGreaterThan(cost0);
    expect(cost2).toBeGreaterThan(cost1);
  });

  it("chickenValue cost at level 1: floor(1000 * 3.5^1) = 3500", () => {
    expect(getUpgradeCost("chickenValue", 1)).toBe(3500);
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

  it("deducts cost and increments sell speed level", () => {
    const cost = getUpgradeCost("sellSpeed", 0);
    const state = stateWith({ money: cost, sellSpeedLevel: 0 });
    const result = buyUpgrade(state, "sellSpeed");
    expect(result.sellSpeedLevel).toBe(1);
    expect(result.money).toBe(0);
  });

  it("deducts cost and increments chicken value level", () => {
    const cost = getUpgradeCost("chickenValue", 0);
    const state = stateWith({ money: cost, chickenValueLevel: 0 });
    const result = buyUpgrade(state, "chickenValue");
    expect(result.chickenValueLevel).toBe(1);
    expect(result.money).toBe(0);
  });

  it("deducts cost and increments cold storage level", () => {
    const cost = getUpgradeCost("coldStorage", 0);
    const state = stateWith({ money: cost, coldStorageLevel: 0 });
    const result = buyUpgrade(state, "coldStorage");
    expect(result.coldStorageLevel).toBe(1);
    expect(result.money).toBe(0);
  });

  it("deducts cost and increments cooking slots level", () => {
    const cost = getUpgradeCost("cookingSlots", 0);
    const state = stateWith({ money: cost, cookingSlotsLevel: 0 });
    const result = buyUpgrade(state, "cookingSlots");
    expect(result.cookingSlotsLevel).toBe(1);
    expect(result.money).toBe(0);
  });

  it("deducts cost and increments selling registers level", () => {
    const cost = getUpgradeCost("sellingRegisters", 0);
    const state = stateWith({ money: cost, sellingRegistersLevel: 0 });
    const result = buyUpgrade(state, "sellingRegisters");
    expect(result.sellingRegistersLevel).toBe(1);
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

  it("returns unchanged state when cookSpeed is at cap (30)", () => {
    const state = stateWith({ money: 1_000_000_000, cookSpeedLevel: 30 });
    const result = buyUpgrade(state, "cookSpeed");
    expect(result.cookSpeedLevel).toBe(30);
    expect(result.money).toBe(1_000_000_000);
  });

  it("returns unchanged state when sellSpeed is at cap (30)", () => {
    const state = stateWith({ money: 1_000_000_000, sellSpeedLevel: 30 });
    const result = buyUpgrade(state, "sellSpeed");
    expect(result.sellSpeedLevel).toBe(30);
  });

  it("returns unchanged state when chickenValue is at cap (25)", () => {
    const state = stateWith({
      money: 1_000_000_000_000,
      chickenValueLevel: 25,
    });
    const result = buyUpgrade(state, "chickenValue");
    expect(result.chickenValueLevel).toBe(25);
  });

  it("returns unchanged state when coldStorage is at cap (10)", () => {
    const state = stateWith({ money: 1_000_000_000_000, coldStorageLevel: 10 });
    const result = buyUpgrade(state, "coldStorage");
    expect(result.coldStorageLevel).toBe(10);
  });

  it("returns unchanged state when cookingSlots is at cap (10)", () => {
    const state = stateWith({
      money: 1_000_000_000_000,
      cookingSlotsLevel: 10,
    });
    const result = buyUpgrade(state, "cookingSlots");
    expect(result.cookingSlotsLevel).toBe(10);
  });

  it("returns unchanged state when sellingRegisters is at cap (10)", () => {
    const state = stateWith({
      money: 1_000_000_000_000,
      sellingRegistersLevel: 10,
    });
    const result = buyUpgrade(state, "sellingRegisters");
    expect(result.sellingRegistersLevel).toBe(10);
  });
});

describe("getEffectiveCookTime", () => {
  it("returns base cook time at level 0", () => {
    expect(getEffectiveCookTime(10, 0)).toBe(10);
  });

  it("decreases cook time with higher levels (0.85^level formula)", () => {
    expect(getEffectiveCookTime(10, 1)).toBeCloseTo(8.5);
    expect(getEffectiveCookTime(10, 2)).toBeCloseTo(7.225);
  });

  it("never goes below 0.1 seconds", () => {
    expect(getEffectiveCookTime(10, 100)).toBeGreaterThanOrEqual(0.1);
    expect(getEffectiveCookTime(10, 100)).toBeLessThanOrEqual(0.15);
  });

  it("works with different recipe base times", () => {
    expect(getEffectiveCookTime(15, 0)).toBe(15);
    expect(getEffectiveCookTime(15, 1)).toBeCloseTo(12.75);
  });
});

describe("getEffectiveSellTime", () => {
  it("returns 10s at level 0", () => {
    expect(getEffectiveSellTime(0)).toBe(10);
  });

  it("decreases with higher levels (0.85^level)", () => {
    expect(getEffectiveSellTime(1)).toBeCloseTo(8.5);
    expect(getEffectiveSellTime(2)).toBeCloseTo(7.225);
  });

  it("never goes below 0.1 seconds", () => {
    expect(getEffectiveSellTime(100)).toBeGreaterThanOrEqual(0.1);
    expect(getEffectiveSellTime(100)).toBeLessThanOrEqual(0.15);
  });
});

describe("getEffectiveChickenPrice", () => {
  it("returns base price at level 0 (1.0x multiplier)", () => {
    expect(getEffectiveChickenPrice(50, 0)).toBe(50);
  });

  it("applies 1.2x multiplier at level 1", () => {
    expect(getEffectiveChickenPrice(50, 1)).toBe(60);
  });

  it("applies 1.4x multiplier at level 2", () => {
    expect(getEffectiveChickenPrice(50, 2)).toBe(70);
  });

  it("applies 50x multiplier at level 25 (cap)", () => {
    expect(getEffectiveChickenPrice(50, 25)).toBe(2500);
  });

  it("scales with recipe base value", () => {
    expect(getEffectiveChickenPrice(100, 0)).toBe(100);
    expect(getEffectiveChickenPrice(100, 1)).toBe(120);
  });

  it("increases price with higher levels", () => {
    const base = getEffectiveChickenPrice(50, 0);
    const lvl1 = getEffectiveChickenPrice(50, 1);
    const lvl5 = getEffectiveChickenPrice(50, 5);
    expect(lvl1).toBeGreaterThan(base);
    expect(lvl5).toBeGreaterThan(lvl1);
  });
});

describe("getColdStorageCapacity", () => {
  it("returns 10 at level 0", () => {
    expect(getColdStorageCapacity(0)).toBe(10);
  });

  it("returns 25 at level 1", () => {
    expect(getColdStorageCapacity(1)).toBe(25);
  });

  it("returns 25000 at level 10 (max)", () => {
    expect(getColdStorageCapacity(10)).toBe(25000);
  });
});

describe("getCookingSlots", () => {
  it("returns 1 at level 0", () => {
    expect(getCookingSlots(0)).toBe(1);
  });

  it("returns 2 at level 1", () => {
    expect(getCookingSlots(1)).toBe(2);
  });

  it("returns 30 at level 10 (max)", () => {
    expect(getCookingSlots(10)).toBe(30);
  });
});

describe("getSellingRegisters", () => {
  it("returns 1 at level 0", () => {
    expect(getSellingRegisters(0)).toBe(1);
  });

  it("returns 2 at level 1", () => {
    expect(getSellingRegisters(1)).toBe(2);
  });

  it("returns 30 at level 10 (max)", () => {
    expect(getSellingRegisters(10)).toBe(30);
  });
});

describe("getTipChance", () => {
  it("returns 0 at level 0 (no tips)", () => {
    expect(getTipChance(0)).toBe(0);
  });

  it("returns 0.05 at level 1 (5% chance)", () => {
    expect(getTipChance(1)).toBe(0.05);
  });

  it("returns 0.5 at level 10 (50% chance)", () => {
    expect(getTipChance(10)).toBe(0.5);
  });

  it("increases with level", () => {
    expect(getTipChance(2)).toBeGreaterThan(getTipChance(1));
    expect(getTipChance(5)).toBeGreaterThan(getTipChance(2));
  });
});

describe("getTipBonus", () => {
  it("returns 0 at level 0 (no bonus)", () => {
    expect(getTipBonus(0)).toBe(0);
  });

  it("returns 0.25 at level 1 (+25% of sale value)", () => {
    expect(getTipBonus(1)).toBe(0.25);
  });

  it("returns 2.0 at level 10 (+200% of sale value)", () => {
    expect(getTipBonus(10)).toBe(2.0);
  });
});

describe("getUpgradeCost — tips", () => {
  it("tips cost at level 0 (L0→L1): 500_000 cents ($5K)", () => {
    expect(getUpgradeCost("tips", 0)).toBe(500_000);
  });

  it("tips cost at level 1 (L1→L2): 1_250_000 cents ($12.5K)", () => {
    expect(getUpgradeCost("tips", 1)).toBe(1_250_000);
  });

  it("tips cost increases with level", () => {
    expect(getUpgradeCost("tips", 1)).toBeGreaterThan(
      getUpgradeCost("tips", 0),
    );
    expect(getUpgradeCost("tips", 2)).toBeGreaterThan(
      getUpgradeCost("tips", 1),
    );
  });
});

describe("buyUpgrade — tips", () => {
  it("deducts cost and increments tips level", () => {
    const cost = getUpgradeCost("tips", 0);
    const state = stateWith({ money: cost, tipsLevel: 0 });
    const result = buyUpgrade(state, "tips");
    expect(result.tipsLevel).toBe(1);
    expect(result.money).toBe(0);
  });

  it("returns unchanged state when money is insufficient", () => {
    const state = stateWith({ money: 0, tipsLevel: 0 });
    const result = buyUpgrade(state, "tips");
    expect(result.tipsLevel).toBe(0);
    expect(result.money).toBe(0);
  });

  it("returns unchanged state when tips is at cap (10)", () => {
    const state = stateWith({ money: 1_000_000_000_000, tipsLevel: 10 });
    const result = buyUpgrade(state, "tips");
    expect(result.tipsLevel).toBe(10);
    expect(result.money).toBe(1_000_000_000_000);
  });
});
