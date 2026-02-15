import { GameState } from "../types/game-state";

/**
 * AGENT CONTEXT: Manual click-to-cook action.
 * Pure function: instantly produces 1 ready chicken per click.
 * Independent of auto-cooking — does not affect cookingProgress.
 */
export function clickCook(state: GameState): GameState {
  return {
    ...state,
    chickensReady: state.chickensReady + 1,
    totalChickensCooked: state.totalChickensCooked + 1,
  };
}
