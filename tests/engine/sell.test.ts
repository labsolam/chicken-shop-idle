import { describe, it, expect } from "vitest";
import { sellChickens } from "@engine/sell";
import { createInitialState, GameState } from "../../src/types/game-state";

function stateWith(overrides: Partial<GameState>): GameState {
  return { ...createInitialState(), ...overrides };
}

describe("sellChickens", () => {
  it("sells all ready chickens and adds money", () => {
    const state = stateWith({
      chickensReady: 5,
      chickenPriceInCents: 100,
      money: 0,
    });
    const result = sellChickens(state);
    expect(result.chickensReady).toBe(0);
    expect(result.money).toBe(500);
  });

  it("adds to existing money", () => {
    const state = stateWith({
      chickensReady: 3,
      chickenPriceInCents: 150,
      money: 200,
    });
    const result = sellChickens(state);
    expect(result.money).toBe(650);
  });

  it("does nothing when no chickens are ready", () => {
    const state = stateWith({ chickensReady: 0, money: 100 });
    const result = sellChickens(state);
    expect(result.money).toBe(100);
    expect(result.chickensReady).toBe(0);
  });

  it("returns a new object without mutating the input", () => {
    const state = stateWith({ chickensReady: 5, money: 0 });
    const original = { ...state };
    sellChickens(state);
    expect(state).toEqual(original);
  });
});
