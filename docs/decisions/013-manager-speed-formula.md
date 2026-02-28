# Decision 013 — Manager Speed Formula (Reciprocal, not Subtractive)

**Date:** 2026-02-28
**Status:** Accepted

## Context

Phase 2 introduces three Tier 1 managers (Buyer Bob, Chef Carmen, Seller Sam), each with
10 upgrade levels. Each level adds a "speed bonus" that reduces the manager's automation
interval (the time between automated actions).

The strategy doc `004-idle-and-automation.md` specifies the following speed bonus fractions
per level (0-indexed, level 1 = index 0):

```
SPEED_BONUS = [0, 0.25, 0.5, 1.0, 2.0, 3.0, 5.0, 8.0, 12.0, 20.0]
```

The original doc implies a **subtractive** formula:

```
interval = baseInterval × (1 - speedBonus)
```

## Problem

The subtractive formula breaks at Level 4 where `speedBonus = 1.0`:

```
interval = baseInterval × (1 - 1.0) = 0
```

A zero interval causes an infinite loop in the tick manager processing `while` loop.
At higher levels (5–10) the speedBonus exceeds 1.0, producing **negative intervals**
which are nonsensical.

## Decision

Override the doc formula with a **reciprocal** formula:

```
interval = baseInterval / (1 + speedBonus)
```

This is mathematically well-defined for all positive speedBonus values and produces
meaningful intervals at every level:

| Level | speedBonus | Subtractive (broken) | Reciprocal (used) |
| ----- | ---------- | -------------------- | ----------------- |
| 1     | 0.00       | baseInterval         | baseInterval      |
| 2     | 0.25       | 0.75× base           | 0.80× base        |
| 3     | 0.50       | 0.50× base           | 0.67× base        |
| 4     | 1.00       | **0× base (∞ loop)** | 0.50× base        |
| 5     | 2.00       | **-1× base (NaN)**   | 0.33× base        |
| 10    | 20.00      | **-19× base (NaN)**  | 0.048× base       |

The reciprocal formula also has a natural interpretation: each speed level makes the
manager proportionally faster rather than knocking fixed time off. At level 10
(+2000% speed) the interval is `base / 21 ≈ 4.8%` of the original, meaning the manager
acts ~21× as fast as at level 1.

## Consequences

- `getManagerInterval(key, level)` in `src/engine/managers.ts` uses the reciprocal formula.
- Tests in `tests/engine/managers.test.ts` verify the reciprocal behavior explicitly
  (e.g., level 2 = `base / 1.25`, level 4 = `base / 2`, level 10 = `base / 21`).
- The strategy doc (`docs/strategy/004-idle-and-automation.md`) is superseded by this
  decision for the speed formula; all other doc values (unlock thresholds, hire costs,
  batch bonuses) remain unchanged.
