import { defineConfig } from "@playwright/test";

/**
 * AGENT CONTEXT: Playwright e2e test config.
 * Starts Vite dev server automatically before tests.
 * Screenshots are saved to e2e/screenshots/ for agent visual inspection.
 * Run with: npm run test:e2e
 */
export default defineConfig({
  testDir: "e2e",
  outputDir: "e2e/results",
  use: {
    baseURL: "http://localhost:5173",
    screenshot: "on",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
});
