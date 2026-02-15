import { test, expect } from "@playwright/test";

/**
 * AGENT CONTEXT: End-to-end tests for the chicken shop game.
 * These run in a real browser (headless Chromium).
 * Screenshots are captured automatically (see playwright.config.ts).
 * Agents can read screenshot files to visually inspect the UI.
 *
 * Run: npm run test:e2e
 * Screenshots saved to: e2e/results/
 */

test.describe("Game initial state", () => {
  test("shows correct initial values on load", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("#money")).toHaveText("$0.00");
    await expect(page.locator("#chickens-ready")).toHaveText("0");
    await expect(page.locator("#cooking-progress")).toHaveText("0%");
    await expect(page.locator("#total-cooked")).toHaveText("0");

    await page.screenshot({
      path: "e2e/screenshots/initial-state.png",
      fullPage: true,
    });
  });

  test("has a sell button", async ({ page }) => {
    await page.goto("/");

    const sellButton = page.locator("#sell-button");
    await expect(sellButton).toBeVisible();
    await expect(sellButton).toHaveText("Sell Chickens");
  });
});

test.describe("Cooking progress", () => {
  test("chickens cook over time", async ({ page }) => {
    await page.goto("/");

    // Wait enough time for cooking progress to advance
    await page.waitForTimeout(2000);

    const progressText = await page.locator("#cooking-progress").textContent();
    const progressPercent = parseInt(progressText ?? "0", 10);
    expect(progressPercent).toBeGreaterThan(0);

    await page.screenshot({
      path: "e2e/screenshots/cooking-in-progress.png",
      fullPage: true,
    });
  });

  test("produces a chicken after cook time", async ({ page }) => {
    await page.goto("/");

    // Default cook time is 5 seconds, wait 6 to ensure at least 1 chicken
    await page.waitForTimeout(6000);

    const readyText = await page.locator("#chickens-ready").textContent();
    const readyCount = parseInt(readyText ?? "0", 10);
    expect(readyCount).toBeGreaterThanOrEqual(1);

    const totalText = await page.locator("#total-cooked").textContent();
    const totalCount = parseInt(totalText ?? "0", 10);
    expect(totalCount).toBeGreaterThanOrEqual(1);

    await page.screenshot({
      path: "e2e/screenshots/chicken-produced.png",
      fullPage: true,
    });
  });
});

test.describe("Cook button", () => {
  test("clicking cook button produces a chicken immediately", async ({
    page,
  }) => {
    await page.goto("/");

    // Verify initial state
    await expect(page.locator("#chickens-ready")).toHaveText("0");
    await expect(page.locator("#total-cooked")).toHaveText("0");

    // Click cook button
    await page.locator("#cook-button").click();

    // Should have 1 chicken ready and 1 total cooked
    const readyText = await page.locator("#chickens-ready").textContent();
    const readyCount = parseInt(readyText ?? "0", 10);
    expect(readyCount).toBeGreaterThanOrEqual(1);

    const totalText = await page.locator("#total-cooked").textContent();
    const totalCount = parseInt(totalText ?? "0", 10);
    expect(totalCount).toBeGreaterThanOrEqual(1);

    await page.screenshot({
      path: "e2e/screenshots/after-cook-click.png",
      fullPage: true,
    });
  });
});

test.describe("Selling", () => {
  test("clicking sell converts chickens to money", async ({ page }) => {
    await page.goto("/");

    // Wait for at least 1 chicken to be ready
    await page.waitForTimeout(6000);

    // Verify we have chickens before selling
    const readyBefore = parseInt(
      (await page.locator("#chickens-ready").textContent()) ?? "0",
      10,
    );
    expect(readyBefore).toBeGreaterThanOrEqual(1);

    // Click sell
    await page.locator("#sell-button").click();

    // Chickens should be sold, money should increase
    await expect(page.locator("#chickens-ready")).toHaveText("0");

    const moneyText = await page.locator("#money").textContent();
    expect(moneyText).not.toBe("$0.00");

    await page.screenshot({
      path: "e2e/screenshots/after-sell.png",
      fullPage: true,
    });
  });
});
