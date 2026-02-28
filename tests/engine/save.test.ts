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
});

describe("deserializeState", () => {
  it("round-trips with serializeState (Phase 1 full state)", () => {
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
});
