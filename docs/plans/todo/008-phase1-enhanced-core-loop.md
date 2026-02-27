# Plan 008: Implement Phase 1 — Enhanced Core Loop

**Status:** Todo
**Date:** 2026-02-27

## Context

The strategy docs (002-006) define a multi-phase expansion of Chicken Shop Idle. Phase 1 ("Enhanced Core Loop") adds depth to the existing Buy → Cook → Sell pipeline without requiring automation or prestige systems. This plan is the implementation spec for an agent to build Phase 1.

**Read these docs before starting (in order):**

1. `agents.md` — Source map, test map, conventions, commands
2. `docs/decisions/002-money-as-cents.md` — All money stored as integer cents
3. `docs/strategy/002-core-gameplay-loop.md` — Pipeline stages, recipes, customer demand, economy
4. `docs/strategy/003-upgrades-and-enhancements.md` — All upgrade tables, cost formulas, milestones, equipment, staff
5. `docs/strategy/006-comprehensive-implementation-strategy.md` — Phases, revenue formula, cost curves, pacing

Docs 004 (idle/automation) and 005 (prestige) are **not in scope for Phase 1** — read only if you need to understand what's deferred.

## What Phase 1 Adds

From doc 006 "Phase 1: Enhanced Core Loop":

1. **Cold Storage capacity** — cap on raw chickens (starts at 10, upgradeable to 25,000 over 10 levels)
2. **Multiple cooking slots** — parallel batch cooking (starts at 1, up to 30 over 10 levels)
3. **Multiple selling registers** — parallel batch selling (starts at 1, up to 30 over 10 levels)
4. **Expanded upgrade system** — 6 categories replacing the current 2:
   - Cook Speed (existing → new formula: `0.85^level`, cost `500 × 2.3^level`, cap 30)
   - Sell Speed (new — same curve as cook speed)
   - Chicken Sale Value (existing → new formula: multiplier lookup table, cost `1000 × 3.5^level`, cap 25)
   - Cold Storage Capacity (new — hand-tuned lookup table, cap 10)
   - Cooking Slots (new — `5000 × 10^level`, cap 10)
   - Selling Registers (new — `3000 × 10^level`, cap 10)
5. **Bulk buy/cook/sell** — x1, x5, x10, x25 batch operations
6. **Recipe system** — 4 initial recipes with different time/value tradeoffs (Basic Fried, Grilled, Wings, Burger)
7. **Revenue & sales milestones** — permanent multiplicative bonuses within a prestige run

## What Phase 1 Does NOT Add

Do NOT implement these — they belong to later phases:

- Managers or automation (Phase 2)
- Customer tips (Phase 2)
- Customer demand / arrival system (Phase 2+)
- Equipment system (Phase 3)
- Staff system (Phase 3)
- Prestige / Stars (Phase 4)
- Buying Speed upgrade (requires Auto-Supplier manager — Phase 2)
- Golden Drumsticks shop (Phase 5+)
- Recipes beyond Chicken Burger (Katsu at $5M, Rotisserie at $5B, etc. unlock later but can be defined in data)

## Steps

### Step 1: Define recipe data and expanded GameState

