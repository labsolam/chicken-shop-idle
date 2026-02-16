# Plan 006: Buy-Cook-Sell Clicker Flow

**Status:** Complete

## Goal

Replace idle auto-cooking with a 3-step manual clicker process: Buy → Cook → Sell.

## Steps

- [x] Update GameState: add `chickensBought`, remove `cookingProgress`, set starting money to $5.00
- [x] Create `src/engine/buy-chicken.ts` with `buyChicken()` pure function
- [x] Modify `clickCook()` to require raw chickens (decrement `chickensBought`)
- [x] Simplify `tick()` to no-op (idle cooking disabled)
- [x] Simplify `calculateOfflineEarnings()` to no-op (no idle production)
- [x] Update `save.ts` to handle `chickensBought` as optional field
- [x] Update `render.ts` for buy/cook/sell button states and raw chicken display
- [x] Update `index.html` with buy button, raw chicken stat, remove cooking progress
- [x] Update `main.ts`: remove game loop tick, wire buy button handler
- [x] Write `buy-chicken.test.ts` and update all existing test files
- [x] Update e2e tests for 3-step flow
- [x] Run full check (lint, format, tests, build)
- [x] Create decision record 010
- [x] Update agents.md

## Outcome

Game now uses a 3-step clicker flow. Player starts with $5.00, buys raw chickens for $0.25 each, cooks them via click, and sells cooked chickens for $1.00 each. All 69 unit tests pass, lint/format clean, build succeeds.
