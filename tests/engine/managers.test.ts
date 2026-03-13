import { describe, it, expect } from "vitest";
import {
  hireManager,
  upgradeManager,
  getManagerUpgradeCost,
  getManagerInterval,
  getManagerBatchSize,
  isManagerUnlocked,
  applyClickBonus,
  MANAGER_HIRE_COSTS,
  MANAGER_BASE_INTERVALS,
  MANAGER_MAX_LEVEL,
} from "@engine/managers";
import { createInitialState, GameState } from "../../src/types/game-state";

function stateWith(overrides: Partial<GameState>): GameState {
  return { ...createInitialState(), ...overrides };
}

// ─────────────────────────────────────────
// isManagerUnlocked
// ─────────────────────────────────────────

describe("isManagerUnlocked", () => {
  it("Chef Carmen unlocks at $25K revenue (2_500_000 cents)", () => {
    expect(
      isManagerUnlocked(stateWith({ totalRevenueCents: 2_499_999 }), "cook"),
    ).toBe(false);
    expect(
      isManagerUnlocked(stateWith({ totalRevenueCents: 2_500_000 }), "cook"),
    ).toBe(true);
  });

  it("Seller Sam unlocks at $25K revenue (2_500_000 cents)", () => {
    expect(
      isManagerUnlocked(stateWith({ totalRevenueCents: 2_499_999 }), "sell"),
    ).toBe(false);
    expect(
      isManagerUnlocked(stateWith({ totalRevenueCents: 2_500_000 }), "sell"),
    ).toBe(true);
  });

  it("Buyer Bob unlocks at $50K revenue (5_000_000 cents)", () => {
    expect(
      isManagerUnlocked(stateWith({ totalRevenueCents: 4_999_999 }), "buyer"),
    ).toBe(false);
    expect(
      isManagerUnlocked(stateWith({ totalRevenueCents: 5_000_000 }), "buyer"),
    ).toBe(true);
  });
});

// ─────────────────────────────────────────
// getManagerInterval
// ─────────────────────────────────────────

describe("getManagerInterval", () => {
  it("returns base interval at level 1 (no speed bonus)", () => {
    expect(getManagerInterval("buyer", 1)).toBeCloseTo(3000);
    expect(getManagerInterval("cook", 1)).toBeCloseTo(2000);
    expect(getManagerInterval("sell", 1)).toBeCloseTo(2000);
  });

  it("level 2 = +25% speed → interval / 1.25", () => {
    expect(getManagerInterval("buyer", 2)).toBeCloseTo(3000 / 1.25);
    expect(getManagerInterval("cook", 2)).toBeCloseTo(2000 / 1.25);
  });

  it("level 4 = +100% speed → interval / 2", () => {
    expect(getManagerInterval("buyer", 4)).toBeCloseTo(3000 / 2);
  });

  it("level 10 = +2000% speed → interval / 21", () => {
    expect(getManagerInterval("cook", 10)).toBeCloseTo(2000 / 21);
  });
});

// ─────────────────────────────────────────
// getManagerBatchSize
// ─────────────────────────────────────────

describe("getManagerBatchSize", () => {
  it("levels 1-4 have batch size 1", () => {
    for (let level = 1; level <= 4; level++) {
      expect(getManagerBatchSize(level)).toBe(1);
    }
  });

  it("level 5 has batch size 2", () => {
    expect(getManagerBatchSize(5)).toBe(2);
  });

  it("level 7 has batch size 6", () => {
    expect(getManagerBatchSize(7)).toBe(6);
  });

  it("level 10 has batch size 51", () => {
    expect(getManagerBatchSize(10)).toBe(51);
  });
});

// ─────────────────────────────────────────
// getManagerUpgradeCost
// ─────────────────────────────────────────

