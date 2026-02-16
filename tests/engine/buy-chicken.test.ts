import { describe, it, expect } from "vitest";
import { buyChicken, RAW_CHICKEN_COST } from "@engine/buy-chicken";
import { createInitialState, GameState } from "../../src/types/game-state";

function stateWith(overrides: Partial<GameState>): GameState {
  return { ...createInitialState(), ...overrides };
}

describe("buyChicken", () => {
  it("buys one raw chicken and deducts cost", () => {
    const state = stateWith({ money: 500, chickensBought: 0 });
    const result = buyChicken(state);
    expect(result.chickensBought).toBe(1);
    expect(result.money).toBe(500 - RAW_CHICKEN_COST);
  });

  it("adds to existing raw chickens", () => {
    const state = stateWith({ money: 500, chickensBought: 3 });
    const result = buyChicken(state);
    expect(result.chickensBought).toBe(4);
  });

  it("does nothing when money is insufficient", () => {
    const state = stateWith({ money: 10, chickensBought: 0 });
    const result = buyChicken(state);
    expect(result.chickensBought).toBe(0);
    expect(result.money).toBe(10);
  });

  it("does nothing when money is exactly 0", () => {
    const state = stateWith({ money: 0, chickensBought: 0 });
    const result = buyChicken(state);
    expect(result.chickensBought).toBe(0);
  });

  it("buys when money is exactly the cost", () => {
    const state = stateWith({ money: RAW_CHICKEN_COST, chickensBought: 0 });
    const result = buyChicken(state);
    expect(result.chickensBought).toBe(1);
    expect(result.money).toBe(0);
  });

  it("returns a new object without mutating the input", () => {
    const state = stateWith({ money: 500, chickensBought: 0 });
    const original = { ...state };
    buyChicken(state);
    expect(state).toEqual(original);
  });
});
