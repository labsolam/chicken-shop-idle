import { describe, it, expect } from "vitest";
import { tick } from "@engine/tick";
import { createInitialState, GameState } from "../../src/types/game-state";

function stateWith(overrides: Partial<GameState>): GameState {
  return { ...createInitialState(), ...overrides };
}

describe("tick", () => {
  describe("cooking progress", () => {
    it("advances cooking progress based on elapsed time", () => {
      const state = stateWith({ cookTimeSeconds: 10, cookingProgress: 0 });
      const result = tick(state, 5000); // 5 seconds
      expect(result.cookingProgress).toBeCloseTo(0.5);
    });

    it("produces a chicken when cooking progress reaches 1.0", () => {
      const state = stateWith({
        cookTimeSeconds: 10,
        cookingProgress: 0.9,
        chickensReady: 0,
        totalChickensCooked: 0,
      });
      const result = tick(state, 2000); // 2 seconds = 0.2 more progress => 1.1
      expect(result.chickensReady).toBe(1);
      expect(result.totalChickensCooked).toBe(1);
    });

    it("wraps leftover progress into the next chicken", () => {
      const state = stateWith({
        cookTimeSeconds: 10,
        cookingProgress: 0.9,
      });
      const result = tick(state, 2000); // 0.9 + 0.2 = 1.1 => 1 chicken, 0.1 leftover
      expect(result.cookingProgress).toBeCloseTo(0.1);
    });

    it("handles cooking multiple chickens in one tick (offline catch-up)", () => {
      const state = stateWith({
        cookTimeSeconds: 10,
        cookingProgress: 0,
        chickensReady: 0,
        totalChickensCooked: 5,
      });
      const result = tick(state, 25000); // 25 seconds = 2.5 cook cycles
      expect(result.chickensReady).toBe(2);
      expect(result.totalChickensCooked).toBe(7);
      expect(result.cookingProgress).toBeCloseTo(0.5);
    });
  });

  describe("shop closed", () => {
    it("does not advance cooking when shop is closed", () => {
      const state = stateWith({
        shopOpen: false,
        cookingProgress: 0.5,
        chickensReady: 3,
      });
      const result = tick(state, 10000);
      expect(result.cookingProgress).toBe(0.5);
      expect(result.chickensReady).toBe(3);
    });
  });

  describe("immutability", () => {
    it("returns a new object without mutating the input", () => {
      const state = stateWith({ cookTimeSeconds: 10 });
      const original = { ...state };
      tick(state, 5000);
      expect(state).toEqual(original);
    });
  });
});
