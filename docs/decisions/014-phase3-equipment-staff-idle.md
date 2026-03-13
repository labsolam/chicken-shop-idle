# Decision 014: Phase 3 — Equipment, Staff, and Idle Diminishing Returns

**Status:** Accepted
**Date:** 2026-03-13

## Context

Phase 3 adds lateral progression through equipment and staff systems, plus idle diminishing returns to prevent infinite AFK farming. These features create build diversity and meaningful investment choices.

## Decision

1. **Equipment system:** 13 items (7 kitchen, 6 front-of-house) with level-based passive bonuses. Bonuses are additive per level, applied as multipliers to cook speed, sell speed, sale value, tips, and slot counts. Recipe-type-specific bonuses only apply when the active recipe matches the tagged type.

2. **Staff system:** 6 staff members with level-based passive bonuses. Unlike managers (who automate), staff provide always-on multipliers. The Accountant's cost reduction applies to all upgrade purchases via `buyUpgrade()`.

3. **Idle diminishing returns:** After 8h continuous idle, earnings ramp down linearly from 100% to 80% over 2h, then cap at 60%. `continuousIdleMs` is tracked by `tick()` and reset on any player click.

4. **Customer attraction reinterpretation:** Per Plan 010, "customer attraction" and "customer rate" bonuses (Display Case, Neon Sign, Marketing Intern) are reinterpreted as sell speed bonuses since the customer demand system is not implemented.

5. **Equipment/staff multipliers in revenue formula:** Equipment and staff multipliers are applied multiplicatively alongside existing milestone multipliers in `tick()`. The idle efficiency factor is also applied to the effective sale price.

## Rationale

- Equipment and staff use additive-per-level bonuses (1 + bonus \* level) rather than multiplicative compounding to keep numbers manageable in mid-game.
- The Accountant discount is applied at purchase time in `buyUpgrade()` rather than modifying `getUpgradeCost()` to keep cost display and discount separate.
- Idle diminishing returns use a simple linear ramp rather than exponential decay for predictability.

## Consequences

- `GameState` now includes `equipment`, `staff`, `lastActivityTimestamp`, and `continuousIdleMs` fields.
- All player click handlers in `main.ts` now call `resetIdle()` to zero `continuousIdleMs`.
- Save/load handles Phase 3 fields with empty-object defaults for backward compatibility.
- Equipment and staff panels are feature-gated behind `$1K` total revenue.
- Future phases (prestige) will need to decide which equipment/staff persist through resets.
