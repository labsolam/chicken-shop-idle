import { GameState } from "../types/game-state";

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
