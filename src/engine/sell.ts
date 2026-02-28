import { GameState } from "../types/game-state";

/**
 * AGENT CONTEXT: Sell ready chicken actions (Phase 1).
 * Pure functions: queues cooked chickens for selling.
 * Money is earned over time via tick() as each chicken finishes selling.
 * sellChickens queues 1. sellChickensBatch queues up to quantity.
 */

/** Queues 1 ready chicken for selling. No-op when no chickens ready. */
export function sellChickens(state: GameState): GameState {
  if (state.chickensReady <= 0) {
    return { ...state };
  }

  return {
    ...state,
    sellingCount: state.sellingCount + 1,
    chickensReady: state.chickensReady - 1,
  };
}

/**
 * Queues up to `quantity` ready chickens for selling.
 * Actual amount = min(quantity, chickensReady).
 */
export function sellChickensBatch(
  state: GameState,
  quantity: number,
): GameState {
  const actualSell = Math.min(quantity, state.chickensReady);

  if (actualSell <= 0) {
    return { ...state };
  }

  return {
    ...state,
    sellingCount: state.sellingCount + actualSell,
    chickensReady: state.chickensReady - actualSell,
  };
}
