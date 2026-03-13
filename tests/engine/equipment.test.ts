import { describe, it, expect } from "vitest";
import {
  EQUIPMENT,
  EQUIPMENT_IDS,
  isEquipmentUnlocked,
  getEquipmentCost,
  buyEquipment,
  getEquipmentCookSpeedMultiplier,
  getEquipmentSellSpeedMultiplier,
  getEquipmentSaleValueMultiplier,
  getEquipmentTipBonus,
  getEquipmentExtraCookingSlots,
  getEquipmentExtraSellRegisters,
} from "@engine/equipment";
import { createInitialState, GameState } from "../../src/types/game-state";

function stateWith(overrides: Partial<GameState>): GameState {
  return { ...createInitialState(), ...overrides };
}

describe("EQUIPMENT definitions", () => {
  it("has 13 equipment items", () => {
    expect(EQUIPMENT_IDS.length).toBe(13);
  });

  it("all IDs in EQUIPMENT_IDS exist in EQUIPMENT", () => {
    for (const id of EQUIPMENT_IDS) {
      expect(EQUIPMENT[id]).toBeDefined();
    }
  });

  it("all equipment have positive maxLevel, baseCostCents, and costScaling", () => {
    for (const id of EQUIPMENT_IDS) {
      const def = EQUIPMENT[id];
      expect(def).toBeDefined();
      expect(def?.maxLevel).toBeGreaterThan(0);
      expect(def?.baseCostCents).toBeGreaterThan(0);
      expect(def?.costScaling).toBeGreaterThan(1);
    }
  });
});

describe("isEquipmentUnlocked", () => {
  it("returns false for unknown equipment", () => {
    expect(isEquipmentUnlocked(createInitialState(), "unknown_equip")).toBe(
      false,
    );
  });

  it("returns false when revenue below threshold", () => {
    const state = stateWith({ totalRevenueCents: 0 });
    expect(isEquipmentUnlocked(state, "basic_oven")).toBe(false);
  });

  it("returns true when revenue meets threshold", () => {
    const state = stateWith({ totalRevenueCents: 100_000 });
    expect(isEquipmentUnlocked(state, "basic_oven")).toBe(true);
  });

  it("returns true when revenue exceeds threshold", () => {
    const state = stateWith({ totalRevenueCents: 999_999_999 });
    expect(isEquipmentUnlocked(state, "basic_oven")).toBe(true);
  });
});

describe("getEquipmentCost", () => {
  it("returns base cost at level 0", () => {
    expect(getEquipmentCost("basic_oven", 0)).toBe(100_000);
  });

  it("scales with level", () => {
    // basic_oven: 100_000 * 2^1 = 200_000
    expect(getEquipmentCost("basic_oven", 1)).toBe(200_000);
  });

  it("uses equipment-specific scaling factor", () => {
    // rotisserie_spit: 50_000_000 * 2.5^1 = 125_000_000
    expect(getEquipmentCost("rotisserie_spit", 1)).toBe(125_000_000);
  });

  it("returns Infinity for unknown equipment", () => {
    expect(getEquipmentCost("nonexistent", 0)).toBe(Infinity);
  });
});

describe("buyEquipment", () => {
  it("buys equipment when affordable and unlocked", () => {
    const state = stateWith({
      money: 200_000,
      totalRevenueCents: 100_000,
    });
    const result = buyEquipment(state, "basic_oven");
    expect(result.equipment.basic_oven).toEqual({ owned: true, level: 1 });
    expect(result.money).toBe(200_000 - 100_000);
  });

  it("upgrades equipment from level 1 to 2", () => {
    const state = stateWith({
      money: 500_000,
      totalRevenueCents: 100_000,
      equipment: { basic_oven: { owned: true, level: 1 } },
    });
    const result = buyEquipment(state, "basic_oven");
    expect(result.equipment.basic_oven).toEqual({ owned: true, level: 2 });
  });

  it("returns unchanged state when not unlocked", () => {
    const state = stateWith({ money: 999_999_999, totalRevenueCents: 0 });
    const result = buyEquipment(state, "basic_oven");
    expect(result.equipment.basic_oven).toBeUndefined();
    expect(result.money).toBe(999_999_999);
  });

  it("returns unchanged state when at max level", () => {
    const state = stateWith({
      money: 999_999_999,
      totalRevenueCents: 100_000,
      equipment: { basic_oven: { owned: true, level: 10 } },
    });
    const result = buyEquipment(state, "basic_oven");
    expect(result.equipment.basic_oven?.level).toBe(10);
  });

  it("returns unchanged state when cannot afford", () => {
    const state = stateWith({ money: 1, totalRevenueCents: 100_000 });
    const result = buyEquipment(state, "basic_oven");
    expect(result.equipment.basic_oven).toBeUndefined();
    expect(result.money).toBe(1);
  });

  it("does not mutate input state", () => {
    const state = stateWith({
      money: 200_000,
      totalRevenueCents: 100_000,
    });
    const before = JSON.stringify(state);
    buyEquipment(state, "basic_oven");
    expect(JSON.stringify(state)).toBe(before);
  });
});

