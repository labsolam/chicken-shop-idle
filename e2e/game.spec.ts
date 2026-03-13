import { test, expect } from "@playwright/test";

/**
 * AGENT CONTEXT: End-to-end tests for the chicken shop game.
 * Tests the 3-step clicker flow: Buy → Cook → Sell.
 * Cooking takes 10s and selling takes 10s (timed actions via tick).
 * Tests use ?timeScale=100 to speed up timers (10s → ~100ms).
 * These run in a real browser (headless Chromium).
 *
 * Phase 1: basic_fried chicken costs $0.25 raw and sells for $0.50.
 * Starting money: $5.00 (500 cents).
 * Phase 3: equipment and staff sections hidden by default (unlock at $1K revenue).
 *
 * Run: npm run test:e2e
 * Screenshots saved to: e2e/results/
 */

test.describe("Game initial state", () => {
  test("shows correct initial values on load", async ({ page }) => {
    await page.goto("/?timeScale=100");

    await expect(page.locator("#money")).toHaveText("$5.00");
    await expect(page.locator("#chickens-bought")).toHaveText("0");
    await expect(page.locator("#chickens-ready")).toHaveText("0");
    await expect(page.locator("#total-cooked")).toHaveText("0");

    await page.screenshot({
      path: "e2e/screenshots/initial-state.png",
      fullPage: true,
    });
  });

  test("has buy, cook, and sell buttons", async ({ page }) => {
    await page.goto("/?timeScale=100");

    await expect(page.locator("#buy-chicken-button")).toBeVisible();
    await expect(page.locator("#cook-button")).toBeVisible();
    await expect(page.locator("#sell-button")).toBeVisible();
  });

  test("shows cold storage display", async ({ page }) => {
    await page.goto("/?timeScale=100");

    await expect(page.locator("#cold-storage-display")).toContainText(
      "Storage: 0/10",
    );
  });

  test("shows upgrade sections", async ({ page }) => {
    await page.goto("/?timeScale=100");

    await expect(page.locator("#buy-cook-speed")).toBeVisible();
    await expect(page.locator("#buy-sell-speed")).toBeVisible();
    await expect(page.locator("#buy-chicken-value")).toBeVisible();
  });

  test("shows active recipe", async ({ page }) => {
    await page.goto("/?timeScale=100");

    await expect(page.locator("#active-recipe-name")).toHaveText(
      "Basic Fried Chicken",
    );
  });
});

test.describe("Buy → Cook → Sell flow", () => {
  test("buying a chicken costs money and adds a raw chicken", async ({
    page,
  }) => {
    await page.goto("/?timeScale=100");

    await page.locator("#buy-chicken-button").click();

    await expect(page.locator("#chickens-bought")).toHaveText("1");
    await expect(page.locator("#money")).toHaveText("$4.75");

    await page.screenshot({
      path: "e2e/screenshots/after-buy.png",
      fullPage: true,
    });
  });

  test("cold storage display updates after buying", async ({ page }) => {
    await page.goto("/?timeScale=100");

    await page.locator("#buy-chicken-button").click();

    await expect(page.locator("#cold-storage-display")).toContainText(
      "Storage: 1/10",
    );
  });

  test("cooking queues a raw chicken and completes after timer", async ({
    page,
  }) => {
    await page.goto("/?timeScale=100");

    // Buy then cook
    await page.locator("#buy-chicken-button").click();
    await page.locator("#cook-button").click();

    // Chicken is now in cooking queue, not yet ready
    await expect(page.locator("#chickens-bought")).toHaveText("0");
    await expect(page.locator("#cooking-status")).toContainText("Cooking:");

    // Wait for the 10s cook timer to complete
    await expect(page.locator("#chickens-ready")).toHaveText("1", {
      timeout: 2000,
    });
    await expect(page.locator("#total-cooked")).toHaveText("1");

    await page.screenshot({
      path: "e2e/screenshots/after-cook.png",
      fullPage: true,
    });
  });

  test("selling queues cooked chickens and earns money after timer", async ({
    page,
  }) => {
    await page.goto("/?timeScale=100");

    // Buy, wait for cook, then sell
    await page.locator("#buy-chicken-button").click();
    await page.locator("#cook-button").click();

    // Wait for cooking to complete
    await expect(page.locator("#chickens-ready")).toHaveText("1", {
      timeout: 2000,
    });

    await page.locator("#sell-button").click();

    // Chicken is now in selling queue
    await expect(page.locator("#chickens-ready")).toHaveText("0");
    await expect(page.locator("#selling-status")).toContainText("Selling:");

    // Wait for the 10s sell timer to complete
    // Started with $5.00, spent $0.25, earned $0.50 = $5.25
    await expect(page.locator("#money")).toHaveText("$5.25", {
      timeout: 2000,
    });

    await page.screenshot({
      path: "e2e/screenshots/after-sell.png",
      fullPage: true,
    });
  });

  test("cook button is disabled without raw chickens", async ({ page }) => {
    await page.goto("/?timeScale=100");

    const cookButton = page.locator("#cook-button");
    await expect(cookButton).toBeDisabled();
  });

  test("sell button is disabled without cooked chickens", async ({ page }) => {
    await page.goto("/?timeScale=100");

    const sellButton = page.locator("#sell-button");
    await expect(sellButton).toBeDisabled();
  });
});

