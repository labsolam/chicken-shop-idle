# Plan 012: Implement Phase 5 — Super Managers & Advanced Automation

**Status:** Todo
**Date:** 2026-02-27
**Depends on:** Plan 011 (Phase 4 complete)

## Context

Phase 5 adds active-play value for post-prestige gameplay. Super Managers have powerful cooldown-based abilities, and advanced automation features reduce tedious micro-management in late runs.

**Read these docs before starting:**

1. `agents.md` — Source map, conventions, commands
2. `docs/strategy/004-idle-and-automation.md` — Tier 2-4 managers, Super Manager abilities, auto-recipe, temporary boosts, stacking rules
3. `docs/strategy/006-comprehensive-implementation-strategy.md` — Phase 5 summary

## What Phase 5 Adds

1. **Tier 2 Efficiency Managers**
   - Speedy Steve ($100K, +25% all automation speed), Bulk Betty ($100K, batch size → 5), Quality Quinn ($250K, +20% sale value on automated sales)
   - Unlock at $500K-$1M revenue

2. **Tier 3 Specialist Managers** — one per recipe type
   - +50% speed and +25% value for their recipe type
   - Unlock when corresponding recipe is unlocked

3. **Tier 4 Super Managers** — cooldown-based active abilities (doc 004)
   - Gordon (Rush Hour: 10× cook speed, 30s, 4h CD)
   - Martha (Fire Sale: 10× sell speed, 30s, 4h CD)
   - Colonel (Supply Drop: fill cold storage free, instant, 6h CD)
   - Chef Ramsay (Kitchen Nightmare: 5× all speed + 3× value, 60s, 8h CD)
   - Julia (Signature Touch: all sales at highest recipe value, 120s, 12h CD)
   - Unlocked via Stars, permanent across prestiges

4. **Auto-recipe selection modes** — Manual, Most Profitable, Fastest, Balanced

5. **Temporary boost system** — Happy Hour (×2 revenue, 30min), Rush Order (×3 sell speed, 15min), etc.
   - Same-type boosts don't stack (highest wins); different-type boosts stack multiplicatively

6. **Golden Drumstick tracking** — earned via achievements (counter only, no shop yet)

## What Phase 5 Does NOT Add

- Golden Drumstick shop (future phase)
- Auto-upgrade system (Phase 6, Crown upgrade)
- Prestige Layer 2 (Phase 6)

## Steps

### Step 1: Tier 2 and Tier 3 managers

- [ ] Expand manager state to support efficiency and specialist managers
- [ ] Tier 2 effects modify existing automation calculations globally
- [ ] Tier 3 effects are conditional on active recipe type
- [ ] Write tests

### Step 2: Super Managers

- [ ] Add `superManagers: Record<string, { unlocked: boolean; cooldownRemainingMs: number }>` to GameState
- [ ] `activateSuperManager(state, id)` — starts ability, sets cooldown
- [ ] Super Manager effects processed in `tick()` — apply multipliers during active duration
- [ ] Cooldowns tick in real time (not game time) — use `lastUpdateTimestamp` diff
- [ ] Super Managers are global across franchise locations (Phase 6 prep)
- [ ] Write tests for activation, duration, cooldown, effect application

### Step 3: Auto-recipe selection

- [ ] Add `autoRecipeMode: 'manual' | 'profitable' | 'fastest' | 'balanced'` to GameState
- [ ] Implement recipe evaluation: revenue/second for each unlocked recipe
- [ ] Auto-selection runs once per cook cycle completion
- [ ] Write tests

### Step 4: Temporary boosts

- [ ] Add `activeBoosts: Array<{ id, type, multiplier, remainingMs }>` to GameState
- [ ] `processBoosts()` in `tick()` — decrement timers, remove expired
- [ ] Stacking rules: same type → highest wins; different types → multiply
- [ ] Integrate boost multipliers into revenue/speed formulas
- [ ] Write tests for stacking, expiration, and effect

### Step 5: UI updates

- [ ] Super Manager panel with ability buttons and cooldown displays
- [ ] Auto-recipe mode selector
- [ ] Active boost indicators
- [ ] Tier 2/3 manager sections in manager panel

### Step 6: Run full check

- [ ] `npm run check` and `npm run test:e2e` — fix any failures
