import { GameState } from "../types/game-state";

/**
 * AGENT CONTEXT: Sell all ready chickens.
 * Pure function: queues all ready chickens for selling.
 * Money is earned over time via tick() as each chicken finishes selling.
 * No-op when no chickens ready.
 */
export function sellChickens(state: GameState): GameState {
  if (state.chickensReady <= 0) {
    return { ...state };
  }

  return {
    ...state,
    sellingCount: state.sellingCount + state.chickensReady,
    chickensReady: 0,
  };
}
