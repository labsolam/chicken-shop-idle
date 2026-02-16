import { describe, it, expect } from "vitest";
import { tick } from "@engine/tick";
import { createInitialState, GameState } from "../../src/types/game-state";

function stateWith(overrides: Partial<GameState>): GameState {
  return { ...createInitialState(), ...overrides };
}

describe("tick — cooking", () => {
  it("advances cooking elapsed time", () => {
    const state = stateWith({ cookingCount: 1, cookingElapsedMs: 0 });
    const result = tick(state, 3000);
    expect(result.cookingElapsedMs).toBe(3000);
    expect(result.cookingCount).toBe(1);
  });

  it("completes a chicken after cookTimeSeconds elapses", () => {
    const state = stateWith({
      cookingCount: 1,
      cookingElapsedMs: 0,
      cookTimeSeconds: 10,
      cookSpeedLevel: 0,
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
      cookTimeSeconds: 10,
    });
    const result = tick(state, 12000);
    expect(result.cookingCount).toBe(1);
    expect(result.chickensReady).toBe(1);
    expect(result.cookingElapsedMs).toBe(2000);
  });

  it("completes multiple chickens in one tick", () => {
    const state = stateWith({
      cookingCount: 3,
      cookingElapsedMs: 0,
      cookTimeSeconds: 10,
    });
    const result = tick(state, 25000);
    expect(result.cookingCount).toBe(1);
    expect(result.chickensReady).toBe(2);
    expect(result.totalChickensCooked).toBe(2);
    expect(result.cookingElapsedMs).toBe(5000);
  });

  it("respects cook speed upgrades", () => {
    // cookTimeSeconds=10, cookSpeedLevel=1 → effective = 10 * 0.9^1 = 9s
    const state = stateWith({
      cookingCount: 1,
      cookingElapsedMs: 0,
      cookTimeSeconds: 10,
      cookSpeedLevel: 1,
    });
    const result = tick(state, 9000);
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
      cookTimeSeconds: 10,
    });
    const result = tick(state, 8000);
    // 5000 + 8000 = 13000 > 10000 → completes, remaining = 3000, but queue empty → reset to 0
    expect(result.cookingCount).toBe(0);
    expect(result.cookingElapsedMs).toBe(0);
  });
});

describe("tick — selling", () => {
  it("advances selling elapsed time", () => {
    const state = stateWith({
      sellingCount: 1,
      sellingElapsedMs: 0,
      sellTimeSeconds: 10,
    });
    const result = tick(state, 4000);
    expect(result.sellingElapsedMs).toBe(4000);
    expect(result.sellingCount).toBe(1);
  });

  it("completes a sale after sellTimeSeconds elapses", () => {
    const state = stateWith({
      sellingCount: 1,
      sellingElapsedMs: 0,
      sellTimeSeconds: 10,
      money: 0,
      chickenPriceInCents: 100,
      chickenValueLevel: 0,
    });
    const result = tick(state, 10000);
    expect(result.sellingCount).toBe(0);
    expect(result.money).toBe(100);
    expect(result.sellingElapsedMs).toBe(0);
  });

  it("carries over extra time to next chicken for sale", () => {
    const state = stateWith({
      sellingCount: 2,
      sellingElapsedMs: 0,
      sellTimeSeconds: 10,
      money: 0,
      chickenPriceInCents: 100,
    });
    const result = tick(state, 15000);
    expect(result.sellingCount).toBe(1);
    expect(result.money).toBe(100);
    expect(result.sellingElapsedMs).toBe(5000);
  });

  it("completes multiple sales in one tick", () => {
    const state = stateWith({
      sellingCount: 3,
      sellingElapsedMs: 0,
      sellTimeSeconds: 10,
      money: 0,
      chickenPriceInCents: 100,
    });
    const result = tick(state, 25000);
    expect(result.sellingCount).toBe(1);
    expect(result.money).toBe(200);
    expect(result.sellingElapsedMs).toBe(5000);
  });

  it("uses effective chicken price with value upgrades", () => {
    // base 100 + level 2 * 25 = 150 cents per chicken
    const state = stateWith({
      sellingCount: 1,
      sellingElapsedMs: 0,
      sellTimeSeconds: 10,
      money: 0,
      chickenPriceInCents: 100,
      chickenValueLevel: 2,
    });
    const result = tick(state, 10000);
    expect(result.money).toBe(150);
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
      sellTimeSeconds: 10,
      money: 0,
      chickenPriceInCents: 100,
    });
    const result = tick(state, 7000);
    expect(result.sellingCount).toBe(0);
    expect(result.sellingElapsedMs).toBe(0);
  });
});

describe("tick — both cooking and selling", () => {
  it("processes cooking and selling simultaneously", () => {
    const state = stateWith({
      cookingCount: 1,
      cookingElapsedMs: 0,
      cookTimeSeconds: 10,
      sellingCount: 1,
      sellingElapsedMs: 0,
      sellTimeSeconds: 10,
      money: 0,
      chickenPriceInCents: 100,
    });
    const result = tick(state, 10000);
    expect(result.cookingCount).toBe(0);
    expect(result.chickensReady).toBe(1);
    expect(result.sellingCount).toBe(0);
    expect(result.money).toBe(100);
  });
});

describe("tick — immutability", () => {
  it("returns a new object without mutating the input", () => {
    const state = stateWith({
      cookingCount: 1,
      sellingCount: 1,
      sellTimeSeconds: 10,
    });
    const original = { ...state };
    tick(state, 5000);
    expect(state).toEqual(original);
  });
});
