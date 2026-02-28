import { GameState } from "../types/game-state";
import { getColdStorageCapacity } from "./buy";

/**
 * AGENT CONTEXT: Buy raw chicken actions (Phase 1).
 * Pure functions: spend money to add raw chickens to cold storage.
 * Cold storage capacity limits how many chickens can be bought.
 * Bulk buy purchases the maximum affordable within capacity.
 */

export const RAW_CHICKEN_COST = 25; // 25 cents = $0.25

/**
 * Buys 1 raw chicken. No-op if money is insufficient or cold storage is full.
 */
export function buyChicken(state: GameState): GameState {
  if (state.money < RAW_CHICKEN_COST) {
    return { ...state };
  }

  const capacity = getColdStorageCapacity(state.coldStorageLevel);
  if (state.chickensBought >= capacity) {
    return { ...state };
  }

  return {
    ...state,
    money: state.money - RAW_CHICKEN_COST,
    chickensBought: state.chickensBought + 1,
  };
}

/**
 * Buys up to `quantity` raw chickens.
 * Actual amount bought = min(quantity, affordableCount, storageRemaining).
 * Returns state unchanged if nothing can be bought.
 */
export function buyChickens(state: GameState, quantity: number): GameState {
  const capacity = getColdStorageCapacity(state.coldStorageLevel);
  const storageRemaining = capacity - state.chickensBought;
  const affordableCount = Math.floor(state.money / RAW_CHICKEN_COST);
  const actualBought = Math.min(quantity, affordableCount, storageRemaining);

  if (actualBought <= 0) {
    return { ...state };
  }

  return {
    ...state,
    money: state.money - actualBought * RAW_CHICKEN_COST,
    chickensBought: state.chickensBought + actualBought,
  };
}
