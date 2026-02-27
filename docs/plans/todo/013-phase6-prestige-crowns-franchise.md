# Plan 013: Implement Phase 6 — Prestige Layer 2 (Crowns) & Franchise

**Status:** Todo
**Date:** 2026-02-27
**Depends on:** Plan 012 (Phase 5 complete)

## Context

Phase 6 extends the endgame with a second prestige layer and the franchise system — multiple parallel chicken shops. This is the major late-game content addition that keeps players engaged for weeks.

**Read these docs before starting:**

1. `agents.md` — Source map, conventions, commands
2. `docs/strategy/005-prestige-and-endgame.md` — Crown formula, franchise reset rules, Crown upgrade tree, franchise locations, location interaction model
3. `docs/strategy/006-comprehensive-implementation-strategy.md` — Phase 6 summary

## What Phase 6 Adds

1. **Crown earning formula**: `floor(totalStarsEarned / 500)`
   - Requires "Franchise License" Star upgrade (2000 Stars) to unlock
   - ~8-12 Layer 1 prestiges to reach

2. **Franchise reset logic** — resets everything a Star reset does PLUS resets Stars to zero
   - Keeps: Crowns, Crown upgrades, Super Managers, Achievements, Golden Drumsticks

3. **Crown upgrade tree** (doc 005) — two tiers, ~17 upgrades
   - Franchise Perks (1-25 Crowns): Brand Recognition I-II, Star Accelerator I-II, Speed Heritage I, Franchise HQ, Manager Academy, Premium Supplier, Autoprestige I
   - Franchise Empire (25-100 Crowns): Brand Recognition III, Star Accelerator III, Location Slots I-III, Speed Heritage II, Express Training, Crown Jewel (unlocks Phase 7)

4. **Franchise locations** (2-4 parallel shops)
   - Downtown (general), Food Court (fast recipes, ×2 speed, ×0.7 value), Uptown (premium, ×0.5 speed, ×3 value), Airport (all recipes, ×2 customer rate, ×1.5 value)
   - Tab-based switching — only one visible at a time, all tick in parallel
   - Each location has its own complete sub-state (managers, upgrades, equipment, recipes, timers)
   - Super Managers are global (affect all locations)
   - Summary bar shows combined $/sec

5. **Auto-prestige option** — auto-prestige Stars when earned would double current total

6. **Auto-upgrade system** (late-game QoL) — player sets priority rules for upgrade purchasing

## Steps

### Step 1: Crown state and franchise reset

- [ ] Add `crowns: number`, `crownUpgrades: string[]`, `totalStarsEarned: number` to GameState
- [ ] Implement `franchiseReset(state)` — resets Stars + base game, preserves Crowns
- [ ] Write tests for reset correctness

### Step 2: Crown upgrade tree

- [ ] Define all Crown upgrades as data
- [ ] `buyCrownUpgrade(state, id)` — deducts Crowns, adds to purchased list
- [ ] Integrate effects: Brand Recognition multipliers, Star Accelerator, Speed Heritage (start speed upgrades at level N), Manager Academy, etc.
- [ ] Write tests

### Step 3: Franchise location system

- [ ] Add `franchiseLocations: Array<{ id, name, specialty, speedMult, valueMult, state: BaseGameState }>` to GameState
- [ ] Add `activeLocationIndex: number`
- [ ] `tick()` must process ALL locations each frame, not just the active one
- [ ] Each location's sub-state is a full base game state (managers, upgrades, etc.)
- [ ] Combined revenue from all locations counts toward Star earning
- [ ] Performance consideration: batch calculations per location
- [ ] Write tests for multi-location ticking, specialty bonuses

### Step 4: Auto-prestige

- [ ] Track Stars that would be earned in real-time
- [ ] When auto-prestige is enabled and condition met, trigger prestige automatically
- [ ] Write tests

### Step 5: UI updates

- [ ] Location tab bar at top of game area
- [ ] Combined $/sec summary across all locations
- [ ] Crown upgrade tree panel (similar to Star upgrade tree)
- [ ] Franchise reset button with preview
- [ ] Auto-prestige toggle

### Step 6: Run full check

- [ ] `npm run check` and `npm run test:e2e` — fix any failures

## Performance Notes

- With 4 locations each running `tick()`, computation per frame increases ~4×
- Consider batching: compute revenue once per second instead of per frame
- Each location's manager timers, cooking timers, and selling timers run independently
- Offline earnings must account for all locations
