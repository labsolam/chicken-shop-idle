# Plan 008: Fix Strategy Doc Inconsistencies & Ambiguities

**Status:** Todo
**Date:** 2026-02-23

## Context

The six strategy docs (`docs/strategy/001-006`) are a strong design vision but contain contradictions, formula errors, ambiguities, and conflicts with the existing codebase. An implementing agent would hit blocking ambiguities within the first phase and have to make significant judgment calls that could lead to subtle bugs or inconsistent game feel.

This plan catalogs every issue found and specifies the exact fix for each. The goal is to make the strategy docs authoritative and unambiguous so that a future agent can implement Phase 1 without guessing.

### Reference: Current Code Values

These are the ground-truth values in the codebase today:

| What | File | Value |
|---|---|---|
| Raw chicken cost | `src/engine/buy-chicken.ts:9` | 25 cents ($0.25) |
| Starting money | `src/types/game-state.ts:57` | 500 cents ($5.00) |
| Chicken sale price | `src/types/game-state.ts:62` | 100 cents ($1.00) |
| Cook time | `src/types/game-state.ts:61` | 10 seconds |
| Sell time | `src/types/game-state.ts:71` | 10 seconds |
| Cook speed cost formula | `src/engine/buy.ts:21` | `500 * 1.5^level` cents |
| Cook time formula | `src/engine/buy.ts:48` | `base * 0.9^level`, min 0.5s |
| Chicken value formula | `src/engine/buy.ts:57` | `base + level * 25` cents |
| Upgrade cost multiplier | `src/engine/buy.ts:13` | 1.5x per level |

---

## Steps

### 1. Fix formula contradiction in doc 003 "Core Principle" vs actual formulas

- [ ] **File:** `docs/strategy/003-upgrades-and-enhancements.md`
- [ ] **Lines:** 17 and 43-44

**Problem:** The "Core Principle" on line 17 states cost grows at `1.15x` per level. But the actual cost formulas in the same document use `2.3x`, `3.5x`, and `5.0x` per level. The number `1.15x` is misleading — it's 10-30x too low.

**Fix:** Replace the Core Principle paragraph with:

```markdown
**Core Principle:** Costs grow exponentially (scaling factor varies by category: 2.3x for speed, 3.5x for value, etc.), while revenue grows at a slower polynomial rate (~1.10-1.20x per upgrade). This guarantees eventual slowdown and creates natural prestige timing. See "Scaling Factors by Category" table below for exact rates.
```

Also update the matching text on lines 278-283 (under "Revenue vs Cost Growth") to remove the `1.15x` reference. Replace with:

```markdown
Revenue growth per upgrade: ~1.10-1.20x (linear to low polynomial)
Cost growth per upgrade:    ~2.0-5.0x (exponential, varies by category)
```

### 2. Fix sale value formula that doesn't match its own table in doc 003

- [ ] **File:** `docs/strategy/003-upgrades-and-enhancements.md`
- [ ] **Line:** 147

**Problem:** The stated formula `saleValue = baseValue × (1 + 0.2 × level)^1.3` does not match the table above it. At Level 1, the formula gives `1.2^1.3 ≈ 1.267x`, but the table says `1.2x`. At Level 2, the formula gives `1.4^1.3 ≈ 1.549x`, but the table says `1.4x`. The table is clearly using a simpler formula.

**However,** the table progression (1.0→1.2→1.4→1.7→2.0→2.5→5.0→10.0→20.0→50.0) is not linear either. It appears hand-tuned for game feel, not generated from a single formula.

**Fix:** Replace the formula line with:

```markdown
**Formula:** Sale value multipliers are hand-tuned per level (see table above). No single closed-form formula applies. For implementation, store the multiplier values in a lookup table or use a piecewise function.

**Approximate formula** (for interpolating unlisted levels): `saleValue ≈ baseValue × (1 + 0.2 × level)` for levels 0-4, transitioning to exponential growth for levels 5+.
```

Also add a comment to the cost formula on line 148:

```markdown
**Cost Formula:** `cost = 10 × 3.5^level` (in dollars; convert to cents for implementation: `1000 × 3.5^level`)
```

