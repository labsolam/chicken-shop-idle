import { GameState } from "../types/game-state";
import {
  getEffectiveCookTime,
  getEffectiveSellTime,
  getEffectiveChickenPrice,
  getCookingSlots,
  getSellingRegisters,
  getColdStorageCapacity,
  getTipChance,
  getTipBonus,
} from "./buy";
import { getRecipe } from "./recipes";
import {
  checkMilestones,
  getMilestoneMultiplier,
  getMilestoneCookSpeedMultiplier,
  getMilestoneSellSpeedMultiplier,
} from "./milestones";
import { getManagerInterval, getManagerBatchSize } from "./managers";
import { RAW_CHICKEN_COST } from "./buy-chicken";
import {
  getEquipmentCookSpeedMultiplier,
  getEquipmentSellSpeedMultiplier,
  getEquipmentSaleValueMultiplier,
  getEquipmentTipBonus,
  getEquipmentExtraCookingSlots,
  getEquipmentExtraSellRegisters,
} from "./equipment";
import {
  getStaffCookSpeedMultiplier,
  getStaffSellSpeedMultiplier,
  getStaffSaleValueMultiplier,
} from "./staff";
import { getIdleEfficiency } from "./idle";

/**
 * AGENT CONTEXT: Core game tick function (Phase 3).
 * Advances cooking and selling timers by deltaMs.
 * Completes cook jobs in batches (cookingSlots per cycle).
 * Completes sell jobs in batches (sellingRegisters per cycle).
 * Uses recipe-based cook time and sale values.
 * Checks milestones after each selling cycle.
 * Processes manager timers (Buyer Bob, Chef Carmen, Seller Sam).
 * Applies tip checks per sale when tipsLevel > 0.
 * Tracks rolling revenue for offline earnings base rate.
 * Pure function — returns new state without mutation.
 *
 * @param rng  Optional RNG (defaults to Math.random). Pass a deterministic
 *             function in tests for tip-check reproducibility.
 *
 * Processing order:
 *   1. Compute effectiveSalePrice from cookingRecipeId BEFORE processing any timers
 *   2. Process selling timer (uses price from step 1, applies tip checks)
 *   3. Process cooking timer (may sync cookingRecipeId → activeRecipe when done)
 *   4. Process manager timers (buyer, cook, sell)
 *   5. Update revenue tracker
 *   6. Check milestones (applied to next tick)
 */
