import { GameState } from "../types/game-state";

/**
 * AGENT CONTEXT: Sell all ready chickens.
 * Pure function: returns new state with chickensReady zeroed and money increased.
 * Called as a player action, not automatically by tick.
 */
export function sellChickens(state: GameState): GameState {
  const earnings = state.chickensReady * state.chickenPriceInCents;

  return {
    ...state,
    chickensReady: 0,
    money: state.money + earnings,
  };
}