### 3. Fix cold storage cost table inconsistency with stated scaling in doc 003

- [ ] **File:** `docs/strategy/003-upgrades-and-enhancements.md`
- [ ] **Lines:** 80-92

**Problem:** Doc 006 states Cold Storage scaling is `×5/level`. The table shows: $15, $75 (×5 ✓), $350 (×4.67 ✗), $2K (×5.71 ✗). The numbers are approximate, not exact.

**Fix:** Add a note below the table:

```markdown
> **Implementation note:** Cold storage costs are hand-tuned, not generated from a strict ×5 formula. Use the table values directly as a lookup rather than computing `baseCost × 5^level`. All dollar values must be converted to cents for implementation (e.g., $15 → 1500 cents).
```

### 4. Fix chicken sale price conflict between code ($1.00) and docs ($0.50)

- [ ] **File:** `docs/strategy/002-core-gameplay-loop.md`, line 93
- [ ] **File:** `docs/strategy/003-upgrades-and-enhancements.md`, line 136

**Problem:** The existing code sets `chickenPriceInCents: 100` ($1.00 per chicken). The docs say Basic Fried Chicken sells for $0.50. This is a deliberate design change (the docs are proposing a new economy), but it's never stated explicitly.

**Fix:** Add an explicit note to both files.

In `002-core-gameplay-loop.md`, before the recipe table (around line 90), add:

```markdown
> **Breaking change from current code:** The existing codebase uses a $1.00 base sale price. The recipe system replaces this with recipe-specific values starting at $0.50. The implementing agent must update `chickenPriceInCents` in `game-state.ts` accordingly, or replace the single price field with per-recipe pricing. The raw chicken cost remains $0.25.
```

In `003-upgrades-and-enhancements.md`, at the Chicken Sale Value table header (line 136), add:

```markdown
> **Note:** Base value of $0.50 assumes the recipe system from doc 002 is implemented. The current code uses $1.00. Update the code to $0.50 when implementing the recipe system.
```

### 5. Fix upgrade formula conflict between code and docs

- [ ] **File:** `docs/strategy/003-upgrades-and-enhancements.md`
- [ ] **Lines:** 43-44

**Problem:** The existing code uses completely different formulas than the docs propose:

| Stat | Current Code | Proposed (Doc 003) |
|---|---|---|
| Cost scaling | `500 * 1.5^level` cents | `baseCost × 2.3^level` |
| Cook time | `base * 0.9^level` | `base * 0.85^level` |
| Chicken value | `base + level * 25` cents | `baseValue × multiplier_table[level]` |
| Min cook time | 0.5s | 0.1s (at level 30) |
| Max level | uncapped | 30 (capped) |

**Fix:** Add a subsection "Migration from Current Code" after the Cooking Speed table (around line 42):

```markdown
#### Migration from Current Code

The existing `src/engine/buy.ts` uses different formulas (`cost = 500 × 1.5^level`, `cookTime = base × 0.9^level`, `value = base + level × 25`). When implementing the expanded upgrade system:

1. **Replace** the current cost formula (`1.5^level`) with the category-specific scaling factors in this document
2. **Replace** the cook time formula (`0.9^level`) with `0.85^level`
3. **Replace** the linear value formula with the multiplier lookup table
4. **Add** a level cap (30 for speed, 25 for value, 10 for capacity/slots)
5. **Add** `sellSpeedLevel` to `GameState` (currently missing — sell speed has no upgrade in the code)
6. **Update** all existing tests in `tests/engine/buy.test.ts` to use the new formulas
7. **Preserve** the existing `UpgradeType` pattern but expand it to cover all 6+ categories
```

### 6. Specify multiple cooking/selling slots architecture

- [ ] **File:** `docs/strategy/003-upgrades-and-enhancements.md`
- [ ] After the Cooking Slots table (around line 111)

**Problem:** The docs say "multiple cooking slots" and "multiple selling registers" but never specify how parallel processing works in the `tick()` function. The current code uses a single `cookingElapsedMs` timer. An implementing agent would have to guess the architecture.