test.describe("Equipment & Staff (Phase 3)", () => {
  test("equipment section is hidden at start", async ({ page }) => {
    await page.goto("/?timeScale=100");

    await expect(page.locator("#equipment-section")).toBeHidden();
  });

  test("staff section is hidden at start", async ({ page }) => {
    await page.goto("/?timeScale=100");

    await expect(page.locator("#staff-section")).toBeHidden();
  });

  test("equipment and staff sections become visible when revenue threshold met", async ({
    page,
  }) => {
    await page.goto("/?timeScale=100");

    // Inject state with enough revenue to unlock equipment/staff panels
    await page.evaluate(() => {
      const saveKey = "chicken-shop-idle-save";
      const state = {
        money: 999_999_999,
        totalChickensCooked: 0,
        chickensBought: 0,
        chickensReady: 0,
        cookTimeSeconds: 10,
        chickenPriceInCents: 50,
        shopOpen: true,
        lastUpdateTimestamp: Date.now(),
        totalRevenueCents: 10_000_000,
        totalChickensSold: 0,
        cookSpeedLevel: 0,
        chickenValueLevel: 0,
        cookingCount: 0,
        cookingElapsedMs: 0,
        sellingCount: 0,
        sellingElapsedMs: 0,
        sellTimeSeconds: 10,
        sellSpeedLevel: 0,
        coldStorageLevel: 0,
        cookingSlotsLevel: 0,
        sellingRegistersLevel: 0,
        activeRecipe: "basic_fried",
        cookingRecipeId: "basic_fried",
        earnedMilestones: [],
        unlockedRecipes: ["basic_fried"],
        managers: {
          buyer: { hired: false, level: 1, elapsedMs: 0 },
          cook: { hired: false, level: 1, elapsedMs: 0 },
          sell: { hired: false, level: 1, elapsedMs: 0 },
        },
        lastOnlineTimestamp: Date.now(),
        revenueTracker: {
          recentRevenueCents: 0,
          trackerElapsedMs: 0,
          lastComputedRatePerMs: 0,
        },
        totalChickensBought: 0,
        tipsLevel: 0,
        lastClickTimestamps: { buyer: 0, cook: 0, sell: 0 },
        equipment: {},
        staff: {},
        lastActivityTimestamp: 0,
        continuousIdleMs: 0,
      };
      localStorage.setItem(saveKey, JSON.stringify(state));
    });

    await page.reload();

    // Equipment and staff sections should now be visible
    await expect(page.locator("#equipment-section")).toBeVisible();
    await expect(page.locator("#staff-section")).toBeVisible();

    // Basic oven should be visible (unlock at $1K revenue, we have $100K)
    await expect(page.locator("#equip-basic_oven")).toBeVisible();

    // Line Cook should be visible (unlock at $1K revenue)
    await expect(page.locator("#staff-line_cook")).toBeVisible();

    await page.screenshot({
      path: "e2e/screenshots/equipment-staff-visible.png",
      fullPage: true,
    });
  });
});
