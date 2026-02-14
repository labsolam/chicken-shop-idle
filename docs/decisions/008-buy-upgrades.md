# Decision 008: Buy Upgrades System

**Status:** Accepted
**Date:** 2026-02-14

## Context

The game had no way to spend money. Players could cook and sell chickens but accumulated money with no purpose, removing the core idle game progression loop.

## Decision

Two purchasable upgrades with escalating costs:

- **Faster Cooking** (`cookSpeedLevel`) — reduces effective cook time by 10% per level (min 0.5s)
- **Better Chicken** (`chickenValueLevel`) — adds $0.25 per chicken per level

Cost formula: `floor(500 * 1.5^level)` cents (starts at $5.00, scales exponentially).

## Rationale

- Two upgrades give players a meaningful choice (speed vs value).
- Exponential cost scaling is standard in idle games to maintain progression pacing.
- Effects are applied via pure helper functions (`getEffectiveCookTime`, `getEffectiveChickenPrice`) called by `tick()` and `sellChickens()`, keeping the engine pure.
- Upgrade levels are stored as simple integers on GameState, with old saves defaulting to 0.

## Consequences

- `GameState` has two new fields: `cookSpeedLevel`, `chickenValueLevel`.
- `save.ts` treats these as optional for backwards compatibility with old saves.
- `tick.ts` now imports `getEffectiveCookTime` from `buy.ts`.
- `sell.ts` now imports `getEffectiveChickenPrice` from `buy.ts`.
- UI shows buy buttons that are disabled when the player can't afford the upgrade.
