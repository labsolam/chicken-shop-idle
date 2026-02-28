/**
 * AGENT CONTEXT: This file defines the complete game state shape.
 * The game uses a 3-step clicker flow: Buy → Cook → Sell.
 * All monetary values are in integer cents to avoid floating point issues.
 * Cooking and selling are timed actions processed by tick().
 *
 * Phase 1 fields added: sellSpeedLevel, coldStorageLevel, cookingSlotsLevel,
 * sellingRegistersLevel, activeRecipe, cookingRecipeId, totalChickensSold,
 * totalRevenueCents, earnedMilestones, unlockedRecipes.
 *
 * Deprecated (kept for save compat): chickenPriceInCents, cookTimeSeconds, sellTimeSeconds.
 * tick() no longer reads these — it uses recipe-based values instead.
 */

export interface GameState {
  /** Total money in cents. 100 = $1.00 */
  money: number;

  /** Total chickens cooked (lifetime stat) */
  totalChickensCooked: number;

  /** Raw chickens bought but not yet cooked */
  chickensBought: number;

  /** Chickens currently cooked and ready to sell */
  chickensReady: number;

  /**
   * @deprecated Superseded by recipe-based cook times.
   * Kept for old-save loading compatibility. Default: 10.
   */
  cookTimeSeconds: number;

  /**
   * @deprecated Superseded by recipe-based values.
   * Kept for old-save loading compatibility. Default: 50 (Basic Fried Chicken).
   */
  chickenPriceInCents: number;

  /** Whether the shop is currently open */
  shopOpen: boolean;

  /** Timestamp of last update (ms since epoch) */
  lastUpdateTimestamp: number;

  /** Current cook-speed upgrade level (0 = no upgrades bought) */
  cookSpeedLevel: number;

  /** Current chicken-value upgrade level (0 = no upgrades bought) */
  chickenValueLevel: number;

  /** Chickens queued or in-progress for cooking */
  cookingCount: number;

  /** Milliseconds elapsed cooking the current batch */
  cookingElapsedMs: number;

  /** Chickens queued or in-progress for selling */
  sellingCount: number;

  /** Milliseconds elapsed selling the current batch */
  sellingElapsedMs: number;

  /**
   * @deprecated Superseded by getEffectiveSellTime().
   * Kept for old-save loading compatibility. Default: 10.
   */
  sellTimeSeconds: number;

  // --- Phase 1 fields ---

  /** Current sell-speed upgrade level (0 = no upgrades) */
  sellSpeedLevel: number;

  /** Cold storage capacity upgrade level (0 = 10 raw chicken cap) */
  coldStorageLevel: number;

  /** Cooking slots upgrade level (0 = 1 slot) */
  cookingSlotsLevel: number;

  /** Selling registers upgrade level (0 = 1 register) */
  sellingRegistersLevel: number;

  /** ID of the recipe currently selected for new cook jobs */
  activeRecipe: string;

  /**
   * ID of the recipe currently cooking (may differ from activeRecipe
   * when player switches mid-cook; syncs to activeRecipe when cookingCount hits 0).
   */
  cookingRecipeId: string;

  /** Total chickens sold this prestige run (lifetime for unlock tracking) */
  totalChickensSold: number;

  /** Total revenue earned in cents this prestige run (for unlock tracking) */
  totalRevenueCents: number;

  /** IDs of milestones already earned this prestige run */
  earnedMilestones: string[];

  /**
   * Recipe IDs that have been permanently unlocked.
   * Persists through prestige in Phase 4+.
   */
  unlockedRecipes: string[];
}

export function createInitialState(): GameState {
  return {
    money: 500,
    totalChickensCooked: 0,
    chickensBought: 0,
    chickensReady: 0,
    cookTimeSeconds: 10,
    chickenPriceInCents: 50,
    shopOpen: true,
    lastUpdateTimestamp: Date.now(),
    cookSpeedLevel: 0,
    chickenValueLevel: 0,
    cookingCount: 0,
    cookingElapsedMs: 0,
    sellingCount: 0,
    sellingElapsedMs: 0,
    sellTimeSeconds: 10,
    sellSpeedLevel: 0,
    coldStorageLevel: 0,
    cookingSlotsLevel: 0,
    sellingRegistersLevel: 0,
    activeRecipe: "basic_fried",
    cookingRecipeId: "basic_fried",
    totalChickensSold: 0,
    totalRevenueCents: 0,
    earnedMilestones: [],
    unlockedRecipes: ["basic_fried"],
  };
}
