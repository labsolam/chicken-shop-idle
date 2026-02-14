import { defineConfig } from "vite";

/**
 * AGENT CONTEXT: Vite build config.
 * Sets base path for GitHub Pages deployment.
 * Dev server uses "/" (default); production build uses repo name as base.
 */
export default defineConfig({
  base: "/chicken-shop-idle/",
});
