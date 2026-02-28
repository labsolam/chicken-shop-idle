/**
 * AGENT CONTEXT: Recipe definitions for the cooking system.
 * Each recipe has a cook time, sale value, raw chicken input count, unlock condition, and type tags.
 * Type tags are used by Phase 3 equipment bonuses (defined here for forward-compatibility).
 * Only the first 4 recipes unlock in Phase 1; the rest have high unlock thresholds.
 * All monetary values are in integer cents.
 */

export interface Recipe {
  id: string;
  name: string;
  /** Number of raw chickens consumed per cook job */
  rawInput: number;
  /** Base cook time in seconds (before speed upgrades) */
  cookTimeSeconds: number;
  /** Base sale value in cents (before value upgrades and multipliers) */
  saleValueCents: number;
  /** Unlock condition — checked against GameState stats */
  unlockCondition:
    | { type: "start" }
    | { type: "revenue"; thresholdCents: number }
    | { type: "sold"; thresholdCount: number }
    | { type: "prestige" };
  /** Recipe type tags for Phase 3 equipment bonuses */
  types: string[];
}

export const RECIPES: Record<string, Recipe> = {
  basic_fried: {
    id: "basic_fried",
    name: "Basic Fried Chicken",
    rawInput: 1,
    cookTimeSeconds: 10,
    saleValueCents: 50,
    unlockCondition: { type: "start" },
    types: ["fried"],
  },
  grilled: {
    id: "grilled",
    name: "Grilled Chicken",
    rawInput: 1,
    cookTimeSeconds: 15,
    saleValueCents: 100,
    unlockCondition: { type: "revenue", thresholdCents: 50000 }, // $500
    types: ["grilled"],
  },
  wings: {
    id: "wings",
    name: "Chicken Wings",
    rawInput: 1,
    cookTimeSeconds: 8,
    saleValueCents: 75,
    unlockCondition: { type: "sold", thresholdCount: 250 },
    types: ["wings"],
  },
  burger: {
    id: "burger",
    name: "Chicken Burger",
    rawInput: 2,
    cookTimeSeconds: 20,
    saleValueCents: 200,
    unlockCondition: { type: "revenue", thresholdCents: 500000 }, // $5K
    types: ["burger"],
  },
  katsu: {
    id: "katsu",
    name: "Chicken Katsu",
    rawInput: 2,
    cookTimeSeconds: 25,
    saleValueCents: 350,
    unlockCondition: { type: "revenue", thresholdCents: 500000000 }, // $5M
    types: ["fried"],
  },
  rotisserie: {
    id: "rotisserie",
    name: "Rotisserie Chicken",
    rawInput: 3,
    cookTimeSeconds: 45,
    saleValueCents: 800,
    unlockCondition: { type: "revenue", thresholdCents: 500000000000 }, // $5B
    types: ["roasted"],
  },
  feast_platter: {
    id: "feast_platter",
    name: "Chicken Feast Platter",
    rawInput: 5,
    cookTimeSeconds: 120,
    saleValueCents: 2500,
    unlockCondition: { type: "revenue", thresholdCents: 500000000000000 }, // $5T
    types: ["mixed"],
  },
  signature: {
    id: "signature",
    name: "Signature Dish",
    rawInput: 3,
    cookTimeSeconds: 300,
    saleValueCents: 10000,
    unlockCondition: { type: "prestige" },
    types: ["signature"],
  },
};

const BASIC_FRIED_FALLBACK: Recipe = {
  id: "basic_fried",
  name: "Basic Fried Chicken",
  rawInput: 1,
  cookTimeSeconds: 10,
  saleValueCents: 50,
  unlockCondition: { type: "start" },
  types: ["fried"],
};

/**
 * Returns the recipe for the given ID, falling back to Basic Fried Chicken
 * if the ID is not found. Avoids noUncheckedIndexedAccess issues at call sites.
 */
export function getRecipe(id: string): Recipe {
  return RECIPES[id] ?? BASIC_FRIED_FALLBACK;
}

/** IDs of all recipes in display order */
export const RECIPE_IDS = [
  "basic_fried",
  "grilled",
  "wings",
  "burger",
  "katsu",
  "rotisserie",
  "feast_platter",
  "signature",
] as const;
