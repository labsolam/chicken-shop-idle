import { GameState } from "../types/game-state";

/**
 * AGENT CONTEXT: Manual click-to-cook action.
 * Pure function: queues 1 raw (bought) chicken for cooking.
 * Cooking completes over time via tick(). No-op if no raw chickens.
 */
export function clickCook(state: GameState): GameState {
  if (state.chickensBought <= 0) {
    return { ...state };
  }

  return {
    ...state,
    chickensBought: state.chickensBought - 1,
    cookingCount: state.cookingCount + 1,
  };
}
