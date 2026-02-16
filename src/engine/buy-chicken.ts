import { GameState } from "../types/game-state";

/**
 * AGENT CONTEXT: Buy raw chicken action.
 * Pure function: spends money to add 1 raw chicken to inventory.
 * No-op if insufficient money.
 */

export const RAW_CHICKEN_COST = 25; // 25 cents = $0.25

export function buyChicken(state: GameState): GameState {
  if (state.money < RAW_CHICKEN_COST) {
    return { ...state };
  }

  return {
    ...state,
    money: state.money - RAW_CHICKEN_COST,
    chickensBought: state.chickensBought + 1,
  };
}
