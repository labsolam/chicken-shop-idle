import { GameState } from "../types/game-state";

/**
 * AGENT CONTEXT: Sell 1 ready chicken per click.
 * Pure function: queues 1 ready chicken for selling.
 * Money is earned over time via tick() as each chicken finishes selling.
 * No-op when no chickens ready.
 */
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
