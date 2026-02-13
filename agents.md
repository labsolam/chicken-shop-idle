# Agent Navigation Map

> This file is the entry point for AI agents working on this codebase.
> It provides a low-context map to all documentation and key code locations.
> Always read this file first when starting a session.

## Project

Chicken Shop Idle — a browser-based idle game where you run a chicken shop.

## Commands

| Action          | Command                   |
| --------------- | ------------------------- |
| Dev server      | `npm run dev`             |
| Run tests       | `npm test`                |
| Watch tests     | `npm run test:watch`      |
| Build           | `npm run build`           |
| Lint            | `npm run lint`            |
| Lint (auto-fix) | `npm run lint:fix`        |
| Format          | `npm run format`          |
| Format (check)  | `npm run format:check`    |
| Full check      | `npm run check`           |
| E2E tests       | `npm run test:e2e`        |
| E2E (headed)    | `npm run test:e2e:headed` |

## Architecture

Pure state machine. Engine functions are pure (`state => newState`). UI is a thin DOM renderer. See decision 003.

## Source Map

| Path                      | Purpose                                                |
| ------------------------- | ------------------------------------------------------ |
| `eslint.config.js`        | ESLint flat config — strict TS rules + Prettier compat |
| `.prettierrc`             | Prettier formatting config                             |
| `.husky/pre-commit`       | Pre-commit hook — lint-staged then tests               |
| `playwright.config.ts`    | Playwright e2e config — auto-starts Vite, screenshots  |
| `src/types/game-state.ts` | GameState interface and initial state factory          |
| `src/engine/tick.ts`      | Core tick function — advances time, cooks chickens     |
| `src/engine/sell.ts`      | Sell action — converts ready chickens to money         |
| `src/ui/render.ts`        | DOM renderer — reads state, updates elements           |
| `src/main.ts`             | Entry point — game loop, event wiring                  |

## Test Map

| Path                        | Covers                                                                  |
| --------------------------- | ----------------------------------------------------------------------- |
| `tests/engine/tick.test.ts` | tick() — cooking progress, production, offline catch-up, immutability   |
| `tests/engine/sell.test.ts` | sellChickens() — earnings, no-op when empty, immutability               |
| `tests/ui/render.test.ts`   | render() — money format, progress %, element updates (happy-dom)        |
| `e2e/game.spec.ts`          | Full browser: initial state, cooking, selling, screenshots (Playwright) |

## Design Decisions

| ID  | File                                                   | Summary                                                |
| --- | ------------------------------------------------------ | ------------------------------------------------------ |
| 001 | `docs/decisions/001-tech-stack.md`                     | TypeScript + Vite + Vitest, vanilla DOM, no framework  |
| 002 | `docs/decisions/002-money-as-cents.md`                 | All money as integer cents to avoid float bugs         |
| 003 | `docs/decisions/003-pure-state-machine.md`             | Engine is pure functions, no side effects              |
| 004 | `docs/decisions/004-static-analysis-and-formatting.md` | ESLint + Prettier + Husky pre-commit enforcement       |
| 005 | `docs/decisions/005-ui-testing-strategy.md`            | happy-dom unit tests + Playwright e2e with screenshots |

## Plans

| ID  | File                                 | Status   | Summary                               |
| --- | ------------------------------------ | -------- | ------------------------------------- |
| 001 | `docs/plans/001-initial-scaffold.md` | Complete | Project setup, core loop, tests, docs |

## Conventions

- **TDD workflow:** Write failing tests first, then implement.
- **Engine purity:** `src/engine/` must never import from `src/ui/` or access DOM/timers.
- **Immutability:** Engine functions return new state objects, never mutate input.
- **Money:** Always integer cents. Format to dollars only in UI.
- **Agent comments:** Use `AGENT CONTEXT:` prefix in JSDoc for comments aimed at agents.
- **Return types:** All functions must have explicit return types (enforced by ESLint).
- **Pre-commit:** Every commit is auto-formatted, linted, and tested. Commits fail if any check fails.
