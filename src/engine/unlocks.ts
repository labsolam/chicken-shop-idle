import { GameState } from "../types/game-state";

/**
 * AGENT CONTEXT: Feature unlock system for Phase 1.
 * Features unlock progressively as the player earns revenue or sells chickens.
 * Unlocked features control UI visibility and button availability.
 * Unlock conditions are based on totalRevenueCents and totalChickensSold.
 *
 * Feature unlock order (doc 003):
 *   1. Bulk Buy x5         — $50 total earned
 *   2. Cold Storage        — $100 total earned
 *   3. 2nd Cooking Slot    — $500 total earned (unlock the upgrade UI)
 *   4. 2nd Register        — $300 total earned (unlock the upgrade UI)
 *   5. Bulk Buy x10        — $5K total earned
 *   6. Bulk Cook x5        — 2,500 chickens sold (milestone)
 */

export type FeatureId =
  | "bulk_buy_x5"
  | "cold_storage"
  | "cooking_slots"
  | "selling_registers"
  | "bulk_buy_x10"
  | "bulk_cook_x5"
  | "bulk_buy_x25"
  | "bulk_sell_x5"
  | "bulk_sell_x10"
  | "bulk_sell_x25";

/** Returns whether a feature has been unlocked based on current game state. */
export function isFeatureUnlocked(
  state: GameState,
  featureId: FeatureId,
): boolean {
  switch (featureId) {
    case "bulk_buy_x5":
      return state.totalRevenueCents >= 5000; // $50
    case "cold_storage":
      return state.totalRevenueCents >= 10000; // $100
    case "cooking_slots":
      return state.totalRevenueCents >= 50000; // $500
    case "selling_registers":
      return state.totalRevenueCents >= 30000; // $300
    case "bulk_buy_x10":
      return state.totalRevenueCents >= 500000; // $5K
    case "bulk_buy_x25":
      return state.totalRevenueCents >= 5000000; // $50K
    case "bulk_cook_x5":
      // Fired by milestone sold_2500 — check earnedMilestones
      return state.earnedMilestones.includes("sold_2500");
    case "bulk_sell_x5":
      return state.totalRevenueCents >= 50000; // $500
    case "bulk_sell_x10":
      return state.totalRevenueCents >= 500000; // $5K
    case "bulk_sell_x25":
      return state.totalRevenueCents >= 5000000; // $50K
  }
}
