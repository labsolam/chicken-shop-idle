import { GameState } from "../types/game-state";

/**
 * AGENT CONTEXT: Calculates earnings accumulated while the player was away.
 * Phase 2: real offline earnings based on the rolling revenue rate.
 *
 * Base rate is taken from the revenueTracker's last computed 60s window average
 * (falling back to the in-progress window if no completed window exists yet).
 *
 * Offline efficiency: 30% of active rate (Phase 2 base, upgradeable via Stars in Phase 4).
 * Max offline duration: 4 hours (Phase 2 base, upgradeable via Stars in Phase 4).
 *
 * Uses lastOnlineTimestamp (written by saveGame on each save) to compute elapsed.
 * Falls back to lastUpdateTimestamp for old saves that lack lastOnlineTimestamp.
 */

/** Maximum offline duration cap in ms (4 hours at Phase 2 base). */
export const MAX_OFFLINE_MS = 4 * 60 * 60 * 1000;

/** Fraction of active rate earned while offline (30% base). */
const OFFLINE_EFFICIENCY = 0.3;

export interface OfflineResult {
  state: GameState;
  elapsedMs: number;
  chickensProduced: number;
  moneyEarned: number;
}

export function calculateOfflineEarnings(
  state: GameState,
  nowTimestamp: number,
): OfflineResult {
  // Use lastOnlineTimestamp if set (non-zero), otherwise fall back to lastUpdateTimestamp
  const referenceTimestamp =
    state.lastOnlineTimestamp !== 0
      ? state.lastOnlineTimestamp
      : state.lastUpdateTimestamp;

  const rawElapsed = nowTimestamp - referenceTimestamp;
  const elapsedMs = Math.min(Math.max(rawElapsed, 0), MAX_OFFLINE_MS);

  // Determine base revenue rate (cents per ms)
  const tracker = state.revenueTracker;
  let baseRatePerMs = tracker.lastComputedRatePerMs;
  // If no completed window yet, use the partial window rate
  if (baseRatePerMs === 0 && tracker.trackerElapsedMs > 0) {
    baseRatePerMs = tracker.recentRevenueCents / tracker.trackerElapsedMs;
  }

  const moneyEarned = Math.round(
    baseRatePerMs * elapsedMs * OFFLINE_EFFICIENCY,
  );

  return {
    state: {
      ...state,
      money: state.money + moneyEarned,
      totalRevenueCents: state.totalRevenueCents + moneyEarned,
      lastUpdateTimestamp: nowTimestamp,
      lastOnlineTimestamp: nowTimestamp,
    },
    elapsedMs,
    chickensProduced: 0,
    moneyEarned,
  };
}
