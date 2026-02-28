import { GameState } from "../types/game-state";

/**
 * AGENT CONTEXT: Milestone system for Phase 1.
 * Milestones fire when cumulative chickens-sold or total-revenue thresholds are crossed.
 * Each milestone gives a permanent multiplicative bonus within a prestige run.
 * All multipliers stack multiplicatively (doc 003 rule 1).
 * Multiple milestones in one tick are all applied (doc 003 rule 2).
 * Milestones reset on prestige (Phase 4+).
 *
 * Revenue thresholds are in cents (all money in the engine is cents).
 */

export type MilestoneReward =
  | { kind: "saleValueMultiplier"; value: number }
  | { kind: "cookSpeedMultiplier"; value: number }
  | { kind: "sellSpeedMultiplier"; value: number }
  | { kind: "allSpeedMultiplier"; value: number }
  | { kind: "allRevenueMultiplier"; value: number }
  | { kind: "recipeUnlock"; recipeId: string }
  | { kind: "featureUnlock"; featureId: string };

export interface Milestone {
  id: string;
  type: "sold" | "revenue";
  threshold: number;
  reward: MilestoneReward;
}

/** All milestone definitions. Processed in ascending threshold order. */
export const MILESTONES: Milestone[] = [
  // --- Chickens Sold ---
  {
    id: "sold_10",
    type: "sold",
    threshold: 10,
    reward: { kind: "saleValueMultiplier", value: 2 },
  },
  {
    id: "sold_50",
    type: "sold",
    threshold: 50,
    reward: { kind: "cookSpeedMultiplier", value: 2 },
  },
  {
    id: "sold_100",
    type: "sold",
    threshold: 100,
    reward: { kind: "saleValueMultiplier", value: 2 },
  },
  {
    id: "sold_250",
    type: "sold",
    threshold: 250,
    reward: { kind: "recipeUnlock", recipeId: "wings" },
  },
  {
    id: "sold_500",
    type: "sold",
    threshold: 500,
    reward: { kind: "saleValueMultiplier", value: 3 },
  },
  {
    id: "sold_1000",
    type: "sold",
    threshold: 1000,
    reward: { kind: "allSpeedMultiplier", value: 2 },
  },
  {
    id: "sold_2500",
    type: "sold",
    threshold: 2500,
    reward: { kind: "featureUnlock", featureId: "bulk_cook_x5" },
  },
  {
    id: "sold_5000",
    type: "sold",
    threshold: 5000,
    reward: { kind: "saleValueMultiplier", value: 5 },
  },
  {
    id: "sold_10000",
    type: "sold",
    threshold: 10000,
    reward: { kind: "allSpeedMultiplier", value: 2 },
  },
  {
    id: "sold_25000",
    type: "sold",
    threshold: 25000,
    reward: { kind: "recipeUnlock", recipeId: "burger" },
  },
  {
    id: "sold_50000",
    type: "sold",
    threshold: 50000,
    reward: { kind: "saleValueMultiplier", value: 10 },
  },
  {
    id: "sold_100000",
    type: "sold",
    threshold: 100000,
    reward: { kind: "allSpeedMultiplier", value: 3 },
  },
  {
    id: "sold_500000",
    type: "sold",
    threshold: 500000,
    reward: { kind: "saleValueMultiplier", value: 25 },
  },
  {
    id: "sold_1000000",
    type: "sold",
    threshold: 1000000,
    reward: { kind: "allSpeedMultiplier", value: 5 },
  },
  // --- Total Revenue (in cents) ---
  {
    id: "revenue_500",
    type: "revenue",
    threshold: 50000, // $500 in cents
    reward: { kind: "recipeUnlock", recipeId: "grilled" },
  },
  {
    id: "revenue_5k",
    type: "revenue",
    threshold: 500000, // $5K
    reward: { kind: "allRevenueMultiplier", value: 2 },
  },
  {
    id: "revenue_5k_burger",
    type: "revenue",
    threshold: 500000, // $5K (same threshold — both fire together)
    reward: { kind: "recipeUnlock", recipeId: "burger" },
  },
  {
    id: "revenue_50k",
    type: "revenue",
    threshold: 5000000, // $50K
    reward: { kind: "featureUnlock", featureId: "bulk_buy_x10" },
  },
  {
    id: "revenue_500k",
    type: "revenue",
    threshold: 50000000, // $500K
    reward: { kind: "allRevenueMultiplier", value: 3 },
  },
  {
    id: "revenue_5m",
    type: "revenue",
    threshold: 500000000, // $5M
    reward: { kind: "recipeUnlock", recipeId: "katsu" },
  },
  {
    id: "revenue_50m",
    type: "revenue",
    threshold: 5000000000, // $50M
    reward: { kind: "allRevenueMultiplier", value: 5 },
  },
  {
    id: "revenue_500m",
    type: "revenue",
    threshold: 50000000000, // $500M
    reward: { kind: "allRevenueMultiplier", value: 10 },
  },
  {
    id: "revenue_5b",
    type: "revenue",
    threshold: 500000000000, // $5B
    reward: { kind: "recipeUnlock", recipeId: "rotisserie" },
  },
  {
    id: "revenue_50b",
    type: "revenue",
    threshold: 5000000000000, // $50B
    reward: { kind: "allRevenueMultiplier", value: 25 },
  },
  {
    id: "revenue_500b",
    type: "revenue",
    threshold: 50000000000000, // $500B
    reward: { kind: "allRevenueMultiplier", value: 50 },
  },
  {
    id: "revenue_5t",
    type: "revenue",
    threshold: 500000000000000, // $5T
    reward: { kind: "recipeUnlock", recipeId: "feast_platter" },
  },
  {
    id: "revenue_50t",
    type: "revenue",
    threshold: 5000000000000000, // $50T
    reward: { kind: "allRevenueMultiplier", value: 100 },
  },
];

