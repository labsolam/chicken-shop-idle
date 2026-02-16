/**
 * AGENT CONTEXT: This file defines the complete game state shape.
 * The game uses a 3-step clicker flow: Buy → Cook → Sell.
 * All monetary values are in integer cents to avoid floating point issues.
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

  /** Seconds to cook one chicken (used by upgrades) */
  cookTimeSeconds: number;

  /** Sale price per chicken in cents */
  chickenPriceInCents: number;

  /** Whether the shop is currently open */
  shopOpen: boolean;

  /** Timestamp of last update (ms since epoch) */
  lastUpdateTimestamp: number;

  /** Current cook-speed upgrade level (0 = no upgrades bought) */
  cookSpeedLevel: number;

  /** Current chicken-value upgrade level (0 = no upgrades bought) */
  chickenValueLevel: number;
}

export function createInitialState(): GameState {
  return {
    money: 500,
    totalChickensCooked: 0,
    chickensBought: 0,
    chickensReady: 0,
    cookTimeSeconds: 5,
    chickenPriceInCents: 100,
    shopOpen: true,
    lastUpdateTimestamp: Date.now(),
    cookSpeedLevel: 0,
    chickenValueLevel: 0,
  };
}