**Fix:** Add a new subsection:

```markdown
#### Parallel Slot Architecture

**How slots affect `tick()`:**

Slots do NOT create independent parallel timers. Instead, they act as a throughput multiplier on the existing single-timer model:

- The game still tracks one `cookingElapsedMs` timer
- When the timer completes (reaches `cookTimeMs`), `min(cookingCount, cookingSlots)` chickens are completed simultaneously
- The timer then resets for the next batch
- This means N slots = N chickens cooked per timer cycle, not N independent timers

**Rationale:** Independent parallel timers would create O(slots) complexity in `tick()`, complicate the UI (showing N progress bars), and make offline earnings calculation much harder. The batch model is simpler, produces nearly identical throughput, and is how most idle games handle parallel processing (e.g., Idle Miner Tycoon's shaft model).

**Implementation:**
```typescript
// In tick(), replace the single-chicken completion with:
while (cookingCount > 0 && cookingElapsedMs >= cookTimeMs) {
  const completedThisCycle = Math.min(cookingCount, cookingSlots);
  cookingCount -= completedThisCycle;
  chickensReady += completedThisCycle;
  totalChickensCooked += completedThisCycle;
  cookingElapsedMs -= cookTimeMs;
}
```

**GameState additions:**
```typescript
cookingSlots: number;    // starts at 1, increased by upgrade
sellingRegisters: number; // starts at 1, increased by upgrade
```
```

### 7. Specify manager automation rate and "speed" meaning

- [ ] **File:** `docs/strategy/004-idle-and-automation.md`
- [ ] After the Tier 1 manager table (around line 36)

**Problem:** Managers "automatically" do things, but at what rate? The "+25% speed" upgrade is ambiguous — speed of what? How often do managers act?

**Fix:** Add a subsection:

```markdown
#### Manager Automation Mechanics

**How managers work in `tick()`:**

Each manager has an internal action interval (in milliseconds). On every tick, the manager's elapsed time is advanced. When it reaches the interval, the manager performs one action:

| Manager | Base Interval | Action Per Trigger |
|---|---|---|
| Buyer Bob | 3000ms (3s) | Buys `min(batchSize, coldStorageRemaining)` raw chickens |
| Chef Carmen | 2000ms (2s) | Queues `min(batchSize, rawChickensAvailable)` for cooking |
| Seller Sam | 2000ms (2s) | Queues `min(batchSize, chickensReady)` for selling |

- **Base batch size:** 1 (at Level 1)
- **"+25% speed"** means the action interval is reduced by 25%: `interval = baseInterval × (1 - speedBonus)`. At Level 2 (+25% speed), Buyer Bob acts every 2250ms instead of 3000ms.
- **Batch size** increases at levels 5, 6, 7, 8, 9, 10 as listed in the upgrade table

**GameState additions:**
```typescript
managers: {
  buyer: { hired: boolean; level: number; elapsedMs: number };
  cook:  { hired: boolean; level: number; elapsedMs: number };
  sell:  { hired: boolean; level: number; elapsedMs: number };
};
```
```

### 8. Specify raw chicken input per recipe

- [ ] **File:** `docs/strategy/002-core-gameplay-loop.md`
- [ ] Recipe table (lines 92-100)

**Problem:** Every recipe consumes raw chickens but the quantity per recipe is never stated. Does a Chicken Feast Platter use 1 raw chicken? That seems wrong for a "platter."

**Fix:** Add a "Raw Input" column to the recipe table:

```markdown
| Recipe | Raw Input | Cook Time | Sale Value | Unlock |
|---|---|---|---|---|
| Basic Fried Chicken | 1 | 10s | $0.50 | Start |
| Grilled Chicken | 1 | 15s | $1.00 | $25 revenue |
| Chicken Wings | 1 | 8s | $0.75 | $100 revenue |
| Chicken Burger | 2 | 20s | $2.00 | $500 revenue |
| Chicken Katsu | 2 | 25s | $3.50 | $2,000 revenue |
| Rotisserie Chicken | 3 | 45s | $8.00 | $10,000 revenue |
| Chicken Feast Platter | 5 | 120s | $25.00 | $100,000 revenue |
| Signature Dish | 3 | 300s | $100.00 | First prestige |
```

