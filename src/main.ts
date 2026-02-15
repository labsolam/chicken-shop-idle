import { createInitialState, GameState } from "./types/game-state";
import { tick } from "./engine/tick";
import { sellChickens } from "./engine/sell";
import { buyUpgrade } from "./engine/buy";
import { clickCook } from "./engine/click";
import { serializeState, deserializeState } from "./engine/save";
import { calculateOfflineEarnings, OfflineResult } from "./engine/offline";
import { render, showOfflineBanner } from "./ui/render";

/**
 * AGENT CONTEXT: Application entry point.
 * Loads saved game from localStorage (or creates fresh state).
 * Calculates offline earnings on return. Auto-saves every 30s + on page unload.
 * Game loop uses performance.now() for frame delta; Date.now() for save timestamps.
 */

const SAVE_KEY = "chicken-shop-idle-save";
const AUTO_SAVE_INTERVAL_MS = 30_000;

function loadOrCreate(): { state: GameState; offline: OfflineResult | null } {
  let json: string | null;
  try {
    json = localStorage.getItem(SAVE_KEY);
  } catch {
    return { state: createInitialState(), offline: null };
  }

  if (!json) {
    return { state: createInitialState(), offline: null };
  }

  const saved = deserializeState(json);
  if (!saved) {
    return { state: createInitialState(), offline: null };
  }

  const offline = calculateOfflineEarnings(saved, Date.now());
  return { state: offline.state, offline };
}

function saveGame(state: GameState): void {
  try {
    localStorage.setItem(SAVE_KEY, serializeState(state));
  } catch {
    // Storage unavailable (private browsing, sandboxed iframe, etc.)
  }
}

// --- Initialize ---

const loaded = loadOrCreate();
let state = loaded.state;
let lastFrameTime = performance.now();

if (loaded.offline && loaded.offline.moneyEarned > 0) {
  showOfflineBanner(loaded.offline);
}

// --- Game loop ---

function gameLoop(currentTime: number): void {
  const deltaMs = currentTime - lastFrameTime;
  lastFrameTime = currentTime;

  state = tick(state, deltaMs);
  state = { ...state, lastUpdateTimestamp: Date.now() };
  render(state);
  requestAnimationFrame(gameLoop);
}

// --- Events ---

function onSellClick(): void {
  state = sellChickens(state);
  render(state);
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
  sellButton.addEventListener("click", onSellClick);
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
requestAnimationFrame(gameLoop);
