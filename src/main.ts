import { createInitialState, GameState } from "./types/game-state";
import { sellChickens, sellChickensBatch } from "./engine/sell";
import { buyUpgrade } from "./engine/buy";
import { buyChicken, buyChickens } from "./engine/buy-chicken";
import { clickCook, clickCookBatch, selectRecipe } from "./engine/click";
import { tick } from "./engine/tick";
import { serializeState, deserializeState } from "./engine/save";
import { calculateOfflineEarnings } from "./engine/offline";
import { render, showOfflineBanner } from "./ui/render";
import { RECIPE_IDS } from "./engine/recipes";
import {
  hireManager,
  upgradeManager,
  applyClickBonus,
  type ManagerKey,
} from "./engine/managers";
import { buyEquipment, EQUIPMENT_IDS } from "./engine/equipment";
import { hireStaff, STAFF_IDS } from "./engine/staff";

/**
 * AGENT CONTEXT: Application entry point.
 * 3-step clicker flow: Buy → Cook → Sell.
 * Cooking and selling are timed — tick() advances timers each frame.
 * Loads saved game from localStorage (or creates fresh state).
 * Auto-saves every 30s + on page unload.
 * Phase 1: wires up bulk operations, recipe selection, all 6 upgrades.
 * Phase 2: wires up managers, click bonuses, tips upgrade, offline earnings.
 * Phase 3: wires up equipment, staff, idle reset on click.
 */

const SAVE_KEY = "chicken-shop-idle-save";
const AUTO_SAVE_INTERVAL_MS = 30_000;

function loadOrCreate(): GameState {
  let json: string | null;
  try {
    json = localStorage.getItem(SAVE_KEY);
  } catch {
    return createInitialState();
  }

  if (!json) {
    return createInitialState();
  }

  return deserializeState(json) ?? createInitialState();
}

/**
 * Saves the game state to localStorage, injecting the current wall-clock time
 * as lastOnlineTimestamp so offline earnings are calculated correctly on next load.
 */
function saveGame(state: GameState): void {
  try {
    localStorage.setItem(
      SAVE_KEY,
      serializeState({ ...state, lastOnlineTimestamp: Date.now() }),
    );
  } catch {
    // Storage unavailable (private browsing, sandboxed iframe, etc.)
  }
}

// --- Initialize ---

let state = loadOrCreate();

// Apply offline earnings on startup
const offlineResult = calculateOfflineEarnings(state, Date.now());
state = offlineResult.state;
if (offlineResult.moneyEarned > 0 || offlineResult.elapsedMs >= 60_000) {
  showOfflineBanner(offlineResult);
}

/** Reset idle diminishing returns on any player click (Phase 3). */
function resetIdle(): void {
  state = { ...state, continuousIdleMs: 0, lastActivityTimestamp: Date.now() };
}

// --- Buy events ---

const buyChickenButton = document.getElementById("buy-chicken-button");
if (buyChickenButton) {
  buyChickenButton.addEventListener("click", () => {
    resetIdle();
    state = buyChicken(state);
    state = applyClickBonus(state, "buyer", Date.now());
    render(state);
  });
}

const bulkBuyX5 = document.getElementById("bulk-buy-x5");
if (bulkBuyX5) {
  bulkBuyX5.addEventListener("click", () => {
    state = buyChickens(state, 5);
    render(state);
  });
}

const bulkBuyX10 = document.getElementById("bulk-buy-x10");
if (bulkBuyX10) {
  bulkBuyX10.addEventListener("click", () => {
    state = buyChickens(state, 10);
    render(state);
  });
}

const bulkBuyX25 = document.getElementById("bulk-buy-x25");
if (bulkBuyX25) {
  bulkBuyX25.addEventListener("click", () => {
    state = buyChickens(state, 25);
    render(state);
  });
}

// --- Cook events ---

const cookButton = document.getElementById("cook-button");
if (cookButton) {
  cookButton.addEventListener("click", () => {
    resetIdle();
    state = clickCook(state);
    state = applyClickBonus(state, "cook", Date.now());
    render(state);
  });
}

const bulkCookX5 = document.getElementById("bulk-cook-x5");
if (bulkCookX5) {
  bulkCookX5.addEventListener("click", () => {
    state = clickCookBatch(state, 5);
    render(state);
  });
}

// --- Sell events ---

const sellButton = document.getElementById("sell-button");
if (sellButton) {
  sellButton.addEventListener("click", () => {
    resetIdle();
    state = sellChickens(state);
    state = applyClickBonus(state, "sell", Date.now());
    render(state);
  });
}

