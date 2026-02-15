/**
 * AGENT CONTEXT: This file defines the complete game state shape.
 * The game is a pure state machine: tick(state, deltaMs) => newState.
 * All monetary values are in integer cents to avoid floating point issues.
 */

export interface GameState {
  /** Total money in cents. 100 = $1.00 */
  money: number;

  /** Total chickens cooked (lifetime stat) */
  totalChickensCooked: number;

  /** Chickens currently ready to sell */
  chickensReady: number;

  /** Progress toward next chicken, 0.0 to 1.0 */
  cookingProgress: number;

  /** Seconds to cook one chicken */
  cookTimeSeconds: number;

  /** Sale price per chicken in cents */
  chickenPriceInCents: number;

  /** Whether the shop is currently open and producing */
  shopOpen: boolean;

  /** Timestamp of last update (ms since epoch), used for offline progress */
  lastUpdateTimestamp: number;

  /** Current cook-speed upgrade level (0 = no upgrades bought) */
  cookSpeedLevel: number;

  /** Current chicken-value upgrade level (0 = no upgrades bought) */
  chickenValueLevel: number;
}

export function createInitialState(): GameState {
  return {
    money: 0,
    totalChickensCooked: 0,
    chickensReady: 0,
    cookingProgress: 0,
    cookTimeSeconds: 5,
    chickenPriceInCents: 100,
    shopOpen: true,
    lastUpdateTimestamp: Date.now(),
    cookSpeedLevel: 0,
    chickenValueLevel: 0,
  };
}
