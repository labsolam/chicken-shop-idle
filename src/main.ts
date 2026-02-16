import { createInitialState, GameState } from "./types/game-state";
import { sellChickens } from "./engine/sell";
import { buyUpgrade } from "./engine/buy";
import { buyChicken } from "./engine/buy-chicken";
import { clickCook } from "./engine/click";
import { serializeState, deserializeState } from "./engine/save";
import { render } from "./ui/render";

/**
 * AGENT CONTEXT: Application entry point.
 * 3-step clicker flow: Buy → Cook → Sell.
 * Loads saved game from localStorage (or creates fresh state).
 * Auto-saves every 30s + on page unload.
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

// --- Events ---

const buyChickenButton = document.getElementById("buy-chicken-button");
if (buyChickenButton) {
  buyChickenButton.addEventListener("click", () => {
    state = buyChicken(state);
    render(state);
  });
}

const cookButton = document.getElementById("cook-button");
if (cookButton) {
  cookButton.addEventListener("click", () => {
    state = clickCook(state);
    render(state);
  });
}

const sellButton = document.getElementById("sell-button");
if (sellButton) {
  sellButton.addEventListener("click", () => {
    state = sellChickens(state);
    render(state);
  });
}

const buyCookSpeedButton = document.getElementById("buy-cook-speed");
if (buyCookSpeedButton) {
  buyCookSpeedButton.addEventListener("click", () => {
    state = buyUpgrade(state, "cookSpeed");
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

// --- Persistence ---

setInterval(() => saveGame(state), AUTO_SAVE_INTERVAL_MS);
window.addEventListener("beforeunload", () => saveGame(state));

// --- Start ---

render(state);