describe("getManagerUpgradeCost", () => {
  it("level 1→2 costs hireCost × 5^1", () => {
    expect(getManagerUpgradeCost("cook", 1)).toBe(
      Math.round(MANAGER_HIRE_COSTS.cook * 5),
    );
    expect(getManagerUpgradeCost("sell", 1)).toBe(
      Math.round(MANAGER_HIRE_COSTS.sell * 5),
    );
    expect(getManagerUpgradeCost("buyer", 1)).toBe(
      Math.round(MANAGER_HIRE_COSTS.buyer * 5),
    );
  });

  it("level 2→3 costs hireCost × 5^2", () => {
    expect(getManagerUpgradeCost("cook", 2)).toBe(
      Math.round(MANAGER_HIRE_COSTS.cook * 25),
    );
  });

  it("level 9→10 costs hireCost × 5^9", () => {
    expect(getManagerUpgradeCost("buyer", 9)).toBe(
      Math.round(MANAGER_HIRE_COSTS.buyer * Math.pow(5, 9)),
    );
  });
});

// ─────────────────────────────────────────
// hireManager
// ─────────────────────────────────────────

describe("hireManager", () => {
  it("hires Chef Carmen when unlocked and affordable", () => {
    const state = stateWith({
      totalRevenueCents: 2_500_000,
      money: MANAGER_HIRE_COSTS.cook + 100,
    });
    const result = hireManager(state, "cook");
    expect(result.managers.cook.hired).toBe(true);
    expect(result.money).toBe(100);
  });

  it("returns unchanged state when not unlocked", () => {
    const state = stateWith({
      totalRevenueCents: 0,
      money: 10_000_000,
    });
    const result = hireManager(state, "cook");
    expect(result.managers.cook.hired).toBe(false);
    expect(result.money).toBe(10_000_000);
  });

  it("returns unchanged state when cannot afford", () => {
    const state = stateWith({
      totalRevenueCents: 5_000_000,
      money: 0,
    });
    const result = hireManager(state, "cook");
    expect(result.managers.cook.hired).toBe(false);
  });

  it("returns unchanged state when already hired", () => {
    const state = stateWith({
      totalRevenueCents: 5_000_000,
      money: 10_000_000,
      managers: {
        buyer: { hired: false, level: 1, elapsedMs: 0 },
        cook: { hired: true, level: 1, elapsedMs: 0 },
        sell: { hired: false, level: 1, elapsedMs: 0 },
      },
    });
    const moneyBefore = state.money;
    const result = hireManager(state, "cook");
    expect(result.money).toBe(moneyBefore); // no double-charge
  });

  it("does not mutate input state", () => {
    const state = stateWith({
      totalRevenueCents: 2_500_000,
      money: 1_000_000,
    });
    const original = JSON.parse(JSON.stringify(state)) as GameState;
    hireManager(state, "cook");
    expect(state.managers.cook.hired).toBe(original.managers.cook.hired);
  });
});

// ─────────────────────────────────────────
// upgradeManager
// ─────────────────────────────────────────

describe("upgradeManager", () => {
  it("upgrades hired manager from level 1 to 2", () => {
    const upgradeCost = getManagerUpgradeCost("cook", 1);
    const state = stateWith({
      money: upgradeCost + 500,
      managers: {
        buyer: { hired: false, level: 1, elapsedMs: 0 },
        cook: { hired: true, level: 1, elapsedMs: 0 },
        sell: { hired: false, level: 1, elapsedMs: 0 },
      },
    });
    const result = upgradeManager(state, "cook");
    expect(result.managers.cook.level).toBe(2);
    expect(result.money).toBe(500);
  });

  it("returns unchanged state when manager not hired", () => {
    const state = stateWith({ money: 100_000_000 });
    const result = upgradeManager(state, "cook");
    expect(result.managers.cook.level).toBe(1);
    expect(result.money).toBe(100_000_000);
  });

  it("returns unchanged state when at max level", () => {
    const state = stateWith({
      money: 100_000_000_000,
      managers: {
        buyer: { hired: false, level: 1, elapsedMs: 0 },
        cook: { hired: true, level: MANAGER_MAX_LEVEL, elapsedMs: 0 },
        sell: { hired: false, level: 1, elapsedMs: 0 },
      },
    });
    const result = upgradeManager(state, "cook");
    expect(result.managers.cook.level).toBe(MANAGER_MAX_LEVEL);
  });

  it("returns unchanged state when cannot afford", () => {
    const state = stateWith({
      money: 0,
      managers: {
        buyer: { hired: false, level: 1, elapsedMs: 0 },
        cook: { hired: true, level: 1, elapsedMs: 0 },
        sell: { hired: false, level: 1, elapsedMs: 0 },
      },
    });
    const result = upgradeManager(state, "cook");
    expect(result.managers.cook.level).toBe(1);
  });
});

