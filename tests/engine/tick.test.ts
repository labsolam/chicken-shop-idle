import { describe, it, expect } from "vitest";
import { tick } from "@engine/tick";
import { createInitialState, GameState } from "../../src/types/game-state";

function stateWith(overrides: Partial<GameState>): GameState {
  return { ...createInitialState(), ...overrides };
}

describe("tick — cooking (basic recipe, 1 slot)", () => {
  it("advances cooking elapsed time", () => {
    const state = stateWith({ cookingCount: 1, cookingElapsedMs: 0 });
    const result = tick(state, 3000);
    expect(result.cookingElapsedMs).toBe(3000);
    expect(result.cookingCount).toBe(1);
  });

  it("completes a chicken after basic_fried cook time elapses (10s)", () => {
    const state = stateWith({
      cookingCount: 1,
      cookingElapsedMs: 0,
      cookSpeedLevel: 0,
      activeRecipe: "basic_fried",
      cookingRecipeId: "basic_fried",
    });
    const result = tick(state, 10000);
    expect(result.cookingCount).toBe(0);
    expect(result.chickensReady).toBe(1);
    expect(result.totalChickensCooked).toBe(1);
    expect(result.cookingElapsedMs).toBe(0);
  });

  it("carries over extra time to next chicken in queue", () => {
    const state = stateWith({
      cookingCount: 2,
      cookingElapsedMs: 0,
      cookSpeedLevel: 0,
      activeRecipe: "basic_fried",
      cookingRecipeId: "basic_fried",
    });
    const result = tick(state, 12000);
    expect(result.cookingCount).toBe(1);
    expect(result.chickensReady).toBe(1);
    expect(result.cookingElapsedMs).toBe(2000);
  });

  it("completes multiple chickens in one tick (1 slot processes 1 per cycle)", () => {
    const state = stateWith({
      cookingCount: 3,
      cookingElapsedMs: 0,
      cookSpeedLevel: 0,
      activeRecipe: "basic_fried",
      cookingRecipeId: "basic_fried",
    });
    const result = tick(state, 25000);
    expect(result.cookingCount).toBe(1);
    expect(result.chickensReady).toBe(2);
    expect(result.totalChickensCooked).toBe(2);
    expect(result.cookingElapsedMs).toBe(5000);
  });

  it("respects cook speed upgrades (0.85^level formula)", () => {
    // basic_fried: 10s, cookSpeedLevel=1 → 10 * 0.85 = 8.5s
    const state = stateWith({
      cookingCount: 1,
      cookingElapsedMs: 0,
      cookSpeedLevel: 1,
      activeRecipe: "basic_fried",
      cookingRecipeId: "basic_fried",
    });
    const result = tick(state, 8500);
    expect(result.cookingCount).toBe(0);
    expect(result.chickensReady).toBe(1);
  });

  it("does nothing when no chickens are cooking", () => {
    const state = stateWith({ cookingCount: 0, chickensReady: 3 });
    const result = tick(state, 10000);
    expect(result.cookingCount).toBe(0);
    expect(result.chickensReady).toBe(3);
  });

  it("resets cookingElapsedMs when queue empties", () => {
    const state = stateWith({
      cookingCount: 1,
      cookingElapsedMs: 5000,
      cookSpeedLevel: 0,
      activeRecipe: "basic_fried",
      cookingRecipeId: "basic_fried",
    });
    const result = tick(state, 8000);
    expect(result.cookingCount).toBe(0);
    expect(result.cookingElapsedMs).toBe(0);
  });
});

describe("tick — batch cooking (multiple slots)", () => {
  it("completes cookingSlots chickens per cycle (2 slots)", () => {
    const state = stateWith({
      cookingCount: 4,
      cookingElapsedMs: 0,
      cookSpeedLevel: 0,
      cookingSlotsLevel: 1, // 2 slots
      activeRecipe: "basic_fried",
      cookingRecipeId: "basic_fried",
    });
    const result = tick(state, 10000);
    expect(result.cookingCount).toBe(2);
    expect(result.chickensReady).toBe(2);
    expect(result.totalChickensCooked).toBe(2);
  });

  it("completes up to 3 slots per cycle then handles remainder", () => {
    const state = stateWith({
      cookingCount: 5,
      cookingElapsedMs: 0,
      cookSpeedLevel: 0,
      cookingSlotsLevel: 2, // 3 slots
      activeRecipe: "basic_fried",
      cookingRecipeId: "basic_fried",
    });
    // After 20s: 3 in first cycle + 2 in second cycle = 5 done
    const result = tick(state, 20000);
    expect(result.chickensReady).toBe(5);
    expect(result.cookingCount).toBe(0);
  });

  it("does not complete more slots than cookingCount", () => {
    const state = stateWith({
      cookingCount: 2,
      cookingElapsedMs: 0,
      cookSpeedLevel: 0,
      cookingSlotsLevel: 2, // 3 slots
      activeRecipe: "basic_fried",
      cookingRecipeId: "basic_fried",
    });
    const result = tick(state, 10000);
    expect(result.chickensReady).toBe(2);
    expect(result.cookingCount).toBe(0);
  });
});

