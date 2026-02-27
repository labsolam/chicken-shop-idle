# Implementation Prompt: Plan 008 — Phase 1 Enhanced Core Loop

Copy the prompt below and give it to a fresh agent.

---

## Prompt

You are implementing Plan 008 (Phase 1 — Enhanced Core Loop) for Chicken Shop Idle, a browser-based idle game. This is the first major feature expansion — it adds depth to the existing Buy → Cook → Sell pipeline.

### Setup

Before writing any code:

1. Read `agents.md` — the project entry point with source map, test map, conventions, and commands.
2. Read the plan: `docs/plans/todo/008-phase1-enhanced-core-loop.md` — this is your implementation spec. Follow its 11 steps in order.
3. Read these strategy docs for context (the plan references them, but is self-contained for formulas and tables):
   - `docs/strategy/002-core-gameplay-loop.md` — pipeline stages, recipes, economy
   - `docs/strategy/003-upgrades-and-enhancements.md` — all upgrade tables, cost formulas, milestones, equipment, staff
   - `docs/strategy/006-comprehensive-implementation-strategy.md` — phases, revenue formula, cost curves
4. Read the current source code to understand what you're modifying:
   - `src/types/game-state.ts` — current GameState (you're expanding this heavily)
   - `src/engine/buy.ts` — current upgrade system (you're replacing the formulas)
   - `src/engine/tick.ts` — current tick processing (you're adding slots, registers, recipes)
   - `src/engine/buy-chicken.ts` — current buy action (you're adding cold storage + bulk)
   - `src/engine/click.ts` — current cook action (you're adding bulk cook + recipe input)
   - `src/engine/sell.ts` — current sell action (you're adding bulk sell)
   - `src/engine/save.ts` — current save/load (you're adding new fields)
   - `src/engine/offline.ts` — offline earnings (no-op, leave alone for now)
5. Read the existing tests to understand test patterns:
   - `tests/engine/buy.test.ts`, `tests/engine/tick.test.ts`, `tests/engine/buy-chicken.test.ts`
   - `tests/engine/click.test.ts`, `tests/engine/sell.test.ts`, `tests/engine/save.test.ts`
   - `tests/ui/render.test.ts`, `e2e/game.spec.ts`

### Critical Conventions

These are non-negotiable. Violating them will cause test/lint failures:

- **TDD workflow:** Write failing tests first, then implement. Every new function needs tests.
- **Engine purity:** `src/engine/` must NEVER import from `src/ui/` or access DOM/timers. Pure `(state) => newState`.
- **Immutability:** Engine functions return new state objects, never mutate input. Spread state in return.
- **Money as integer cents:** All monetary values are integers. `500` = $5.00. Never use floats for money.
- **Explicit return types:** All functions must have explicit return types (ESLint enforces this).
- **Pre-commit hooks:** Every commit runs lint + format + tests. If a commit fails, fix the issue first.
- **No side effects in engine:** `Date.now()`, `Math.random()`, `console.log()` — none of these in engine files.

### Implementation Order

Follow the plan's 11 steps in dependency order. Here's the workflow for each step:

1. **Read the step** in the plan carefully — it has the exact formulas, lookup tables, and code snippets.
2. **Write failing tests** for the new functionality.
3. **Implement** the feature to make tests pass.
4. **Run `npm test`** to verify all tests pass (new AND existing).
5. **Run `npm run lint`** to catch any lint issues.
6. **Commit** after each step passes.

### Step Summary (brief — the plan has full details)

| Step | What | Key files |
|------|------|-----------|
| 1 | Recipe data + expanded GameState | `src/engine/recipes.ts` (new), `src/types/game-state.ts`, `src/engine/save.ts` |
| 2 | Replace upgrade formulas (6 categories, caps, lookup tables) | `src/engine/buy.ts`, `tests/engine/buy.test.ts` |
| 3 | Update tick() for slots, registers, recipes, sell speed | `src/engine/tick.ts`, `tests/engine/tick.test.ts` |
| 4 | Cold storage + bulk buy | `src/engine/buy-chicken.ts`, `tests/engine/buy-chicken.test.ts` |
| 5 | Bulk cook/sell + recipe selection | `src/engine/click.ts`, `src/engine/sell.ts` |
| 6 | Milestone system | `src/engine/milestones.ts` (new) |
| 7 | Feature unlock system | `src/engine/unlocks.ts` (new) |
| 8 | Number formatting utility | `src/ui/format.ts` (new) |
| 9 | UI updates | `src/ui/render.ts`, `src/main.ts` |
| 10 | E2E test updates | `e2e/game.spec.ts` |
| 11 | Full check | `npm run check` + `npm run test:e2e` |

### What to Watch Out For

1. **`cookingRecipeId` vs `activeRecipe`:** These are separate fields. `activeRecipe` is what the player selected (determines next cook). `cookingRecipeId` is what's currently in the oven (determines cook time and sell price). They sync when `cookingCount` hits 0. Read the plan's Step 1 and Step 3 carefully.

2. **tick() processing order:** Compute sale price → process selling → process cooking. This prevents price changes mid-tick when cooking finishes and syncs the recipe.

3. **Deprecating old fields:** `chickenPriceInCents`, `cookTimeSeconds`, and `sellTimeSeconds` are superseded by recipe/formula-based values. Keep them in GameState for save compatibility but stop reading them in game logic.

4. **Lookup tables are hand-tuned, not formulas:** Cold Storage capacity, Sale Value multipliers, and Cold Storage costs all use explicit lookup tables from the plan. Do NOT invent formulas — use the exact arrays.

5. **Batch operations use recipes:** Bulk cook x5 means 5 cook jobs, each consuming `recipe.rawInput` raw chickens. For Chicken Burger (2 inputs), x5 = 10 raw chickens.

6. **`unlockedRecipes` is a persistent field:** It survives prestige resets in later phases. Unlock recipes by adding to this array, and check this array (not revenue thresholds) when validating recipe selection.

7. **Milestones are multiplicative:** `getMilestoneMultiplier()` returns the product of all earned milestone rewards. It feeds into the sale price formula.

8. **Level caps:** Every upgrade type has a max level. `buyUpgrade()` must return state unchanged at cap. Cold Storage has 10 levels (0-10), Cook/Sell Speed has 30, Chicken Value has 25, Slots/Registers have 10.

9. **Breaking changes from current code:**
   - Chicken price: $1.00 → recipe-based ($0.50 for Basic Fried)
   - Cook time formula: `0.9^level` → `0.85^level`
   - Value upgrade: additive (+$0.25/level) → multiplicative (lookup table)
   - Cost formula: `500 × 1.5^level` → category-specific (see plan Step 2)
   - UpgradeType: 2 types → 6 types

10. **Existing tests will break:** Steps 2-3 change core formulas. Update existing tests to match new behavior before adding new tests.

### After All Steps

1. Run `npm run check` — must pass cleanly (lint + format + tests + build).
2. Run `npm run test:e2e` — must pass cleanly.
3. Update `agents.md`:
   - Add new files to Source Map (`src/engine/recipes.ts`, `src/engine/milestones.ts`, `src/engine/unlocks.ts`, `src/ui/format.ts`)
   - Add new test files to Test Map
   - Update Plan 008 status from Todo to In Progress (or Complete if all steps done)
4. Set Plan 008 status to `Complete`, add an `## Outcome` section, and move it to `docs/plans/complete/`.
5. Commit all changes.

### Do NOT

- Implement features from Phase 2+ (managers, automation, tips, equipment, staff, prestige)
- Add `BigInt` or complex number libraries
- Introduce external dependencies (no npm packages)
- Modify the build/deploy config
- Skip writing tests
- Use `Set<string>` in GameState (not JSON-serializable — use `string[]`)
- Use `Date.now()` or `Math.random()` in engine files
