import { createInitialState, GameState } from "./types/game-state";
import { sellChickens, sellChickensBatch } from "./engine/sell";
import { buyUpgrade } from "./engine/buy";
import { buyChicken, buyChickens } from "./engine/buy-chicken";
import { clickCook, clickCookBatch, selectRecipe } from "./engine/click";
import { tick } from "./engine/tick";
import { serializeState, deserializeState } from "./engine/save";
import { render } from "./ui/render";
import { RECIPE_IDS } from "./engine/recipes";

/**
 * AGENT CONTEXT: Application entry point.
 * 3-step clicker flow: Buy → Cook → Sell.
 * Cooking and selling are timed — tick() advances timers each frame.
 * Loads saved game from localStorage (or creates fresh state).
 * Auto-saves every 30s + on page unload.
 * Phase 1: wires up bulk operations, recipe selection, all 6 upgrades.
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

function saveGame(state: GameState): void {
  try {
    localStorage.setItem(SAVE_KEY, serializeState(state));
  } catch {
    // Storage unavailable (private browsing, sandboxed iframe, etc.)
  }
}

// --- Initialize ---

let state = loadOrCreate();

// --- Buy events ---

const buyChickenButton = document.getElementById("buy-chicken-button");
if (buyChickenButton) {
  buyChickenButton.addEventListener("click", () => {
    state = buyChicken(state);
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
    state = clickCook(state);
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
    state = sellChickens(state);
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
