import { GameState } from "../types/game-state";

/**
 * AGENT CONTEXT: Pure serialization/deserialization for game state.
 * localStorage I/O is handled in main.ts, keeping these functions testable.
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
  };
}