const bulkSellX5 = document.getElementById("bulk-sell-x5");
if (bulkSellX5) {
  bulkSellX5.addEventListener("click", () => {
    state = sellChickensBatch(state, 5);
    render(state);
  });
}

const bulkSellX10 = document.getElementById("bulk-sell-x10");
if (bulkSellX10) {
  bulkSellX10.addEventListener("click", () => {
    state = sellChickensBatch(state, 10);
    render(state);
  });
}

const bulkSellX25 = document.getElementById("bulk-sell-x25");
if (bulkSellX25) {
  bulkSellX25.addEventListener("click", () => {
    state = sellChickensBatch(state, 25);
    render(state);
  });
}

// --- Recipe selection ---

for (const recipeId of RECIPE_IDS) {
  const btn = document.getElementById(`recipe-btn-${recipeId}`);
  if (btn) {
    btn.addEventListener("click", () => {
      state = selectRecipe(state, recipeId);
      render(state);
    });
  }
}

// --- Upgrade events ---

const buyCookSpeedButton = document.getElementById("buy-cook-speed");
if (buyCookSpeedButton) {
  buyCookSpeedButton.addEventListener("click", () => {
    state = buyUpgrade(state, "cookSpeed");
    render(state);
  });
}

const buySellSpeedButton = document.getElementById("buy-sell-speed");
if (buySellSpeedButton) {
  buySellSpeedButton.addEventListener("click", () => {
    state = buyUpgrade(state, "sellSpeed");
    render(state);
  });
}

const buyChickenValueButton = document.getElementById("buy-chicken-value");
if (buyChickenValueButton) {
  buyChickenValueButton.addEventListener("click", () => {
    state = buyUpgrade(state, "chickenValue");
    render(state);
  });
}

const buyColdStorageButton = document.getElementById("buy-cold-storage");
if (buyColdStorageButton) {
  buyColdStorageButton.addEventListener("click", () => {
    state = buyUpgrade(state, "coldStorage");
    render(state);
  });
}

const buyCookingSlotsButton = document.getElementById("buy-cooking-slots");
if (buyCookingSlotsButton) {
  buyCookingSlotsButton.addEventListener("click", () => {
    state = buyUpgrade(state, "cookingSlots");
    render(state);
  });
}

const buySellingRegistersButton = document.getElementById(
  "buy-selling-registers",
);
if (buySellingRegistersButton) {
  buySellingRegistersButton.addEventListener("click", () => {
    state = buyUpgrade(state, "sellingRegisters");
    render(state);
  });
}

// Tips upgrade (Phase 2)
const buyTipsButton = document.getElementById("buy-tips");
if (buyTipsButton) {
  buyTipsButton.addEventListener("click", () => {
    state = buyUpgrade(state, "tips");
    render(state);
  });
}

// --- Manager events (Phase 2) ---

const managerKeys: ManagerKey[] = ["buyer", "cook", "sell"];

for (const key of managerKeys) {
  const hireBtn = document.getElementById(`manager-hire-btn-${key}`);
  if (hireBtn) {
    hireBtn.addEventListener("click", () => {
      state = hireManager(state, key);
      render(state);
    });
  }

  const upgradeBtn = document.getElementById(`manager-upgrade-btn-${key}`);
  if (upgradeBtn) {
    upgradeBtn.addEventListener("click", () => {
      state = upgradeManager(state, key);
      render(state);
    });
  }
}

// --- Equipment events (Phase 3) ---

for (const equipId of EQUIPMENT_IDS) {
  const btn = document.getElementById(`equip-btn-${equipId}`);
  if (btn) {
    btn.addEventListener("click", () => {
      resetIdle();
      state = buyEquipment(state, equipId);
      render(state);
    });
  }
}

// --- Staff events (Phase 3) ---

for (const staffId of STAFF_IDS) {
  const btn = document.getElementById(`staff-btn-${staffId}`);
  if (btn) {
    btn.addEventListener("click", () => {
      resetIdle();
      state = hireStaff(state, staffId);
      render(state);
    });
  }
}

// --- Game Loop ---

let lastTimestamp = performance.now();

function gameLoop(now: number): void {
  const deltaMs = now - lastTimestamp;
  lastTimestamp = now;

  state = tick(state, deltaMs);
  render(state);

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

// --- Persistence ---

setInterval(() => saveGame(state), AUTO_SAVE_INTERVAL_MS);
window.addEventListener("beforeunload", () => saveGame(state));

// --- Start ---

render(state);