describe("getEquipmentCookSpeedMultiplier", () => {
  it("returns 1.0 with no equipment", () => {
    expect(getEquipmentCookSpeedMultiplier(createInitialState())).toBe(1.0);
  });

  it("returns 1.1 with basic oven level 1 (+10% cook speed)", () => {
    const state = stateWith({
      equipment: { basic_oven: { owned: true, level: 1 } },
    });
    expect(getEquipmentCookSpeedMultiplier(state)).toBeCloseTo(1.1);
  });

  it("stacks multiple equipment cook speed bonuses", () => {
    const state = stateWith({
      equipment: {
        basic_oven: { owned: true, level: 2 }, // +10% * 2 = +20%
        commercial_oven: { owned: true, level: 1 }, // +25% * 1 = +25%
      },
    });
    // 1.0 + 0.2 + 0.25 = 1.45
    expect(getEquipmentCookSpeedMultiplier(state)).toBeCloseTo(1.45);
  });

  it("ignores non-owned equipment", () => {
    const state = stateWith({
      equipment: { basic_oven: { owned: false, level: 5 } },
    });
    expect(getEquipmentCookSpeedMultiplier(state)).toBe(1.0);
  });
});

describe("getEquipmentSellSpeedMultiplier", () => {
  it("returns 1.0 with no equipment", () => {
    expect(getEquipmentSellSpeedMultiplier(createInitialState())).toBe(1.0);
  });

  it("returns 1.1 with cash register level 1", () => {
    const state = stateWith({
      equipment: { cash_register: { owned: true, level: 1 } },
    });
    expect(getEquipmentSellSpeedMultiplier(state)).toBeCloseTo(1.1);
  });
});

describe("getEquipmentSaleValueMultiplier", () => {
  it("returns 1.0 with no equipment", () => {
    expect(
      getEquipmentSaleValueMultiplier(createInitialState(), ["fried"]),
    ).toBe(1.0);
  });

  it("applies global sale value bonus", () => {
    const state = stateWith({
      equipment: { rotisserie_spit: { owned: true, level: 2 } },
    });
    // +10% * 2 = +20%
    expect(getEquipmentSaleValueMultiplier(state, ["roasted"])).toBeCloseTo(
      1.2,
    );
  });

  it("applies type-specific bonus when recipe type matches", () => {
    const state = stateWith({
      equipment: { industrial_fryer: { owned: true, level: 1 } },
    });
    // +15% for fried items
    expect(getEquipmentSaleValueMultiplier(state, ["fried"])).toBeCloseTo(1.15);
  });

  it("does not apply type-specific bonus when type does not match", () => {
    const state = stateWith({
      equipment: { industrial_fryer: { owned: true, level: 1 } },
    });
    expect(getEquipmentSaleValueMultiplier(state, ["grilled"])).toBeCloseTo(
      1.0,
    );
  });
});

describe("getEquipmentTipBonus", () => {
  it("returns 0 with no equipment", () => {
    expect(getEquipmentTipBonus(createInitialState())).toBe(0);
  });

  it("returns tip bonus from neon sign", () => {
    const state = stateWith({
      equipment: { neon_sign: { owned: true, level: 2 } },
    });
    // +10% * 2 = 0.2
    expect(getEquipmentTipBonus(state)).toBeCloseTo(0.2);
  });
});

describe("getEquipmentExtraCookingSlots", () => {
  it("returns 0 with no equipment", () => {
    expect(getEquipmentExtraCookingSlots(createInitialState())).toBe(0);
  });

  it("returns 1 with commercial oven owned", () => {
    const state = stateWith({
      equipment: { commercial_oven: { owned: true, level: 1 } },
    });
    expect(getEquipmentExtraCookingSlots(state)).toBe(1);
  });

  it("returns 0 when commercial oven not owned", () => {
    const state = stateWith({
      equipment: { commercial_oven: { owned: false, level: 0 } },
    });
    expect(getEquipmentExtraCookingSlots(state)).toBe(0);
  });
});

describe("getEquipmentExtraSellRegisters", () => {
  it("returns 0 with no equipment", () => {
    expect(getEquipmentExtraSellRegisters(createInitialState())).toBe(0);
  });

  it("returns 1 with drive-through owned", () => {
    const state = stateWith({
      equipment: { drive_through: { owned: true, level: 1 } },
    });
    expect(getEquipmentExtraSellRegisters(state)).toBe(1);
  });
});
