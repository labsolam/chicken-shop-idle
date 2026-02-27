import { GameState } from "../types/game-state";

/**
 * AGENT CONTEXT: Pure serialization/deserialization for game state.
 * localStorage I/O is handled in main.ts, keeping these functions testable.
 * Phase 1 new fields are handled as optional (with safe defaults) for old-save compat.
 */

const STATE_FIELDS: Array<{ key: keyof GameState; type: string }> = [
  { key: "money", type: "number" },
  { key: "totalChickensCooked", type: "number" },
  { key: "chickensReady", type: "number" },
  { key: "cookTimeSeconds", type: "number" },
  { key: "chickenPriceInCents", type: "number" },
  { key: "shopOpen", type: "boolean" },
  { key: "lastUpdateTimestamp", type: "number" },
];

/** Fields added after initial release. Missing values default to 0. */
const OPTIONAL_NUMBER_FIELDS: Array<keyof GameState> = [
  "cookSpeedLevel",
  "chickenValueLevel",
  "chickensBought",
  "cookingCount",
  "cookingElapsedMs",
  "sellingCount",
  "sellingElapsedMs",
  "sellTimeSeconds",
  // Phase 1 additions
  "sellSpeedLevel",
  "coldStorageLevel",
  "cookingSlotsLevel",
  "sellingRegistersLevel",
  "totalChickensSold",
  "totalRevenueCents",
];

export function serializeState(state: GameState): string {
  return JSON.stringify(state);
}

export function deserializeState(json: string): GameState | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return null;
  }

  if (typeof parsed !== "object" || parsed === null) {
    return null;
  }

  const obj = parsed as Record<string, unknown>;

  for (const { key, type } of STATE_FIELDS) {
    if (typeof obj[key] !== type) {
      return null;
    }
  }

  for (const key of OPTIONAL_NUMBER_FIELDS) {
    if (obj[key] !== undefined && typeof obj[key] !== "number") {
      return null;
    }
  }

  // Validate optional array fields
  if (
    obj.earnedMilestones !== undefined &&
    !Array.isArray(obj.earnedMilestones)
  ) {
    return null;
  }
  if (
    obj.unlockedRecipes !== undefined &&
    !Array.isArray(obj.unlockedRecipes)
  ) {
    return null;
  }

  return {
    money: obj.money as number,
    totalChickensCooked: obj.totalChickensCooked as number,
    chickensBought: (obj.chickensBought as number) ?? 0,
    chickensReady: obj.chickensReady as number,
    cookTimeSeconds: obj.cookTimeSeconds as number,
    chickenPriceInCents: obj.chickenPriceInCents as number,
    shopOpen: obj.shopOpen as boolean,
    lastUpdateTimestamp: obj.lastUpdateTimestamp as number,
    cookSpeedLevel: (obj.cookSpeedLevel as number) ?? 0,
    chickenValueLevel: (obj.chickenValueLevel as number) ?? 0,
    cookingCount: (obj.cookingCount as number) ?? 0,
    cookingElapsedMs: (obj.cookingElapsedMs as number) ?? 0,
    sellingCount: (obj.sellingCount as number) ?? 0,
    sellingElapsedMs: (obj.sellingElapsedMs as number) ?? 0,
    sellTimeSeconds: (obj.sellTimeSeconds as number) ?? 10,
    // Phase 1 fields with safe defaults
    sellSpeedLevel: (obj.sellSpeedLevel as number) ?? 0,
    coldStorageLevel: (obj.coldStorageLevel as number) ?? 0,
    cookingSlotsLevel: (obj.cookingSlotsLevel as number) ?? 0,
    sellingRegistersLevel: (obj.sellingRegistersLevel as number) ?? 0,
    activeRecipe:
      typeof obj.activeRecipe === "string" ? obj.activeRecipe : "basic_fried",
    cookingRecipeId:
      typeof obj.cookingRecipeId === "string"
        ? obj.cookingRecipeId
        : "basic_fried",
    totalChickensSold: (obj.totalChickensSold as number) ?? 0,
    totalRevenueCents: (obj.totalRevenueCents as number) ?? 0,
    earnedMilestones: Array.isArray(obj.earnedMilestones)
      ? (obj.earnedMilestones as string[])
      : [],
    unlockedRecipes: Array.isArray(obj.unlockedRecipes)
      ? (obj.unlockedRecipes as string[])
      : ["basic_fried"],
  };
}
