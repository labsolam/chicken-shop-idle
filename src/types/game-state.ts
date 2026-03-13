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
 * Phase 2 fields added: managers, lastOnlineTimestamp, revenueTracker,
 * totalChickensBought, tipsLevel, lastClickTimestamps.
 *
 * Phase 3 fields added: equipment, staff, idleDiminishingReturns
 * (lastActivityTimestamp, continuousIdleMs).
 *
 * Deprecated (kept for save compat): chickenPriceInCents, cookTimeSeconds, sellTimeSeconds.
 * tick() no longer reads these — it uses recipe-based values instead.
 */

export interface EquipmentState {
  owned: boolean;
  level: number;
}

export interface StaffState {
  hired: boolean;
  level: number;
}

export interface ManagerState {
  hired: boolean;
  level: number;
  /** Milliseconds elapsed since last action */
  elapsedMs: number;
}

export interface RevenueTracker {
  /** Revenue earned in the current 60s tracking window */
  recentRevenueCents: number;
  /** Elapsed time in the current window (ms) */
  trackerElapsedMs: number;
  /** Cached revenue rate from the last completed 60s window (cents/ms) */
  lastComputedRatePerMs: number;
}

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

  // --- Phase 2 fields ---

  /** Manager states for the three Tier 1 managers */
  managers: {
    buyer: ManagerState;
    cook: ManagerState;
    sell: ManagerState;
  };

  /**
   * Timestamp (ms since epoch) written on each save.
   * Used exclusively to compute offline elapsed time in calculateOfflineEarnings().
   * Distinct from lastUpdateTimestamp which tracks game-loop timing.
   * Defaults to 0 for brand-new games; calculateOfflineEarnings falls back to
   * lastUpdateTimestamp when this is 0.
   */
  lastOnlineTimestamp: number;

  /** Rolling revenue tracker for offline earnings base rate */
  revenueTracker: RevenueTracker;

  /** Total chickens auto-purchased by Buyer Bob (lifetime) */
  totalChickensBought: number;

  /** Customer Tips upgrade level (0 = no tips, 10 = max) */
  tipsLevel: number;

  /**
   * Wall-clock timestamps (ms since epoch) of last click bonus per action.
   * Used to enforce the 1s cooldown on click bonuses.
   */
  lastClickTimestamps: {
    buyer: number;
    cook: number;
    sell: number;
  };

  // --- Phase 3 fields ---

  /** Equipment ownership and levels keyed by equipment ID */
  equipment: Record<string, EquipmentState>;

  /** Staff hiring and levels keyed by staff ID */
  staff: Record<string, StaffState>;

  /** Wall-clock timestamp of last player activity (click). Reset on any click. */
  lastActivityTimestamp: number;

  /** Continuous idle time in ms (tracked by tick, reset on player click) */
  continuousIdleMs: number;
}

const DEFAULT_MANAGER_STATE: ManagerState = {
  hired: false,
  level: 1,
  elapsedMs: 0,
};

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
    // Phase 2
    managers: {
      buyer: { ...DEFAULT_MANAGER_STATE },
      cook: { ...DEFAULT_MANAGER_STATE },
      sell: { ...DEFAULT_MANAGER_STATE },
    },
    lastOnlineTimestamp: 0,
    revenueTracker: {
      recentRevenueCents: 0,
      trackerElapsedMs: 0,
      lastComputedRatePerMs: 0,
    },
    totalChickensBought: 0,
    tipsLevel: 0,
    lastClickTimestamps: {
      buyer: 0,
      cook: 0,
      sell: 0,
    },
    // Phase 3
    equipment: {},
    staff: {},
    lastActivityTimestamp: 0,
    continuousIdleMs: 0,
  };
}
