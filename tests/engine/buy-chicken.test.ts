import { describe, it, expect } from "vitest";
import { buyChicken, buyChickens, RAW_CHICKEN_COST } from "@engine/buy-chicken";
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

  it("does nothing when cold storage is full (default cap: 10)", () => {
    // coldStorageLevel=0 → capacity=10
    const state = stateWith({
      money: 500,
      chickensBought: 10,
      coldStorageLevel: 0,
    });
    const result = buyChicken(state);
    expect(result.chickensBought).toBe(10);
    expect(result.money).toBe(500);
  });

  it("allows buying when one slot remains in cold storage", () => {
    const state = stateWith({
      money: 500,
      chickensBought: 9,
      coldStorageLevel: 0,
    });
    const result = buyChicken(state);
    expect(result.chickensBought).toBe(10);
  });

  it("respects upgraded cold storage capacity (level 1: 25)", () => {
    const state = stateWith({
      money: 500,
      chickensBought: 24,
      coldStorageLevel: 1,
    });
    const result = buyChicken(state);
    expect(result.chickensBought).toBe(25);
  });

  it("returns a new object without mutating the input", () => {
    const state = stateWith({ money: 500, chickensBought: 0 });
    const original = { ...state };
    buyChicken(state);
    expect(state).toEqual(original);
  });
});

describe("buyChickens (bulk buy)", () => {
  it("buys exact quantity when affordable and space available", () => {
    const state = stateWith({
      money: 500,
      chickensBought: 0,
      coldStorageLevel: 0,
    });
    // cap=10, affordable=20, buy 5
    const result = buyChickens(state, 5);
    expect(result.chickensBought).toBe(5);
    expect(result.money).toBe(500 - 5 * RAW_CHICKEN_COST);
  });

  it("limits to storage remaining", () => {
    // coldStorageLevel=0 → cap=10, already have 8
    const state = stateWith({
      money: 500,
      chickensBought: 8,
      coldStorageLevel: 0,
    });
    const result = buyChickens(state, 10);
    expect(result.chickensBought).toBe(10); // only 2 remaining
    expect(result.money).toBe(500 - 2 * RAW_CHICKEN_COST);
  });

  it("limits to affordable count", () => {
    // Can afford 4: 100 / 25 = 4
    const state = stateWith({
      money: 100,
      chickensBought: 0,
      coldStorageLevel: 1,
    });
    const result = buyChickens(state, 10);
    expect(result.chickensBought).toBe(4);
    expect(result.money).toBe(0);
  });

  it("buys nothing when storage is full", () => {
    const state = stateWith({
      money: 500,
      chickensBought: 10,
      coldStorageLevel: 0,
    });
    const result = buyChickens(state, 5);
    expect(result.chickensBought).toBe(10);
    expect(result.money).toBe(500);
  });

  it("buys nothing when money is 0", () => {
    const state = stateWith({
      money: 0,
      chickensBought: 0,
      coldStorageLevel: 0,
    });
    const result = buyChickens(state, 5);
    expect(result.chickensBought).toBe(0);
  });

  it("returns a new object without mutating the input", () => {
    const state = stateWith({ money: 500, chickensBought: 0 });
    const original = { ...state };
    buyChickens(state, 5);
    expect(state).toEqual(original);
  });
});
