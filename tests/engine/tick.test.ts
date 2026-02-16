import { describe, it, expect } from "vitest";
import { tick } from "@engine/tick";
import { createInitialState, GameState } from "../../src/types/game-state";

function stateWith(overrides: Partial<GameState>): GameState {
  return { ...createInitialState(), ...overrides };
}

describe("tick", () => {
  it("returns state unchanged (idle cooking disabled)", () => {
    const state = stateWith({ chickensReady: 3, chickensBought: 2 });
    const result = tick(state, 10000);
    expect(result.chickensReady).toBe(3);
    expect(result.chickensBought).toBe(2);
  });

  it("returns a new object without mutating the input", () => {
    const state = stateWith({});
    const original = { ...state };
    tick(state, 5000);
    expect(state).toEqual(original);
  });
});
