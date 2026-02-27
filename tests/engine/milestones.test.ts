import { describe, it, expect } from "vitest";
import {
  checkMilestones,
  getMilestoneMultiplier,
  getMilestoneCookSpeedMultiplier,
  getMilestoneSellSpeedMultiplier,
  MILESTONES,
} from "../../src/engine/milestones";
import { createInitialState, GameState } from "../../src/types/game-state";

function stateWith(overrides: Partial<GameState>): GameState {
  return { ...createInitialState(), ...overrides };
}

describe("checkMilestones", () => {
  it("does nothing when no thresholds are crossed", () => {
    const state = stateWith({ totalChickensSold: 5, totalRevenueCents: 100 });
    const result = checkMilestones(state);
    expect(result.earnedMilestones).toEqual([]);
  });

  it("triggers sold_10 when 10 chickens sold", () => {
    const state = stateWith({ totalChickensSold: 10 });
    const result = checkMilestones(state);
    expect(result.earnedMilestones).toContain("sold_10");
  });

  it("triggers sold_10 at threshold or above (11 sold)", () => {
    const state = stateWith({ totalChickensSold: 11 });
    const result = checkMilestones(state);
    expect(result.earnedMilestones).toContain("sold_10");
  });

  it("triggers revenue_500 when $500 earned (50000 cents)", () => {
    const state = stateWith({ totalRevenueCents: 50000 });
    const result = checkMilestones(state);
    expect(result.earnedMilestones).toContain("revenue_500");
  });

  it("does not re-trigger already earned milestones", () => {
    const state = stateWith({
      totalChickensSold: 100,
      earnedMilestones: ["sold_10"],
    });
    const result = checkMilestones(state);
    const sold10Count = result.earnedMilestones.filter(
      (m) => m === "sold_10",
    ).length;
    expect(sold10Count).toBe(1); // not added again
  });

  it("triggers multiple milestones at once when thresholds crossed simultaneously", () => {
    // sold_10 (threshold=10) and sold_50 (threshold=50) both triggered at exactly 50
    // sold_100 (threshold=100) is NOT triggered yet
    const state = stateWith({ totalChickensSold: 50 });
    const result = checkMilestones(state);
    expect(result.earnedMilestones).toContain("sold_10");
    expect(result.earnedMilestones).toContain("sold_50");
    expect(result.earnedMilestones).not.toContain("sold_100");
  });

  it("unlocks grilled recipe when revenue_500 milestone fires", () => {
    const state = stateWith({ totalRevenueCents: 50000 });
    const result = checkMilestones(state);
    expect(result.unlockedRecipes).toContain("grilled");
  });

  it("unlocks wings recipe when sold_250 milestone fires", () => {
    const state = stateWith({ totalChickensSold: 250 });
    const result = checkMilestones(state);
    expect(result.unlockedRecipes).toContain("wings");
  });

  it("preserves already unlocked recipes when adding new ones", () => {
    const state = stateWith({
      totalChickensSold: 250,
      unlockedRecipes: ["basic_fried"],
    });
    const result = checkMilestones(state);
    expect(result.unlockedRecipes).toContain("basic_fried");
    expect(result.unlockedRecipes).toContain("wings");
  });

  it("returns a new object without mutating the input", () => {
    const state = stateWith({ totalChickensSold: 10 });
    const original = {
      ...state,
      earnedMilestones: [...state.earnedMilestones],
    };
    checkMilestones(state);
    expect(state.earnedMilestones).toEqual(original.earnedMilestones);
  });

  it("triggers milestones in order (multiple at once)", () => {
    const state = stateWith({ totalChickensSold: 250 });
    const result = checkMilestones(state);
    // Should include sold_10, sold_50, sold_100, sold_250
    expect(result.earnedMilestones).toContain("sold_10");
    expect(result.earnedMilestones).toContain("sold_50");
    expect(result.earnedMilestones).toContain("sold_100");
    expect(result.earnedMilestones).toContain("sold_250");
  });
});

describe("getMilestoneMultiplier", () => {
  it("returns 1.0 with no milestones earned", () => {
    const state = stateWith({ earnedMilestones: [] });
    expect(getMilestoneMultiplier(state)).toBe(1.0);
  });

  it("returns 2.0 after sold_10 (x2 sale value)", () => {
    const state = stateWith({ earnedMilestones: ["sold_10"] });
    expect(getMilestoneMultiplier(state)).toBe(2.0);
  });

  it("stacks multiplicatively (sold_10 × sold_100 = x2 × x2 = x4)", () => {
    const state = stateWith({
      earnedMilestones: ["sold_10", "sold_100"],
    });
    expect(getMilestoneMultiplier(state)).toBe(4.0);
  });

  it("combines sale value and all revenue milestones", () => {
    // sold_10 = x2, revenue_5k = x2 → x4 total
    const state = stateWith({
      earnedMilestones: ["sold_10", "revenue_5k"],
    });
    expect(getMilestoneMultiplier(state)).toBe(4.0);
  });
});

describe("getMilestoneCookSpeedMultiplier", () => {
  it("returns 1.0 with no milestones", () => {
    const state = stateWith({ earnedMilestones: [] });
    expect(getMilestoneCookSpeedMultiplier(state)).toBe(1.0);
  });

  it("returns 2.0 after sold_50 (x2 cooking speed)", () => {
    const state = stateWith({ earnedMilestones: ["sold_50"] });
    expect(getMilestoneCookSpeedMultiplier(state)).toBe(2.0);
  });

  it("stacks with allSpeedMultiplier milestones", () => {
    // sold_50 (x2 cook) + sold_1000 (x2 all) = x4
    const state = stateWith({
      earnedMilestones: ["sold_50", "sold_1000"],
    });
    expect(getMilestoneCookSpeedMultiplier(state)).toBe(4.0);
  });
});

describe("getMilestoneSellSpeedMultiplier", () => {
  it("returns 1.0 with no milestones", () => {
    const state = stateWith({ earnedMilestones: [] });
    expect(getMilestoneSellSpeedMultiplier(state)).toBe(1.0);
  });

  it("returns 2.0 after sold_1000 (x2 all speeds includes sell speed)", () => {
    const state = stateWith({ earnedMilestones: ["sold_1000"] });
    expect(getMilestoneSellSpeedMultiplier(state)).toBe(2.0);
  });
});

describe("MILESTONES array", () => {
  it("has all expected milestones defined", () => {
    const ids = MILESTONES.map((m) => m.id);
    expect(ids).toContain("sold_10");
    expect(ids).toContain("sold_50");
    expect(ids).toContain("sold_100");
    expect(ids).toContain("sold_250");
    expect(ids).toContain("revenue_500");
    expect(ids).toContain("revenue_5k");
  });
});
