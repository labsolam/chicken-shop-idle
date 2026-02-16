import { describe, it, expect } from "vitest";
import { serializeState, deserializeState } from "../../src/engine/save";
import { createInitialState, GameState } from "../../src/types/game-state";

describe("serializeState", () => {
  it("produces valid JSON", () => {
    const state = createInitialState();
    const json = serializeState(state);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it("includes all state fields", () => {
    const state = createInitialState();
    const parsed = JSON.parse(serializeState(state));
    expect(parsed).toHaveProperty("money");
    expect(parsed).toHaveProperty("totalChickensCooked");
    expect(parsed).toHaveProperty("chickensBought");
    expect(parsed).toHaveProperty("chickensReady");
    expect(parsed).toHaveProperty("cookTimeSeconds");
    expect(parsed).toHaveProperty("chickenPriceInCents");
    expect(parsed).toHaveProperty("shopOpen");
    expect(parsed).toHaveProperty("lastUpdateTimestamp");
  });
});

describe("deserializeState", () => {
  it("round-trips with serializeState", () => {
    const original: GameState = {
      money: 5000,
      totalChickensCooked: 42,
      chickensBought: 5,
      chickensReady: 3,
      cookTimeSeconds: 5,
      chickenPriceInCents: 100,
      shopOpen: true,
      lastUpdateTimestamp: 1700000000000,
      cookSpeedLevel: 2,
      chickenValueLevel: 3,
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
      cookTimeSeconds: 5,
      chickenPriceInCents: 100,
      shopOpen: true,
      lastUpdateTimestamp: 0,
    };
    expect(deserializeState(JSON.stringify(bad))).toBeNull();
  });

  it("defaults missing optional fields to 0 (old save compat)", () => {
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
  });

  it("ignores extra fields in JSON", () => {
    const state = createInitialState();
    const json = JSON.stringify({ ...state, extraField: "should be ignored" });
    const restored = deserializeState(json);
    expect(restored).not.toBeNull();
    expect(restored).not.toHaveProperty("extraField");
  });
});
