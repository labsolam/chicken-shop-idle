import { GameState } from "../types/game-state";
import { getEffectiveChickenPrice } from "./buy";

/**
 * AGENT CONTEXT: Sell all ready chickens.
 * Pure function: returns new state with chickensReady zeroed and money increased.
 * Called as a player action, not automatically by tick.
 * Price is modified by chickenValueLevel via getEffectiveChickenPrice.
 */
export function sellChickens(state: GameState): GameState {
  const effectivePrice = getEffectiveChickenPrice(
    state.chickenPriceInCents,
    state.chickenValueLevel,
  );
  const earnings = state.chickensReady * effectivePrice;

  return {
    ...state,
    chickensReady: 0,
    money: state.money + earnings,
  };
}
