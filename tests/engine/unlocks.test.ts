import { describe, it, expect } from "vitest";
import { isFeatureUnlocked } from "../../src/engine/unlocks";
import { createInitialState, GameState } from "../../src/types/game-state";

function stateWith(overrides: Partial<GameState>): GameState {
  return { ...createInitialState(), ...overrides };
}

describe("isFeatureUnlocked", () => {
  it("bulk_buy_x5 unlocks at $50 total earned (5000 cents)", () => {
    expect(
      isFeatureUnlocked(stateWith({ totalRevenueCents: 4999 }), "bulk_buy_x5"),
    ).toBe(false);
    expect(
      isFeatureUnlocked(stateWith({ totalRevenueCents: 5000 }), "bulk_buy_x5"),
    ).toBe(true);
    expect(
      isFeatureUnlocked(stateWith({ totalRevenueCents: 10000 }), "bulk_buy_x5"),
    ).toBe(true);
  });

  it("cold_storage unlocks at $100 total earned (10000 cents)", () => {
    expect(
      isFeatureUnlocked(stateWith({ totalRevenueCents: 9999 }), "cold_storage"),
    ).toBe(false);
    expect(
      isFeatureUnlocked(
        stateWith({ totalRevenueCents: 10000 }),
        "cold_storage",
      ),
    ).toBe(true);
  });

  it("cooking_slots unlocks at $500 total earned (50000 cents)", () => {
    expect(
      isFeatureUnlocked(
        stateWith({ totalRevenueCents: 49999 }),
        "cooking_slots",
      ),
    ).toBe(false);
    expect(
      isFeatureUnlocked(
        stateWith({ totalRevenueCents: 50000 }),
        "cooking_slots",
      ),
    ).toBe(true);
  });

  it("selling_registers unlocks at $300 total earned (30000 cents)", () => {
    expect(
      isFeatureUnlocked(
        stateWith({ totalRevenueCents: 29999 }),
        "selling_registers",
      ),
    ).toBe(false);
    expect(
      isFeatureUnlocked(
        stateWith({ totalRevenueCents: 30000 }),
        "selling_registers",
      ),
    ).toBe(true);
  });

  it("bulk_buy_x10 unlocks at $5K total earned (500000 cents)", () => {
    expect(
      isFeatureUnlocked(
        stateWith({ totalRevenueCents: 499999 }),
        "bulk_buy_x10",
      ),
    ).toBe(false);
    expect(
      isFeatureUnlocked(
        stateWith({ totalRevenueCents: 500000 }),
        "bulk_buy_x10",
      ),
    ).toBe(true);
  });

  it("bulk_cook_x5 unlocks when sold_2500 milestone is earned", () => {
    const locked = stateWith({ earnedMilestones: [] });
    const unlocked = stateWith({ earnedMilestones: ["sold_2500"] });
    expect(isFeatureUnlocked(locked, "bulk_cook_x5")).toBe(false);
    expect(isFeatureUnlocked(unlocked, "bulk_cook_x5")).toBe(true);
  });

  it("nothing is unlocked in initial state", () => {
    const state = createInitialState();
    expect(isFeatureUnlocked(state, "bulk_buy_x5")).toBe(false);
    expect(isFeatureUnlocked(state, "cold_storage")).toBe(false);
    expect(isFeatureUnlocked(state, "cooking_slots")).toBe(false);
    expect(isFeatureUnlocked(state, "selling_registers")).toBe(false);
    expect(isFeatureUnlocked(state, "bulk_buy_x10")).toBe(false);
    expect(isFeatureUnlocked(state, "bulk_cook_x5")).toBe(false);
  });
});
