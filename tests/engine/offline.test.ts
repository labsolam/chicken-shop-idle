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
  it("returns 0 earnings (idle cooking disabled)", () => {
    const state = stateAt(1000, {
      cookTimeSeconds: 5,
      chickenPriceInCents: 100,
    });
    const result = calculateOfflineEarnings(state, 11000);

    expect(result.chickensProduced).toBe(0);
    expect(result.moneyEarned).toBe(0);
  });

  it("preserves existing state", () => {
    const state = stateAt(1000, {
      money: 500,
      chickensReady: 3,
      chickensBought: 2,
    });
    const result = calculateOfflineEarnings(state, 11000);

    expect(result.state.money).toBe(500);
    expect(result.state.chickensReady).toBe(3);
    expect(result.state.chickensBought).toBe(2);
  });

  it("caps elapsed time at 8 hours", () => {
    const twelveHoursMs = 12 * 60 * 60 * 1000;
    const state = stateAt(0);
    const result = calculateOfflineEarnings(state, twelveHoursMs);
    expect(result.elapsedMs).toBe(MAX_OFFLINE_MS);
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

  it("does not mutate input state", () => {
    const state = stateAt(1000);
    const original = { ...state };
    calculateOfflineEarnings(state, 11000);
    expect(state).toEqual(original);
  });
});
