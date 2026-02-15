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
| Prepare (Husky) | `npm run prepare`         |

## Architecture

Pure state machine. Engine functions are pure (`state => newState`). UI is a thin DOM renderer. See decision 003.

## Source Map

| Path                           | Purpose                                                               |
| ------------------------------ | --------------------------------------------------------------------- |
| `eslint.config.js`             | ESLint flat config — strict TS rules + Prettier compat                |
| `.prettierrc`                  | Prettier formatting config                                            |
| `.husky/pre-commit`            | Pre-commit hook — lint-staged then tests                              |
| `playwright.config.ts`         | Playwright e2e config — auto-starts Vite, screenshots                 |
| `src/types/game-state.ts`      | GameState interface and initial state factory                         |
| `src/engine/tick.ts`           | Core tick function — advances time, cooks chickens                    |
| `src/engine/sell.ts`           | Sell action — converts ready chickens to money (uses effective price) |
| `src/engine/buy.ts`            | Upgrade system — costs, purchases, effective stat calculations        |
| `src/engine/click.ts`          | Click-to-cook action — instantly produces 1 chicken per click         |
| `src/engine/save.ts`           | Pure serialize/deserialize for game state persistence                 |
| `src/engine/offline.ts`        | Offline earnings — auto-sells chickens produced while away (8h cap)   |
| `src/ui/render.ts`             | DOM renderer — stats, upgrade buttons, offline banner                 |
| `src/main.ts`                  | Entry point — game loop, cook/buy/sell events, save/load              |
| `tsconfig.json`                | TypeScript config — strict mode, path aliases (@engine, @ui, @types)  |
| `vite.config.ts`               | Vite build config — sets `/chicken-shop-idle/` base for GitHub Pages  |
| `vitest.config.ts`             | Vitest config — path aliases, test include pattern                    |
| `index.html`                   | HTML entry point — game UI shell, inline styles, module script        |
| `.github/workflows/deploy.yml` | GitHub Actions — build + deploy to GitHub Pages on push to main       |

## Test Map

| Path                           | Covers                                                                    |
| ------------------------------ | ------------------------------------------------------------------------- |
| `tests/engine/tick.test.ts`    | tick() — cooking progress, production, offline catch-up, immutability     |
| `tests/engine/sell.test.ts`    | sellChickens() — earnings, no-op when empty, immutability                 |
| `tests/engine/click.test.ts`   | clickCook() — instant cook, counter increment, immutability               |
| `tests/engine/buy.test.ts`     | buyUpgrade, getUpgradeCost, effective stats, immutability                 |
| `tests/engine/save.test.ts`    | serializeState/deserializeState — round-trip, validation, old save compat |
| `tests/engine/offline.test.ts` | calculateOfflineEarnings — production, auto-sell, 8h cap, immutability    |
| `tests/ui/render.test.ts`      | render() + showOfflineBanner() — formatting, banner display (happy-dom)   |
| `e2e/game.spec.ts`             | Full browser: initial state, cooking, selling, screenshots (Playwright)   |

## Design Decisions

| ID  | File                                                   | Summary                                                 |
| --- | ------------------------------------------------------ | ------------------------------------------------------- |
| 001 | `docs/decisions/001-tech-stack.md`                     | TypeScript + Vite + Vitest, vanilla DOM, no framework   |
| 002 | `docs/decisions/002-money-as-cents.md`                 | All money as integer cents to avoid float bugs          |
| 003 | `docs/decisions/003-pure-state-machine.md`             | Engine is pure functions, no side effects               |
| 004 | `docs/decisions/004-static-analysis-and-formatting.md` | ESLint + Prettier + Husky pre-commit enforcement        |
| 005 | `docs/decisions/005-ui-testing-strategy.md`            | happy-dom unit tests + Playwright e2e with screenshots  |
| 006 | `docs/decisions/006-persistence-and-offline.md`        | localStorage save + 8-hour offline earnings cap         |
| 007 | `docs/decisions/007-github-pages-deploy.md`            | GitHub Pages deploy on merge to main via GitHub Actions |
| 008 | `docs/decisions/008-buy-upgrades.md`                   | Two purchasable upgrades with exponential cost scaling  |

## Plans

Plans live in two directories based on status:

- **`docs/plans/todo/`** — Active and upcoming plans
- **`docs/plans/complete/`** — Finished plans (moved here when done)

| ID  | File                                            | Status      | Summary                                      |
| --- | ----------------------------------------------- | ----------- | -------------------------------------------- |
| 001 | `docs/plans/complete/001-initial-scaffold.md`   | Complete    | Project setup, core loop, tests, docs        |
| 002 | `docs/plans/complete/002-buy-upgrades.md`       | Complete    | Buy upgrades for cook speed + chicken value  |
| 003 | `docs/plans/complete/003-update-agents-docs.md` | Complete    | Add missing config files and commands to map |
| 004 | `docs/plans/todo/004-click-to-cook.md`          | In Progress | Click-to-cook clicker button                 |

## Conventions

- **TDD workflow:** Write failing tests first, then implement.
- **Engine purity:** `src/engine/` must never import from `src/ui/` or access DOM/timers.
- **Immutability:** Engine functions return new state objects, never mutate input.
- **Money:** Always integer cents. Format to dollars only in UI.
- **Agent comments:** Use `AGENT CONTEXT:` prefix in JSDoc for comments aimed at agents.
- **Return types:** All functions must have explicit return types (enforced by ESLint).
- **Pre-commit:** Every commit is auto-formatted, linted, and tested. Commits fail if any check fails.
- **Default branch:** `main`. Always branch from and merge into `main`.

## Keeping Docs Up to Date

When you make changes to the codebase, update documentation **in the same commit**:

### When to write a new decision record

Add a new `docs/decisions/NNN-<slug>.md` when any of these happen:

- A new library, tool, or service is introduced
- An architectural pattern is established or changed
- A non-obvious constraint is chosen (e.g. caps, limits, storage strategy)
- An existing decision is reversed or superseded (set old status to `Superseded by NNN`)

Use the template:

```markdown
# Decision NNN: Title

**Status:** Accepted
**Date:** YYYY-MM-DD

## Context

Why this decision is needed.

## Decision

What was decided.

## Rationale

Why this option over alternatives.

## Consequences

What follows from this decision — trade-offs, constraints, future work.
```

### Plan lifecycle

1. **Create** — New plans go in `docs/plans/todo/NNN-<slug>.md` with status `Todo`.
2. **Work** — Set status to `In Progress` when you start. Check off steps as you go.
3. **Complete** — When all steps are done, set status to `Complete`, add an `## Outcome` section, then move the file to `docs/plans/complete/`. Moving the plan must be the **last commit** on the branch — a dedicated commit that only moves the plan file and updates the Plans table in this file.
4. **Abandon** — If a plan is dropped, set status to `Abandoned` with a brief reason, then move to `docs/plans/complete/` (it's still a historical record).

Always update the Plans table in this file (agents.md) when a plan changes directory or status.

### After every change, review and update

1. **This file (agents.md)** — Keep the Design Decisions table, Source Map, Test Map, Plans table, and Conventions in sync with the current code.
2. **Decision records** — If a change modifies behavior covered by an existing decision, update that decision or write a new one that supersedes it.
3. **Plan docs** — Follow the plan lifecycle above.

### Numbering

Decision and plan IDs are sequential. Check the highest existing number across `docs/decisions/`, `docs/plans/todo/`, and `docs/plans/complete/`, then increment by one.
