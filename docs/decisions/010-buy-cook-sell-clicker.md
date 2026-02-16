# Decision 010: Buy-Cook-Sell Clicker Flow

**Status:** Accepted
**Date:** 2026-02-16

## Context

The game previously used an idle auto-cooking model where chickens cooked automatically over time via a tick function, and players could click to instantly cook or sell. This needed to be replaced with a 3-step manual clicker flow.

## Decision

Replace idle auto-cooking with a 3-step clicker process:

1. **Buy** — Player spends money ($0.25) to purchase a raw chicken
2. **Cook** — Player clicks to convert a raw chicken into a cooked chicken
3. **Sell** — Player clicks to sell all cooked chickens ($1.00 each)

Key changes:

- Added `chickensBought` to GameState for raw chicken inventory
- Removed `cookingProgress` from GameState (no idle cooking)
- Player starts with $5.00 (500 cents) to buy initial chickens
- Raw chicken cost is 25 cents, selling price remains $1.00 (300% profit margin)
- Tick function and offline earnings are no-ops (kept for future idle mechanics)
- Cook and sell buttons are disabled when their action is not possible

## Rationale

The clicker flow gives players direct control over every step of the chicken shop pipeline. Idle mechanics will be re-introduced later as upgrades, building on this manual foundation.

## Consequences

- Players must actively click through all 3 steps — no passive income
- Tick and offline systems are dormant but preserved for future use
- Starting money is required since buying raw chickens costs money
- Old saves without `chickensBought` are handled via optional field defaulting to 0