/**
 * Checks if any new milestones have been crossed based on current stats.
 * Returns updated state with new milestones added to earnedMilestones and
 * any recipe/feature unlocks applied.
 * Processes milestones in ascending threshold order (doc 003 rule 2).
 */
export function checkMilestones(state: GameState): GameState {
  const earned = new Set(state.earnedMilestones);
  let newMilestones: string[] = [];
  let newUnlockedRecipes: string[] = [...state.unlockedRecipes];

  // Process in order defined (already ascending by threshold within each type)
  for (const milestone of MILESTONES) {
    if (earned.has(milestone.id)) continue;

    const crossed =
      milestone.type === "sold"
        ? state.totalChickensSold >= milestone.threshold
        : state.totalRevenueCents >= milestone.threshold;

    if (!crossed) continue;

    newMilestones = [...newMilestones, milestone.id];

    if (
      milestone.reward.kind === "recipeUnlock" &&
      !newUnlockedRecipes.includes(milestone.reward.recipeId)
    ) {
      newUnlockedRecipes = [...newUnlockedRecipes, milestone.reward.recipeId];
    }
  }

  if (newMilestones.length === 0) return state;

  return {
    ...state,
    earnedMilestones: [...state.earnedMilestones, ...newMilestones],
    unlockedRecipes: newUnlockedRecipes,
  };
}

/**
 * Returns the combined sale value multiplier from all earned milestones.
 * Stacks multiplicatively. Returns 1.0 if no relevant milestones earned.
 */
export function getMilestoneMultiplier(state: GameState): number {
  const earned = new Set(state.earnedMilestones);
  let multiplier = 1.0;

  for (const milestone of MILESTONES) {
    if (!earned.has(milestone.id)) continue;
    const r = milestone.reward;
    if (r.kind === "saleValueMultiplier" || r.kind === "allRevenueMultiplier") {
      multiplier *= r.value;
    }
  }

  return multiplier;
}

/**
 * Returns the combined cook speed multiplier from all earned milestones.
 * A higher value = faster cooking (divide cook time by this).
 */
export function getMilestoneCookSpeedMultiplier(state: GameState): number {
  const earned = new Set(state.earnedMilestones);
  let multiplier = 1.0;

  for (const milestone of MILESTONES) {
    if (!earned.has(milestone.id)) continue;
    const r = milestone.reward;
    if (r.kind === "cookSpeedMultiplier" || r.kind === "allSpeedMultiplier") {
      multiplier *= r.value;
    }
  }

  return multiplier;
}

/**
 * Returns the combined sell speed multiplier from all earned milestones.
 * A higher value = faster selling (divide sell time by this).
 */
export function getMilestoneSellSpeedMultiplier(state: GameState): number {
  const earned = new Set(state.earnedMilestones);
  let multiplier = 1.0;

  for (const milestone of MILESTONES) {
    if (!earned.has(milestone.id)) continue;
    const r = milestone.reward;
    if (r.kind === "sellSpeedMultiplier" || r.kind === "allSpeedMultiplier") {
      multiplier *= r.value;
    }
  }

  return multiplier;
}
