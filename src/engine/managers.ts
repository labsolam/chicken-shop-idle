import { GameState } from "../types/game-state";
import { getEffectiveChickenPrice, getColdStorageCapacity } from "./buy";
import { getRecipe } from "./recipes";
import { getMilestoneMultiplier } from "./milestones";
import { RAW_CHICKEN_COST } from "./buy-chicken";

/**
 * AGENT CONTEXT: Manager system for Phase 2.
 * Three Tier 1 managers automate the Buy → Cook → Sell pipeline.
 *
 * Manager types:
 *   buyer — Buyer Bob:   3s interval, buys raw chickens
 *   cook  — Chef Carmen: 2s interval, queues chickens for cooking
 *   sell  — Seller Sam:  2s interval, queues chickens for selling
 *
 * Each manager has 10 upgrade levels.
 * Speed formula: baseInterval / (1 + speedBonus) [see decision 013]
 * Batch formula: 1 + BATCH_BONUS[level - 1]
 * Upgrade cost:  hireCost × 5^currentLevel
 */

export type ManagerKey = "buyer" | "cook" | "sell";

export const MANAGER_HIRE_COSTS: Record<ManagerKey, number> = {
  buyer: 1_000_000, // $10K
  cook: 500_000, // $5K
  sell: 500_000, // $5K
};

export const MANAGER_UNLOCK_THRESHOLDS: Record<ManagerKey, number> = {
  buyer: 5_000_000, // $50K total revenue
  cook: 2_500_000, // $25K total revenue
  sell: 2_500_000, // $25K total revenue
};

/** Base automation interval in ms for each manager */
export const MANAGER_BASE_INTERVALS: Record<ManagerKey, number> = {
  buyer: 3000,
  cook: 2000,
  sell: 2000,
};

/** Max upgrade level for managers */
export const MANAGER_MAX_LEVEL = 10;

/**
 * Speed bonus fraction per level (1-indexed: index 0 = level 1).
 * interval = baseInterval / (1 + speedBonus)
 */
const SPEED_BONUS = [
  0, // Level 1: base speed
  0.25, // Level 2: +25% speed
  0.5, // Level 3: +50% speed
  1.0, // Level 4: +100% speed
  2.0, // Level 5: +200% speed
  3.0, // Level 6: +300% speed
  5.0, // Level 7: +500% speed
  8.0, // Level 8: +800% speed
  12.0, // Level 9: +1200% speed
  20.0, // Level 10: +2000% speed
];

/**
 * Extra batch size per level (1-indexed: index 0 = level 1).
 * batchSize = 1 + BATCH_BONUS[level - 1]
 */
const BATCH_BONUS = [
  0, // Level 1: batch 1
  0, // Level 2: batch 1
  0, // Level 3: batch 1
  0, // Level 4: batch 1
  1, // Level 5: batch 2
  2, // Level 6: batch 3
  5, // Level 7: batch 6
  10, // Level 8: batch 11
  20, // Level 9: batch 21
  50, // Level 10: batch 51
];

/**
 * Returns whether a manager has been unlocked (can be hired) based on total revenue.
 */
export function isManagerUnlocked(state: GameState, key: ManagerKey): boolean {
  return state.totalRevenueCents >= MANAGER_UNLOCK_THRESHOLDS[key];
}

/**
 * Returns the effective automation interval in ms for a manager at the given level.
 * Formula: baseInterval / (1 + speedBonus) — see decision 013.
 */
export function getManagerInterval(key: ManagerKey, level: number): number {
  const baseInterval = MANAGER_BASE_INTERVALS[key];
  const bonus = SPEED_BONUS[level - 1] ?? 20.0;
  return baseInterval / (1 + bonus);
}

/**
 * Returns the batch size for a manager at the given level.
 */
export function getManagerBatchSize(level: number): number {
  return 1 + (BATCH_BONUS[level - 1] ?? 50);
}

/**
 * Returns the cost in cents to upgrade a manager from currentLevel to currentLevel+1.
 * Formula: hireCost × 5^currentLevel
 */
export function getManagerUpgradeCost(
  key: ManagerKey,
  currentLevel: number,
): number {
  return Math.round(MANAGER_HIRE_COSTS[key] * Math.pow(5, currentLevel));
}

/**
 * Hires a manager. Returns unchanged state if:
 * - Manager is already hired
 * - Manager is not yet unlocked (insufficient total revenue)
 * - Player cannot afford the hire cost
 */
export function hireManager(state: GameState, key: ManagerKey): GameState {
  if (state.managers[key].hired) return { ...state };
  if (!isManagerUnlocked(state, key)) return { ...state };
  const cost = MANAGER_HIRE_COSTS[key];
  if (state.money < cost) return { ...state };
  return {
    ...state,
    money: state.money - cost,
    managers: {
      ...state.managers,
      [key]: { ...state.managers[key], hired: true },
    },
  };
}

/**
 * Upgrades a manager. Returns unchanged state if:
 * - Manager is not hired
 * - Manager is already at max level
 * - Player cannot afford the upgrade cost
 */
export function upgradeManager(state: GameState, key: ManagerKey): GameState {
  const manager = state.managers[key];
  if (!manager.hired) return { ...state };
  if (manager.level >= MANAGER_MAX_LEVEL) return { ...state };
  const cost = getManagerUpgradeCost(key, manager.level);
  if (state.money < cost) return { ...state };
  return {
    ...state,
    money: state.money - cost,
    managers: {
      ...state.managers,
      [key]: { ...manager, level: manager.level + 1 },
    },
  };
}

/**
 * Applies a click bonus when the player clicks an action while its manager is active.
 * Bonus = 10% of one automated action's revenue (effectiveSalePrice × batchSize × 0.10).
 * Enforces a 1s cooldown per action type.
 *
 * @param state   Current game state
 * @param action  Which button was clicked
 * @param nowMs   Current wall-clock time in ms (pass Date.now() in production)
 */
export function applyClickBonus(
  state: GameState,
  action: ManagerKey,
  nowMs: number,
): GameState {
  const manager = state.managers[action];
  if (!manager.hired) return { ...state };

  const lastClick = state.lastClickTimestamps[action];
  if (nowMs - lastClick < 1000) return { ...state }; // 1s cooldown

  const cookingRecipe = getRecipe(state.cookingRecipeId);
  const effectiveSalePrice = Math.round(
    getEffectiveChickenPrice(
      cookingRecipe.saleValueCents,
      state.chickenValueLevel,
    ) * getMilestoneMultiplier(state),
  );
  const batchSize = getManagerBatchSize(manager.level);
  const bonus = Math.round(effectiveSalePrice * batchSize * 0.1);

  return {
    ...state,
    money: state.money + bonus,
    totalRevenueCents: state.totalRevenueCents + bonus,
    lastClickTimestamps: {
      ...state.lastClickTimestamps,
      [action]: nowMs,
    },
  };
}

/**
 * Returns how many raw chickens Buyer Bob can buy in one action.
 * Limited by storage space and player's money.
 */
export function getBuyerBobAction(state: GameState): {
  count: number;
  cost: number;
} {
  const batchSize = getManagerBatchSize(state.managers.buyer.level);
  const cap = getColdStorageCapacity(state.coldStorageLevel);
  const storageFree = cap - state.chickensBought;
  const canAfford = Math.floor(state.money / RAW_CHICKEN_COST);
  const count = Math.min(batchSize, storageFree, canAfford);
  return { count: Math.max(0, count), cost: count * RAW_CHICKEN_COST };
}
