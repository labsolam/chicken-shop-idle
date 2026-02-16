import { test, expect } from "@playwright/test";

/**
 * AGENT CONTEXT: End-to-end tests for the chicken shop game.
 * Tests the 3-step clicker flow: Buy → Cook → Sell.
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

  test("cooking converts a raw chicken to a cooked chicken", async ({
    page,
  }) => {
    await page.goto("/");

    // Buy then cook
    await page.locator("#buy-chicken-button").click();
    await page.locator("#cook-button").click();

    await expect(page.locator("#chickens-bought")).toHaveText("0");
    await expect(page.locator("#chickens-ready")).toHaveText("1");
    await expect(page.locator("#total-cooked")).toHaveText("1");

    await page.screenshot({
      path: "e2e/screenshots/after-cook.png",
      fullPage: true,
    });
  });

  test("selling converts cooked chickens to money", async ({ page }) => {
    await page.goto("/");

    // Buy, cook, sell
    await page.locator("#buy-chicken-button").click();
    await page.locator("#cook-button").click();
    await page.locator("#sell-button").click();

    await expect(page.locator("#chickens-ready")).toHaveText("0");
    // Started with $5.00, spent $0.25, earned $1.00 = $5.75
    await expect(page.locator("#money")).toHaveText("$5.75");

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
