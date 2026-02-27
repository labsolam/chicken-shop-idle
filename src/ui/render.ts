import { GameState } from "../types/game-state";
import { OfflineResult } from "../engine/offline";
import {
  getUpgradeCost,
  getEffectiveCookTime,
  getEffectiveSellTime,
  getColdStorageCapacity,
  getCookingSlots,
  getSellingRegisters,
  UpgradeType,
} from "../engine/buy";
import { RAW_CHICKEN_COST } from "../engine/buy-chicken";
import { getRecipe, RECIPE_IDS } from "../engine/recipes";
import { isFeatureUnlocked } from "../engine/unlocks";
import { MILESTONES } from "../engine/milestones";
import { formatMoney } from "./format";

/**
 * AGENT CONTEXT: DOM renderer for Phase 1.
 * Reads game state and updates text content of known elements.
 * No framework — just getElementById and textContent.
 * Element IDs are defined in index.html.
 * New Phase 1 elements: storage display, recipe selector, all 6 upgrades, bulk buttons, milestones.
 */

const UPGRADE_CAPS: Record<UpgradeType, number> = {
  cookSpeed: 30,
  sellSpeed: 30,
  chickenValue: 25,
  coldStorage: 10,
  cookingSlots: 10,
  sellingRegisters: 10,
};

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function formatTimerSeconds(ms: number): string {
  return (ms / 1000).toFixed(1);
}