describe("tick — recipe-based cook times", () => {
  it("uses grilled recipe cook time (15s)", () => {
    const state = stateWith({
      cookingCount: 1,
      cookingElapsedMs: 0,
      cookSpeedLevel: 0,
      activeRecipe: "grilled",
      cookingRecipeId: "grilled",
    });
    const result10 = tick(state, 10000);
    expect(result10.cookingCount).toBe(1); // not done yet
    const result15 = tick(state, 15000);
    expect(result15.cookingCount).toBe(0);
    expect(result15.chickensReady).toBe(1);
  });

  it("uses wings recipe cook time (8s)", () => {
    const state = stateWith({
      cookingCount: 1,
      cookingElapsedMs: 0,
      cookSpeedLevel: 0,
      activeRecipe: "wings",
      cookingRecipeId: "wings",
    });
    const result = tick(state, 8000);
    expect(result.cookingCount).toBe(0);
    expect(result.chickensReady).toBe(1);
  });

  it("syncs cookingRecipeId to activeRecipe when cookingCount reaches 0", () => {
    const state = stateWith({
      cookingCount: 1,
      cookingElapsedMs: 0,
      cookSpeedLevel: 0,
      activeRecipe: "grilled",
      cookingRecipeId: "basic_fried",
    });
    const result = tick(state, 10000);
    expect(result.cookingCount).toBe(0);
    expect(result.cookingRecipeId).toBe("grilled");
  });
});

describe("tick — selling (basic recipe, 1 register)", () => {
  it("advances selling elapsed time", () => {
    const state = stateWith({
      sellingCount: 1,
      sellingElapsedMs: 0,
      sellSpeedLevel: 0,
    });
    const result = tick(state, 4000);
    expect(result.sellingElapsedMs).toBe(4000);
    expect(result.sellingCount).toBe(1);
  });

  it("completes a sale after 10s (basic_fried: 50 cents at level 0)", () => {
    const state = stateWith({
      sellingCount: 1,
      sellingElapsedMs: 0,
      sellSpeedLevel: 0,
      money: 0,
      chickenValueLevel: 0,
      activeRecipe: "basic_fried",
      cookingRecipeId: "basic_fried",
    });
    const result = tick(state, 10000);
    expect(result.sellingCount).toBe(0);
    expect(result.money).toBe(50);
    expect(result.sellingElapsedMs).toBe(0);
  });

  it("carries over extra time to next chicken for sale", () => {
    const state = stateWith({
      sellingCount: 2,
      sellingElapsedMs: 0,
      sellSpeedLevel: 0,
      money: 0,
      chickenValueLevel: 0,
      cookingRecipeId: "basic_fried",
    });
    const result = tick(state, 15000);
    expect(result.sellingCount).toBe(1);
    expect(result.money).toBe(50);
    expect(result.sellingElapsedMs).toBe(5000);
  });

  it("completes multiple sales in one tick", () => {
    const state = stateWith({
      sellingCount: 3,
      sellingElapsedMs: 0,
      sellSpeedLevel: 0,
      money: 0,
      cookingRecipeId: "basic_fried",
    });
    const result = tick(state, 25000);
    expect(result.sellingCount).toBe(1);
    expect(result.money).toBe(100); // 2 * 50 cents
    expect(result.sellingElapsedMs).toBe(5000);
  });

  it("uses effective chicken price with value upgrades", () => {
    // basic_fried base = 50, level 1 multiplier = 1.2x → 60
    const state = stateWith({
      sellingCount: 1,
      sellingElapsedMs: 0,
      sellSpeedLevel: 0,
      money: 0,
      chickenValueLevel: 1,
      cookingRecipeId: "basic_fried",
    });
    const result = tick(state, 10000);
    expect(result.money).toBe(60);
  });

  it("does nothing when no chickens are selling", () => {
    const state = stateWith({ sellingCount: 0, money: 500 });
    const result = tick(state, 10000);
    expect(result.sellingCount).toBe(0);
    expect(result.money).toBe(500);
  });

  it("resets sellingElapsedMs when queue empties", () => {
    const state = stateWith({
      sellingCount: 1,
      sellingElapsedMs: 6000,
      sellSpeedLevel: 0,
      money: 0,
      cookingRecipeId: "basic_fried",
    });
    const result = tick(state, 7000);
    expect(result.sellingCount).toBe(0);
    expect(result.sellingElapsedMs).toBe(0);
  });

  it("respects sell speed upgrades (0.85^level)", () => {
    // sellSpeedLevel=1 → 10 * 0.85 = 8.5s
    const state = stateWith({
      sellingCount: 1,
      sellingElapsedMs: 0,
      sellSpeedLevel: 1,
      money: 0,
      cookingRecipeId: "basic_fried",
    });
    const result = tick(state, 8500);
    expect(result.sellingCount).toBe(0);
    expect(result.money).toBe(50);
  });
});

