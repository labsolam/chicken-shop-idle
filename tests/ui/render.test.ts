/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render } from "../../src/ui/render";
import { createInitialState, GameState } from "../../src/types/game-state";

function stateWith(overrides: Partial<GameState>): GameState {
  return { ...createInitialState(), ...overrides };
}

function setupDOM(): void {
  document.body.innerHTML = `
    <span id="money"></span>
    <span id="chickens-ready"></span>
    <span id="cooking-progress"></span>
    <span id="total-cooked"></span>
  `;
}

function getText(id: string): string {
  return document.getElementById(id)?.textContent ?? "";
}

describe("render", () => {
  beforeEach(() => {
    setupDOM();
  });

  it("displays money formatted as dollars", () => {
    render(stateWith({ money: 1050 }));
    expect(getText("money")).toBe("$10.50");
  });

  it("displays zero money as $0.00", () => {
    render(stateWith({ money: 0 }));
    expect(getText("money")).toBe("$0.00");
  });

  it("displays chickens ready count", () => {
    render(stateWith({ chickensReady: 7 }));
    expect(getText("chickens-ready")).toBe("7");
  });

  it("displays cooking progress as percentage", () => {
    render(stateWith({ cookingProgress: 0.75 }));
    expect(getText("cooking-progress")).toBe("75%");
  });

  it("floors cooking progress percentage", () => {
    render(stateWith({ cookingProgress: 0.333 }));
    expect(getText("cooking-progress")).toBe("33%");
  });

  it("displays total chickens cooked", () => {
    render(stateWith({ totalChickensCooked: 42 }));
    expect(getText("total-cooked")).toBe("42");
  });

  it("updates all fields on re-render", () => {
    render(stateWith({ money: 100, chickensReady: 1 }));
    expect(getText("money")).toBe("$1.00");
    expect(getText("chickens-ready")).toBe("1");

    render(stateWith({ money: 500, chickensReady: 5 }));
    expect(getText("money")).toBe("$5.00");
    expect(getText("chickens-ready")).toBe("5");
  });

  it("does not throw when DOM elements are missing", () => {
    document.body.innerHTML = "";
    expect(() => render(stateWith({}))).not.toThrow();
  });
});
