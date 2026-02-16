# Plan 007: Cooking and Selling Timers

**Status:** Complete

## Goal

Make cooking and selling timed actions (10 seconds each) instead of instant.

## Steps

- [x] Add timer fields to GameState (`cookingCount`, `cookingElapsedMs`, `sellingCount`, `sellingElapsedMs`, `sellTimeSeconds`)
- [x] Update `clickCook` to queue chickens for cooking instead of instant conversion
- [x] Update `sellChickens` to queue chickens for selling instead of instant sale
- [x] Implement `tick()` to advance cooking/selling timers and complete actions
- [x] Update `save.ts` deserialization for new fields (backward-compatible)
- [x] Update `render.ts` to display cooking/selling timer status
- [x] Add timer status elements to `index.html`
- [x] Add `requestAnimationFrame` game loop to `main.ts`
- [x] Update all unit tests (click, sell, tick, save, render)
- [x] Update e2e tests for timed flow
- [x] Write decision record 011

## Outcome

Cooking and selling now take 10 seconds each. The game loop runs via `requestAnimationFrame`, calling `tick()` each frame to advance timers. UI shows queue status with elapsed/total time. All 89 unit tests pass, lint and formatting are clean.
