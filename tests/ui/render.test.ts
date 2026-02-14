/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, showOfflineBanner } from "../../src/ui/render";
import { createInitialState, GameState } from "../../src/types/game-state";
import { OfflineResult } from "../../src/engine/offline";

function stateWith(overrides: Partial<GameState>): GameState {
  return { ...createInitialState(), ...overrides };
}

function setupDOM(): void {
  document.body.innerHTML = `
    <span id="money"></span>
    <span id="chickens-ready"></span>
    <span id="cooking-progress"></span>
    <span id="total-cooked"></span>
    <div id="offline-banner" style="display: none;"></div>
    <span id="cook-speed-level"></span>
    <span id="cook-speed-cost"></span>
    <button id="buy-cook-speed"></button>
    <span id="chicken-value-level"></span>
    <span id="chicken-value-cost"></span>
    <button id="buy-chicken-value"></button>
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

  it("displays upgrade levels", () => {
    render(stateWith({ cookSpeedLevel: 3, chickenValueLevel: 5 }));
    expect(getText("cook-speed-level")).toBe("Lv 3");
    expect(getText("chicken-value-level")).toBe("Lv 5");
  });

  it("displays upgrade costs", () => {
    render(stateWith({ cookSpeedLevel: 0, chickenValueLevel: 0 }));
    expect(getText("cook-speed-cost")).toBe("$5.00");
    expect(getText("chicken-value-cost")).toBe("$5.00");
  });

  it("disables buy buttons when money is insufficient", () => {
    render(stateWith({ money: 0, cookSpeedLevel: 0, chickenValueLevel: 0 }));
    const cookBtn = document.getElementById(
      "buy-cook-speed",
    ) as HTMLButtonElement;
    const valueBtn = document.getElementById(
      "buy-chicken-value",
    ) as HTMLButtonElement;
    expect(cookBtn.disabled).toBe(true);
    expect(valueBtn.disabled).toBe(true);
  });

  it("enables buy buttons when money is sufficient", () => {
    render(stateWith({ money: 500, cookSpeedLevel: 0, chickenValueLevel: 0 }));
    const cookBtn = document.getElementById(
      "buy-cook-speed",
    ) as HTMLButtonElement;
    const valueBtn = document.getElementById(
      "buy-chicken-value",
    ) as HTMLButtonElement;
    expect(cookBtn.disabled).toBe(false);
    expect(valueBtn.disabled).toBe(false);
  });
});

describe("showOfflineBanner", () => {
  beforeEach(() => {
    setupDOM();
    vi.useFakeTimers();
  });

  it("shows banner with earnings summary", () => {
    const offline: OfflineResult = {
      state: stateWith({}),
      elapsedMs: 3600000, // 1 hour
      chickensProduced: 720,
      moneyEarned: 72000,
    };
    showOfflineBanner(offline);

    const banner = document.getElementById("offline-banner") as HTMLElement;
    expect(banner.style.display).toBe("block");
    expect(banner.textContent).toContain("1h 0m");
    expect(banner.textContent).toContain("720 chickens");
    expect(banner.textContent).toContain("$720.00");
  });

  it("uses singular chicken for 1 chicken", () => {
    const offline: OfflineResult = {
      state: stateWith({}),
      elapsedMs: 5000,
      chickensProduced: 1,
      moneyEarned: 100,
    };
    showOfflineBanner(offline);

    const banner = document.getElementById("offline-banner") as HTMLElement;
    expect(banner.textContent).toContain("1 chicken ");
    expect(banner.textContent).not.toContain("1 chickens");
  });

  it("formats short durations as minutes", () => {
    const offline: OfflineResult = {
      state: stateWith({}),
      elapsedMs: 300000, // 5 minutes
      chickensProduced: 60,
      moneyEarned: 6000,
    };
    showOfflineBanner(offline);

    const banner = document.getElementById("offline-banner") as HTMLElement;
    expect(banner.textContent).toContain("5m.");
    expect(banner.textContent).not.toMatch(/\d+h/);
  });

  it("hides banner after 8 seconds", () => {
    const offline: OfflineResult = {
      state: stateWith({}),
      elapsedMs: 60000,
      chickensProduced: 12,
      moneyEarned: 1200,
    };
    showOfflineBanner(offline);

    const banner = document.getElementById("offline-banner") as HTMLElement;
    expect(banner.style.display).toBe("block");

    vi.advanceTimersByTime(8000);
    expect(banner.style.display).toBe("none");
  });

  it("does not throw when banner element is missing", () => {
    document.body.innerHTML = "";
    const offline: OfflineResult = {
      state: stateWith({}),
      elapsedMs: 60000,
      chickensProduced: 12,
      moneyEarned: 1200,
    };
    expect(() => showOfflineBanner(offline)).not.toThrow();
  });
});
