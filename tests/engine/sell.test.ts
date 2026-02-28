import { describe, it, expect } from "vitest";
import { sellChickens, sellChickensBatch } from "@engine/sell";
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

describe("sellChickensBatch", () => {
  it("queues multiple ready chickens for selling", () => {
    const state = stateWith({ chickensReady: 10, sellingCount: 0 });
    const result = sellChickensBatch(state, 5);
    expect(result.chickensReady).toBe(5);
    expect(result.sellingCount).toBe(5);
  });

  it("limits to available chickensReady", () => {
    const state = stateWith({ chickensReady: 3, sellingCount: 0 });
    const result = sellChickensBatch(state, 10);
    expect(result.chickensReady).toBe(0);
    expect(result.sellingCount).toBe(3);
  });

  it("does nothing when no chickens ready", () => {
    const state = stateWith({ chickensReady: 0, sellingCount: 0 });
    const result = sellChickensBatch(state, 5);
    expect(result.chickensReady).toBe(0);
    expect(result.sellingCount).toBe(0);
  });

  it("adds to existing selling queue", () => {
    const state = stateWith({ chickensReady: 5, sellingCount: 2 });
    const result = sellChickensBatch(state, 3);
    expect(result.chickensReady).toBe(2);
    expect(result.sellingCount).toBe(5);
  });

  it("returns a new object without mutating the input", () => {
    const state = stateWith({ chickensReady: 5, sellingCount: 0 });
    const original = { ...state };
    sellChickensBatch(state, 3);
    expect(state).toEqual(original);
  });
});
