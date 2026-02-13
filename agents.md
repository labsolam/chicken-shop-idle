# Agent Navigation Map

> This file is the entry point for AI agents working on this codebase.
> It provides a low-context map to all documentation and key code locations.
> Always read this file first when starting a session.

## Project

Chicken Shop Idle — a browser-based idle game where you run a chicken shop.

## Commands

| Action | Command |
|--------|---------|
| Dev server | `npm run dev` |
| Run tests | `npm test` |
| Watch tests | `npm run test:watch` |
| Build | `npm run build` |

## Architecture

Pure state machine. Engine functions are pure (`state => newState`). UI is a thin DOM renderer. See decision 003.

## Source Map

| Path | Purpose |
|------|---------|
| `src/types/game-state.ts` | GameState interface and initial state factory |
| `src/engine/tick.ts` | Core tick function — advances time, cooks chickens |
| `src/engine/sell.ts` | Sell action — converts ready chickens to money |
| `src/ui/render.ts` | DOM renderer — reads state, updates elements |
| `src/main.ts` | Entry point — game loop, event wiring |

## Test Map

| Path | Covers |
|------|--------|
| `tests/engine/tick.test.ts` | tick() — cooking progress, production, offline catch-up, immutability |
| `tests/engine/sell.test.ts` | sellChickens() — earnings, no-op when empty, immutability |

## Design Decisions

| ID | File | Summary |
|----|------|---------|
| 001 | `docs/decisions/001-tech-stack.md` | TypeScript + Vite + Vitest, vanilla DOM, no framework |
| 002 | `docs/decisions/002-money-as-cents.md` | All money as integer cents to avoid float bugs |
| 003 | `docs/decisions/003-pure-state-machine.md` | Engine is pure functions, no side effects |

## Plans

| ID | File | Status | Summary |
|----|------|--------|---------|
| 001 | `docs/plans/001-initial-scaffold.md` | Complete | Project setup, core loop, tests, docs |

## Conventions

- **TDD workflow:** Write failing tests first, then implement.
- **Engine purity:** `src/engine/` must never import from `src/ui/` or access DOM/timers.
- **Immutability:** Engine functions return new state objects, never mutate input.
- **Money:** Always integer cents. Format to dollars only in UI.
- **Agent comments:** Use `AGENT CONTEXT:` prefix in JSDoc for comments aimed at agents.
