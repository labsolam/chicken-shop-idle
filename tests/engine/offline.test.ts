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

  it("caps elapsed time at 4 hours (MAX_OFFLINE_MS)", () => {
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

  it("earns money based on lastComputedRatePerMs × elapsed × 0.30", () => {
    // rate: 0.1 cents/ms; elapsed: 10000ms → earned = round(0.1 * 10000 * 0.30) = 300
    const state = stateAt(0, {
      revenueTracker: {
        recentRevenueCents: 0,
        trackerElapsedMs: 0,
        lastComputedRatePerMs: 0.1,
      },
    });
    const result = calculateOfflineEarnings(state, 10_000);
    expect(result.moneyEarned).toBe(300);
  });

  it("uses lastOnlineTimestamp when non-zero (ignores lastUpdateTimestamp)", () => {
    // lastOnlineTimestamp=5000 → elapsed = 10000-5000 = 5000ms
    const state = stateAt(1000, {
      lastOnlineTimestamp: 5000,
      revenueTracker: {
        recentRevenueCents: 0,
        trackerElapsedMs: 0,
        lastComputedRatePerMs: 1,
      },
    });
    const result = calculateOfflineEarnings(state, 10_000);
    expect(result.elapsedMs).toBe(5000);
    expect(result.moneyEarned).toBe(Math.round(1 * 5000 * 0.3));
  });

  it("falls back to lastUpdateTimestamp when lastOnlineTimestamp is 0", () => {
    // lastUpdateTimestamp=3000, lastOnlineTimestamp=0 → elapsed = 10000-3000 = 7000ms
    const state = stateAt(3000, {
      lastOnlineTimestamp: 0,
      revenueTracker: {
        recentRevenueCents: 0,
        trackerElapsedMs: 0,
        lastComputedRatePerMs: 1,
      },
    });
    const result = calculateOfflineEarnings(state, 10_000);
    expect(result.elapsedMs).toBe(7000);
    expect(result.moneyEarned).toBe(Math.round(1 * 7000 * 0.3));
  });

  it("uses partial window rate as fallback when lastComputedRatePerMs is 0", () => {
    // partial window: 6000 cents in 60000ms → rate = 0.1 cents/ms
    // elapsed: 10000ms → earned = round(0.1 * 10000 * 0.30) = 300
    const state = stateAt(0, {
      revenueTracker: {
        recentRevenueCents: 6000,
        trackerElapsedMs: 60_000,
        lastComputedRatePerMs: 0,
      },
    });
    const result = calculateOfflineEarnings(state, 10_000);
    expect(result.moneyEarned).toBe(300);
  });

  it("updates lastOnlineTimestamp to now in returned state", () => {
    const state = stateAt(1000);
    const result = calculateOfflineEarnings(state, 50000);
    expect(result.state.lastOnlineTimestamp).toBe(50000);
  });
});
