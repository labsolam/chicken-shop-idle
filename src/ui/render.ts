import { GameState } from "../types/game-state";
import { OfflineResult } from "../engine/offline";
import { getUpgradeCost } from "../engine/buy";
import { RAW_CHICKEN_COST } from "../engine/buy-chicken";

/**
 * AGENT CONTEXT: Minimal DOM renderer.
 * Reads game state and updates text content of known elements.
 * No framework — just getElementById and textContent.
 * Element IDs are defined in index.html.
 */

function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function render(state: GameState): void {
  const moneyEl = document.getElementById("money");
  const boughtEl = document.getElementById("chickens-bought");
  const readyEl = document.getElementById("chickens-ready");
  const totalEl = document.getElementById("total-cooked");

  if (moneyEl) moneyEl.textContent = formatMoney(state.money);
  if (boughtEl) boughtEl.textContent = String(state.chickensBought);
  if (readyEl) readyEl.textContent = String(state.chickensReady);
  if (totalEl) totalEl.textContent = String(state.totalChickensCooked);

  // Action buttons — disable when action is not possible
  const buyChickenBtn = document.getElementById(
    "buy-chicken-button",
  ) as HTMLButtonElement | null;
  const cookBtn = document.getElementById(
    "cook-button",
  ) as HTMLButtonElement | null;
  const sellBtn = document.getElementById(
    "sell-button",
  ) as HTMLButtonElement | null;

  if (buyChickenBtn) buyChickenBtn.disabled = state.money < RAW_CHICKEN_COST;
  if (cookBtn) cookBtn.disabled = state.chickensBought <= 0;
  if (sellBtn) sellBtn.disabled = state.chickensReady <= 0;

  // Upgrade buttons
  const cookSpeedCost = getUpgradeCost("cookSpeed", state.cookSpeedLevel);
  const chickenValueCost = getUpgradeCost(
    "chickenValue",
    state.chickenValueLevel,
  );

  const cookSpeedCostEl = document.getElementById("cook-speed-cost");
  const chickenValueCostEl = document.getElementById("chicken-value-cost");
  const cookSpeedLevelEl = document.getElementById("cook-speed-level");
  const chickenValueLevelEl = document.getElementById("chicken-value-level");
  const buyCookSpeedBtn = document.getElementById(
    "buy-cook-speed",
  ) as HTMLButtonElement | null;
  const buyChickenValueBtn = document.getElementById(
    "buy-chicken-value",
  ) as HTMLButtonElement | null;

  if (cookSpeedCostEl) cookSpeedCostEl.textContent = formatMoney(cookSpeedCost);
  if (chickenValueCostEl)
    chickenValueCostEl.textContent = formatMoney(chickenValueCost);
  if (cookSpeedLevelEl)
    cookSpeedLevelEl.textContent = `Lv ${state.cookSpeedLevel}`;
  if (chickenValueLevelEl)
    chickenValueLevelEl.textContent = `Lv ${state.chickenValueLevel}`;
  if (buyCookSpeedBtn) buyCookSpeedBtn.disabled = state.money < cookSpeedCost;
  if (buyChickenValueBtn)
    buyChickenValueBtn.disabled = state.money < chickenValueCost;
}

export function showOfflineBanner(offline: OfflineResult): void {
  const bannerEl = document.getElementById("offline-banner");
  if (!bannerEl) return;

  const duration = formatDuration(offline.elapsedMs);
  const money = formatMoney(offline.moneyEarned);
  const chickens = offline.chickensProduced;

  bannerEl.textContent = `Welcome back! You were away for ${duration}. Your shop sold ${chickens} chicken${chickens !== 1 ? "s" : ""} and earned ${money}.`;
  bannerEl.style.display = "block";

  setTimeout(() => {
    bannerEl.style.display = "none";
  }, 8000);
}