> **Design note:** Multi-chicken recipes create an additional supply-chain bottleneck. A Chicken Feast Platter consuming 5 raw chickens means cold storage drains 5x faster when cooking platters, creating meaningful strategic tension between recipe choice and supply management.
```

### 9. Clarify customer demand system implementation status

- [ ] **File:** `docs/strategy/002-core-gameplay-loop.md`
- [ ] Customer Demand System section (lines 128-133)

**Problem:** Doc 002 designs a pull-based customer system (customers arrive, leave if no chicken). Doc 006 never mentions it in any implementation phase. Is it implemented? When?

**Fix:** Add a note to the Customer Demand section:

```markdown
> **Implementation phasing:** The customer demand system is a **Phase 2+ feature**, implemented alongside the manager system. In Phase 1, selling remains push-based (player clicks Sell, sale happens). The customer arrival/departure mechanic is optional flavor that can be deferred to Phase 3 or later without affecting core gameplay. Do NOT implement this in Phase 1.
```

Also add a corresponding note in `docs/strategy/006-comprehensive-implementation-strategy.md` Phase 2 features list (around line 97), adding:

```markdown
8. Customer demand system (customer arrival rate, lost sales tracking)
```

### 10. Clarify Golden Drumstick spending

- [ ] **File:** `docs/strategy/002-core-gameplay-loop.md`
- [ ] After the Currency Types table (around line 153)

**Problem:** Golden Drumsticks are earned via achievements but there's no table of what they can buy. An agent would have to invent the entire shop.

**Fix:** Add:

```markdown
> **Implementation note:** The Golden Drumstick shop is **not in scope for Phases 1-4**. For now, Golden Drumsticks are tracked as a counter (earned via achievements) but have no spending mechanic. The shop will be designed and implemented in Phase 5 or later. Do NOT implement a GD shop until a dedicated design doc specifies purchasable items.
```

### 11. Specify franchise location interaction model

- [ ] **File:** `docs/strategy/005-prestige-and-endgame.md`
- [ ] After the Franchise Locations table (around line 218)

**Problem:** How does the player interact with multiple locations? Can they view all at once? Do they switch between them?

**Fix:** Add:

```markdown
#### Location Interaction Model

