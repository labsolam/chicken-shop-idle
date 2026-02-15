# Plan 004: Click-to-Cook Clicker Button

**Status:** Complete
**Date:** 2026-02-15

## Goal

Add a clicker button that lets players manually cook chickens by clicking. Each click instantly produces 1 ready chicken, bypassing the automatic cooking timer. This gives players an active way to earn alongside the idle mechanic.

## Changes

### 1. New engine function `src/engine/click.ts`

Pure function `clickCook(state) => newState` that:

- Adds 1 to `chickensReady`
- Adds 1 to `totalChickensCooked`
- Does NOT affect `cookingProgress` (auto-cooking continues independently)

### 2. Add "Cook Chicken" button to `index.html`

A new button above the sell button for the click action.

### 3. Wire click event in `src/main.ts`

Add event listener for the cook button that calls `clickCook`.

### 4. Update docs

- Add `src/engine/click.ts` to Source Map in agents.md
- Add `tests/engine/click.test.ts` to Test Map
- Add plan 004 to Plans table

## Steps

- [x] Write failing tests for clickCook (TDD red phase)
- [x] Implement clickCook engine function (TDD green phase)
- [x] Add cook button to index.html
- [x] Wire click event in main.ts
- [x] Update agents.md
- [x] Run full check and commit

## Outcome

Implemented `clickCook()` in `src/engine/click.ts` with 5 unit tests. "Cook Chicken" button wired in `index.html` and `src/main.ts`. All 65 tests passing, lint and format clean.
