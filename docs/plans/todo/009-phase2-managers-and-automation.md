# Plan 009: Implement Phase 2 — Manager & Automation System

**Status:** Todo
**Date:** 2026-02-27
**Depends on:** Plan 008 (Phase 1 complete)

## Context

Phase 2 transitions the game from a clicker into a true idle game by adding managers that automate the Buy → Cook → Sell pipeline, plus offline earnings. This is the most impactful feature for player retention.

**Read these docs before starting:**

1. `agents.md` — Source map, conventions, commands
2. `docs/strategy/004-idle-and-automation.md` — Manager types, upgrade paths, idle/offline earnings, automation timeline
3. `docs/strategy/002-core-gameplay-loop.md` — Customer demand system (Phase 2 feature)
4. `docs/strategy/003-upgrades-and-enhancements.md` — Customer Tips (Phase 2 feature), milestone integration
5. `docs/strategy/006-comprehensive-implementation-strategy.md` — Phase 2 summary, revenue formula

## What Phase 2 Adds

1. **Three Tier 1 managers** — Auto-Buy (Buyer Bob), Auto-Cook (Chef Carmen), Auto-Sell (Seller Sam)
   - Each has an internal action interval timer processed in `tick()`
   - Buyer Bob: 3000ms interval, buys `min(batchSize, coldStorageRemaining)` raw chickens
   - Chef Carmen: 2000ms interval, queues `min(batchSize, rawAvailable)` for cooking
   - Seller Sam: 2000ms interval, queues `min(batchSize, chickensReady)` for selling
   - Unlock: Buyer Bob at $50K revenue, Chef Carmen at $25K, Seller Sam at $25K
   - Hire costs: Buyer Bob $10K, Chef Carmen $5K, Seller Sam $5K

2. **Manager upgrade system** (10 levels each)
   - Cost formula: `hireCost × 5^level`
   - Levels increase speed bonus and batch size (see doc 004 upgrade table)

3. **Idle income calculation** — revenue/sec display based on actual throughput

4. **Offline earnings** — welcome-back screen with earnings summary
   - `baseRate` = rolling average of revenue over last 60 seconds
   - `offlineEarnings = baseRate × duration × offlineEfficiency`
   - Base efficiency: 30%, duration cap: 4 hours
   - Replaces current no-op in `src/engine/offline.ts`

5. **Customer Tips system** (doc 003, Category 3)
   - Per-sale random check: tip chance % → bonus revenue on that sale
   - 10 levels, unlocks at $5K total earned

6. **Click bonuses** — clicking Buy/Cook/Sell while corresponding manager is active gives 10% bonus of one automated action's revenue (1s cooldown)

7. **Income/second display** — shows current automated revenue rate

## What Phase 2 Does NOT Add

- Tier 2 Efficiency Managers (Speedy Steve, Bulk Betty, Quality Quinn) — defer to Phase 2b or Phase 5
- Tier 3 Specialist Managers — defer to Phase 5
- Tier 4 Super Managers — Phase 5
- Diminishing returns on long sessions — Phase 3+
- Auto-recipe selection modes — Phase 5
- Temporary boost system — Phase 5
- Notification system — deferred

## Steps

### Step 1: Expand GameState for managers

- [ ] Add manager state to `GameState`:
  ```
  managers: {
    buyer: { hired: boolean; level: number; elapsedMs: number };
    cook:  { hired: boolean; level: number; elapsedMs: number };
    sell:  { hired: boolean; level: number; elapsedMs: number };
  }
  ```
- [ ] Add `lastOnlineTimestamp: number` for offline earnings
- [ ] Add `revenueTracker: { recentRevenueCents, trackerElapsedMs, lastComputedRatePerMs }` for base rate tracking
- [ ] Add `totalChickensBought: number` lifetime stat (for Buyer Bob tracking)
- [ ] Update `createInitialState()` and save/load

### Step 2: Manager hiring and upgrading

- [ ] Create `src/engine/managers.ts` with `hireManager()`, `upgradeManager()`, `getManagerUpgradeCost()`
- [ ] Manager unlock checks based on `totalRevenueCents`
- [ ] Write tests for hire, upgrade, cost scaling, and unlock conditions

### Step 3: Manager processing in tick()

- [ ] Add manager timer processing to `tick()`:
  - For each hired manager, advance `elapsedMs` by `deltaMs`
  - When elapsed >= interval, perform action and reset timer
  - Compute interval from level (base interval × speed reduction)
  - Compute batch size from level
- [ ] Write tests for manager automation at various levels

### Step 4: Revenue tracking and offline earnings

- [ ] Implement rolling revenue tracker in `tick()` (track revenue over 60s windows)
- [ ] Replace the no-op `calculateOfflineEarnings()` with real implementation
- [ ] Offline earnings formula: `baseRate × clampedDuration × 0.30`
- [ ] Write tests for revenue tracking, offline earnings calculation

### Step 5: Customer Tips

- [ ] Add `tipsLevel: number` to GameState
- [ ] Add `"tips"` to UpgradeType
- [ ] Implement per-sale tip check in sell completion within `tick()`
- [ ] Tips are deterministic in tests (inject RNG or use seeded random)
- [ ] Write tests for tip chance, tip bonus, and integration

### Step 6: Click bonuses

- [ ] When a manager is active and player clicks the same action, grant 10% bonus
- [ ] 1s internal cooldown per action type
- [ ] Add `lastClickTimestamps: { buy, cook, sell }` to GameState
- [ ] Write tests

### Step 7: UI updates

- [ ] Manager panel: show available/locked managers, hire buttons, upgrade buttons
- [ ] Income/second display in header
- [ ] "Auto" indicators on Buy/Cook/Sell buttons when manager is active
- [ ] Welcome-back screen showing offline earnings
- [ ] Tips upgrade in the Value upgrade section

### Step 8: Run full check

- [ ] `npm run check` — fix any failures
- [ ] `npm run test:e2e` — fix any failures

## Key Formulas

| Stat | Formula | Source |
|---|---|---|
| Manager interval | `baseInterval × (1 - speedBonus)` | Doc 004 |
| Manager upgrade cost | `hireCost × 5^level` | Doc 004 |
| Offline earnings | `baseRate × min(elapsed, 4h) × 0.30` | Doc 004 |
| Tip check | `random() < tipChance` → `saleValue × (1 + tipBonus)` | Doc 003 |