- [ ] Create `src/engine/recipes.ts` with recipe definitions (all 8 recipes from doc 002 table — they're data, but only 4 unlock in Phase 1)
  - Each recipe: `id`, `name`, `rawInput`, `cookTimeSeconds`, `saleValueCents`, `unlockCondition`
  - Basic Fried Chicken: 1 input, 10s, 50¢, available at start
  - Grilled Chicken: 1 input, 15s, 100¢, unlock at $500 total earned (50000 cents)
  - Chicken Wings: 1 input, 8s, 75¢, unlock at 250 chickens sold
  - Chicken Burger: 2 inputs, 20s, 200¢, unlock at $5K total earned (500000 cents)
  - Remaining recipes defined but with high unlock thresholds (Phase 2+ timing)

- [ ] Expand `GameState` interface in `src/types/game-state.ts`:
  - Add `sellSpeedLevel: number` (new upgrade, starts at 0)
  - Add `coldStorageLevel: number` (capacity upgrade level, starts at 0)
  - Add `cookingSlotsLevel: number` (starts at 0 = 1 slot)
  - Add `sellingRegistersLevel: number` (starts at 0 = 1 register)
  - Add `activeRecipe: string` (recipe ID, default `"basic_fried"`)
  - Add `totalChickensSold: number` (lifetime stat for milestone tracking)
  - Add `totalRevenueCents: number` (lifetime stat for milestone/unlock tracking)
  - Add `earnedMilestones: string[]` (IDs of triggered milestones)
  - Change `chickenPriceInCents` from `100` to `50` (Basic Fried Chicken base value — see doc 002 breaking change note)
  - Change `cookTimeSeconds` default to `10` (no change, but it now represents recipe base time)

- [ ] Update `createInitialState()` with all new fields and defaults

- [ ] Update `src/engine/save.ts` to handle new fields (add to `OPTIONAL_NUMBER_FIELDS` or equivalent, with safe defaults for old saves)

- [ ] Write tests for new state shape and save/load round-trip with new fields

### Step 2: Replace upgrade formulas in buy.ts

- [ ] Expand `UpgradeType` to cover all 6 categories: `"cookSpeed" | "sellSpeed" | "chickenValue" | "coldStorage" | "cookingSlots" | "sellingRegisters"`

- [ ] Replace cost formula per category (doc 003 "Scaling Factors by Category"):
  - Cook Speed: `baseCost=500, scaling=2.3` → `floor(500 × 2.3^level)`
  - Sell Speed: same as cook speed → `floor(500 × 2.3^level)`
  - Chicken Value: `baseCost=1000, scaling=3.5` → `floor(1000 × 3.5^level)`
  - Cold Storage: **hand-tuned lookup table** (doc 003 table — do NOT use a formula):
    `[1500, 7500, 35000, 200000, 1000000, 5000000, 25000000, 150000000, 1000000000, 7500000000]`
    (these are the doc 003 dollar values converted to cents)
  - Cooking Slots: `baseCost=5000, scaling=10` → `floor(5000 × 10^level)`
  - Selling Registers: `baseCost=3000, scaling=10` → `floor(3000 × 10^level)`

- [ ] Add level caps per upgrade type (doc 003 "Upgrade Cap Behavior"):
  - Cook Speed: 30, Sell Speed: 30, Chicken Value: 25
  - Cold Storage: 10, Cooking Slots: 10, Selling Registers: 10
  - `buyUpgrade()` must return state unchanged if at cap

- [ ] Replace `getEffectiveCookTime()`:
  - New formula: `baseCookTime × 0.85^level` (min 0.1s per doc 003 Cooking Speed table)
  - `baseCookTime` comes from the active recipe, not a global constant

- [ ] Add `getEffectiveSellTime()`:
  - Formula: `baseSellTime × 0.85^level` (same curve as cook speed, applied to sell timer)
  - `baseSellTime` is always 10s (selling doesn't vary by recipe)

- [ ] Replace `getEffectiveChickenPrice()`:
  - New behavior: multiplier-based, not additive
  - Use hand-tuned lookup table from doc 003 Chicken Sale Value table
  - `effectivePrice = recipeBaseValue × saleValueMultiplier(level)`
  - Multiplier table: `[1.0, 1.2, 1.4, 1.7, 2.0, 2.5, ...]` (see doc 003 for all 26 values)

- [ ] Add `getColdStorageCapacity(level)`:
  - Lookup table from doc 003: `[10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000]`

- [ ] Add `getCookingSlots(level)` and `getSellingRegisters(level)`:
  - Cooking: `[1, 2, 3, 4, 5, 6, 8, 10, 15, 20, 30]`
  - Selling: `[1, 2, 3, 4, 5, ...]` up to 30 at level 10 (doc 003 Selling Registers table)

- [ ] Update `buyUpgrade()` to handle the new `UpgradeType` values and update the correct `GameState` field for each

- [ ] **Update all existing tests** in `tests/engine/buy.test.ts` to use new formulas, then add tests for every new upgrade type, cap behavior, and effective stat function

### Step 3: Update tick() for slots, recipes, and sell speed

- [ ] Modify cooking completion in `tick()` to use slot-based batch processing (doc 003 "Parallel Slot Architecture"):
  ```
  while (cookingCount > 0 && cookingElapsedMs >= cookTimeMs) {
    const completedThisCycle = Math.min(cookingCount, cookingSlots);
    cookingCount -= completedThisCycle;
    chickensReady += completedThisCycle;
    totalChickensCooked += completedThisCycle;
    cookingElapsedMs -= cookTimeMs;
  }
  ```

- [ ] Modify selling completion to use register-based batch processing (same pattern as cooking slots)

- [ ] Use the active recipe's cook time instead of the global `cookTimeSeconds`:
  - `cookTimeMs = getEffectiveCookTime(RECIPES[state.activeRecipe].cookTimeSeconds, state.cookSpeedLevel) × 1000`

- [ ] Use `getEffectiveSellTime()` for sell timer (currently uses raw `sellTimeSeconds`)

- [ ] Track `totalChickensSold` — increment when selling completes

- [ ] Track `totalRevenueCents` — increment when money is earned from selling

- [ ] Compute effective sale price using recipe value × sale value multiplier:
  - `price = getEffectiveChickenPrice(RECIPES[state.activeRecipe].saleValueCents, state.chickenValueLevel)`

- [ ] **Update all existing tests** in `tests/engine/tick.test.ts`, then add tests for batch cooking, batch selling, recipe-based cook times, and stat tracking

### Step 4: Update buy-chicken.ts for cold storage and bulk buy

- [ ] Add cold storage capacity check to `buyChicken()`:
  - Cannot buy if `chickensBought >= getColdStorageCapacity(state.coldStorageLevel)`
  - Return state unchanged if storage full

- [ ] Add bulk buy function `buyChickens(state, quantity)`:
  - Buys `min(quantity, affordableCount, storageRemaining)` chickens
  - Deducts `actualBought × RAW_CHICKEN_COST` from money
  - Returns new state with updated `chickensBought` and `money`

- [ ] Update tests for cold storage cap and bulk buy

### Step 5: Update click.ts and sell.ts for bulk operations and recipes

- [ ] Add bulk cook function `clickCookBatch(state, quantity)`:
  - Queues `min(quantity, rawChickensAvailable)` for cooking
  - Multi-input recipes: Chicken Burger takes 2 raw chickens per cook, so `quantity` raw = `floor(quantity / rawInput)` cook jobs queued, `cookingCount` increases by that amount
  - Each cooking slot cooks one recipe (not one raw chicken) per cycle

- [ ] Add bulk sell function `sellChickensBatch(state, quantity)`:
  - Queues `min(quantity, chickensReady)` for selling

- [ ] Add recipe selection function `selectRecipe(state, recipeId)`:
  - Validates recipe is unlocked (check `totalRevenueCents` and `totalChickensSold` against unlock conditions)
  - When switching recipes: in-progress cooking completes at old recipe's time before new starts (doc 003)
  - Sets `state.activeRecipe` to the new recipe ID
  - Returns state unchanged if recipe is locked

- [ ] Write tests for all new functions, including edge cases:
  - Bulk cook with multi-input recipe when not enough raw chickens
  - Recipe switch mid-cook
  - Attempting to select a locked recipe

### Step 6: Milestone system

- [ ] Create `src/engine/milestones.ts` with milestone definitions from doc 003:
  - Total Chickens Sold milestones (10, 50, 100, 250, 500, 1000, ...)
  - Total Revenue milestones ($500, $5K, $50K, ...)
  - Each milestone: `id`, `type` (sold/revenue), `threshold`, `reward` (multiplier type + value, or recipe unlock)

- [ ] Create `checkMilestones(state)` function:
  - Checks if any new milestones have been crossed
  - Returns updated state with new milestones added to `earnedMilestones`
  - Process in ascending threshold order (doc 003 rule 2)

- [ ] Create `getMilestoneMultiplier(state)` function:
  - Combines all earned milestone multipliers multiplicatively
  - Returns single number used in revenue formula

- [ ] Integrate milestone checking into `tick()` (check after each sell completion)

- [ ] Integrate milestone multiplier into sale price calculation in `tick()`

- [ ] Write tests for milestone triggering, stacking, and integration with tick

### Step 7: Feature unlock system

- [ ] Create `src/engine/unlocks.ts` implementing the Feature Unlock Order from doc 003:
  - `isFeatureUnlocked(state, featureId)` → boolean
  - Features: bulk buy x5 ($50 earned), cold storage ($100 earned), recipes (various), etc.
  - Use doc 003's Feature Unlock Order table as the canonical source

- [ ] Integrate unlocks with recipe selection (can't select locked recipes)
- [ ] Integrate unlocks with upgrade visibility (can't buy locked upgrade categories)
- [ ] Write tests for unlock conditions

### Step 8: Update UI

- [ ] Update `src/ui/render.ts` to display:
  - Cold storage: `Storage: X/Y` where Y = capacity
  - Cooking slots: `Cooking: X/Y` where Y = slots
  - Selling registers: show register count
  - Active recipe name and selector (show unlocked recipes only)
  - All 6 upgrade categories (show only unlocked ones)
  - Bulk buy/cook/sell buttons (x1, x5, x10, x25 — show only unlocked tiers)
  - Milestone progress: next milestone and current progress
  - Upgrade buttons show "MAX" when at cap

- [ ] Update `src/main.ts` to wire up:
  - Recipe selection clicks
  - Bulk operation buttons
  - New upgrade type purchases

- [ ] Update UI tests in `tests/ui/render.test.ts`

### Step 9: Update e2e tests

- [ ] Update `e2e/game.spec.ts` for the new game flow:
  - Verify cold storage limits work
  - Verify recipe switching works
  - Verify new upgrades appear and function
  - Verify milestone triggers

### Step 10: Run full check and fix any issues

- [ ] Run `npm run check` (lint + format + tests + build)
- [ ] Fix any failures
- [ ] Run `npm run test:e2e` and fix any failures

## Implementation Notes

### Breaking Changes from Current Code

1. **Chicken price drops from $1.00 to $0.50** — the recipe system replaces the flat price (doc 002 breaking change note). Update `chickenPriceInCents: 100` → use recipe-based pricing.

2. **Cook time formula changes from `0.9^level` to `0.85^level`** — steeper diminishing returns per doc 003.

3. **Value upgrade changes from additive (+$0.25/level) to multiplicative (lookup table)** — doc 003 Chicken Sale Value table.

4. **Cost formula changes from `500 × 1.5^level` to category-specific scaling** — doc 003 "Migration from Current Code" section.

5. **`UpgradeType` expands from 2 to 6 types** — all existing references must be updated.

### Architecture Rules (Must Preserve)

- All engine functions remain pure: `(state) => newState`
- No DOM access or side effects in `src/engine/`
- All money in integer cents
- TDD: write failing tests first, then implement
- Immutability: return new state objects, never mutate

### Key Formulas (Quick Reference)

| Stat | Formula | Source |
|---|---|---|
| Cook time | `recipeBase × 0.85^cookSpeedLevel` (min 0.1s) | Doc 003 Cooking Speed |
| Sell time | `10 × 0.85^sellSpeedLevel` (min 0.1s) | Doc 003 Selling Speed |
| Sale value | `recipeBaseValue × multiplierLookup[chickenValueLevel] × milestoneMultiplier` | Docs 003, 006 |
| Cook speed cost | `floor(500 × 2.3^level)` cents | Doc 003 |
| Sell speed cost | `floor(500 × 2.3^level)` cents | Doc 003 |
| Value cost | `floor(1000 × 3.5^level)` cents | Doc 003 |
| Cold storage cap | Lookup table (hand-tuned) | Doc 003 |
| Slot/register cost | `floor(baseCost × 10^level)` cents | Doc 003 |

### Dependency Order

Steps must be implemented in order because:
- Step 1 (state shape) is needed by everything
- Step 2 (upgrade formulas) is needed by Steps 3-8
- Step 3 (tick changes) is needed by Step 6 (milestones integrate into tick)
- Steps 4-5 (buy/cook/sell changes) can be parallel
- Step 6 (milestones) depends on Step 3
- Step 7 (unlocks) depends on Steps 1-2
- Step 8 (UI) depends on all engine steps
- Steps 9-10 (e2e/check) are last
