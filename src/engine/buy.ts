import { GameState } from "../types/game-state";
import { getAccountantDiscount } from "./staff";

/**
 * AGENT CONTEXT: Upgrade purchase system (Phase 1 expansion).
 * Pure functions for computing upgrade costs, applying purchases,
 * and calculating effective stats from upgrade levels.
 *
 * Six upgrade categories:
 *   cookSpeed     — formula: floor(500 × 2.3^level), cap 30
 *   sellSpeed     — same as cook speed, cap 30
 *   chickenValue  — formula: floor(1000 × 3.5^level), cap 25, multiplier lookup table
 *   coldStorage   — hand-tuned lookup table, cap 10
 *   cookingSlots  — formula: floor(5000 × 10^level), cap 10
 *   sellingRegisters — formula: floor(3000 × 10^level), cap 10
 */

export type UpgradeType =
  | "cookSpeed"
  | "sellSpeed"
  | "chickenValue"
  | "coldStorage"
  | "cookingSlots"
  | "sellingRegisters"
  | "tips";

const BASE_SELL_TIME = 10; // seconds, constant for all recipes

/** Level caps by upgrade category */
const UPGRADE_CAPS: Record<UpgradeType, number> = {
  cookSpeed: 30,
  sellSpeed: 30,
  chickenValue: 25,
  coldStorage: 10,
  cookingSlots: 10,
  sellingRegisters: 10,
  tips: 10,
};

/**
 * Customer Tips upgrade costs in cents (hand-tuned lookup table — doc 003).
 * Index = current level; value = cost to buy the next level.
 */
const TIPS_COSTS_CENTS = [
  500_000, // L0→L1: $5K
  1_250_000, // L1→L2: $12.5K
  3_125_000, // L2→L3: $31.25K
  7_812_500, // L3→L4: $78.1K
  19_531_250, // L4→L5: $195.3K
  48_828_125, // L5→L6: $488.3K
  122_070_312, // L6→L7: $1.22M
  305_175_781, // L7→L8: $3.05M
  762_939_453, // L8→L9: $7.63M
  1_907_348_632, // L9→L10: $19.1M
];

/**
 * Tip chance by tips upgrade level (0-10).
 * Index = level; value = probability (0 to 1).
 */
const TIP_CHANCE = [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5];

/**
 * Tip bonus multiplier by tips upgrade level (0-10).
 * Index = level; value = bonus fraction (e.g. 0.25 = +25% of sale value).
 */
