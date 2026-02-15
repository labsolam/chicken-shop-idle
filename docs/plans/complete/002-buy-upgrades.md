# Plan 002: Buy Upgrades

**Status:** Complete
**Date:** 2026-02-14

## Goal

Add a buy/upgrade system so players can spend money to improve their chicken shop. Two upgrades:

- **Faster Cooking** — reduces `cookTimeSeconds` (cook chickens quicker)
- **Better Chicken** — increases `chickenPriceInCents` (earn more per chicken)

Each upgrade has escalating costs and can be purchased multiple times.

## Steps

- [x] Add `cookSpeedLevel` and `chickenValueLevel` to GameState
- [x] Update `save.ts` STATE_FIELDS + deserializeState to handle new fields
- [x] Write `buy.test.ts` (TDD red phase)
- [x] Implement `src/engine/buy.ts` (TDD green phase)
- [x] Add buy buttons to `index.html`
- [x] Update `render.ts` to show upgrade costs and disable when unaffordable
- [x] Add render tests for buy button display
- [x] Wire buy buttons in `main.ts`
- [x] Run full test suite
- [x] Update `agents.md` source/test maps
- [x] Write decision record 008
- [x] Commit and push

## Outcome

60 tests passing (13 new buy tests + 4 new render tests + 1 save compat test). Two buy buttons in the UI with dynamic cost display and disabled state. Upgrade effects integrated into tick and sell functions.