describe("tick — batch selling (multiple registers)", () => {
  it("completes sellingRegisters chickens per cycle (2 registers)", () => {
    const state = stateWith({
      sellingCount: 4,
      sellingElapsedMs: 0,
      sellSpeedLevel: 0,
      sellingRegistersLevel: 1, // 2 registers
      money: 0,
      cookingRecipeId: "basic_fried",
    });
    const result = tick(state, 10000);
    expect(result.sellingCount).toBe(2);
    expect(result.money).toBe(100); // 2 * 50 cents
  });
});

describe("tick — stat tracking", () => {
  it("tracks totalChickensSold when selling completes", () => {
    const state = stateWith({
      sellingCount: 3,
      sellingElapsedMs: 0,
      sellSpeedLevel: 0,
      totalChickensSold: 5,
      cookingRecipeId: "basic_fried",
    });
    const result = tick(state, 25000); // 2 complete
    expect(result.totalChickensSold).toBe(7);
  });

  it("tracks totalRevenueCents when selling completes", () => {
    const state = stateWith({
      sellingCount: 2,
      sellingElapsedMs: 0,
      sellSpeedLevel: 0,
      money: 0,
      totalRevenueCents: 100,
      cookingRecipeId: "basic_fried",
    });
    const result = tick(state, 25000); // 2 complete
    expect(result.totalRevenueCents).toBe(200); // 100 + 2*50
  });
});

describe("tick — both cooking and selling", () => {
  it("processes cooking and selling simultaneously", () => {
    const state = stateWith({
      cookingCount: 1,
      cookingElapsedMs: 0,
      cookSpeedLevel: 0,
      activeRecipe: "basic_fried",
      cookingRecipeId: "basic_fried",
      sellingCount: 1,
      sellingElapsedMs: 0,
      sellSpeedLevel: 0,
      money: 0,
    });
    const result = tick(state, 10000);
    expect(result.cookingCount).toBe(0);
    expect(result.chickensReady).toBe(1);
    expect(result.sellingCount).toBe(0);
    expect(result.money).toBe(50);
  });
});

describe("tick — milestone integration", () => {
  it("triggers sold_10 milestone when 10 chickens sold", () => {
    const state = stateWith({
      sellingCount: 10,
      sellingElapsedMs: 0,
      sellSpeedLevel: 0,
      totalChickensSold: 0,
      cookingRecipeId: "basic_fried",
      earnedMilestones: [],
    });
    const result = tick(state, 100000);
    expect(result.earnedMilestones).toContain("sold_10");
  });

  it("applies milestone multiplier to subsequent tick prices", () => {
    // First tick: earn sold_10 milestone (2x sale value)
    const state1 = stateWith({
      sellingCount: 10,
      sellingElapsedMs: 0,
      sellSpeedLevel: 0,
      money: 0,
      totalChickensSold: 0,
      cookingRecipeId: "basic_fried",
      earnedMilestones: [],
    });
    const afterFirst = tick(state1, 100000);
    expect(afterFirst.earnedMilestones).toContain("sold_10");

    // Second tick with milestone active
    const state2 = stateWith({
      ...afterFirst,
      sellingCount: 1,
      sellingElapsedMs: 0,
      money: 0,
    });
    const afterSecond = tick(state2, 10000);
    expect(afterSecond.money).toBe(100); // 50 * 2x milestone multiplier
  });
});

describe("tick — immutability", () => {
  it("returns a new object without mutating the input", () => {
    const state = stateWith({
      cookingCount: 1,
      sellingCount: 1,
      sellSpeedLevel: 0,
      activeRecipe: "basic_fried",
      cookingRecipeId: "basic_fried",
    });
    const original = { ...state };
    tick(state, 5000);
    expect(state).toEqual(original);
  });
});