**Tab-based switching** (inspired by AdVenture Capitalist's planet system):

- The main UI has a location selector (tabs or dropdown) at the top
- Only ONE location is "active" (visible) at a time
- Switching is instant — just changes which sub-state the UI renders
- ALL locations run their `tick()` processing in parallel regardless of which is active
- A summary bar always shows combined $/sec across all locations
- Each location has its own complete sub-state: managers, upgrades, equipment, recipes, timers
- Managers and staff are per-location (hiring a cook at Downtown does not give Food Court a cook)
- Super Managers are global — their abilities affect ALL locations simultaneously

**GameState structure:**
```typescript
franchiseLocations: Array<{
  id: string;
  name: string;
  specialty: 'general' | 'fast' | 'premium' | 'all';
  speedMultiplier: number;
  valueMultiplier: number;
  state: BaseGameState; // same shape as the non-franchise GameState
}>;
activeLocationIndex: number;
```
```

### 12. Clarify prestige manager retention semantics

- [ ] **File:** `docs/strategy/005-prestige-and-endgame.md`
- [ ] What Resets table (around line 57)

**Problem:** The table says managers keep "unlock status" but reset "levels." The Star upgrade "Manager Expertise I" says "Managers start at Level 2." But it's ambiguous: does keeping "unlock status" mean you don't have to re-hire (re-pay) them?

**Fix:** Replace the manager row in the Resets table with a more explicit note:

```markdown
| Manager **levels** (reset to 1 or Star-boosted level) | Manager **unlock status** (don't need to re-hire) |
```

Add a clarifying paragraph below the table:

```markdown
> **Manager prestige behavior:** When you prestige, each hired manager stays hired (you do NOT pay the hire cost again). However, their upgrade level resets to 1 (or to the level specified by "Manager Expertise" Star upgrades, if purchased). This means the hire cost is a one-time investment across all prestiges, but upgrade levels must be re-earned each run.
```

### 13. Add explicit "all money in cents" reminder to doc 006

- [ ] **File:** `docs/strategy/006-comprehensive-implementation-strategy.md`
- [ ] Technical Considerations section (around line 344)

**Problem:** All dollar amounts in the strategy docs are in dollars ($5, $10, $50K, etc.) but the codebase convention is integer cents. An implementing agent might forget to convert.

**Fix:** Add a prominent callout at the top of the Technical Considerations section:

```markdown
### Currency Convention

> **CRITICAL:** All dollar amounts in these strategy documents ($5, $10, $50K, etc.) must be converted to **integer cents** for implementation. The codebase uses cents exclusively to avoid floating-point errors (see decision `docs/decisions/002-money-as-cents.md`).
>
> Examples: $5 → 500, $0.50 → 50, $50K → 5_000_000, $1B → 100_000_000_000
>
> When numbers exceed `Number.MAX_SAFE_INTEGER` (9,007,199,254,740,991 cents ≈ $90 trillion), a BigInt or big-number library will be needed. This is expected to occur in late-game prestige runs.
```

### 14. Fix doc 002 "Economic Pacing" to match doc 003

- [ ] **File:** `docs/strategy/002-core-gameplay-loop.md`
- [ ] Lines 158-159

**Problem:** Doc 002 line 158 says "Upgrade costs: Grow at 1.15x per level" which contradicts doc 003's actual formulas (2.3x, 3.5x, etc.). This is the same `1.15x` error from Step 1 but in a different file.

**Fix:** Replace lines 158-159 with:

```markdown
- **Upgrade costs:** Grow exponentially per level (scaling factor varies: 2.3x for speed, 3.5x for value, 2.0-5.0x for other categories — see doc 003 for details)
- **Revenue growth:** Grows at ~1.10-1.20x per upgrade level (polynomial, slower than costs)
```

### 15. Specify offline earnings "baseRate" calculation

- [ ] **File:** `docs/strategy/004-idle-and-automation.md`
- [ ] Offline earnings formula (around line 123)

**Problem:** The formula uses `baseRate = current automated revenue per second (at time of closing)` but doesn't specify how to compute revenue/second for a multi-stage pipeline with variable bottlenecks, multiple recipes, and multiple managers.

**Fix:** Add clarification below the formula:

```markdown
#### Computing baseRate

The `baseRate` is a snapshot of actual revenue per second at the moment the game closes. It should be computed as:

```
baseRate = actualRevenueEarnedInLastNSeconds / N
```

Where N = 60 (use the last 60 seconds of real gameplay as the sample window). This approach:
- Automatically accounts for bottlenecks (the slowest stage limits throughput)
- Handles multiple recipes (weighted by what was actually being cooked)
- Avoids complex theoretical calculations
- Is simple to implement: just track `revenueLastNSeconds` as a rolling counter in GameState

**GameState addition:**
```typescript
revenueTracker: {
  recentRevenueCents: number; // revenue earned in current tracking window
  trackerElapsedMs: number;   // elapsed time in current window
  lastComputedRatePerMs: number; // cached rate from last completed window
};
```

Do NOT attempt to compute a theoretical maximum rate from upgrade levels, slot counts, and recipe values. The empirical approach is simpler and more accurate.
```

---

## Outcome

After completing all 15 steps, the strategy docs will be:

1. **Self-consistent** — no formula contradicts its own table or another doc's statement
2. **Code-aware** — explicit about where proposed values differ from current code and what to change
3. **Architecturally specific** — slots, managers, franchises, and offline earnings have concrete data structures and `tick()` integration specs
4. **Implementation-safe** — cents conversion, level caps, and formula choices are unambiguous
5. **Properly scoped** — deferred features (customer demand, Golden Drumstick shop) are explicitly marked as out-of-scope for early phases

No code changes are required. All changes are to markdown files in `docs/strategy/`.
