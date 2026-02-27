# Decision 012: Phase 1 Enhanced Core Loop Architecture

**Status:** Accepted
**Date:** 2026-02-27

## Context

Phase 1 adds depth to the Buy → Cook → Sell pipeline without requiring automation. Key additions: cold storage capacity cap, multiple cooking slots and selling registers, expanded upgrade system (6 categories), bulk operations (x5/x10/x25), a recipe system, and revenue/sales milestones with permanent multiplicative bonuses.

## Decision

### Recipe system

Each recipe has `id`, `name`, `rawInput`, `cookTimeSeconds`, `saleValueCents`, `unlockCondition`, and `types[]`. The `RECIPES` map is typed `Record<string, Recipe>`. A `getRecipe(id)` helper always returns a non-null `Recipe` with Basic Fried Chicken as fallback, avoiding `noUncheckedIndexedAccess` type errors at call sites.

Two recipe ID fields on `GameState`:

- `activeRecipe` — what the player has selected for new cook jobs
- `cookingRecipeId` — the recipe currently in the oven (set when cooking starts, synced to `activeRecipe` only when `cookingCount` reaches 0 in `tick()`)

This decoupling ensures switching recipes mid-cook doesn't interrupt in-progress cooking or change the cook time/sale price of the batch already in progress.

### Slot-based batch cooking and selling

Instead of N independent timers, one timer fires per interval and completes `min(cookingCount, cookingSlots)` jobs. Same pattern for selling registers. This preserves O(1) state (two counters + one elapsed-ms) regardless of batch size.

### Upgrade system expansion

Upgraded from 2 to 6 categories: Cook Speed, Sell Speed, Chicken Sale Value, Cold Storage, Cooking Slots, Selling Registers. Each has its own cost formula and level cap. Cook/sell speed now use `0.85^level` (steeper than old `0.9^level`). Chicken value is now multiplier-based (lookup table) rather than additive.

### Milestone system

Milestones fire when `totalChickensSold` or `totalRevenueCents` cross thresholds. Each milestone adds a permanent multiplicative bonus or unlocks a recipe/feature. `checkMilestones()` is called at the end of every `tick()`. Multipliers are computed at the start of each tick, so newly earned milestones apply from the next tick.

### Feature unlock system

`isFeatureUnlocked(state, featureId)` reveals bulk operations and locked upgrade categories progressively based on revenue/sold thresholds. The UI uses this to show/hide buttons, keeping the initial screen simple.

### Number formatting

`formatMoney(cents)` formats in tiers: $X.XX → $X.XXK → $X.XXM → $X.XXB → $X.XXT → scientific. All monetary UI uses this function.

## Rationale

- **Slot-based batching over N timers:** Simpler state, no serialization complexity, predictable behavior with offline calculations.
- **activeRecipe vs cookingRecipeId separation:** Allows recipe UI to be responsive (switch immediately) without interrupting in-progress cooking — standard idle game behavior.
- **Milestone multipliers vs fixed bonuses:** Multiplicative stacking gives impactful progression without balance disruption at late game.
- **Feature gating by revenue:** Keeps early UI uncluttered; complexity introduced gradually as the player earns more.

## Consequences

- `chickenPriceInCents`, `cookTimeSeconds`, `sellTimeSeconds` on `GameState` are now deprecated (kept for old-save compatibility; `tick()` ignores them).
- Basic Fried Chicken base sale value is $0.50 (down from implicit $1.00) — multiplier table compensates and grows significantly with upgrades.
- Cook time minimum is 0.1s (down from 0.5s) to support late-game play.
- The `getRecipe()` helper in recipes.ts is the canonical way to look up a recipe by string ID throughout the codebase.
