import { GameState } from "../types/game-state";

/**
 * AGENT CONTEXT: Equipment system for Phase 3.
 * 13 equipment items split into Kitchen and Front-of-House categories.
 * Each has a base bonus, max level, base cost, and cost scaling.
 * Equipment bonuses apply as multipliers to cook speed, sell speed,
 * sale value, tips, and sell registers.
 *
 * Kitchen equipment bonuses may be recipe-type-specific.
 * Front-of-house equipment bonuses affect sell speed, tips, and registers.
 *
 * Per plan note: "customer attraction" bonuses are reinterpreted as sell speed.
 * Display Case → +15% sell speed, Neon Sign → +25% sell speed + 10% tips.
 */

export type EquipmentCategory = "kitchen" | "front_of_house";

export interface EquipmentBonus {
  /** Multiplicative cook speed bonus per level (e.g. 0.10 = +10%/lvl) */
  cookSpeed?: number;
  /** Multiplicative sell speed bonus per level */
  sellSpeed?: number;
  /** Multiplicative sale value bonus per level (applies to all recipes) */
  saleValue?: number;
  /** Multiplicative sale value bonus per level for specific recipe types */
  typeSaleValue?: { types: string[]; bonus: number };
  /** Additional sell registers (additive, not per-level — flat bonus when owned) */
  extraSellRegisters?: number;
  /** Tip bonus per level (additive to tip chance) */
  tipBonus?: number;
  /** Multiplicative batch sale value bonus per level */
  batchValue?: number;
  /** Extra cooking slot (additive, flat bonus when owned) */
  extraCookingSlot?: number;
}

export interface EquipmentDefinition {
  id: string;
  name: string;
  category: EquipmentCategory;
  maxLevel: number;
  /** Base cost in cents */
  baseCostCents: number;
  /** Cost scaling factor per level */
  costScaling: number;
  /** Bonus per level */
  bonus: EquipmentBonus;
  /** Revenue threshold in cents to unlock (0 = starting equipment) */
  unlockThresholdCents: number;
}

