# Plan 011: Implement Phase 4 — Prestige Layer 1 (Stars)

**Status:** Todo
**Date:** 2026-02-27
**Depends on:** Plan 010 (Phase 3 complete)

## Context

Phase 4 is the single most important feature for longevity. The prestige system transforms a few hours of content into weeks by letting players reset for permanent bonuses. Stars are earned via `floor(sqrt(lifetimeRevenueCents / 100_000_000))`.

**Read these docs before starting:**

1. `agents.md` — Source map, conventions, commands
2. `docs/strategy/005-prestige-and-endgame.md` — Star formula, reset rules, Star upgrade tree (4 tiers, ~25 upgrades), pacing
3. `docs/strategy/006-comprehensive-implementation-strategy.md` — Phase 4 summary, prestige math, units note

## What Phase 4 Adds

1. **Star earning formula**: `floor(sqrt(lifetimeRevenueCents / 100_000_000))`
   - Prestige button appears at $1B lifetime revenue (~31 Stars)
   - Verification table in doc 005

2. **Prestige reset logic** — what resets vs what persists (doc 005 table)
   - Resets: cash, all upgrades, equipment levels, staff levels, manager levels (to 1 or Star-boosted), milestone progress
   - Keeps: Stars, Star upgrades, Super Managers, recipes unlocked, achievements, manager hire status, offline upgrades

3. **Star upgrade tree** — 4 tiers, ~25 upgrades (doc 005 full tables)
   - Tier 1 (1-50 Stars): Reputation I, Quick Start I-II, Kitchen Memory I, Loyal Customers I, Offline Earner I, Supplier Deal I
   - Tier 2 (50-200 Stars): Reputation II, Manager Expertise I, Equipment Retention I, Bulk Mastery, etc.
   - Tier 3 (200-750 Stars): Reputation III, Star Power I, Permanent Slot I, Staff Retention I, etc.
   - Tier 4 (750-2000 Stars): Reputation IV, Manager Expertise III, Equipment Retention III, Permanent Slot II, Franchise License (unlocks Phase 6)

4. **Prestige preview UI** — "You would earn X Stars" display

5. **Quick Start upgrades** — start with more cash ($50, $500, $5K, $50K)

6. **Permanent multiplier upgrades** — Reputation I-IV stack multiplicatively (×1.5, ×2, ×3, ×5 = ×45 total)

7. **Equipment/Staff retention** — keep % of levels through prestige (25%, 50%, 100%)

8. **Permanent upgrade slots** — carry 1-2 base upgrades through prestige (player's choice)

9. **Anti-frustration features**: prestige preview, 30s undo window, progress bars toward next threshold

## What Phase 4 Does NOT Add

- Prestige Layer 2 (Crowns/Franchise) — Phase 6
- Super Managers — Phase 5
- Auto-prestige — Phase 6 (Crown upgrade)
- Achievements — Phase 7
- Golden Drumsticks spending — Phase 5+

## Steps

### Step 1: Expand GameState for prestige

- [ ] Add `stars: number`, `starUpgrades: string[]` (purchased upgrade IDs)
- [ ] Add `lifetimeRevenueCents: number` (never resets, tracks across all runs)
- [ ] Add `prestigeCount: number`
- [ ] Add `permanentSlots: string[]` (upgrade types carried through prestige)
- [ ] Update save/load with prestige data preservation

### Step 2: Star calculation and prestige reset

- [ ] Create `src/engine/prestige.ts` with `calculateStarsEarned(state)`, `prestige(state)`
- [ ] `prestige()` must correctly reset/preserve per the doc 005 table
- [ ] Manager hire status persists but levels reset (or to Star-boosted level)
- [ ] Equipment/staff retention based on purchased Star upgrades
- [ ] Permanent slots preserve selected upgrades with their levels AND cost history
- [ ] Write extensive tests for reset correctness

### Step 3: Star upgrade tree

- [ ] Define all ~25 Star upgrades as data (id, cost, tier, effect)
- [ ] `buyStarUpgrade(state, upgradeId)` — deducts Stars, adds to purchased list
- [ ] Each upgrade's effect integrated into relevant game formulas:
  - Reputation: multiplier in revenue formula
  - Quick Start: initial cash in `createInitialState()` (or post-prestige state)
  - Kitchen Memory: cost reduction in `getUpgradeCost()`
  - Manager Expertise: starting manager level
  - Equipment/Staff Retention: % of levels kept
  - Star Power: unspent Stars × bonus %
  - Supplier Deal: raw chicken cost reduction
  - Offline Earner: efficiency/duration bonuses
- [ ] Write tests for each upgrade's effect

### Step 4: Prestige preview and UI

- [ ] Prestige button appears when `lifetimeRevenueCents >= 100_000_000_000` ($1B in cents)
- [ ] Preview shows Stars that would be earned
- [ ] Star upgrade tree UI (tiered display, show locked/unlocked/purchased)
- [ ] Permanent slot selection UI
- [ ] 30s undo-prestige button after prestige

### Step 5: Integration

- [ ] `lifetimeRevenueCents` incremented in `tick()` alongside `totalRevenueCents`
- [ ] Star multipliers feed into revenue formula
- [ ] Star Power (unspent Stars bonus) applied in revenue calculation
- [ ] Post-prestige state correctly applies Quick Start, Manager Expertise, Equipment Retention, etc.

### Step 6: Run full check

- [ ] `npm run check` and `npm run test:e2e` — fix any failures
