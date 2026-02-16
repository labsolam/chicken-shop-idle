import { describe, it, expect } from "vitest";
import { clickCook } from "@engine/click";
import { createInitialState, GameState } from "../../src/types/game-state";

function stateWith(overrides: Partial<GameState>): GameState {
  return { ...createInitialState(), ...overrides };
}

describe("clickCook", () => {
  it("queues one raw chicken for cooking", () => {
    const state = stateWith({ chickensBought: 5, cookingCount: 0 });
    const result = clickCook(state);
    expect(result.chickensBought).toBe(4);
    expect(result.cookingCount).toBe(1);
  });

  it("adds to existing cooking queue", () => {
    const state = stateWith({ chickensBought: 3, cookingCount: 2 });
    const result = clickCook(state);
    expect(result.chickensBought).toBe(2);
    expect(result.cookingCount).toBe(3);
  });

  it("does not change chickensReady (cooking is timed)", () => {
    const state = stateWith({ chickensBought: 1, chickensReady: 3 });
    const result = clickCook(state);
    expect(result.chickensReady).toBe(3);
  });

  it("does nothing when no raw chickens are available", () => {
    const state = stateWith({ chickensBought: 0, cookingCount: 1 });
    const result = clickCook(state);
    expect(result.chickensBought).toBe(0);
    expect(result.cookingCount).toBe(1);
  });

  it("does nothing from initial state (no raw chickens)", () => {
    const state = createInitialState();
    const result = clickCook(state);
    expect(result.cookingCount).toBe(0);
    expect(result.chickensBought).toBe(0);
  });

  it("works when exactly one raw chicken is available", () => {
    const state = stateWith({ chickensBought: 1, cookingCount: 0 });
    const result = clickCook(state);
    expect(result.chickensBought).toBe(0);
    expect(result.cookingCount).toBe(1);
  });

  it("returns a new object without mutating the input", () => {
    const state = stateWith({ chickensBought: 2, cookingCount: 1 });
    const original = { ...state };
    clickCook(state);
    expect(state).toEqual(original);
  });
});
