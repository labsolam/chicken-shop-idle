import { describe, it, expect } from "vitest";
import { clickCook } from "@engine/click";
import { createInitialState, GameState } from "../../src/types/game-state";

function stateWith(overrides: Partial<GameState>): GameState {
  return { ...createInitialState(), ...overrides };
}

describe("clickCook", () => {
  it("converts one raw chicken into one ready chicken", () => {
    const state = stateWith({ chickensBought: 5, chickensReady: 3 });
    const result = clickCook(state);
    expect(result.chickensBought).toBe(4);
    expect(result.chickensReady).toBe(4);
  });

  it("increments totalChickensCooked", () => {
    const state = stateWith({
      chickensBought: 1,
      totalChickensCooked: 10,
    });
    const result = clickCook(state);
    expect(result.totalChickensCooked).toBe(11);
  });

  it("does nothing when no raw chickens are available", () => {
    const state = stateWith({ chickensBought: 0, chickensReady: 3 });
    const result = clickCook(state);
    expect(result.chickensBought).toBe(0);
    expect(result.chickensReady).toBe(3);
  });

  it("does nothing from initial state (no raw chickens)", () => {
    const state = createInitialState();
    const result = clickCook(state);
    expect(result.chickensReady).toBe(0);
    expect(result.totalChickensCooked).toBe(0);
  });

  it("works when exactly one raw chicken is available", () => {
    const state = stateWith({ chickensBought: 1, chickensReady: 0 });
    const result = clickCook(state);
    expect(result.chickensBought).toBe(0);
    expect(result.chickensReady).toBe(1);
    expect(result.totalChickensCooked).toBe(1);
  });

  it("returns a new object without mutating the input", () => {
    const state = stateWith({
      chickensBought: 2,
      chickensReady: 2,
      totalChickensCooked: 5,
    });
    const original = { ...state };
    clickCook(state);
    expect(state).toEqual(original);
  });
});
