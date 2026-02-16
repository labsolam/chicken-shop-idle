import { test, expect } from "@playwright/test";

/**
 * AGENT CONTEXT: End-to-end tests for the chicken shop game.
 * Tests the 3-step clicker flow: Buy → Cook → Sell.
 * Cooking takes 10s and selling takes 10s (timed actions via tick).
 * These run in a real browser (headless Chromium).
 *
 * Run: npm run test:e2e
 * Screenshots saved to: e2e/results/
 */

test.describe("Game initial state", () => {
  test("shows correct initial values on load", async ({ page }) => {
    await page.goto("/");

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
    await page.goto("/");

    await expect(page.locator("#buy-chicken-button")).toBeVisible();
    await expect(page.locator("#cook-button")).toBeVisible();
    await expect(page.locator("#sell-button")).toBeVisible();
  });
});

test.describe("Buy → Cook → Sell flow", () => {
  test("buying a chicken costs money and adds a raw chicken", async ({
    page,
  }) => {
    await page.goto("/");

    await page.locator("#buy-chicken-button").click();

    await expect(page.locator("#chickens-bought")).toHaveText("1");
    await expect(page.locator("#money")).toHaveText("$4.75");

    await page.screenshot({
      path: "e2e/screenshots/after-buy.png",
      fullPage: true,
    });
  });

  test("cooking queues a raw chicken and completes after timer", async ({
    page,
  }) => {
    await page.goto("/");

    // Buy then cook
    await page.locator("#buy-chicken-button").click();
    await page.locator("#cook-button").click();

    // Chicken is now in cooking queue, not yet ready
    await expect(page.locator("#chickens-bought")).toHaveText("0");
    await expect(page.locator("#cooking-status")).toContainText("Cooking:");

    // Wait for the 10s cook timer to complete
    await expect(page.locator("#chickens-ready")).toHaveText("1", {
      timeout: 15000,
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
    await page.goto("/");

    // Buy, wait for cook, then sell
    await page.locator("#buy-chicken-button").click();
    await page.locator("#cook-button").click();

    // Wait for cooking to complete
    await expect(page.locator("#chickens-ready")).toHaveText("1", {
      timeout: 15000,
    });

    await page.locator("#sell-button").click();

    // Chicken is now in selling queue
    await expect(page.locator("#chickens-ready")).toHaveText("0");
    await expect(page.locator("#selling-status")).toContainText("Selling:");

    // Wait for the 10s sell timer to complete
    // Started with $5.00, spent $0.25, earned $1.00 = $5.75
    await expect(page.locator("#money")).toHaveText("$5.75", {
      timeout: 15000,
    });

    await page.screenshot({
      path: "e2e/screenshots/after-sell.png",
      fullPage: true,
    });
  });

  test("cook button is disabled without raw chickens", async ({ page }) => {
    await page.goto("/");

    const cookButton = page.locator("#cook-button");
    await expect(cookButton).toBeDisabled();
  });

  test("sell button is disabled without cooked chickens", async ({ page }) => {
    await page.goto("/");

    const sellButton = page.locator("#sell-button");
    await expect(sellButton).toBeDisabled();
  });
});