/** All equipment definitions keyed by ID */
export const EQUIPMENT: Record<string, EquipmentDefinition> = {
  // --- Kitchen Equipment ---
  basic_oven: {
    id: "basic_oven",
    name: "Basic Oven",
    category: "kitchen",
    maxLevel: 10,
    baseCostCents: 100_000, // $1K (starting equipment, low cost)
    costScaling: 2,
    bonus: { cookSpeed: 0.1 },
    unlockThresholdCents: 100_000, // $1K
  },
  commercial_oven: {
    id: "commercial_oven",
    name: "Commercial Oven",
    category: "kitchen",
    maxLevel: 15,
    baseCostCents: 1_000_000, // $10K
    costScaling: 2,
    bonus: { cookSpeed: 0.25, extraCookingSlot: 1 },
    unlockThresholdCents: 1_000_000, // $10K
  },
  industrial_fryer: {
    id: "industrial_fryer",
    name: "Industrial Fryer",
    category: "kitchen",
    maxLevel: 15,
    baseCostCents: 5_000_000, // $50K
    costScaling: 2,
    bonus: {
      cookSpeed: 0.2,
      typeSaleValue: { types: ["fried"], bonus: 0.15 },
    },
    unlockThresholdCents: 5_000_000, // $50K
  },
  charcoal_grill: {
    id: "charcoal_grill",
    name: "Charcoal Grill",
    category: "kitchen",
    maxLevel: 15,
    baseCostCents: 2_500_000, // $25K
    costScaling: 2,
    bonus: {
      cookSpeed: 0.15,
      typeSaleValue: { types: ["grilled"], bonus: 0.25 },
    },
    unlockThresholdCents: 2_500_000, // $25K
  },
  rotisserie_spit: {
    id: "rotisserie_spit",
    name: "Rotisserie Spit",
    category: "kitchen",
    maxLevel: 10,
    baseCostCents: 50_000_000, // $500K
    costScaling: 2.5,
    bonus: { saleValue: 0.1 },
    unlockThresholdCents: 50_000_000, // $500K
  },
  chefs_wok: {
    id: "chefs_wok",
    name: "Chef's Wok",
    category: "kitchen",
    maxLevel: 15,
    baseCostCents: 100_000_000, // $1M
    costScaling: 2,
    bonus: {
      cookSpeed: 0.3,
      typeSaleValue: { types: ["stir_fry"], bonus: 0.2 },
    },
    unlockThresholdCents: 100_000_000, // $1M
  },
  smoker: {
    id: "smoker",
    name: "Smoker",
    category: "kitchen",
    maxLevel: 10,
    baseCostCents: 500_000_000, // $5M
    costScaling: 3,
    bonus: { saleValue: 0.35 },
    unlockThresholdCents: 500_000_000, // $5M
  },

  // --- Front-of-House Equipment ---
  cash_register: {
    id: "cash_register",
    name: "Cash Register",
    category: "front_of_house",
    maxLevel: 10,
    baseCostCents: 100_000, // $1K (starting equipment)
    costScaling: 2,
    bonus: { sellSpeed: 0.1 },
    unlockThresholdCents: 100_000, // $1K
  },
  display_case: {
    id: "display_case",
    name: "Display Case",
    category: "front_of_house",
    maxLevel: 10,
    baseCostCents: 500_000, // $5K
    costScaling: 2,
    bonus: { sellSpeed: 0.15 },
    unlockThresholdCents: 500_000, // $5K
  },
  drive_through: {
    id: "drive_through",
    name: "Drive-Through Window",
    category: "front_of_house",
    maxLevel: 15,
    baseCostCents: 10_000_000, // $100K
    costScaling: 2,
    bonus: { sellSpeed: 0.2, extraSellRegisters: 1 },
    unlockThresholdCents: 10_000_000, // $100K
  },
  neon_sign: {
    id: "neon_sign",
    name: "Neon Sign",
    category: "front_of_house",
    maxLevel: 10,
    baseCostCents: 50_000_000, // $500K
    costScaling: 2,
    bonus: { sellSpeed: 0.25, tipBonus: 0.1 },
    unlockThresholdCents: 50_000_000, // $500K
  },
  loyalty_card_printer: {
    id: "loyalty_card_printer",
    name: "Loyalty Card Printer",
    category: "front_of_house",
    maxLevel: 20,
    baseCostCents: 5_000_000, // $50K
    costScaling: 2,
    bonus: { saleValue: 0.05 },
    unlockThresholdCents: 5_000_000, // $50K
  },
  catering_van: {
    id: "catering_van",
    name: "Catering Van",
    category: "front_of_house",
    maxLevel: 10,
    baseCostCents: 500_000_000, // $5M
    costScaling: 2,
    bonus: { batchValue: 0.5 },
    unlockThresholdCents: 500_000_000, // $5M
  },
};

/** Equipment IDs in display order */
export const EQUIPMENT_IDS = [
  "basic_oven",
  "commercial_oven",
  "industrial_fryer",
  "charcoal_grill",
  "rotisserie_spit",
  "chefs_wok",
  "smoker",
  "cash_register",
  "display_case",
  "drive_through",
  "neon_sign",
  "loyalty_card_printer",
  "catering_van",
] as const;

/** Returns whether an equipment item is unlocked based on total revenue */
export function isEquipmentUnlocked(
  state: GameState,
  equipId: string,
): boolean {
  const def = EQUIPMENT[equipId];
  if (!def) return false;
  return state.totalRevenueCents >= def.unlockThresholdCents;
}

/** Returns the cost in cents to buy or upgrade an equipment item */
export function getEquipmentCost(
  equipId: string,
  currentLevel: number,
): number {
  const def = EQUIPMENT[equipId];
  if (!def) return Infinity;
  return Math.floor(
    def.baseCostCents * Math.pow(def.costScaling, currentLevel),
  );
}

/**
 * Buys or upgrades an equipment item.
 * Level 0 → 1 is the initial purchase (owned becomes true).
 * Returns unchanged state if not unlocked, at max level, or can't afford.
 */
export function buyEquipment(state: GameState, equipId: string): GameState {
  const def = EQUIPMENT[equipId];
  if (!def) return { ...state };
  if (!isEquipmentUnlocked(state, equipId)) return { ...state };

  const current = state.equipment[equipId];
  const currentLevel = current?.level ?? 0;

  if (currentLevel >= def.maxLevel) return { ...state };

  const cost = getEquipmentCost(equipId, currentLevel);
  if (state.money < cost) return { ...state };

  return {
    ...state,
    money: state.money - cost,
    equipment: {
      ...state.equipment,
      [equipId]: { owned: true, level: currentLevel + 1 },
    },
  };
}