// ─────────────────────────────────────────
// applyClickBonus
// ─────────────────────────────────────────

describe("applyClickBonus", () => {
  it("grants bonus when manager is hired and cooldown has expired", () => {
    const state = stateWith({
      money: 0,
      cookingRecipeId: "basic_fried",
      chickenValueLevel: 0,
      earnedMilestones: [],
      managers: {
        buyer: { hired: false, level: 1, elapsedMs: 0 },
        cook: { hired: true, level: 1, elapsedMs: 0 },
        sell: { hired: false, level: 1, elapsedMs: 0 },
      },
      lastClickTimestamps: { buyer: 0, cook: 0, sell: 0 },
    });
    const now = 5000;
    const result = applyClickBonus(state, "cook", now);
    expect(result.money).toBeGreaterThan(0);
    expect(result.lastClickTimestamps.cook).toBe(now);
  });

  it("does not grant bonus when manager is not hired", () => {
    const state = stateWith({
      money: 0,
      managers: {
        buyer: { hired: false, level: 1, elapsedMs: 0 },
        cook: { hired: false, level: 1, elapsedMs: 0 },
        sell: { hired: false, level: 1, elapsedMs: 0 },
      },
    });
    const result = applyClickBonus(state, "cook", 5000);
    expect(result.money).toBe(0);
  });

  it("does not grant bonus within 1s cooldown", () => {
    const state = stateWith({
      money: 0,
      managers: {
        buyer: { hired: false, level: 1, elapsedMs: 0 },
        cook: { hired: true, level: 1, elapsedMs: 0 },
        sell: { hired: false, level: 1, elapsedMs: 0 },
      },
      lastClickTimestamps: { buyer: 0, cook: 4500, sell: 0 }, // clicked 500ms ago
    });
    const result = applyClickBonus(state, "cook", 5000); // 500ms later (< 1s)
    expect(result.money).toBe(0);
  });

  it("grants bonus after cooldown expires (exactly 1000ms)", () => {
    const state = stateWith({
      money: 0,
      managers: {
        buyer: { hired: false, level: 1, elapsedMs: 0 },
        cook: { hired: true, level: 1, elapsedMs: 0 },
        sell: { hired: false, level: 1, elapsedMs: 0 },
      },
      lastClickTimestamps: { buyer: 0, cook: 4000, sell: 0 }, // clicked 1000ms ago
    });
    const result = applyClickBonus(state, "cook", 5000); // exactly 1s later
    expect(result.money).toBeGreaterThan(0);
  });

  it("does not mutate input state", () => {
    const state = stateWith({
      money: 1000,
      managers: {
        buyer: { hired: false, level: 1, elapsedMs: 0 },
        cook: { hired: true, level: 1, elapsedMs: 0 },
        sell: { hired: false, level: 1, elapsedMs: 0 },
      },
    });
    const original = { ...state };
    applyClickBonus(state, "cook", 9999);
    expect(state.money).toBe(original.money);
  });
});

// ─────────────────────────────────────────
// MANAGER_BASE_INTERVALS constants
// ─────────────────────────────────────────

describe("MANAGER_BASE_INTERVALS", () => {
  it("Buyer Bob has 3000ms base interval", () => {
    expect(MANAGER_BASE_INTERVALS.buyer).toBe(3000);
  });

  it("Chef Carmen has 2000ms base interval", () => {
    expect(MANAGER_BASE_INTERVALS.cook).toBe(2000);
  });

  it("Seller Sam has 2000ms base interval", () => {
    expect(MANAGER_BASE_INTERVALS.sell).toBe(2000);
  });
});
