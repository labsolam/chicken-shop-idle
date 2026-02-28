/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, showOfflineBanner } from "../../src/ui/render";
import { createInitialState, GameState } from "../../src/types/game-state";
import { OfflineResult } from "../../src/engine/offline";
import { MILESTONES } from "../../src/engine/milestones";

function stateWith(overrides: Partial<GameState>): GameState {
  return { ...createInitialState(), ...overrides };
}

function setupDOM(): void {
  document.body.innerHTML = `
    <span id="money"></span>
    <span id="chickens-bought"></span>
    <span id="chickens-ready"></span>
    <span id="total-cooked"></span>
    <span id="total-sold"></span>
    <span id="cold-storage-display"></span>
    <span id="cooking-slots-display"></span>
    <span id="selling-registers-display"></span>
    <button id="buy-chicken-button"></button>
    <button id="cook-button"></button>
    <div id="cooking-status"></div>
    <button id="sell-button"></button>
    <div id="selling-status"></div>
    <button id="bulk-buy-x5"></button>
    <button id="bulk-buy-x10"></button>
    <button id="bulk-buy-x25"></button>
    <button id="bulk-cook-x5"></button>
    <button id="bulk-sell-x5"></button>
    <button id="bulk-sell-x10"></button>
    <button id="bulk-sell-x25"></button>
    <span id="active-recipe-name"></span>
    <button id="recipe-btn-basic_fried"></button>
    <button id="recipe-btn-grilled"></button>
    <button id="recipe-btn-wings"></button>
    <button id="recipe-btn-burger"></button>
    <button id="recipe-btn-katsu"></button>
    <button id="recipe-btn-rotisserie"></button>
    <button id="recipe-btn-feast_platter"></button>
    <button id="recipe-btn-signature"></button>
    <div id="offline-banner" style="display: none;"></div>
    <span id="cook-speed-level"></span>
    <span id="cook-speed-cost"></span>
    <button id="buy-cook-speed"></button>
    <span id="sell-speed-level"></span>
    <span id="sell-speed-cost"></span>
    <button id="buy-sell-speed"></button>
    <span id="chicken-value-level"></span>
    <span id="chicken-value-cost"></span>
    <button id="buy-chicken-value"></button>
    <div id="upgrade-cold-storage"></div>
    <span id="cold-storage-level"></span>
    <span id="cold-storage-cost"></span>
    <button id="buy-cold-storage"></button>
    <div id="upgrade-cooking-slots"></div>
    <span id="cooking-slots-level"></span>
    <span id="cooking-slots-cost"></span>
    <button id="buy-cooking-slots"></button>
    <div id="upgrade-selling-registers"></div>
    <span id="selling-registers-level"></span>
    <span id="selling-registers-cost"></span>
    <button id="buy-selling-registers"></button>
    <div id="milestone-progress"></div>
    <span id="income-per-second"></span>
    <div id="manager-section-cook"></div>
    <div id="manager-hire-cook"></div>
    <span id="manager-hire-cost-cook"></span>
    <button id="manager-hire-btn-cook"></button>
    <div id="manager-upgrade-cook"></div>
    <span id="manager-level-cook"></span>
    <span id="manager-upgrade-cost-cook"></span>
    <button id="manager-upgrade-btn-cook"></button>
    <div id="manager-section-sell"></div>
    <div id="manager-hire-sell"></div>
    <span id="manager-hire-cost-sell"></span>
    <button id="manager-hire-btn-sell"></button>
    <div id="manager-upgrade-sell"></div>
    <span id="manager-level-sell"></span>
    <span id="manager-upgrade-cost-sell"></span>
    <button id="manager-upgrade-btn-sell"></button>
    <div id="manager-section-buyer"></div>
    <div id="manager-hire-buyer"></div>
    <span id="manager-hire-cost-buyer"></span>
    <button id="manager-hire-btn-buyer"></button>
    <div id="manager-upgrade-buyer"></div>
    <span id="manager-level-buyer"></span>
    <span id="manager-upgrade-cost-buyer"></span>
    <button id="manager-upgrade-btn-buyer"></button>
    <div id="upgrade-tips" style="display: none;"></div>
    <span id="tips-level"></span>
    <span id="tips-cost"></span>
    <button id="buy-tips"></button>
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

  it("displays raw chickens bought count", () => {
    render(stateWith({ chickensBought: 10 }));
    expect(getText("chickens-bought")).toBe("10");
  });

  it("displays cooked chickens ready count", () => {
    render(stateWith({ chickensReady: 7 }));
    expect(getText("chickens-ready")).toBe("7");
  });

  it("displays total chickens cooked", () => {
    render(stateWith({ totalChickensCooked: 42 }));
    expect(getText("total-cooked")).toBe("42");
  });

  it("displays total chickens sold", () => {
    render(stateWith({ totalChickensSold: 15 }));
    expect(getText("total-sold")).toBe("15");
  });

  it("displays cold storage capacity", () => {
    render(stateWith({ chickensBought: 3, coldStorageLevel: 0 }));
    expect(getText("cold-storage-display")).toBe("Storage: 3/10");
  });

  it("displays cooking slots count", () => {
    render(stateWith({ cookingSlotsLevel: 1 }));
    expect(getText("cooking-slots-display")).toBe("Slots: 2");
  });

  it("displays selling registers count", () => {
    render(stateWith({ sellingRegistersLevel: 2 }));
    expect(getText("selling-registers-display")).toBe("Registers: 3");
  });

  it("disables buy chicken button when money is insufficient", () => {
    render(stateWith({ money: 10 }));
    const btn = document.getElementById(
      "buy-chicken-button",
    ) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it("enables buy chicken button when money is sufficient", () => {
    render(stateWith({ money: 500 }));
    const btn = document.getElementById(
      "buy-chicken-button",
    ) as HTMLButtonElement;
    expect(btn.disabled).toBe(false);
  });

  it("disables cook button when no raw chickens", () => {
    render(stateWith({ chickensBought: 0 }));
    const btn = document.getElementById("cook-button") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it("enables cook button when raw chickens available", () => {
    render(stateWith({ chickensBought: 3 }));
    const btn = document.getElementById("cook-button") as HTMLButtonElement;
    expect(btn.disabled).toBe(false);
  });

  it("disables sell button when no cooked chickens", () => {
    render(stateWith({ chickensReady: 0 }));
    const btn = document.getElementById("sell-button") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it("enables sell button when cooked chickens available", () => {
    render(stateWith({ chickensReady: 5 }));
    const btn = document.getElementById("sell-button") as HTMLButtonElement;
    expect(btn.disabled).toBe(false);
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

  it("displays upgrade costs (cookSpeed: $5, chickenValue: $10 at level 0)", () => {
    render(stateWith({ cookSpeedLevel: 0, chickenValueLevel: 0 }));
    expect(getText("cook-speed-cost")).toBe("$5.00");
    expect(getText("chicken-value-cost")).toBe("$10.00"); // Phase 1: 1000 × 3.5^0 = $10
  });

  it("displays sell speed upgrade level and cost at level 0", () => {
    render(stateWith({ sellSpeedLevel: 0 }));
    expect(getText("sell-speed-level")).toBe("Lv 0");
    expect(getText("sell-speed-cost")).toBe("$5.00");
  });

  it("shows MAX for upgrades at cap", () => {
    render(stateWith({ cookSpeedLevel: 30 }));
    expect(getText("cook-speed-cost")).toBe("MAX");
    const btn = document.getElementById("buy-cook-speed") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
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

  it("enables buy buttons when money is sufficient for both upgrades", () => {
    // cookSpeed costs 500, chickenValue costs 1000 at level 0
    render(stateWith({ money: 1000, cookSpeedLevel: 0, chickenValueLevel: 0 }));
    const cookBtn = document.getElementById(
      "buy-cook-speed",
    ) as HTMLButtonElement;
    const valueBtn = document.getElementById(
      "buy-chicken-value",
    ) as HTMLButtonElement;
    expect(cookBtn.disabled).toBe(false);
    expect(valueBtn.disabled).toBe(false);
  });

  it("shows cooking status when chickens are cooking", () => {
    render(
      stateWith({
        cookingCount: 3,
        cookingElapsedMs: 5000,
        cookTimeSeconds: 10,
        cookSpeedLevel: 0,
      }),
    );
    const text = getText("cooking-status");
    expect(text).toContain("Cooking:");
    expect(text).toContain("3 in queue");
    expect(text).toContain("5.0s");
    expect(text).toContain("10.0s");
  });

  it("clears cooking status when no chickens are cooking", () => {
    render(stateWith({ cookingCount: 0 }));
    expect(getText("cooking-status")).toBe("");
  });

  it("shows selling status when chickens are selling", () => {
    render(
      stateWith({
        sellingCount: 2,
        sellingElapsedMs: 3000,
        sellTimeSeconds: 10,
      }),
    );
    const text = getText("selling-status");
    expect(text).toContain("Selling:");
    expect(text).toContain("2 in queue");
    expect(text).toContain("3.0s");
    expect(text).toContain("10.0s");
  });

  it("clears selling status when no chickens are selling", () => {
    render(stateWith({ sellingCount: 0 }));
    expect(getText("selling-status")).toBe("");
  });

  it("displays active recipe name", () => {
    render(stateWith({ activeRecipe: "basic_fried" }));
    expect(getText("active-recipe-name")).toBe("Basic Fried Chicken");
  });

  it("shows basic_fried recipe button (always unlocked)", () => {
    render(stateWith({ unlockedRecipes: ["basic_fried"] }));
    const btn = document.getElementById(
      "recipe-btn-basic_fried",
    ) as HTMLButtonElement;
    expect(btn.style.display).not.toBe("none");
  });

  it("hides locked recipe buttons", () => {
    render(stateWith({ unlockedRecipes: ["basic_fried"] }));
    const btn = document.getElementById(
      "recipe-btn-grilled",
    ) as HTMLButtonElement;
    expect(btn.style.display).toBe("none");
  });

  it("disables the active recipe button", () => {
    render(
      stateWith({
        activeRecipe: "basic_fried",
        unlockedRecipes: ["basic_fried"],
      }),
    );
    const btn = document.getElementById(
      "recipe-btn-basic_fried",
    ) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it("hides bulk buy buttons when feature locked", () => {
    render(stateWith({ totalRevenueCents: 0 }));
    const btn = document.getElementById("bulk-buy-x5") as HTMLButtonElement;
    expect(btn.style.display).toBe("none");
  });

  it("shows bulk buy x5 when feature unlocked ($50 revenue)", () => {
    render(stateWith({ totalRevenueCents: 5000, money: 25 }));
    const btn = document.getElementById("bulk-buy-x5") as HTMLButtonElement;
    expect(btn.style.display).not.toBe("none");
  });

  it("displays milestone progress for next sold milestone", () => {
    render(stateWith({ totalChickensSold: 5, totalRevenueCents: 0 }));
    const text = getText("milestone-progress");
    expect(text).toContain("5/10 sold");
  });

  it("shows all milestones earned message when all earned", () => {
    const allIds = MILESTONES.map((m) => m.id);
    const state = stateWith({ earnedMilestones: allIds });
    render(state);
    const text = getText("milestone-progress");
    expect(text).toBe("All milestones earned!");
  });

  it("displays income per second when revenue tracker has a completed rate", () => {
    // 1 cent/ms = 1000 cents/sec = $10.00/s
    render(
      stateWith({
        revenueTracker: {
          recentRevenueCents: 0,
          trackerElapsedMs: 0,
          lastComputedRatePerMs: 1,
        },
      }),
    );
    expect(getText("income-per-second")).toBe("$10.00/s");
  });

  it("displays empty income-per-second when rate is zero", () => {
    render(stateWith({}));
    expect(getText("income-per-second")).toBe("");
  });

  it("displays income from partial window when lastComputedRatePerMs is 0", () => {
    // 600 cents in 60000ms → rate = 0.01 cents/ms = 10 cents/sec = $0.10/s
    render(
      stateWith({
        revenueTracker: {
          recentRevenueCents: 600,
          trackerElapsedMs: 60_000,
          lastComputedRatePerMs: 0,
        },
      }),
    );
    expect(getText("income-per-second")).toBe("$0.10/s");
  });

  it("hides manager section when not unlocked", () => {
    render(stateWith({ totalRevenueCents: 0 }));
    const section = document.getElementById(
      "manager-section-cook",
    ) as HTMLElement;
    expect(section.style.display).toBe("none");
  });

  it("shows manager section when unlocked", () => {
    render(stateWith({ totalRevenueCents: 2_500_000 }));
    const section = document.getElementById(
      "manager-section-cook",
    ) as HTMLElement;
    expect(section.style.display).not.toBe("none");
  });

  it("shows hire UI when manager is unlocked but not hired", () => {
    render(
      stateWith({
        totalRevenueCents: 2_500_000,
        managers: {
          buyer: { hired: false, level: 1, elapsedMs: 0 },
          cook: { hired: false, level: 1, elapsedMs: 0 },
          sell: { hired: false, level: 1, elapsedMs: 0 },
        },
      }),
    );
    const hireDiv = document.getElementById("manager-hire-cook") as HTMLElement;
    const upgradeDiv = document.getElementById(
      "manager-upgrade-cook",
    ) as HTMLElement;
    expect(hireDiv.style.display).not.toBe("none");
    expect(upgradeDiv.style.display).toBe("none");
  });

  it("shows upgrade UI when manager is hired", () => {
    render(
      stateWith({
        totalRevenueCents: 2_500_000,
        managers: {
          buyer: { hired: false, level: 1, elapsedMs: 0 },
          cook: { hired: true, level: 1, elapsedMs: 0 },
          sell: { hired: false, level: 1, elapsedMs: 0 },
        },
      }),
    );
    const hireDiv = document.getElementById("manager-hire-cook") as HTMLElement;
    const upgradeDiv = document.getElementById(
      "manager-upgrade-cook",
    ) as HTMLElement;
    expect(hireDiv.style.display).toBe("none");
    expect(upgradeDiv.style.display).not.toBe("none");
    expect(getText("manager-level-cook")).toBe("Lv 1");
  });

  it("disables hire button when cannot afford manager", () => {
    render(
      stateWith({
        totalRevenueCents: 2_500_000,
        money: 0,
        managers: {
          buyer: { hired: false, level: 1, elapsedMs: 0 },
          cook: { hired: false, level: 1, elapsedMs: 0 },
          sell: { hired: false, level: 1, elapsedMs: 0 },
        },
      }),
    );
    const btn = document.getElementById(
      "manager-hire-btn-cook",
    ) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it("shows MAX on upgrade cost when manager is at max level", () => {
    render(
      stateWith({
        totalRevenueCents: 2_500_000,
        managers: {
          buyer: { hired: false, level: 1, elapsedMs: 0 },
          cook: { hired: true, level: 10, elapsedMs: 0 },
          sell: { hired: false, level: 1, elapsedMs: 0 },
        },
      }),
    );
    expect(getText("manager-upgrade-cost-cook")).toBe("MAX");
    const btn = document.getElementById(
      "manager-upgrade-btn-cook",
    ) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it("shows Auto label on cook button when Chef Carmen is hired", () => {
    render(
      stateWith({
        managers: {
          buyer: { hired: false, level: 1, elapsedMs: 0 },
          cook: { hired: true, level: 1, elapsedMs: 0 },
          sell: { hired: false, level: 1, elapsedMs: 0 },
        },
      }),
    );
    const btn = document.getElementById("cook-button");
    expect(btn?.textContent).toContain("[Auto]");
  });

  it("shows Auto label on sell button when Seller Sam is hired", () => {
    render(
      stateWith({
        managers: {
          buyer: { hired: false, level: 1, elapsedMs: 0 },
          cook: { hired: false, level: 1, elapsedMs: 0 },
          sell: { hired: true, level: 1, elapsedMs: 0 },
        },
      }),
    );
    const btn = document.getElementById("sell-button");
    expect(btn?.textContent).toContain("[Auto]");
  });

  it("shows tips upgrade section when unlocked ($5K revenue)", () => {
    render(stateWith({ totalRevenueCents: 500_000 }));
    const div = document.getElementById("upgrade-tips") as HTMLElement;
    expect(div.style.display).not.toBe("none");
  });

  it("renders tips upgrade level and cost", () => {
    render(stateWith({ totalRevenueCents: 500_000, tipsLevel: 0 }));
    expect(getText("tips-level")).toBe("Lv 0");
    expect(getText("tips-cost")).toBe("$5.00K");
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

  it("shows only money earned when no chickens were produced (chickensProduced=0)", () => {
    const offline: OfflineResult = {
      state: stateWith({}),
      elapsedMs: 60000,
      chickensProduced: 0,
      moneyEarned: 1200,
    };
    showOfflineBanner(offline);

    const banner = document.getElementById("offline-banner") as HTMLElement;
    expect(banner.style.display).toBe("block");
    expect(banner.textContent).toContain("$12.00");
    expect(banner.textContent).not.toContain("chicken");
  });
});
