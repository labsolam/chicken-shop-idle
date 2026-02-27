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
   - Base efficiency: 30%, duration cap: 4 hours (doc 004 Level 0)
   - **Breaking change:** The existing `offline.ts` has `MAX_OFFLINE_MS = 8 * 60 * 60 * 1000` (8 hours). Change this to 4 hours to match doc 004 Level 0 cap. The 8h cap becomes achievable via offline upgrades (Star purchases in Phase 4).
   - Replaces current no-op in `src/engine/offline.ts`

5. **Customer Tips system** (doc 003, Category 3)
   - Per-sale random check: tip chance % → bonus revenue on that sale
   - 10 levels, unlocks at $5K total earned

6. **Click bonuses** — clicking Buy/Cook/Sell while corresponding manager is active gives 10% bonus of one automated action's revenue (1s cooldown)

7. **Income/second display** — shows current automated revenue rate

## What Phase 2 Does NOT Add

> **Scope note:** Doc 006 Phase 2 lists Efficiency Managers, Specialist Managers, and Customer Demand as Phase 2 features. These have been re-scoped to later phases because Phase 2 is already large (3 basic managers + offline earnings + tips + click bonuses). This is a deliberate plan-level decision; doc 006 reflects the original vision, these plans reflect the refined scope.

- Tier 2 Efficiency Managers (Speedy Steve, Bulk Betty, Quality Quinn) — moved to Phase 5 (Plan 012)
- Tier 3 Specialist Managers — moved to Phase 5 (Plan 012)
- Tier 4 Super Managers — Phase 5 (Plan 012)
- Customer demand system (customer arrival rate, lost sales tracking) — deferred indefinitely per doc 002 ("optional flavor that can be deferred to Phase 3 or later"). No plan currently implements this; related bonuses (Marketing Intern, Display Case, Neon Sign) should be reinterpreted as sell-speed or revenue bonuses if customer demand is never implemented.
- Buying Speed upgrade — deferred. Doc 003 defines it (20 levels, cap at 1s auto-buy interval) but it requires the Auto-Supplier manager and is superseded by Buyer Bob's interval upgrades. Revisit if needed.
- Diminishing returns on long sessions — Phase 3 (Plan 010)
- Auto-recipe selection modes — Phase 5 (Plan 012)
- Temporary boost system — Phase 5 (Plan 012)
- Notification system — deferred indefinitely

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
- [ ] Add `lastOnlineTimestamp: number` for offline earnings (written on each save; `lastUpdateTimestamp` updates every tick and is used for delta calculations — they serve different purposes)
- [ ] Add `revenueTracker: { recentRevenueCents, trackerElapsedMs, lastComputedRatePerMs }` for base rate tracking
- [ ] Add `totalChickensBought: number` lifetime stat (used for Buyer Bob analytics in UI — shows "chickens auto-purchased" count)
- [ ] Update `createInitialState()` and save/load

### Step 2: Manager hiring and upgrading

- [ ] Create `src/engine/managers.ts` with `hireManager()`, `upgradeManager()`, `getManagerUpgradeCost()`
- [ ] Manager unlock checks based on `totalRevenueCents`
- [ ] Write tests for hire, upgrade, cost scaling, and unlock conditions

### Step 3: Manager processing in tick()

- [ ] Add manager timer processing to `tick()`:
  - For each hired manager, advance `elapsedMs` by `deltaMs`
  - When elapsed >= interval, perform action and reset timer
  - Compute interval from level: `baseInterval / (1 + speedBonus)` (see formula correction note)
  - Compute batch size from level using this lookup table (indexed by level 1-10):
    ```
    BATCH_BONUS = [0, 0, 0, 0, 1, 2, 5, 10, 20, 50]
    batchSize = baseBatch + BATCH_BONUS[level - 1]
    ```
    where `baseBatch` = 1 (or 5 if Bulk Betty is hired, see Plan 012). Each level's bonus is the total extra at that level, NOT cumulative across levels. So a Level 10 manager has batch size = baseBatch + 50 (not baseBatch + 1 + 2 + 5 + 10 + 20 + 50).
- [ ] Write tests for manager automation at various levels

### Step 4: Revenue tracking and offline earnings

- [ ] Implement rolling revenue tracker in `tick()` (track revenue over 60s windows)
- [ ] Replace the no-op `calculateOfflineEarnings()` with real implementation
- [ ] Offline earnings formula: `baseRate × clampedDuration × 0.30`
- [ ] Write tests for revenue tracking, offline earnings calculation

### Step 5: Customer Tips

- [ ] Add `tipsLevel: number` to GameState
- [ ] Add `"tips"` to UpgradeType
- [ ] Tip upgrade cost lookup table (hand-tuned from doc 003, converted to cents):
  ```
  [500_000, 2_500_000, 12_500_000, 60_000_000, 300_000_000,
   1_500_000_000, 7_500_000_000, 40_000_000_000, 200_000_000_000, 500_000_000_000]
  ```
  (10 levels, roughly ×5 scaling. Unlocks at $5K total earned.)
- [ ] Implement per-sale tip check in sell completion within `tick()`
  - **RNG approach:** Pass an optional `rng: () => number` parameter to `tick()`, defaulting to `Math.random`. This preserves engine purity (deterministic with the same RNG). Tests pass a seeded/deterministic RNG; production uses `Math.random`.
  - Doc 006 revenue formula uses expected value `(1 + tipChance × tipBonus)`. For `tick()`, use per-sale random check as doc 003 specifies. The expected value formula is for offline earnings only.
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

### Step 8: Update e2e tests

- [ ] Add e2e tests for:
  - Manager hiring and automation (verify pipeline runs without clicks)
  - Offline earnings welcome-back screen
  - Income/second display
  - Tip upgrade purchase

### Step 9: Run full check

- [ ] `npm run check` — fix any failures
- [ ] `npm run test:e2e` — fix any failures

## Key Formulas

| Stat | Formula | Source |
|---|---|---|
| Manager interval | `baseInterval / (1 + speedBonus)` | Doc 004 (corrected — see note) |
| Manager upgrade cost | `hireCost × 5^level` | Doc 004 |
| Offline earnings | `baseRate × min(elapsed, 4h) × 0.30` | Doc 004 |
| Tip check | `random() < tipChance` → `saleValue × (1 + tipBonus)` | Doc 003 |

> **Manager speed formula correction:** Doc 004 says `interval = baseInterval × (1 - speedBonus)`, but this breaks at Level 4 (+100% speed → interval = 0) and goes negative at Level 5+. Use the reciprocal formula `interval = baseInterval / (1 + speedBonus)` instead. At +25% speed: `base / 1.25` (20% faster). At +100%: `base / 2` (twice as fast). At +2000%: `base / 21` (~21× faster). This is the standard idle game approach and produces sensible values at all levels. **Create a decision record** (`docs/decisions/012-manager-speed-formula.md`) documenting this override when implementing.
