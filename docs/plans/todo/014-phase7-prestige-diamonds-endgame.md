# Plan 014: Implement Phase 7 — Prestige Layer 3 (Diamonds) & Endgame

**Status:** Todo
**Date:** 2026-02-27
**Depends on:** Plan 013 (Phase 6 complete)

## Context

Phase 7 is the capstone. The third prestige layer (Diamonds), full achievement system, completion tracking, and the "Golden Chicken" final goal. Players who reach this content are deeply invested.

**Read these docs before starting:**

1. `agents.md` — Source map, conventions, commands
2. `docs/strategy/005-prestige-and-endgame.md` — Diamond formula, legacy reset, Diamond upgrade tree, achievements (progression + challenge + secret), completion percentage
3. `docs/strategy/006-comprehensive-implementation-strategy.md` — Phase 7 summary

## What Phase 7 Adds

1. **Diamond earning formula**: `floor(totalCrownsEarned / 25)`
   - Requires "Crown Jewel" Crown upgrade (100 Crowns) to unlock
   - ~5-8 Layer 2 resets to reach

2. **Legacy reset logic** — resets everything (Stars, Crowns, base game)
   - Keeps: Diamonds, Diamond upgrades, Achievements, Golden Drumsticks

3. **Diamond upgrade tree** (doc 005) — 10 upgrades
   - Dynasty I-III (×50, ×200, ×1000 all revenue)
   - Crown Accelerator (Crowns earned ×2), Star Accelerator Max (Stars earned ×5)
   - Auto-Franchise (auto-franchise-reset when optimal)
   - Instant Kitchen (all cooking starts at 1s base time)
   - Location Mastery (all franchise locations auto-unlocked each run)
   - **The Golden Chicken** (15 Diamonds) — "You beat the game!" trophy
   - Infinity Mode (20 Diamonds) — remove all caps, pure number-go-up

4. **Full achievement system** (doc 005)
   - Progression achievements (First Sale, Hundred Club, Chicken Tycoon, etc.) — 10+
   - Challenge achievements (Speedrun, No Upgrades, One Recipe Only, Pacifist Chef, etc.) — 6+
   - Secret achievements (sell exactly 1337 chickens, etc.) — 4+
   - Each awards Golden Drumsticks

5. **Completion percentage tracker** (doc 005)
   - Average of 8 categories: recipes, upgrades, equipment, staff, achievements, star upgrades, crown upgrades, diamond upgrades
   - 100% = "You Beat the Game"

6. **Infinity Mode** — post-completion sandbox
   - Remove all upgrade level caps
   - Numbers can grow without bound (may need BigInt for very large values)

7. **Number formatting** (doc 006)
   - $0-$999.99, $1K-$999.99K, $1M-$999.99M, etc. up to scientific notation

## Steps

### Step 1: Diamond state and legacy reset

- [ ] Add `diamonds: number`, `diamondUpgrades: string[]`, `totalCrownsEarned: number` to GameState
- [ ] Implement `legacyReset(state)` — resets everything except Diamonds/achievements
- [ ] Write tests for reset correctness across all 3 layers

### Step 2: Diamond upgrade tree

- [ ] Define all Diamond upgrades as data
- [ ] `buyDiamondUpgrade(state, id)` — deducts Diamonds
- [ ] Integrate effects: Dynasty multipliers, accelerators, Instant Kitchen, Location Mastery, Infinity Mode
- [ ] The Golden Chicken: set a completion flag, trigger victory screen
- [ ] Write tests

### Step 3: Achievement system

- [ ] Create `src/engine/achievements.ts` with all achievement definitions
- [ ] Add `achievements: string[]` (earned achievement IDs) to GameState
- [ ] Add `goldenDrumsticks: number` to GameState
- [ ] `checkAchievements(state)` — runs each tick or on significant events
- [ ] Challenge achievements require tracking run-specific constraints (e.g., "no upgrades bought this run")
- [ ] Secret achievements: don't show condition until earned
- [ ] Write tests for each achievement trigger

### Step 4: Completion percentage

- [ ] Implement completion formula from doc 005
- [ ] Add `completionPercentage: number` to GameState (cached, recalculated periodically)
- [ ] Write tests

### Step 5: Number formatting

- [ ] Create `src/ui/format.ts` (or expand existing formatter)
- [ ] Format: $123.45, $1.23K, $1.23M, $1.23B, $1.23T, $1.23Qa, scientific notation
- [ ] All monetary displays use the formatter
- [ ] Write tests for formatting at each tier

### Step 6: Infinity Mode

- [ ] When purchased: remove all level caps from upgrade functions
- [ ] Consider BigInt or big-number library for values exceeding `Number.MAX_SAFE_INTEGER`
- [ ] Write tests

### Step 7: Victory and endgame UI

- [ ] Golden Chicken victory screen
- [ ] Achievement gallery (progression, challenge, secret sections)
- [ ] Completion percentage display
- [ ] Infinity Mode indicator

### Step 8: Run full check

- [ ] `npm run check` and `npm run test:e2e` — fix any failures

## Notes

- This is the final implementation phase. After Phase 7, the game has 1+ month of content.
- BigInt consideration: at Dynasty III (×1000 all revenue) with multiple prestige layers, revenue can exceed `Number.MAX_SAFE_INTEGER` (~$90 trillion in cents). Evaluate whether BigInt is needed or if the game naturally caps below this.
- Achievement tracking must be carefully designed to not impact `tick()` performance — most checks can run once per second rather than per frame.