const TIP_BONUS = [0, 0.25, 0.25, 0.5, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

/**
 * Cold storage upgrade costs in cents (hand-tuned lookup table — doc 003).
 * Index = current level; value = cost to buy the next level.
 */
const COLD_STORAGE_COSTS_CENTS = [
  1500, // L0→L1: $15
  7500, // L1→L2: $75
  35000, // L2→L3: $350
  200000, // L3→L4: $2K
  1000000, // L4→L5: $10K
  5000000, // L5→L6: $50K
  25000000, // L6→L7: $250K
  150000000, // L7→L8: $1.5M
  1000000000, // L8→L9: $10M
  7500000000, // L9→L10: $75M
];

/**
 * Sale value multiplier lookup table (26 values for levels 0-25 — doc 003).
 * effectivePrice = recipeBaseValue × table[chickenValueLevel]
 */
const SALE_VALUE_MULTIPLIERS = [
  1.0, 1.2, 1.4, 1.7, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 6.0, 7.0, 8.0, 9.0,
  10.0, 12.0, 14.0, 16.0, 18.0, 20.0, 25.0, 30.0, 35.0, 42.0, 50.0,
];

/**
 * Cold storage capacity lookup table (11 values for levels 0-10 — doc 003).
 * Index = level; value = capacity in raw chickens.
 */
const COLD_STORAGE_CAPACITY = [
  10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000,
];

/**
 * Cooking slots per level (11 values for levels 0-10 — doc 003).
 * Index = level; value = number of parallel cooking slots.
 */
const COOKING_SLOTS_TABLE = [1, 2, 3, 4, 5, 6, 8, 10, 15, 20, 30];

/**
 * Selling registers per level (11 values for levels 0-10 — doc 003).
 * Index = level; value = number of parallel selling registers.
 */
const SELLING_REGISTERS_TABLE = [1, 2, 3, 4, 5, 6, 8, 10, 15, 20, 30];

/** Returns the cost in cents to buy the next level of an upgrade. */
export function getUpgradeCost(
  type: UpgradeType,
  currentLevel: number,
): number {
  switch (type) {
    case "cookSpeed":
    case "sellSpeed":
      return Math.floor(500 * Math.pow(2.3, currentLevel));
    case "chickenValue":
      return Math.floor(1000 * Math.pow(3.5, currentLevel));
    case "coldStorage":
      return COLD_STORAGE_COSTS_CENTS[currentLevel] ?? Infinity;
    case "cookingSlots":
      return Math.floor(5000 * Math.pow(10, currentLevel));
    case "sellingRegisters":
      return Math.floor(3000 * Math.pow(10, currentLevel));
    case "tips":
      return TIPS_COSTS_CENTS[currentLevel] ?? Infinity;
  }
}

/** Maps an UpgradeType to the GameState field it controls. */
function upgradeLevelKey(
  type: UpgradeType,
): keyof Pick<
  GameState,
  | "cookSpeedLevel"
  | "sellSpeedLevel"
  | "chickenValueLevel"
  | "coldStorageLevel"
  | "cookingSlotsLevel"
  | "sellingRegistersLevel"
  | "tipsLevel"
> {
  switch (type) {
    case "cookSpeed":
      return "cookSpeedLevel";
    case "sellSpeed":
      return "sellSpeedLevel";
    case "chickenValue":
      return "chickenValueLevel";
    case "coldStorage":
      return "coldStorageLevel";
    case "cookingSlots":
      return "cookingSlotsLevel";
    case "sellingRegisters":
      return "sellingRegistersLevel";
    case "tips":
      return "tipsLevel";
  }
}

/**
 * Returns the cost in cents after applying the Accountant staff discount.
 * Used for display and affordability checks when the discount should be shown.
 */
export function getDiscountedUpgradeCost(
  state: GameState,
  type: UpgradeType,
  currentLevel: number,
): number {
  const baseCost = getUpgradeCost(type, currentLevel);
  return Math.floor(baseCost * getAccountantDiscount(state));
}

/**
 * Attempts to buy an upgrade. Returns unchanged state if money is insufficient
 * or the upgrade is already at its cap. Applies Accountant staff discount.
 */
export function buyUpgrade(state: GameState, type: UpgradeType): GameState {
  const levelKey = upgradeLevelKey(type);
  const currentLevel = state[levelKey];
  const cap = UPGRADE_CAPS[type];

  if (currentLevel >= cap) {
    return { ...state };
  }

  const cost = getDiscountedUpgradeCost(state, type, currentLevel);

  if (state.money < cost) {
    return { ...state };
  }

  return {
    ...state,
    money: state.money - cost,
    [levelKey]: currentLevel + 1,
  };
}

/**
 * Returns the effective cook time in seconds after applying speed upgrades.
 * Formula: baseCookTime × 0.85^level, minimum 0.1s.
 * baseCookTime comes from the active recipe, not a global constant.
 */
export function getEffectiveCookTime(
  baseCookTime: number,
  speedLevel: number,
): number {
  return Math.max(0.1, baseCookTime * Math.pow(0.85, speedLevel));
}

/**
 * Returns the effective sell time in seconds after applying sell speed upgrades.
 * Formula: 10 × 0.85^level, minimum 0.1s. Base is always 10s (not recipe-dependent).
 */
export function getEffectiveSellTime(speedLevel: number): number {
  return Math.max(0.1, BASE_SELL_TIME * Math.pow(0.85, speedLevel));
}

/**
 * Returns the effective chicken sale price in cents after applying value upgrades.
 * Uses a multiplier lookup table (not additive).
 * effectivePrice = round(recipeBaseValue × multiplierTable[level])
 */
export function getEffectiveChickenPrice(
  basePrice: number,
  valueLevel: number,
): number {
  const multiplier = SALE_VALUE_MULTIPLIERS[valueLevel] ?? 50.0;
  return Math.round(basePrice * multiplier);
}

/**
 * Returns the cold storage capacity (max raw chickens) at the given upgrade level.
 */
export function getColdStorageCapacity(level: number): number {
  return COLD_STORAGE_CAPACITY[level] ?? 25000;
}

/**
 * Returns the number of cooking slots at the given upgrade level.
 * N slots means N chickens (or cook jobs) complete per cook cycle.
 */
export function getCookingSlots(level: number): number {
  return COOKING_SLOTS_TABLE[level] ?? 30;
}

/**
 * Returns the number of selling registers at the given upgrade level.
 * N registers means N chickens complete per sell cycle.
 */
export function getSellingRegisters(level: number): number {
  return SELLING_REGISTERS_TABLE[level] ?? 30;
}

/**
 * Returns the tip chance (0–1) at the given tips upgrade level.
 */
export function getTipChance(tipsLevel: number): number {
  return TIP_CHANCE[tipsLevel] ?? 0.5;
}

/**
 * Returns the tip bonus fraction at the given tips upgrade level.
 * e.g. 0.25 means +25% of the base sale value is added as a tip.
 */
export function getTipBonus(tipsLevel: number): number {
  return TIP_BONUS[tipsLevel] ?? 2.0;
}
