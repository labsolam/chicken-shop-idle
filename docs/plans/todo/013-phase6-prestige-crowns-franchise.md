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
   - Data model: `autoUpgradeRules: Array<{ priority: number; category: UpgradeType; enabled: boolean }>`
   - Algorithm: Each tick (or once per second), iterate rules by priority, buy the first affordable upgrade that matches an enabled rule
   - Player can reorder priorities and toggle categories on/off

## Steps

### Step 1: Crown state and franchise reset

- [ ] Add `crowns: number`, `crownUpgrades: string[]` to GameState
- [ ] Add `totalCrownsEarned: number` (cumulative Crowns earned — never decremented by Crown upgrade purchases. Needed by Phase 7 Diamond formula: `floor(totalCrownsEarned / 25)`)
- [ ] **Note:** `totalStarsEarned` was already added in Plan 011 (Phase 4). It is incremented whenever Stars are earned via prestige. This plan's Crown formula uses it: `floor(totalStarsEarned / 500)`.
- [ ] **Save migration:** For saves from Phases 4-5 that lack `totalStarsEarned`, default to `stars + sum(starUpgradeCosts)` as a best approximation of total Stars earned (imperfect but recovers most data).
- [ ] Implement `franchiseReset(state)` — resets Stars + base game, preserves Crowns. Increment `totalCrownsEarned` by Crowns earned.
- [ ] Write tests for reset correctness

### Step 2: Crown upgrade tree

- [ ] Define all Crown upgrades as data
- [ ] `buyCrownUpgrade(state, id)` — deducts Crowns, adds to purchased list
- [ ] Integrate effects: Brand Recognition multipliers, Star Accelerator, Speed Heritage (start speed upgrades at level N), Manager Academy, etc.
- [ ] Write tests

### Step 3: Franchise location system

- [ ] Add `franchiseLocations: Array<{ id, name, specialty, speedMult, valueMult, state: BaseGameState }>` to GameState
- [ ] Add `activeLocationIndex: number`
- [ ] **Refactor tick() for multi-location:** Create `tickLocation(locationState, deltaMs)` (extract current tick logic) and a `tickGame(state, deltaMs)` wrapper that iterates over all franchise locations, calling `tickLocation()` for each.
- [ ] Each location's sub-state is a full base game state (managers, upgrades, etc.)
- [ ] Combined revenue from all locations counts toward Star earning
- [ ] **Offline earnings across locations:** `calculateOfflineEarnings()` must sum revenue rates across all active franchise locations. Add a step to compute per-location base rates and aggregate them.
- [ ] Performance consideration: batch calculations per location (compute revenue once per second, not per frame)
- [ ] Write tests for multi-location ticking, specialty bonuses

### Step 4: Auto-prestige

- [ ] Track Stars that would be earned in real-time
- [ ] When auto-prestige is enabled and condition met, trigger prestige automatically
- [ ] Write tests

### Step 5: Save/load updates

- [ ] Update `save.ts` to serialize/deserialize all new fields: `crowns`, `crownUpgrades`, `totalCrownsEarned`, `franchiseLocations` (deeply nested sub-states), `activeLocationIndex`
- [ ] **Franchise location sub-states** contain full base game states — ensure the serializer handles the array of nested objects correctly
- [ ] Write round-trip save/load tests for franchise state

### Step 6: UI updates

- [ ] Location tab bar at top of game area
- [ ] Combined $/sec summary across all locations
- [ ] Crown upgrade tree panel (similar to Star upgrade tree)
- [ ] Franchise reset button with preview
- [ ] Auto-prestige toggle

### Step 7: Run full check

- [ ] `npm run check` and `npm run test:e2e` — fix any failures

## Performance Notes

- With 4 locations each running `tick()`, computation per frame increases ~4×
- Consider batching: compute revenue once per second instead of per frame
- Each location's manager timers, cooking timers, and selling timers run independently
- Offline earnings must account for all locations
