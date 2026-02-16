import { GameState } from "../types/game-state";

/**
 * AGENT CONTEXT: Manual click-to-cook action.
 * Pure function: converts 1 raw (bought) chicken into 1 cooked (ready) chicken.
 * No-op if no raw chickens are available.
 */
export function clickCook(state: GameState): GameState {
  if (state.chickensBought <= 0) {
    return { ...state };
  }

  return {
    ...state,
    chickensBought: state.chickensBought - 1,
    chickensReady: state.chickensReady + 1,
    totalChickensCooked: state.totalChickensCooked + 1,
  };
}
