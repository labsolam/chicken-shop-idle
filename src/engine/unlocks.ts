import { GameState } from "../types/game-state";

/**
 * AGENT CONTEXT: Feature unlock system for Phase 1 + Phase 2 + Phase 3.
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
 *
 * Phase 2 additions (doc 004):
 *   7. Tips upgrade        — $5K total earned
 *   8. Manager: Chef Carmen / Seller Sam — $25K total earned
 *   9. Manager: Buyer Bob  — $50K total earned
 *
 * Phase 3 additions:
 *  10. Equipment panel      — $1K total earned
 *  11. Staff panel          — $1K total earned
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
  | "bulk_sell_x25"
  | "tips_upgrade"
  | "manager_cook"
  | "manager_sell"
  | "manager_buyer"
  | "equipment_panel"
  | "staff_panel";

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
    // Phase 2
    case "tips_upgrade":
      return state.totalRevenueCents >= 500000; // $5K
    case "manager_cook":
      return state.totalRevenueCents >= 2_500_000; // $25K
    case "manager_sell":
      return state.totalRevenueCents >= 2_500_000; // $25K
    case "manager_buyer":
      return state.totalRevenueCents >= 5_000_000; // $50K
    // Phase 3
    case "equipment_panel":
      return state.totalRevenueCents >= 100_000; // $1K
    case "staff_panel":
      return state.totalRevenueCents >= 100_000; // $1K
  }
}
