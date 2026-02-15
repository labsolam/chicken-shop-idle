import { describe, it, expect } from "vitest";
import { clickCook } from "@engine/click";
import { createInitialState, GameState } from "../../src/types/game-state";

function stateWith(overrides: Partial<GameState>): GameState {
  return { ...createInitialState(), ...overrides };
}

describe("clickCook", () => {
  it("adds one ready chicken on click", () => {
    const state = stateWith({ chickensReady: 3 });
    const result = clickCook(state);
    expect(result.chickensReady).toBe(4);
  });

  it("increments totalChickensCooked", () => {
    const state = stateWith({ totalChickensCooked: 10 });
    const result = clickCook(state);
    expect(result.totalChickensCooked).toBe(11);
  });

  it("does not affect cookingProgress", () => {
    const state = stateWith({ cookingProgress: 0.5 });
    const result = clickCook(state);
    expect(result.cookingProgress).toBe(0.5);
  });

  it("works from initial state", () => {
    const state = createInitialState();
    const result = clickCook(state);
    expect(result.chickensReady).toBe(1);
    expect(result.totalChickensCooked).toBe(1);
  });

  it("returns a new object without mutating the input", () => {
    const state = stateWith({ chickensReady: 2, totalChickensCooked: 5 });
    const original = { ...state };
    clickCook(state);
    expect(state).toEqual(original);
  });
});
