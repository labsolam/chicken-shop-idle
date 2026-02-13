import { GameState } from "../types/game-state";
import { tick } from "./tick";

/**
 * AGENT CONTEXT: Calculates earnings accumulated while the player was away.
 * Pure function: takes saved state + current timestamp, returns new state + summary.
 * Chickens produced during offline time are auto-sold.
 * Pre-existing ready chickens are kept unsold (player chose not to sell).
 * Elapsed time is capped at MAX_OFFLINE_MS (8 hours).
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

  const afterTick = tick(state, elapsedMs);
  const chickensProduced =
    afterTick.totalChickensCooked - state.totalChickensCooked;
  const moneyEarned = chickensProduced * state.chickenPriceInCents;

  return {
    state: {
      ...afterTick,
      chickensReady: state.chickensReady,
      money: state.money + moneyEarned,
      lastUpdateTimestamp: nowTimestamp,
    },
    elapsedMs,
    chickensProduced,
    moneyEarned,
  };
}
