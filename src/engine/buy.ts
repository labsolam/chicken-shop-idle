import { GameState } from "../types/game-state";

/**
 * AGENT CONTEXT: Upgrade purchase system.
 * Pure functions for computing upgrade costs, applying purchases,
 * and calculating effective stats from upgrade levels.
 * Cost formula: baseCost * 1.5^level (exponential scaling).
 */

export type UpgradeType = "cookSpeed" | "chickenValue";

const BASE_UPGRADE_COST = 500; // 500 cents = $5.00
const COST_MULTIPLIER = 1.5;

/** Returns the cost in cents to buy the next level of an upgrade. */
export function getUpgradeCost(
  type: UpgradeType,
  currentLevel: number,
): number {
  void type; // same formula for all upgrades currently
  return Math.floor(
    BASE_UPGRADE_COST * Math.pow(COST_MULTIPLIER, currentLevel),
  );
}

/** Attempts to buy an upgrade. Returns unchanged state if money is insufficient. */
export function buyUpgrade(state: GameState, type: UpgradeType): GameState {
  const levelKey =
    type === "cookSpeed" ? "cookSpeedLevel" : "chickenValueLevel";
  const cost = getUpgradeCost(type, state[levelKey]);

  if (state.money < cost) {
    return { ...state };
  }

  return {
    ...state,
    money: state.money - cost,
    [levelKey]: state[levelKey] + 1,
  };
}

/** Returns the effective cook time after applying speed upgrades. Min 0.5s. */
export function getEffectiveCookTime(
  baseCookTime: number,
  speedLevel: number,
): number {
  // Each level reduces cook time by 10%: base * 0.9^level
  return Math.max(0.5, baseCookTime * Math.pow(0.9, speedLevel));
}

/** Returns the effective chicken price after applying value upgrades. */
export function getEffectiveChickenPrice(
  basePrice: number,
  valueLevel: number,
): number {
  // Each level adds 25 cents ($0.25) per chicken
  return basePrice + valueLevel * 25;
}