/**
 * Returns the combined cook speed multiplier from all owned equipment.
 * Higher value = faster cooking (divide cook time by this).
 * Recipe-type-specific cook speed is not in the spec — cookSpeed applies globally.
 */
export function getEquipmentCookSpeedMultiplier(state: GameState): number {
  let multiplier = 1.0;
  for (const equipId of EQUIPMENT_IDS) {
    const equip = state.equipment[equipId];
    if (!equip?.owned) continue;
    const def = EQUIPMENT[equipId];
    if (!def) continue;
    if (def.bonus.cookSpeed) {
      multiplier += def.bonus.cookSpeed * equip.level;
    }
  }
  return multiplier;
}

/**
 * Returns the combined sell speed multiplier from all owned equipment.
 * Higher value = faster selling (divide sell time by this).
 */
export function getEquipmentSellSpeedMultiplier(state: GameState): number {
  let multiplier = 1.0;
  for (const equipId of EQUIPMENT_IDS) {
    const equip = state.equipment[equipId];
    if (!equip?.owned) continue;
    const def = EQUIPMENT[equipId];
    if (!def) continue;
    if (def.bonus.sellSpeed) {
      multiplier += def.bonus.sellSpeed * equip.level;
    }
  }
  return multiplier;
}

/**
 * Returns the combined sale value multiplier from all owned equipment.
 * Includes both global saleValue and recipe-type-specific bonuses.
 */
export function getEquipmentSaleValueMultiplier(
  state: GameState,
  recipeTypes: string[],
): number {
  let multiplier = 1.0;
  for (const equipId of EQUIPMENT_IDS) {
    const equip = state.equipment[equipId];
    if (!equip?.owned) continue;
    const def = EQUIPMENT[equipId];
    if (!def) continue;

    // Global sale value bonus
    if (def.bonus.saleValue) {
      multiplier += def.bonus.saleValue * equip.level;
    }

    // Recipe-type-specific sale value bonus
    if (def.bonus.typeSaleValue) {
      const matchesType = def.bonus.typeSaleValue.types.some((t) =>
        recipeTypes.includes(t),
      );
      if (matchesType) {
        multiplier += def.bonus.typeSaleValue.bonus * equip.level;
      }
    }

    // Batch value bonus (treated as global sale value boost)
    if (def.bonus.batchValue) {
      multiplier += def.bonus.batchValue * equip.level;
    }
  }
  return multiplier;
}

/**
 * Returns the combined tip bonus from equipment (additive fraction).
 */
export function getEquipmentTipBonus(state: GameState): number {
  let bonus = 0;
  for (const equipId of EQUIPMENT_IDS) {
    const equip = state.equipment[equipId];
    if (!equip?.owned) continue;
    const def = EQUIPMENT[equipId];
    if (!def) continue;
    if (def.bonus.tipBonus) {
      bonus += def.bonus.tipBonus * equip.level;
    }
  }
  return bonus;
}

/**
 * Returns extra cooking slots from equipment (additive).
 * Only counted if the equipment is owned (level >= 1).
 */
export function getEquipmentExtraCookingSlots(state: GameState): number {
  let extra = 0;
  for (const equipId of EQUIPMENT_IDS) {
    const equip = state.equipment[equipId];
    if (!equip?.owned) continue;
    const def = EQUIPMENT[equipId];
    if (!def) continue;
    if (def.bonus.extraCookingSlot) {
      extra += def.bonus.extraCookingSlot;
    }
  }
  return extra;
}

/**
 * Returns extra selling registers from equipment (additive).
 * Only counted if the equipment is owned (level >= 1).
 */
export function getEquipmentExtraSellRegisters(state: GameState): number {
  let extra = 0;
  for (const equipId of EQUIPMENT_IDS) {
    const equip = state.equipment[equipId];
    if (!equip?.owned) continue;
    const def = EQUIPMENT[equipId];
    if (!def) continue;
    if (def.bonus.extraSellRegisters) {
      extra += def.bonus.extraSellRegisters;
    }
  }
  return extra;
}
