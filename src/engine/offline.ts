import { GameState } from "../types/game-state";

/**
 * AGENT CONTEXT: Calculates earnings accumulated while the player was away.
 * Currently a no-op — idle cooking is disabled in favor of the clicker flow.
 * Kept for future idle mechanics.
 */

export const MAX_OFFLINE_MS = 8 * 60 * 60 * 1000;

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
  const rawElapsed = nowTimestamp - state.lastUpdateTimestamp;
  const elapsedMs = Math.min(Math.max(rawElapsed, 0), MAX_OFFLINE_MS);

  return {
    state: {
      ...state,
      lastUpdateTimestamp: nowTimestamp,
    },
    elapsedMs,
    chickensProduced: 0,
    moneyEarned: 0,
  };
}
