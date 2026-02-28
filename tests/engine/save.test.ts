import { describe, it, expect } from "vitest";
import { serializeState, deserializeState } from "../../src/engine/save";
import { createInitialState, GameState } from "../../src/types/game-state";

describe("serializeState", () => {
  it("produces valid JSON", () => {
    const state = createInitialState();
    const json = serializeState(state);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it("includes all legacy and Phase 1 state fields", () => {
    const state = createInitialState();
    const parsed = JSON.parse(serializeState(state));
    // Legacy fields
    expect(parsed).toHaveProperty("money");
    expect(parsed).toHaveProperty("totalChickensCooked");
    expect(parsed).toHaveProperty("chickensBought");
    expect(parsed).toHaveProperty("chickensReady");
    expect(parsed).toHaveProperty("cookTimeSeconds");
    expect(parsed).toHaveProperty("chickenPriceInCents");
    expect(parsed).toHaveProperty("shopOpen");
    expect(parsed).toHaveProperty("lastUpdateTimestamp");
    expect(parsed).toHaveProperty("cookingCount");
    expect(parsed).toHaveProperty("cookingElapsedMs");
    expect(parsed).toHaveProperty("sellingCount");
    expect(parsed).toHaveProperty("sellingElapsedMs");
    expect(parsed).toHaveProperty("sellTimeSeconds");
    // Phase 1 fields
    expect(parsed).toHaveProperty("sellSpeedLevel");
    expect(parsed).toHaveProperty("coldStorageLevel");
    expect(parsed).toHaveProperty("cookingSlotsLevel");
    expect(parsed).toHaveProperty("sellingRegistersLevel");
    expect(parsed).toHaveProperty("activeRecipe");
    expect(parsed).toHaveProperty("cookingRecipeId");
    expect(parsed).toHaveProperty("totalChickensSold");
    expect(parsed).toHaveProperty("totalRevenueCents");
    expect(parsed).toHaveProperty("earnedMilestones");
    expect(parsed).toHaveProperty("unlockedRecipes");
  });

  it("includes Phase 2 state fields in serialized output", () => {
    const state = createInitialState();
    const parsed = JSON.parse(serializeState(state));
    expect(parsed).toHaveProperty("managers");
    expect(parsed).toHaveProperty("lastOnlineTimestamp");
    expect(parsed).toHaveProperty("revenueTracker");
    expect(parsed).toHaveProperty("totalChickensBought");
    expect(parsed).toHaveProperty("tipsLevel");
    expect(parsed).toHaveProperty("lastClickTimestamps");
  });
});

describe("deserializeState", () => {
  it("round-trips with serializeState (Phase 1 + Phase 2 full state)", () => {
    const original: GameState = {
      money: 5000,
      totalChickensCooked: 42,
      chickensBought: 5,
      chickensReady: 3,
      cookTimeSeconds: 10,
      chickenPriceInCents: 50,
      shopOpen: true,
      lastUpdateTimestamp: 1700000000000,
      cookSpeedLevel: 2,
      chickenValueLevel: 3,
      cookingCount: 1,
      cookingElapsedMs: 3000,
      sellingCount: 2,
      sellingElapsedMs: 5000,
      sellTimeSeconds: 10,
      sellSpeedLevel: 1,
      coldStorageLevel: 2,
      cookingSlotsLevel: 1,
      sellingRegistersLevel: 1,
      activeRecipe: "grilled",
      cookingRecipeId: "basic_fried",
      totalChickensSold: 150,
      totalRevenueCents: 75000,
      earnedMilestones: ["sold_10", "sold_50"],
      unlockedRecipes: ["basic_fried", "grilled"],
      // Phase 2
      managers: {
        buyer: { hired: true, level: 2, elapsedMs: 500 },
        cook: { hired: true, level: 1, elapsedMs: 0 },
        sell: { hired: false, level: 1, elapsedMs: 0 },
      },
      lastOnlineTimestamp: 1700000000000,
      revenueTracker: {
        recentRevenueCents: 1500,
        trackerElapsedMs: 30000,
        lastComputedRatePerMs: 0.05,
      },
      totalChickensBought: 200,
      tipsLevel: 2,
      lastClickTimestamps: { buy: 1000, cook: 2000, sell: 3000 },
    };
    const json = serializeState(original);
    const restored = deserializeState(json);
    expect(restored).toEqual(original);
  });

  it("returns null for invalid JSON", () => {
    expect(deserializeState("not json")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(deserializeState("")).toBeNull();
  });

  it("returns null when money is missing", () => {
    const partial = { totalChickensCooked: 0, chickensReady: 0 };
    expect(deserializeState(JSON.stringify(partial))).toBeNull();
  });

  it("returns null when a field has wrong type", () => {
    const bad = {
      money: "not a number",
      totalChickensCooked: 0,
      chickensReady: 0,
      cookTimeSeconds: 10,
      chickenPriceInCents: 50,
      shopOpen: true,
      lastUpdateTimestamp: 0,
    };
    expect(deserializeState(JSON.stringify(bad))).toBeNull();
  });

  it("returns null when earnedMilestones is not an array", () => {
    const state = createInitialState();
    const bad = { ...state, earnedMilestones: "invalid" };
    expect(deserializeState(JSON.stringify(bad))).toBeNull();
  });

  it("returns null when unlockedRecipes is not an array", () => {
    const state = createInitialState();
    const bad = { ...state, unlockedRecipes: 42 };
    expect(deserializeState(JSON.stringify(bad))).toBeNull();
  });

  it("defaults missing Phase 1 fields from old saves", () => {
    const oldSave = {
      money: 1000,
      totalChickensCooked: 10,
      chickensReady: 2,
      cookTimeSeconds: 5,
      chickenPriceInCents: 100,
      shopOpen: true,
      lastUpdateTimestamp: 1700000000000,
    };
    const restored = deserializeState(JSON.stringify(oldSave));
    expect(restored).not.toBeNull();
    expect(restored?.cookSpeedLevel).toBe(0);
    expect(restored?.chickenValueLevel).toBe(0);
    expect(restored?.chickensBought).toBe(0);
    expect(restored?.cookingCount).toBe(0);
    expect(restored?.cookingElapsedMs).toBe(0);
    expect(restored?.sellingCount).toBe(0);
    expect(restored?.sellingElapsedMs).toBe(0);
    expect(restored?.sellTimeSeconds).toBe(10);
    // Phase 1 defaults
    expect(restored?.sellSpeedLevel).toBe(0);
    expect(restored?.coldStorageLevel).toBe(0);
    expect(restored?.cookingSlotsLevel).toBe(0);
    expect(restored?.sellingRegistersLevel).toBe(0);
    expect(restored?.activeRecipe).toBe("basic_fried");
    expect(restored?.cookingRecipeId).toBe("basic_fried");
    expect(restored?.totalChickensSold).toBe(0);
    expect(restored?.totalRevenueCents).toBe(0);
    expect(restored?.earnedMilestones).toEqual([]);
    expect(restored?.unlockedRecipes).toEqual(["basic_fried"]);
  });

  it("ignores extra fields in JSON", () => {
    const state = createInitialState();
    const json = JSON.stringify({ ...state, extraField: "should be ignored" });
    const restored = deserializeState(json);
    expect(restored).not.toBeNull();
    expect(restored).not.toHaveProperty("extraField");
  });

  it("defaults missing Phase 2 fields from old saves", () => {
    const oldSave = {
      money: 1000,
      totalChickensCooked: 10,
      chickensReady: 2,
      cookTimeSeconds: 5,
      chickenPriceInCents: 100,
      shopOpen: true,
      lastUpdateTimestamp: 1700000000000,
    };
    const restored = deserializeState(JSON.stringify(oldSave));
    expect(restored).not.toBeNull();
    // Phase 2 defaults
    expect(restored?.managers.buyer.hired).toBe(false);
    expect(restored?.managers.buyer.level).toBe(1);
    expect(restored?.managers.cook.hired).toBe(false);
    expect(restored?.managers.sell.hired).toBe(false);
    expect(restored?.tipsLevel).toBe(0);
    expect(restored?.totalChickensBought).toBe(0);
    expect(restored?.lastClickTimestamps).toEqual({ buy: 0, cook: 0, sell: 0 });
    expect(restored?.revenueTracker.lastComputedRatePerMs).toBe(0);
    // lastOnlineTimestamp falls back to lastUpdateTimestamp for old saves
    expect(restored?.lastOnlineTimestamp).toBe(1700000000000);
  });

  it("deserializes valid manager state from JSON", () => {
    const state = createInitialState();
    const withManagers = {
      ...state,
      managers: {
        buyer: { hired: true, level: 3, elapsedMs: 1500 },
        cook: { hired: true, level: 2, elapsedMs: 500 },
        sell: { hired: false, level: 1, elapsedMs: 0 },
      },
    };
    const restored = deserializeState(serializeState(withManagers));
    expect(restored?.managers.buyer).toEqual({
      hired: true,
      level: 3,
      elapsedMs: 1500,
    });
    expect(restored?.managers.cook.hired).toBe(true);
    expect(restored?.managers.sell.hired).toBe(false);
  });

  it("falls back to default manager state when manager data is malformed", () => {
    const state = createInitialState();
    const bad = {
      ...state,
      managers: {
        buyer: { hired: "yes", level: 1, elapsedMs: 0 }, // hired is wrong type
        cook: null,
        sell: { hired: false, level: 1, elapsedMs: 0 },
      },
    };
    const restored = deserializeState(JSON.stringify(bad));
    expect(restored).not.toBeNull();
    // Falls back to default for invalid entries
    expect(restored?.managers.buyer.hired).toBe(false);
    expect(restored?.managers.cook.hired).toBe(false);
    expect(restored?.managers.sell.hired).toBe(false);
  });
});
