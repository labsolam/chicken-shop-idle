import { GameState } from "../types/game-state";
import {
  getEffectiveCookTime,
  getEffectiveSellTime,
  getEffectiveChickenPrice,
  getCookingSlots,
  getSellingRegisters,
} from "./buy";
import { getRecipe } from "./recipes";
import {
  checkMilestones,
  getMilestoneMultiplier,
  getMilestoneCookSpeedMultiplier,
  getMilestoneSellSpeedMultiplier,
} from "./milestones";

/**
 * AGENT CONTEXT: Core game tick function (Phase 1).
 * Advances cooking and selling timers by deltaMs.
 * Completes cook jobs in batches (cookingSlots per cycle).
 * Completes sell jobs in batches (sellingRegisters per cycle).
 * Uses recipe-based cook time and sale values.
 * Checks milestones after each selling cycle.
 * Pure function — returns new state without mutation.
 *
 * Processing order (important for recipe-price consistency):
 *   1. Compute effectiveSalePrice from cookingRecipeId BEFORE processing any timers
 *   2. Process selling timer (uses price from step 1)
 *   3. Process cooking timer (may sync cookingRecipeId → activeRecipe when done)
 *   4. Check milestones (applied to next tick)
 */
export function tick(state: GameState, deltaMs: number): GameState {
  // Step 1: Compute effective prices/times upfront
  const cookingRecipe = getRecipe(state.cookingRecipeId);
  const cookTimeMs =
    (getEffectiveCookTime(cookingRecipe.cookTimeSeconds, state.cookSpeedLevel) /
      getMilestoneCookSpeedMultiplier(state)) *
    1000;

  const sellTimeMs =
    (getEffectiveSellTime(state.sellSpeedLevel) /
      getMilestoneSellSpeedMultiplier(state)) *
    1000;

  const milestoneMultiplier = getMilestoneMultiplier(state);
  const effectiveSalePrice = Math.round(
    getEffectiveChickenPrice(
      cookingRecipe.saleValueCents,
      state.chickenValueLevel,
    ) * milestoneMultiplier,
  );

  const cookingSlots = getCookingSlots(state.cookingSlotsLevel);
  const sellingRegisters = getSellingRegisters(state.sellingRegistersLevel);

  // Step 2: Process selling timer
  let sellingCount = state.sellingCount;
  let sellingElapsedMs = state.sellingElapsedMs;
  let money = state.money;
  let totalChickensSold = state.totalChickensSold;
  let totalRevenueCents = state.totalRevenueCents;

  if (sellingCount > 0) {
    sellingElapsedMs += deltaMs;

    while (sellingCount > 0 && sellingElapsedMs >= sellTimeMs) {
      const completedThisCycle = Math.min(sellingCount, sellingRegisters);
      sellingCount -= completedThisCycle;
      money += completedThisCycle * effectiveSalePrice;
      totalChickensSold += completedThisCycle;
      totalRevenueCents += completedThisCycle * effectiveSalePrice;
      sellingElapsedMs -= sellTimeMs;
    }

    if (sellingCount === 0) {
      sellingElapsedMs = 0;
    }
  }

  // Step 3: Process cooking timer
  let cookingCount = state.cookingCount;
  let cookingElapsedMs = state.cookingElapsedMs;
  let chickensReady = state.chickensReady;
  let totalChickensCooked = state.totalChickensCooked;
  let cookingRecipeId = state.cookingRecipeId;

  if (cookingCount > 0) {
    cookingElapsedMs += deltaMs;

    while (cookingCount > 0 && cookingElapsedMs >= cookTimeMs) {
      const completedThisCycle = Math.min(cookingCount, cookingSlots);
      cookingCount -= completedThisCycle;
      chickensReady += completedThisCycle;
      totalChickensCooked += completedThisCycle;
      cookingElapsedMs -= cookTimeMs;
    }

    if (cookingCount === 0) {
      cookingElapsedMs = 0;
      // Sync recipe when nothing left cooking
      cookingRecipeId = state.activeRecipe;
    }
  }

  // Step 4: Check milestones (applied next tick via earnedMilestones)
  const newState: GameState = {
    ...state,
    cookingCount,
    cookingElapsedMs,
    chickensReady,
    totalChickensCooked,
    cookingRecipeId,
    sellingCount,
    sellingElapsedMs,
    money,
    totalChickensSold,
    totalRevenueCents,
  };

  return checkMilestones(newState);
}
