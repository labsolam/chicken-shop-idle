import { describe, it, expect } from "vitest";
import {
  calculateOfflineEarnings,
  MAX_OFFLINE_MS,
} from "../../src/engine/offline";
import { GameState, createInitialState } from "../../src/types/game-state";

function stateAt(timestamp: number, overrides?: Partial<GameState>): GameState {
  return {
    ...createInitialState(),
    lastUpdateTimestamp: timestamp,
    ...overrides,
  };
}

describe("calculateOfflineEarnings", () => {
  it("produces chickens and earns money for elapsed time", () => {
    // 10 seconds away with 5s cook time = 2 chickens at $1.00 each
    const state = stateAt(1000, {
      cookTimeSeconds: 5,
      chickenPriceInCents: 100,
    });
    const result = calculateOfflineEarnings(state, 11000);

    expect(result.chickensProduced).toBe(2);
    expect(result.moneyEarned).toBe(200);
    expect(result.state.money).toBe(200);
  });

  it("keeps pre-existing ready chickens unsold", () => {
    const state = stateAt(1000, { chickensReady: 3 });
    const result = calculateOfflineEarnings(state, 11000);

    // 3 original + 0 from offline (new ones auto-sold)
    expect(result.state.chickensReady).toBe(3);
  });

  it("adds offline money to existing money", () => {
    const state = stateAt(1000, {
      money: 500,
      cookTimeSeconds: 5,
      chickenPriceInCents: 100,
    });
    // 10 seconds = 2 chickens = $2.00 = 200 cents
    const result = calculateOfflineEarnings(state, 11000);
    expect(result.state.money).toBe(700);
    expect(result.moneyEarned).toBe(200);
  });

  it("caps elapsed time at 8 hours", () => {
    const twelveHoursMs = 12 * 60 * 60 * 1000;
    const state = stateAt(0, { cookTimeSeconds: 5, chickenPriceInCents: 100 });
    const result = calculateOfflineEarnings(state, twelveHoursMs);

    // 8 hours = 28800 seconds / 5s cook time = 5760 chickens
    const maxChickens = (8 * 60 * 60) / 5;
    expect(result.chickensProduced).toBe(maxChickens);
    expect(result.elapsedMs).toBe(MAX_OFFLINE_MS);
  });

  it("accounts for existing cooking progress", () => {
    // 0.8 progress + 4 seconds (0.8 cook progress) = 1.6 total = 1 chicken + 0.6 leftover
    const state = stateAt(1000, {
      cookingProgress: 0.8,
      cookTimeSeconds: 5,
      chickenPriceInCents: 100,
    });
    const result = calculateOfflineEarnings(state, 5000); // 4 seconds

    expect(result.chickensProduced).toBe(1);
    expect(result.moneyEarned).toBe(100);
    expect(result.state.cookingProgress).toBeCloseTo(0.6, 5);
  });

  it("returns 0 earnings when shop is closed", () => {
    const state = stateAt(1000, { shopOpen: false });
    const result = calculateOfflineEarnings(state, 11000);

    expect(result.chickensProduced).toBe(0);
    expect(result.moneyEarned).toBe(0);
  });

  it("handles 0 elapsed time", () => {
    const state = stateAt(1000);
    const result = calculateOfflineEarnings(state, 1000);

    expect(result.chickensProduced).toBe(0);
    expect(result.moneyEarned).toBe(0);
    expect(result.elapsedMs).toBe(0);
  });

  it("handles negative elapsed time (clock skew)", () => {
    const state = stateAt(5000);
    const result = calculateOfflineEarnings(state, 1000);

    expect(result.chickensProduced).toBe(0);
    expect(result.moneyEarned).toBe(0);
    expect(result.elapsedMs).toBe(0);
  });

  it("updates lastUpdateTimestamp to now", () => {
    const state = stateAt(1000);
    const result = calculateOfflineEarnings(state, 50000);
    expect(result.state.lastUpdateTimestamp).toBe(50000);
  });

  it("updates totalChickensCooked", () => {
    const state = stateAt(1000, {
      totalChickensCooked: 10,
      cookTimeSeconds: 5,
    });
    // 10 seconds = 2 chickens
    const result = calculateOfflineEarnings(state, 11000);
    expect(result.state.totalChickensCooked).toBe(12);
  });

  it("does not mutate input state", () => {
    const state = stateAt(1000);
    const original = { ...state };
    calculateOfflineEarnings(state, 11000);
    expect(state).toEqual(original);
  });
});
