import { GameState } from "../types/game-state";

/**
 * AGENT CONTEXT: Staff system for Phase 3.
 * 6 staff members provide passive bonuses per level.
 * Unlike managers (who automate), staff give always-on multipliers.
 *
 * Staff members:
 *   line_cook        — +15% cook speed/lvl, max 10, $1K base, x2.5/lvl
 *   sous_chef        — +10% recipe value/lvl, max 10, $5K base, x2.5/lvl
 *   cashier          — +15% sell speed/lvl, max 10, $1K base, x2.5/lvl
 *   marketing_intern — +10% sell speed/lvl (reinterpreted from customer rate), max 10, $10K base, x3/lvl
 *   accountant       — -5% upgrade costs/lvl (max -30%), max 6, $50K base, x3/lvl
 *   health_inspector — +5% all revenue/lvl, max 10, $25K base, x3/lvl
 */

export interface StaffDefinition {
  id: string;
  name: string;
  description: string;
  maxLevel: number;
  /** Base hire cost in cents */
  baseCostCents: number;
  /** Cost scaling factor per level */
  costScaling: number;
  /** Revenue threshold in cents to unlock */
  unlockThresholdCents: number;
}

export const STAFF: Record<string, StaffDefinition> = {
  line_cook: {
    id: "line_cook",
    name: "Line Cook",
    description: "+15% cook speed per level",
    maxLevel: 10,
    baseCostCents: 100_000, // $1K
    costScaling: 2.5,
    unlockThresholdCents: 100_000, // $1K
  },
  sous_chef: {
    id: "sous_chef",
    name: "Sous Chef",
    description: "+10% recipe value per level",
    maxLevel: 10,
    baseCostCents: 500_000, // $5K
    costScaling: 2.5,
    unlockThresholdCents: 500_000, // $5K
  },
  cashier: {
    id: "cashier",
    name: "Cashier",
    description: "+15% sell speed per level",
    maxLevel: 10,
    baseCostCents: 100_000, // $1K
    costScaling: 2.5,
    unlockThresholdCents: 100_000, // $1K
  },
  marketing_intern: {
    id: "marketing_intern",
    name: "Marketing Intern",
    description: "+10% sell speed per level",
    maxLevel: 10,
    baseCostCents: 1_000_000, // $10K
    costScaling: 3,
    unlockThresholdCents: 1_000_000, // $10K
  },
  accountant: {
    id: "accountant",
    name: "Accountant",
    description: "-5% upgrade costs per level (max -30%)",
    maxLevel: 6,
    baseCostCents: 5_000_000, // $50K
    costScaling: 3,
    unlockThresholdCents: 5_000_000, // $50K
  },
  health_inspector: {
    id: "health_inspector",
    name: "Health Inspector",
    description: "+5% all revenue per level",
    maxLevel: 10,
    baseCostCents: 2_500_000, // $25K
    costScaling: 3,
    unlockThresholdCents: 2_500_000, // $25K
  },
};

/** Staff IDs in display order */
export const STAFF_IDS = [
  "line_cook",
  "sous_chef",
  "cashier",
  "marketing_intern",
  "accountant",
  "health_inspector",
] as const;

/** Returns whether a staff member is unlocked based on total revenue */
export function isStaffUnlocked(state: GameState, staffId: string): boolean {
  const def = STAFF[staffId];
  if (!def) return false;
  return state.totalRevenueCents >= def.unlockThresholdCents;
}

/** Returns the cost in cents to hire or upgrade a staff member */
export function getStaffCost(staffId: string, currentLevel: number): number {
  const def = STAFF[staffId];
  if (!def) return Infinity;
  return Math.floor(
    def.baseCostCents * Math.pow(def.costScaling, currentLevel),
  );
}

/**
 * Hires or upgrades a staff member.
 * Level 0 → 1 is the initial hire (hired becomes true).
 * Returns unchanged state if not unlocked, at max level, or can't afford.
 */
export function hireStaff(state: GameState, staffId: string): GameState {
  const def = STAFF[staffId];
  if (!def) return { ...state };
  if (!isStaffUnlocked(state, staffId)) return { ...state };

  const current = state.staff[staffId];
  const currentLevel = current?.level ?? 0;

  if (currentLevel >= def.maxLevel) return { ...state };

  const cost = getStaffCost(staffId, currentLevel);
  if (state.money < cost) return { ...state };

  return {
    ...state,
    money: state.money - cost,
    staff: {
      ...state.staff,
      [staffId]: { hired: true, level: currentLevel + 1 },
    },
  };
}

/**
 * Returns the combined cook speed multiplier from all hired staff.
 * Higher value = faster cooking (divide cook time by this).
 * Line Cook: +15% per level.
 */
export function getStaffCookSpeedMultiplier(state: GameState): number {
  let multiplier = 1.0;
  const lineCook = state.staff.line_cook;
  if (lineCook?.hired) {
    multiplier += 0.15 * lineCook.level;
  }
  return multiplier;
}

/**
 * Returns the combined sell speed multiplier from all hired staff.
 * Higher value = faster selling (divide sell time by this).
 * Cashier: +15% per level, Marketing Intern: +10% per level.
 */
export function getStaffSellSpeedMultiplier(state: GameState): number {
  let multiplier = 1.0;
  const cashier = state.staff.cashier;
  if (cashier?.hired) {
    multiplier += 0.15 * cashier.level;
  }
  const intern = state.staff.marketing_intern;
  if (intern?.hired) {
    multiplier += 0.1 * intern.level;
  }
  return multiplier;
}

/**
 * Returns the combined sale value multiplier from all hired staff.
 * Sous Chef: +10% per level, Health Inspector: +5% per level.
 */
export function getStaffSaleValueMultiplier(state: GameState): number {
  let multiplier = 1.0;
  const sousChef = state.staff.sous_chef;
  if (sousChef?.hired) {
    multiplier += 0.1 * sousChef.level;
  }
  const inspector = state.staff.health_inspector;
  if (inspector?.hired) {
    multiplier += 0.05 * inspector.level;
  }
  return multiplier;
}

/**
 * Returns the upgrade cost discount multiplier from the Accountant.
 * Accountant: -5% per level, max -30% (at level 6).
 * Returns a value between 0.7 and 1.0 (multiply cost by this).
 */
export function getAccountantDiscount(state: GameState): number {
  const accountant = state.staff.accountant;
  if (!accountant?.hired) return 1.0;
  const discount = Math.min(0.05 * accountant.level, 0.3);
  return 1.0 - discount;
}
