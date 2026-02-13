# Plan 001: Initial Scaffold

**Status:** Complete
**Date:** 2026-02-13

## Goal

Set up project from empty repo to a runnable idle game with:
- Working build toolchain
- Core game loop (cooking chickens over time)
- Sell action (convert chickens to money)
- Minimal UI
- Full test coverage of engine logic
- Documentation system for agent navigation

## Steps

- [x] Initialize package.json with Vite + Vitest + TypeScript
- [x] Configure tsconfig with strict mode and path aliases
- [x] Define GameState type and initial state factory
- [x] Write tick tests (TDD red phase)
- [x] Write sell tests (TDD red phase)
- [x] Implement tick.ts (TDD green phase)
- [x] Implement sell.ts (TDD green phase)
- [x] Create minimal UI (index.html + render.ts)
- [x] Wire game loop in main.ts
- [x] Create agents.md index
- [x] Create decision records
- [x] Commit and push

## Outcome

10 tests passing. Game runs in browser via `npm run dev`. Pure engine fully separated from UI.