function setText(id: string, text: string): void {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function setDisabled(id: string, disabled: boolean): void {
  const el = document.getElementById(id) as HTMLButtonElement | null;
  if (el) el.disabled = disabled;
}

function showElement(id: string, show: boolean): void {
  const el = document.getElementById(id) as HTMLElement | null;
  if (el) el.style.display = show ? "" : "none";
}

function renderUpgrade(
  state: GameState,
  type: UpgradeType,
  levelId: string,
  costId: string,
  btnId: string,
): void {
  const levelKey = `${type}Level` as keyof GameState;
  const currentLevel = state[levelKey] as number;
  const cap = UPGRADE_CAPS[type];
  const atCap = currentLevel >= cap;

  const levelEl = document.getElementById(levelId);
  const costEl = document.getElementById(costId);
  const btn = document.getElementById(btnId) as HTMLButtonElement | null;

  if (levelEl) levelEl.textContent = `Lv ${currentLevel}`;

  if (atCap) {
    if (costEl) costEl.textContent = "MAX";
    if (btn) btn.disabled = true;
  } else {
    const cost = getUpgradeCost(type, currentLevel);
    if (costEl) costEl.textContent = formatMoney(cost);
    if (btn) btn.disabled = state.money < cost;
  }
}

export function render(state: GameState): void {
  // --- Core stats ---
  const cookingRecipe = getRecipe(state.cookingRecipeId);

  setText("money", formatMoney(state.money));

  setText("chickens-bought", String(state.chickensBought));
  setText("chickens-ready", String(state.chickensReady));
  setText("total-cooked", String(state.totalChickensCooked));
  setText("total-sold", String(state.totalChickensSold));

  // Cold storage
  const capacity = getColdStorageCapacity(state.coldStorageLevel);
  setText(
    "cold-storage-display",
    `Storage: ${state.chickensBought}/${capacity}`,
  );

  // Cooking slots / selling registers
  const slots = getCookingSlots(state.cookingSlotsLevel);
  const registers = getSellingRegisters(state.sellingRegistersLevel);
  setText("cooking-slots-display", `Slots: ${slots}`);
  setText("selling-registers-display", `Registers: ${registers}`);

  // --- Cooking timer status ---
  const cookingStatusEl = document.getElementById("cooking-status");
  if (cookingStatusEl) {
    if (state.cookingCount > 0) {
      const cookTimeSec = getEffectiveCookTime(
        cookingRecipe.cookTimeSeconds,
        state.cookSpeedLevel,
      );
      cookingStatusEl.textContent = `Cooking: ${state.cookingCount} in queue (${formatTimerSeconds(state.cookingElapsedMs)}s / ${formatTimerSeconds(cookTimeSec * 1000)}s)`;
    } else {
      cookingStatusEl.textContent = "";
    }
  }

  // --- Selling timer status ---
  const sellingStatusEl = document.getElementById("selling-status");
  if (sellingStatusEl) {
    if (state.sellingCount > 0) {
      const sellTimeSec = getEffectiveSellTime(state.sellSpeedLevel);
      sellingStatusEl.textContent = `Selling: ${state.sellingCount} in queue (${formatTimerSeconds(state.sellingElapsedMs)}s / ${formatTimerSeconds(sellTimeSec * 1000)}s)`;
    } else {
      sellingStatusEl.textContent = "";
    }
  }

  // --- Action buttons ---
  setDisabled(
    "buy-chicken-button",
    state.money < RAW_CHICKEN_COST ||
      state.chickensBought >= getColdStorageCapacity(state.coldStorageLevel),
  );
  setDisabled("cook-button", state.chickensBought < cookingRecipe.rawInput);
  setDisabled("sell-button", state.chickensReady <= 0);

  // --- Bulk buy buttons ---
  const canBuy = state.money >= RAW_CHICKEN_COST;
  showElement("bulk-buy-x5", isFeatureUnlocked(state, "bulk_buy_x5"));
  showElement("bulk-buy-x10", isFeatureUnlocked(state, "bulk_buy_x10"));
  showElement("bulk-buy-x25", isFeatureUnlocked(state, "bulk_buy_x25"));
  setDisabled("bulk-buy-x5", !canBuy);
  setDisabled("bulk-buy-x10", !canBuy);
  setDisabled("bulk-buy-x25", !canBuy);

  // --- Bulk cook buttons ---
  const canCook = state.chickensBought >= cookingRecipe.rawInput;
  const bulkCookUnlocked = isFeatureUnlocked(state, "bulk_cook_x5");
  showElement("bulk-cook-x5", bulkCookUnlocked);
  setDisabled("bulk-cook-x5", !canCook);

  // --- Bulk sell buttons ---
  const canSell = state.chickensReady > 0;
  showElement("bulk-sell-x5", isFeatureUnlocked(state, "bulk_sell_x5"));
  showElement("bulk-sell-x10", isFeatureUnlocked(state, "bulk_sell_x10"));
  showElement("bulk-sell-x25", isFeatureUnlocked(state, "bulk_sell_x25"));
  setDisabled("bulk-sell-x5", !canSell);
  setDisabled("bulk-sell-x10", !canSell);
  setDisabled("bulk-sell-x25", !canSell);

  // --- Recipe selector ---
  const activeRecipeNameEl = document.getElementById("active-recipe-name");
  if (activeRecipeNameEl) {
    activeRecipeNameEl.textContent = getRecipe(state.activeRecipe).name;
  }

  for (const recipeId of RECIPE_IDS) {
    const recipe = getRecipe(recipeId);
    const btnId = `recipe-btn-${recipeId}`;
    const isUnlocked = state.unlockedRecipes.includes(recipeId);
    showElement(btnId, isUnlocked);
    const btn = document.getElementById(btnId) as HTMLButtonElement | null;
    if (btn) {
      btn.disabled = state.activeRecipe === recipeId;
      btn.textContent = `${recipe.name} (${recipe.cookTimeSeconds}s, ${formatMoney(recipe.saleValueCents)})`;
    }
  }

  // --- Upgrades (core 2 always shown) ---
  renderUpgrade(
    state,
    "cookSpeed",
    "cook-speed-level",
    "cook-speed-cost",
    "buy-cook-speed",
  );
  renderUpgrade(
    state,
    "chickenValue",
    "chicken-value-level",
    "chicken-value-cost",
    "buy-chicken-value",
  );

  // --- Upgrades (Phase 1 — show when unlocked) ---
  renderUpgrade(
    state,
    "sellSpeed",
    "sell-speed-level",
    "sell-speed-cost",
    "buy-sell-speed",
  );
  if (isFeatureUnlocked(state, "cold_storage")) {
    showElement("upgrade-cold-storage", true);
    renderUpgrade(
      state,
      "coldStorage",
      "cold-storage-level",
      "cold-storage-cost",
      "buy-cold-storage",
    );
  }
  if (isFeatureUnlocked(state, "cooking_slots")) {
    showElement("upgrade-cooking-slots", true);
    renderUpgrade(
      state,
      "cookingSlots",
      "cooking-slots-level",
      "cooking-slots-cost",
      "buy-cooking-slots",
    );
  }
  if (isFeatureUnlocked(state, "selling_registers")) {
    showElement("upgrade-selling-registers", true);
    renderUpgrade(
      state,
      "sellingRegisters",
      "selling-registers-level",
      "selling-registers-cost",
      "buy-selling-registers",
    );
  }

  // --- Milestone progress ---
  const milestoneProgressEl = document.getElementById("milestone-progress");
  if (milestoneProgressEl) {
    const earned = new Set(state.earnedMilestones);
    const nextSoldMilestone = MILESTONES.filter(
      (m) => m.type === "sold" && !earned.has(m.id),
    ).sort((a, b) => a.threshold - b.threshold)[0];
    const nextRevenueMilestone = MILESTONES.filter(
      (m) => m.type === "revenue" && !earned.has(m.id),
    ).sort((a, b) => a.threshold - b.threshold)[0];

    const parts: string[] = [];
    if (nextSoldMilestone) {
      parts.push(
        `Next: ${state.totalChickensSold}/${nextSoldMilestone.threshold} sold`,
      );
    }
    if (nextRevenueMilestone) {
      parts.push(
        `${formatMoney(state.totalRevenueCents)}/${formatMoney(nextRevenueMilestone.threshold)} revenue`,
      );
    }
    milestoneProgressEl.textContent =
      parts.length > 0 ? parts.join(" | ") : "All milestones earned!";
  }
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
