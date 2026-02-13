# Decision 005: UI Testing Strategy

**Status:** Accepted
**Date:** 2026-02-13

## Context

Agents cannot open a browser GUI. Need automated ways to validate UI correctness and visually inspect the rendered game.

## Decision

Two-layer UI testing:

### Layer 1: happy-dom unit tests (fast, in Vitest)

- File: `tests/ui/render.test.ts`
- Uses `@vitest-environment happy-dom` directive per-file
- Tests render function against a simulated DOM
- Validates: text content, formatting, element updates, missing element safety
- Runs as part of `npm test` (sub-second)

### Layer 2: Playwright e2e tests (full browser, slower)

- Dir: `e2e/`
- Config: `playwright.config.ts`
- Launches headless Chromium, loads the real app via Vite dev server
- Tests: initial state, cooking over time, sell interaction
- Captures screenshots to `e2e/screenshots/` — agents read these with image tools
- Run with: `npm run test:e2e`
- Not part of pre-commit (requires Chromium install)

## Agent Workflow for Visual Debugging

1. Run `npm run test:e2e`
2. Read screenshot files from `e2e/screenshots/` (agent is multimodal)
3. Inspect visually for layout/style issues
4. If issues found, fix and re-run

## Consequences

- happy-dom tests run on every commit (fast, no browser needed)
- Playwright tests run on-demand or in CI (needs `npx playwright install chromium` first)
- Screenshot artifacts are gitignored
- ESLint ignores `e2e/` directory (Playwright has its own conventions)
