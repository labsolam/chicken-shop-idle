import {
  GameState,
  ManagerState,
  EquipmentState,
  StaffState,
} from "../types/game-state";

/**
 * AGENT CONTEXT: Pure serialization/deserialization for game state.
 * localStorage I/O is handled in main.ts, keeping these functions testable.
 * Phase 1 new fields are handled as optional (with safe defaults) for old-save compat.
 * Phase 2 new fields: managers, lastOnlineTimestamp, revenueTracker,
 *   totalChickensBought, tipsLevel, lastClickTimestamps.
 * Phase 3 new fields: equipment, staff, lastActivityTimestamp, continuousIdleMs.
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
  // Phase 2 additions
  "lastOnlineTimestamp",
  "totalChickensBought",
  "tipsLevel",
  // Phase 3 additions
  "lastActivityTimestamp",
  "continuousIdleMs",
];

function isEquipmentState(v: unknown): v is EquipmentState {
  if (typeof v !== "object" || v === null) return false;
  const obj = v as Record<string, unknown>;
  return typeof obj.owned === "boolean" && typeof obj.level === "number";
}

function isStaffState(v: unknown): v is StaffState {
  if (typeof v !== "object" || v === null) return false;
  const obj = v as Record<string, unknown>;
  return typeof obj.hired === "boolean" && typeof obj.level === "number";
}

function deserializeRecord<T>(
  raw: unknown,
  validator: (v: unknown) => v is T,
): Record<string, T> {
  if (typeof raw !== "object" || raw === null) return {};
  const obj = raw as Record<string, unknown>;
  const result: Record<string, T> = {};
  for (const key of Object.keys(obj)) {
    if (validator(obj[key])) {
      result[key] = obj[key] as T;
    }
  }
  return result;
}

function isManagerState(v: unknown): v is ManagerState {
  if (typeof v !== "object" || v === null) return false;
  const obj = v as Record<string, unknown>;
  return (
    typeof obj.hired === "boolean" &&
    typeof obj.level === "number" &&
    typeof obj.elapsedMs === "number"
  );
}

function deserializeManager(v: unknown): ManagerState {
  if (isManagerState(v)) return v;
  return { hired: false, level: 1, elapsedMs: 0 };
}

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

  // Phase 2: managers (optional nested object — falls back to defaults)
  const rawManagers =
    typeof obj.managers === "object" && obj.managers !== null
      ? (obj.managers as Record<string, unknown>)
      : {};

  // Phase 2: revenueTracker (optional nested object)
  const rawTracker =
    typeof obj.revenueTracker === "object" && obj.revenueTracker !== null
      ? (obj.revenueTracker as Record<string, unknown>)
      : {};

  const revenueTracker = {
    recentRevenueCents:
      typeof rawTracker.recentRevenueCents === "number"
        ? rawTracker.recentRevenueCents
        : 0,
    trackerElapsedMs:
      typeof rawTracker.trackerElapsedMs === "number"
        ? rawTracker.trackerElapsedMs
        : 0,
    lastComputedRatePerMs:
      typeof rawTracker.lastComputedRatePerMs === "number"
        ? rawTracker.lastComputedRatePerMs
        : 0,
  };

  // Phase 2: lastClickTimestamps (optional nested object)
  const rawClicks =
    typeof obj.lastClickTimestamps === "object" &&
    obj.lastClickTimestamps !== null
      ? (obj.lastClickTimestamps as Record<string, unknown>)
      : {};

  const lastClickTimestamps = {
    buyer: typeof rawClicks.buyer === "number" ? rawClicks.buyer : 0,
    cook: typeof rawClicks.cook === "number" ? rawClicks.cook : 0,
    sell: typeof rawClicks.sell === "number" ? rawClicks.sell : 0,
  };

  // For old saves lacking lastOnlineTimestamp, fall back to lastUpdateTimestamp
  const lastOnlineTimestamp =
    (obj.lastOnlineTimestamp as number | undefined) ??
    (obj.lastUpdateTimestamp as number);

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
    // Phase 2 fields with safe defaults
    managers: {
      buyer: deserializeManager(rawManagers.buyer),
      cook: deserializeManager(rawManagers.cook),
      sell: deserializeManager(rawManagers.sell),
    },
    lastOnlineTimestamp,
    revenueTracker,
    totalChickensBought: (obj.totalChickensBought as number) ?? 0,
    tipsLevel: (obj.tipsLevel as number) ?? 0,
    lastClickTimestamps,
    // Phase 3 fields with safe defaults
    equipment: deserializeRecord(obj.equipment, isEquipmentState),
    staff: deserializeRecord(obj.staff, isStaffState),
    lastActivityTimestamp: (obj.lastActivityTimestamp as number) ?? 0,
    continuousIdleMs: (obj.continuousIdleMs as number) ?? 0,
  };
}
