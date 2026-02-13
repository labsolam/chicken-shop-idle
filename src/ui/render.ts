import { GameState } from "../types/game-state";
import { OfflineResult } from "../engine/offline";

/**
 * AGENT CONTEXT: Minimal DOM renderer.
 * Reads game state and updates text content of known elements.
 * No framework — just getElementById and textContent.
 * Element IDs are defined in index.html.
 */

function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatProgress(progress: number): string {
  return `${Math.floor(progress * 100)}%`;
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
  const readyEl = document.getElementById("chickens-ready");
  const progressEl = document.getElementById("cooking-progress");
  const totalEl = document.getElementById("total-cooked");

  if (moneyEl) moneyEl.textContent = formatMoney(state.money);
  if (readyEl) readyEl.textContent = String(state.chickensReady);
  if (progressEl)
    progressEl.textContent = formatProgress(state.cookingProgress);
  if (totalEl) totalEl.textContent = String(state.totalChickensCooked);
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