export function tick(
  state: GameState,
  deltaMs: number,
  rng: () => number = Math.random,
): GameState {
  // Step 1: Compute effective prices/times upfront (with Phase 3 multipliers)
  const cookingRecipe = getRecipe(state.cookingRecipeId);
  const equipCookSpeed = getEquipmentCookSpeedMultiplier(state);
  const staffCookSpeed = getStaffCookSpeedMultiplier(state);
  const cookTimeMs =
    (getEffectiveCookTime(cookingRecipe.cookTimeSeconds, state.cookSpeedLevel) /
      (getMilestoneCookSpeedMultiplier(state) *
        equipCookSpeed *
        staffCookSpeed)) *
    1000;

  const equipSellSpeed = getEquipmentSellSpeedMultiplier(state);
  const staffSellSpeed = getStaffSellSpeedMultiplier(state);
  const sellTimeMs =
    (getEffectiveSellTime(state.sellSpeedLevel) /
      (getMilestoneSellSpeedMultiplier(state) *
        equipSellSpeed *
        staffSellSpeed)) *
    1000;

  const milestoneMultiplier = getMilestoneMultiplier(state);
  const equipSaleValue = getEquipmentSaleValueMultiplier(
    state,
    cookingRecipe.types,
  );
  const staffSaleValue = getStaffSaleValueMultiplier(state);
  const idleEfficiency = getIdleEfficiency(state.continuousIdleMs);
  const effectiveSalePrice = Math.round(
    getEffectiveChickenPrice(
      cookingRecipe.saleValueCents,
      state.chickenValueLevel,
    ) *
      milestoneMultiplier *
      equipSaleValue *
      staffSaleValue *
      idleEfficiency,
  );

  const cookingSlots =
    getCookingSlots(state.cookingSlotsLevel) +
    getEquipmentExtraCookingSlots(state);
  const sellingRegisters =
    getSellingRegisters(state.sellingRegistersLevel) +
    getEquipmentExtraSellRegisters(state);

  const tipChance = getTipChance(state.tipsLevel);
  const tipBonus = getTipBonus(state.tipsLevel) + getEquipmentTipBonus(state);

  // Step 2: Process selling timer
  let sellingCount = state.sellingCount;
  let sellingElapsedMs = state.sellingElapsedMs;
  let money = state.money;
  let totalChickensSold = state.totalChickensSold;
  let totalRevenueCents = state.totalRevenueCents;
  let revenueEarnedThisTick = 0;

  if (sellingCount > 0) {
    sellingElapsedMs += deltaMs;

    while (sellingCount > 0 && sellingElapsedMs >= sellTimeMs) {
      const completedThisCycle = Math.min(sellingCount, sellingRegisters);
      sellingCount -= completedThisCycle;

      // Base sale revenue
      let cycleRevenue = completedThisCycle * effectiveSalePrice;

      // Tip check per chicken sold (only when tips are upgraded)
      if (state.tipsLevel > 0) {
        for (let i = 0; i < completedThisCycle; i++) {
          if (rng() < tipChance) {
            cycleRevenue += Math.round(effectiveSalePrice * tipBonus);
          }
        }
      }

      money += cycleRevenue;
      totalChickensSold += completedThisCycle;
      totalRevenueCents += cycleRevenue;
      revenueEarnedThisTick += cycleRevenue;
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

  // Step 4: Process manager timers
  let chickensBought = state.chickensBought;
  let totalChickensBought = state.totalChickensBought;
  const managers = {
    buyer: { ...state.managers.buyer },
    cook: { ...state.managers.cook },
    sell: { ...state.managers.sell },
  };

  // Buyer Bob — auto-buy raw chickens
  if (managers.buyer.hired) {
    let buyerElapsed = managers.buyer.elapsedMs + deltaMs;
    const buyerInterval = getManagerInterval("buyer", managers.buyer.level);
    while (buyerElapsed >= buyerInterval) {
      const batchSize = getManagerBatchSize(managers.buyer.level);
      const cap = getColdStorageCapacity(state.coldStorageLevel);
      const storageFree = cap - chickensBought;
      const canAfford = Math.floor(money / RAW_CHICKEN_COST);
      const toBuy = Math.min(batchSize, storageFree, canAfford);
      if (toBuy > 0) {
        chickensBought += toBuy;
        money -= toBuy * RAW_CHICKEN_COST;
        totalChickensBought += toBuy;
      }
      buyerElapsed -= buyerInterval;
    }
    managers.buyer = { ...managers.buyer, elapsedMs: buyerElapsed };
  }

  // Chef Carmen — auto-queue raw chickens for cooking
  if (managers.cook.hired) {
    let carmenElapsed = managers.cook.elapsedMs + deltaMs;
    const carmenInterval = getManagerInterval("cook", managers.cook.level);
    const activeRecipeData = getRecipe(state.activeRecipe);
    while (carmenElapsed >= carmenInterval) {
      const batchSize = getManagerBatchSize(managers.cook.level);
      const rawAvailable = Math.floor(
        chickensBought / activeRecipeData.rawInput,
      );
      const toQueue = Math.min(batchSize, rawAvailable);
      if (toQueue > 0) {
        chickensBought -= toQueue * activeRecipeData.rawInput;
        cookingCount += toQueue;
        // Sync recipe if queue was empty before this action
        if (cookingCount === toQueue) {
          cookingRecipeId = state.activeRecipe;
        }
      }
      carmenElapsed -= carmenInterval;
    }
    managers.cook = { ...managers.cook, elapsedMs: carmenElapsed };
  }

  // Seller Sam — auto-queue cooked chickens for selling
  if (managers.sell.hired) {
    let samElapsed = managers.sell.elapsedMs + deltaMs;
    const samInterval = getManagerInterval("sell", managers.sell.level);
    while (samElapsed >= samInterval) {
      const batchSize = getManagerBatchSize(managers.sell.level);
      const toQueue = Math.min(batchSize, chickensReady);
      if (toQueue > 0) {
        chickensReady -= toQueue;
        sellingCount += toQueue;
      }
      samElapsed -= samInterval;
    }
    managers.sell = { ...managers.sell, elapsedMs: samElapsed };
  }

  // Step 5: Update revenue tracker (rolling 60s window)
  let tracker = state.revenueTracker;
  const newTrackerElapsed = tracker.trackerElapsedMs + deltaMs;
  const newTrackerRevenue = tracker.recentRevenueCents + revenueEarnedThisTick;

  if (newTrackerElapsed >= 60_000) {
    // Window complete — compute rate and reset
    tracker = {
      recentRevenueCents: 0,
      trackerElapsedMs: 0,
      lastComputedRatePerMs: newTrackerRevenue / newTrackerElapsed,
    };
  } else {
    tracker = {
      ...tracker,
      recentRevenueCents: newTrackerRevenue,
      trackerElapsedMs: newTrackerElapsed,
    };
  }

  // Step 6: Track continuous idle time (Phase 3)
  const continuousIdleMs = state.continuousIdleMs + deltaMs;

  // Step 7: Check milestones (applied next tick via earnedMilestones)
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
    chickensBought,
    totalChickensBought,
    managers,
    revenueTracker: tracker,
    continuousIdleMs,
  };

  return checkMilestones(newState);
}
