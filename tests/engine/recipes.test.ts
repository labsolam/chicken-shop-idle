import { describe, it, expect } from "vitest";
import { RECIPES, RECIPE_IDS, Recipe } from "../../src/engine/recipes";

function req(id: string): Recipe {
  const r = RECIPES[id];
  if (!r) throw new Error(`Recipe not found: ${id}`);
  return r;
}

describe("RECIPES", () => {
  it("defines basic_fried as starting recipe", () => {
    const r = req("basic_fried");
    expect(r.id).toBe("basic_fried");
    expect(r.rawInput).toBe(1);
    expect(r.cookTimeSeconds).toBe(10);
    expect(r.saleValueCents).toBe(50);
    expect(r.unlockCondition.type).toBe("start");
    expect(r.types).toContain("fried");
  });

  it("defines grilled chicken with revenue unlock", () => {
    const r = req("grilled");
    expect(r.rawInput).toBe(1);
    expect(r.cookTimeSeconds).toBe(15);
    expect(r.saleValueCents).toBe(100);
    expect(r.unlockCondition.type).toBe("revenue");
    if (r.unlockCondition.type === "revenue") {
      expect(r.unlockCondition.thresholdCents).toBe(50000); // $500
    }
    expect(r.types).toContain("grilled");
  });

  it("defines chicken wings with sold unlock", () => {
    const r = req("wings");
    expect(r.rawInput).toBe(1);
    expect(r.cookTimeSeconds).toBe(8);
    expect(r.saleValueCents).toBe(75);
    expect(r.unlockCondition.type).toBe("sold");
    if (r.unlockCondition.type === "sold") {
      expect(r.unlockCondition.thresholdCount).toBe(250);
    }
  });

  it("defines chicken burger with 2 raw inputs", () => {
    const r = req("burger");
    expect(r.rawInput).toBe(2);
    expect(r.cookTimeSeconds).toBe(20);
    expect(r.saleValueCents).toBe(200);
  });

  it("defines all 8 recipes", () => {
    expect(Object.keys(RECIPES)).toHaveLength(8);
  });

  it("RECIPE_IDS includes all recipe keys", () => {
    for (const id of RECIPE_IDS) {
      expect(RECIPES[id]).toBeDefined();
    }
  });

  it("each recipe has required fields", () => {
    for (const recipe of Object.values(RECIPES)) {
      expect(recipe.id).toBeTruthy();
      expect(recipe.name).toBeTruthy();
      expect(recipe.rawInput).toBeGreaterThan(0);
      expect(recipe.cookTimeSeconds).toBeGreaterThan(0);
      expect(recipe.saleValueCents).toBeGreaterThan(0);
      expect(recipe.types.length).toBeGreaterThan(0);
    }
  });
});
