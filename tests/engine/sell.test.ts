import { describe, it, expect } from "vitest";
import { sellChickens } from "@engine/sell";
import { createInitialState, GameState } from "../../src/types/game-state";

function stateWith(overrides: Partial<GameState>): GameState {
  return { ...createInitialState(), ...overrides };
}

describe("sellChickens", () => {
  it("queues 1 ready chicken for selling", () => {
    const state = stateWith({ chickensReady: 5, sellingCount: 0 });
    const result = sellChickens(state);
    expect(result.chickensReady).toBe(4);
    expect(result.sellingCount).toBe(1);
  });

  it("adds 1 to existing selling queue", () => {
    const state = stateWith({ chickensReady: 3, sellingCount: 2 });
    const result = sellChickens(state);
    expect(result.chickensReady).toBe(2);
    expect(result.sellingCount).toBe(3);
  });

  it("does not change money (selling is timed)", () => {
    const state = stateWith({ chickensReady: 5, money: 200 });
    const result = sellChickens(state);
    expect(result.money).toBe(200);
  });

  it("does nothing when no chickens are ready", () => {
    const state = stateWith({ chickensReady: 0, money: 100, sellingCount: 0 });
    const result = sellChickens(state);
    expect(result.money).toBe(100);
    expect(result.chickensReady).toBe(0);
    expect(result.sellingCount).toBe(0);
  });

  it("returns a new object without mutating the input", () => {
    const state = stateWith({ chickensReady: 5, money: 0 });
    const original = { ...state };
    sellChickens(state);
    expect(state).toEqual(original);
  });
});
