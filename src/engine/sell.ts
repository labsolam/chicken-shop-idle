import { GameState } from "../types/game-state";
import { getEffectiveChickenPrice } from "./buy";

/**
 * AGENT CONTEXT: Sell 1 ready chicken per click.
 * Pure function: returns new state with chickensReady decremented by 1 and money increased.
 * Called as a player action, not automatically by tick.
 * Price is modified by chickenValueLevel via getEffectiveChickenPrice.
 */
export function sellChickens(state: GameState): GameState {
  if (state.chickensReady <= 0) {
    return { ...state };
  }

  const effectivePrice = getEffectiveChickenPrice(
    state.chickenPriceInCents,
    state.chickenValueLevel,
  );

  return {
    ...state,
    chickensReady: state.chickensReady - 1,
    money: state.money + effectivePrice,
  };
}
