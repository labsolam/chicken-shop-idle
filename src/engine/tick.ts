import { GameState } from "../types/game-state";
import { getEffectiveCookTime, getEffectiveChickenPrice } from "./buy";

/**
 * AGENT CONTEXT: Core game tick function.
 * Advances cooking and selling timers by deltaMs.
 * Completes chickens when their timer reaches the required duration.
 * Pure function — returns new state without mutation.
 */
export function tick(state: GameState, deltaMs: number): GameState {
  let cookingCount = state.cookingCount;
  let cookingElapsedMs = state.cookingElapsedMs;
  let chickensReady = state.chickensReady;
  let totalChickensCooked = state.totalChickensCooked;

  // Process cooking timer
  if (cookingCount > 0) {
    const cookTimeMs =
      getEffectiveCookTime(state.cookTimeSeconds, state.cookSpeedLevel) * 1000;
    cookingElapsedMs += deltaMs;

    while (cookingCount > 0 && cookingElapsedMs >= cookTimeMs) {
      cookingCount -= 1;
      chickensReady += 1;
      totalChickensCooked += 1;
      cookingElapsedMs -= cookTimeMs;
    }

    if (cookingCount === 0) {
      cookingElapsedMs = 0;
    }
  }

  let sellingCount = state.sellingCount;
  let sellingElapsedMs = state.sellingElapsedMs;
  let money = state.money;

  // Process selling timer
  if (sellingCount > 0) {
    const sellTimeMs = state.sellTimeSeconds * 1000;
    const effectivePrice = getEffectiveChickenPrice(
      state.chickenPriceInCents,
      state.chickenValueLevel,
    );
    sellingElapsedMs += deltaMs;

    while (sellingCount > 0 && sellingElapsedMs >= sellTimeMs) {
      sellingCount -= 1;
      money += effectivePrice;
      sellingElapsedMs -= sellTimeMs;
    }

    if (sellingCount === 0) {
      sellingElapsedMs = 0;
    }
  }

  return {
    ...state,
    cookingCount,
    cookingElapsedMs,
    chickensReady,
    totalChickensCooked,
    sellingCount,
    sellingElapsedMs,
    money,
  };
}
