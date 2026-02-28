import { describe, it, expect } from "vitest";
import { clickCook, clickCookBatch, selectRecipe } from "@engine/click";
import { createInitialState, GameState } from "../../src/types/game-state";

function stateWith(overrides: Partial<GameState>): GameState {
  return { ...createInitialState(), ...overrides };
}

describe("clickCook", () => {
  it("queues one cook job and consumes 1 raw chicken (basic_fried)", () => {
    const state = stateWith({
      chickensBought: 5,
      cookingCount: 0,
      activeRecipe: "basic_fried",
    });
    const result = clickCook(state);
    expect(result.chickensBought).toBe(4);
    expect(result.cookingCount).toBe(1);
  });

  it("adds to existing cooking queue", () => {
    const state = stateWith({
      chickensBought: 3,
      cookingCount: 2,
      activeRecipe: "basic_fried",
    });
    const result = clickCook(state);
    expect(result.chickensBought).toBe(2);
    expect(result.cookingCount).toBe(3);
  });

  it("does not change chickensReady (cooking is timed)", () => {
    const state = stateWith({
      chickensBought: 1,
      chickensReady: 3,
      activeRecipe: "basic_fried",
    });
    const result = clickCook(state);
    expect(result.chickensReady).toBe(3);
  });

  it("does nothing when no raw chickens are available", () => {
    const state = stateWith({
      chickensBought: 0,
      cookingCount: 1,
      activeRecipe: "basic_fried",
    });
    const result = clickCook(state);
    expect(result.chickensBought).toBe(0);
    expect(result.cookingCount).toBe(1);
  });

  it("consumes 2 raw chickens for burger recipe (rawInput=2)", () => {
    const state = stateWith({
      chickensBought: 5,
      cookingCount: 0,
      activeRecipe: "burger",
      unlockedRecipes: ["basic_fried", "burger"],
    });
    const result = clickCook(state);
    expect(result.chickensBought).toBe(3);
    expect(result.cookingCount).toBe(1);
  });

  it("does nothing for burger when only 1 raw chicken available", () => {
    const state = stateWith({
      chickensBought: 1,
      cookingCount: 0,
      activeRecipe: "burger",
      unlockedRecipes: ["basic_fried", "burger"],
    });
    const result = clickCook(state);
    expect(result.chickensBought).toBe(1);
    expect(result.cookingCount).toBe(0);
  });

  it("works when exactly rawInput raw chickens are available", () => {
    const state = stateWith({
      chickensBought: 1,
      cookingCount: 0,
      activeRecipe: "basic_fried",
    });
    const result = clickCook(state);
    expect(result.chickensBought).toBe(0);
    expect(result.cookingCount).toBe(1);
  });

  it("returns a new object without mutating the input", () => {
    const state = stateWith({
      chickensBought: 2,
      cookingCount: 1,
      activeRecipe: "basic_fried",
    });
    const original = { ...state };
    clickCook(state);
    expect(state).toEqual(original);
  });
});

describe("clickCookBatch", () => {
  it("queues multiple cook jobs (basic_fried: 1 raw each)", () => {
    const state = stateWith({
      chickensBought: 10,
      cookingCount: 0,
      activeRecipe: "basic_fried",
    });
    const result = clickCookBatch(state, 5);
    expect(result.chickensBought).toBe(5);
    expect(result.cookingCount).toBe(5);
  });

  it("limits to available raw chickens", () => {
    const state = stateWith({
      chickensBought: 3,
      cookingCount: 0,
      activeRecipe: "basic_fried",
    });
    const result = clickCookBatch(state, 10);
    expect(result.chickensBought).toBe(0);
    expect(result.cookingCount).toBe(3);
  });

  it("accounts for rawInput when limiting (burger: 2 raw each)", () => {
    const state = stateWith({
      chickensBought: 5,
      cookingCount: 0,
      activeRecipe: "burger",
      unlockedRecipes: ["basic_fried", "burger"],
    });
    // floor(5/2) = 2 jobs possible, request 10 → 2 actual
    const result = clickCookBatch(state, 10);
    expect(result.cookingCount).toBe(2);
    expect(result.chickensBought).toBe(1); // 5 - 2*2 = 1 left
  });

  it("does nothing when no raw chickens", () => {
    const state = stateWith({
      chickensBought: 0,
      cookingCount: 0,
      activeRecipe: "basic_fried",
    });
    const result = clickCookBatch(state, 5);
    expect(result.cookingCount).toBe(0);
    expect(result.chickensBought).toBe(0);
  });

  it("returns a new object without mutating the input", () => {
    const state = stateWith({
      chickensBought: 5,
      cookingCount: 0,
      activeRecipe: "basic_fried",
    });
    const original = { ...state };
    clickCookBatch(state, 3);
    expect(state).toEqual(original);
  });
});

describe("selectRecipe", () => {
  it("switches active recipe when recipe is unlocked", () => {
    const state = stateWith({
      activeRecipe: "basic_fried",
      unlockedRecipes: ["basic_fried", "grilled"],
    });
    const result = selectRecipe(state, "grilled");
    expect(result.activeRecipe).toBe("grilled");
  });

  it("does not change cookingRecipeId (in-progress cooking unaffected)", () => {
    const state = stateWith({
      activeRecipe: "basic_fried",
      cookingRecipeId: "basic_fried",
      cookingCount: 1,
      unlockedRecipes: ["basic_fried", "grilled"],
    });
    const result = selectRecipe(state, "grilled");
    expect(result.activeRecipe).toBe("grilled");
    expect(result.cookingRecipeId).toBe("basic_fried"); // unchanged
  });

  it("returns state unchanged when recipe is locked", () => {
    const state = stateWith({
      activeRecipe: "basic_fried",
      unlockedRecipes: ["basic_fried"],
    });
    const result = selectRecipe(state, "grilled");
    expect(result.activeRecipe).toBe("basic_fried");
  });

  it("returns state unchanged for unknown recipe id", () => {
    const state = stateWith({
      activeRecipe: "basic_fried",
      unlockedRecipes: ["basic_fried"],
    });
    const result = selectRecipe(state, "nonexistent");
    expect(result.activeRecipe).toBe("basic_fried");
  });

  it("returns a new object without mutating the input", () => {
    const state = stateWith({
      activeRecipe: "basic_fried",
      unlockedRecipes: ["basic_fried", "grilled"],
    });
    const original = { ...state };
    selectRecipe(state, "grilled");
    expect(state).toEqual(original);
  });
});
