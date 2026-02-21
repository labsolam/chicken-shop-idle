# Strategy Document: Comprehensive Implementation Strategy

**Date:** 2026-02-21
**Purpose:** Synthesize all research and design documents into a unified, recommended implementation strategy for Chicken Shop Idle.

---

## Executive Summary

Based on analysis of 10 successful idle games and industry best practices, this document presents the recommended strategy for transforming Chicken Shop Idle from a basic 3-step clicker into a deep idle game with 1+ month of content.

### Key Influences

| Game | What We Take From It |
|---|---|
| **Idle Miner Tycoon** | Three-stage pipeline bottleneck management (our Buy/Cook/Sell maps perfectly) |
| **Egg, Inc.** | Chicken theme, Soul Egg prestige formula, tiered products |
| **AdVenture Capitalist** | Manager automation, Angel Investor prestige-or-spend tension |
| **Cookie Clicker** | Deep prestige upgrade tree, permanent upgrade slots |
| **Antimatter Dimensions** | Multi-layer prestige for month+ endgame |
| **Clicker Heroes** | Dual playstyle support (idle vs active) |
| **Realm Grinder** | Variety across prestige runs |
| **AdVenture Communist** | Mission/rank system for short-term goals |
| **NGU Idle** | Gradual system reveals, resource allocation |
| **Melvor Idle** | Full offline simulation, completion log |

---

## The Complete Game Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CHICKEN SHOP IDLE                              │
│                                                                   │
│  Layer 3: LEGACY (Diamonds)                                       │
│    └─ Reset Crowns/Stars for Diamonds                            │
│       └─ Dynasty multipliers, endgame unlocks                    │
│                                                                   │
│  Layer 2: FRANCHISE (Crowns)                                      │
│    └─ Reset Stars for Crowns                                      │
│       └─ Multiple locations, brand bonuses, auto-prestige        │
│                                                                   │
│  Layer 1: NEW MENU (Stars)                                        │
│    └─ Reset cash/upgrades for Stars                               │
│       └─ Permanent multipliers, manager boosts, quick starts     │
│                                                                   │
│  Base Game: THE CHICKEN SHOP                                      │
│    ├─ Buy raw chicken (supply chain)                              │
│    ├─ Cook chicken (kitchen with recipes)                         │
│    ├─ Sell chicken (counter with customers)                       │
│    ├─ Upgrades (speed, capacity, value)                           │
│    ├─ Equipment (ovens, grills, registers)                        │
│    ├─ Staff (passive bonuses)                                     │
│    ├─ Managers (automation)                                       │
│    └─ Milestones & Achievements                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Recommended Implementation Phases

### Phase 1: Enhanced Core Loop

**Goal:** Expand the existing Buy -> Cook -> Sell pipeline with depth.

**Features:**
1. Cold Storage capacity system (buy limit)
2. Multiple cooking slots (parallel processing)
3. Multiple selling registers (parallel selling)
4. Expanded upgrade system:
   - Cook speed (existing, expand levels)
   - Sell speed (new)
   - Chicken value (existing, expand levels)
   - Cold storage capacity (new)
   - Cooking slot count (new)
   - Register count (new)
5. Bulk buy/cook/sell operations
6. Recipe system (4-5 initial recipes with different time/value tradeoffs)
7. Revenue and sales milestones with multiplier rewards

**State Changes:**
- `GameState` gains: `coldStorageCapacity`, `cookingSlots`, `sellingRegisters`, `recipes`, `activeRecipe`, `milestones`
- New engine functions: recipe selection, milestone checking, capacity validation
- All using existing pure function architecture

**Why First:** This is the foundation everything else builds on. The existing game already has the 3-step flow; this phase adds strategic depth without requiring prestige or automation.

### Phase 2: Manager & Automation System

**Goal:** Transition from clicker to idle game.

**Features:**
1. Three basic managers (Auto-Buy, Auto-Cook, Auto-Sell)
2. Manager upgrade system (10 levels each)
3. Idle income calculation
4. Offline earnings calculation and welcome-back screen
5. Efficiency managers (speed boost, batch operations, quality)
6. Recipe specialist managers
7. Income/second display and projected earnings

**State Changes:**
- `GameState` gains: `managers`, `managerLevels`, `lastOnlineTimestamp`
- New engine functions: `hireManager()`, `upgradeManager()`, `calculateOfflineEarnings()` (replacing current no-op), `processManagers()` in tick
- Offline earnings system integrates with existing `save.ts`/`offline.ts`

**Why Second:** Automation is the most impactful feature for player retention. Once the core loop has depth (Phase 1), automating it feels like a genuine achievement.

### Phase 3: Equipment & Staff

**Goal:** Add lateral progression and build diversity.

**Features:**
1. Equipment system (kitchen equipment + front-of-house)
2. Equipment upgrading
3. Staff hiring with passive bonuses
4. Equipment unlock progression tied to revenue milestones
5. Recipe-specific equipment bonuses

**State Changes:**
- `GameState` gains: `equipment`, `staff`
- New engine functions: `buyEquipment()`, `upgradeEquipment()`, `hireStaff()`, `upgradeStaff()`
- Equipment/staff bonuses feed into existing revenue/speed calculations

**Why Third:** Equipment and staff add depth but aren't essential for the core loop or idle play. They make the mid-game more interesting between prestiges.

### Phase 4: Prestige Layer 1 (Stars)

**Goal:** Add the first reset-for-permanent-bonus system.

**Features:**
1. Star earning formula (sqrt of lifetime revenue)
2. Prestige reset logic (what resets, what persists)
3. Star upgrade tree (4 tiers, ~25 upgrades)
4. Prestige preview UI ("You would earn X Stars")
5. Quick Start upgrades (start with more cash)
6. Permanent multiplier upgrades
7. Equipment/Staff retention upgrades
8. Permanent upgrade slots (carry one upgrade through prestige)

**State Changes:**
- `GameState` gains: `stars`, `starUpgrades`, `lifetimeRevenue`, `prestigeCount`
- New engine functions: `calculateStarsEarned()`, `prestige()`, `buyStarUpgrade()`
- Prestige interacts with `save.ts` — must preserve prestige data across resets

**Why Fourth:** Prestige is what makes the game last weeks instead of hours. By this point, the player has experienced the full base game loop and feels the natural slowdown that prestige resolves.

### Phase 5: Super Managers & Advanced Automation

**Goal:** Add active-play value layer for post-prestige gameplay.

**Features:**
1. Super Managers with cooldown-based abilities
2. Super Manager unlocking (via Stars)
3. Auto-recipe selection modes
4. Temporary boost system (Happy Hour, Rush Order, etc.)
5. Boost stacking rules
6. Smart automation settings

**State Changes:**
- `GameState` gains: `superManagers`, `activeBoosts`, `autoRecipeMode`
- New engine functions: `activateSuperManager()`, `processBoosts()`, `autoSelectRecipe()`

**Why Fifth:** Super Managers give post-prestige runs something new to do. They bridge the gap between idle and active play.

### Phase 6: Prestige Layer 2 (Crowns) & Franchise System

**Goal:** Extend endgame with franchise locations and a second prestige layer.

**Features:**
1. Crown earning formula (based on total Stars earned)
2. Franchise reset logic (resets Stars + base game)
3. Crown upgrade tree
4. Franchise locations (2-4 parallel shops)
5. Location specializations and bonuses
6. Combined revenue across locations
7. Auto-prestige option (for Stars)

**State Changes:**
- `GameState` gains: `crowns`, `crownUpgrades`, `franchiseLocations`, `totalStarsEarned`
- New engine functions: `calculateCrownsEarned()`, `franchiseReset()`, `buyCrownUpgrade()`
- Franchise locations each have a sub-state mimicking the base game state

**Why Sixth:** The franchise system is the major endgame content addition. By this point, players have done many Star prestiges and need a new dimension of gameplay.

### Phase 7: Prestige Layer 3 (Diamonds) & Endgame

**Goal:** Final prestige layer, achievements, completion system, and long-term goals.

**Features:**
1. Diamond earning formula (based on total Crowns earned)
2. Legacy reset logic
3. Diamond upgrade tree (including "The Golden Chicken" final goal)
4. Full achievement system (progression + challenge + secret)
5. Completion percentage tracker
6. Challenge achievements (restricted runs)
7. Infinity Mode (post-completion sandbox)

**State Changes:**
- `GameState` gains: `diamonds`, `diamondUpgrades`, `achievements`, `completionPercentage`
- New engine functions: `calculateDiamondsEarned()`, `legacyReset()`, achievement tracking

**Why Last:** This is the capstone. Players who reach this content are deeply invested. The Diamond layer and achievements provide the final stretch to the 1+ month target.

---

## Mathematical Balancing Overview

### Revenue Formula (Complete)

```
chickenValue = baseRecipeValue
             × saleValueUpgradeMultiplier
             × (1 + tipChance × tipBonus)
             × equipmentMultiplier
             × staffMultiplier
             × milestoneMultiplier
             × starMultiplier
             × crownMultiplier
             × diamondMultiplier
             × (1 + unspentStars × starPowerBonus)

revenuePerSecond = chickenValue × chickensPerSecond

chickensPerSecond = min(supplyRate, cookRate, sellRate)
  where each rate = (slots × batchSize) / adjustedTime
```

### Cost Curve Summary

| Upgrade Type | Base Cost | Scaling | Cap |
|---|---|---|---|
| Cook/Sell Speed | $5 | ×2.3/level | Level 30 |
| Cold Storage | $15 | ×5/level | Level 10 |
| Cooking/Selling Slots | $50/$30 | ×10/level | Level 10 |
| Sale Value | $10 | ×3.5/level | Level 25 |
| Equipment | Varies | ×2-3/level | Level 10-15 |
| Staff | Varies | ×2.5/level | Level 10 |
| Managers | Varies | ×5/level (upgrades) | Level 10 |

### Prestige Math

```
Layer 1 (Stars):    floor(sqrt(lifetimeRevenue / 1,000,000))
Layer 2 (Crowns):   floor(totalStarsEarned / 500)
Layer 3 (Diamonds): floor(totalCrownsEarned / 25)
```

### Pacing Checkpoints

| Checkpoint | Target Time (Active) | Target Revenue |
|---|---|---|
| First upgrade affordable | 30 seconds | $5 starting cash |
| All basic upgrades tried | 10 minutes | ~$100 |
| First recipe unlocked | 15 minutes | ~$500 |
| First manager affordable | 2 hours | ~$25K |
| Full automation | 3 hours | ~$75K |
| First prestige viable | 8-12 hours | ~$1B |
| Franchise unlock | 2-3 weeks | ~2000 Stars |
| Legacy unlock | 1-2 months | ~100 Crowns |
| Golden Chicken | 1-2 months | ~15 Diamonds |

---

## UI Evolution

The UI should grow with the player, not overwhelm them at the start.

### Start State
```
┌──────────────────────────────────┐
│  CHICKEN SHOP        💰 $5.00    │
│                                   │
│  Raw: 0    Cooked: 0             │
│                                   │
│  [🐔 Buy $0.25]                  │
│  [🍳 Cook]                       │
│  [💰 Sell]                       │
│                                   │
│  UPGRADES                         │
│  Cook Speed  Lv.0 [$5.00]        │
│  Sell Speed  Lv.0 [$5.00]        │
│  Value       Lv.0 [$10.00]       │
└──────────────────────────────────┘
```

### Mid-Game State (with managers)
```
┌──────────────────────────────────────────────┐
│  CHICKEN SHOP           💰 $48,230           │
│  $/sec: $12.45                               │
│                                               │
│  Storage: 45/100   Cooking: 3/4   Ready: 12  │
│  [🐔 Buy x10]  [🍳 Auto]  [💰 Auto]         │
│                                               │
│  RECIPES                                      │
│  ▸ Fried Chicken    2.1s  $1.25  [Active]    │
│  ▸ Grilled Chicken  4.5s  $2.50              │
│  ▸ Wings            1.8s  $1.00              │
│                                               │
│  UPGRADES | EQUIPMENT | STAFF | MANAGERS      │
│  [tabbed interface with upgrade options]       │
│                                               │
│  MILESTONES                                    │
│  Next: Sell 5,000 chickens (3,241/5,000)     │
└──────────────────────────────────────────────┘
```

### Late-Game State (with prestige)
```
┌──────────────────────────────────────────────────────┐
│  CHICKEN SHOP ⭐×142          💰 $2.4B               │
│  $/sec: $450K   Stars: 142   Crowns: 3               │
│                                                       │
│  [Pipeline status bars]                               │
│  [Recipe selector]                                    │
│                                                       │
│  UPGRADES | EQUIPMENT | STAFF | MANAGERS | PRESTIGE   │
│                                                       │
│  ⭐ PRESTIGE: Earn 89 Stars  [New Menu →]             │
│  👑 FRANCHISE: Need 2000 Stars (1,847/2,000)          │
│                                                       │
│  LOCATIONS (if franchise unlocked):                   │
│  ▸ Downtown    $/sec: $200K                          │
│  ▸ Food Court  $/sec: $150K                          │
│  ▸ Uptown      $/sec: $180K                          │
│                                                       │
│  Completion: 47%                                      │
└──────────────────────────────────────────────────────┘
```

---

## Technical Considerations

### Preserving Architecture

The existing codebase has strong architectural principles that should be maintained:

1. **Pure state machine:** All new features must be pure functions `(state) => newState`
2. **Engine/UI separation:** New engine logic in `src/engine/`, never touch DOM
3. **Immutability:** Return new state objects, never mutate
4. **Money as cents:** Continue using integer cents for all currency calculations
5. **TDD workflow:** Write failing tests first for every new engine function

### State Growth Management

As features are added, `GameState` will grow significantly. Consider:
- Nested state objects (e.g., `state.prestige.stars`, `state.managers.basic`)
- Type-safe sub-states with dedicated interfaces
- Save/load versioning (existing `save.ts` already handles validation)
- Migration functions for old saves when new fields are added

### Performance Considerations

- With multiple franchise locations and many managers, `tick()` will do more work
- Consider batching calculations (e.g., calculate revenue once per second, not per frame)
- Large numbers: May need BigNumber library when revenue exceeds Number.MAX_SAFE_INTEGER
- Offline calculations should use time-based formulas, not simulate each tick

### Number Formatting

As numbers grow, display should adapt:

| Range | Display |
|---|---|
| $0 - $999.99 | $123.45 |
| $1K - $999.99K | $123.45K |
| $1M - $999.99M | $123.45M |
| $1B - $999.99B | $123.45B |
| $1T - $999.99T | $123.45T |
| $1Qa+ | Scientific notation: $1.23e15 |

---

## Summary: Why This Strategy Works

### Depth Without Complexity
Each system is simple on its own (buy upgrades, hire managers, prestige for bonuses) but they compose into a rich strategic space.

### Respects Player Time
Whether playing actively for hours or checking in for 5 minutes daily, there's meaningful progress. Offline earnings, auto-prestige, and manager automation ensure no play session feels wasted.

### Clear Progression Arc
The game tells a story: small shop -> busy kitchen -> automated business -> franchise empire -> legendary legacy. Each phase feels different and introduces new mechanics.

### Meets Duration Target
The three-layer prestige system, combined with achievements and completion tracking, creates 1+ month of content for active players and 3-6 months for casual players — exceeding the requirement.

### Builds on Existing Foundation
The current Buy -> Cook -> Sell pipeline is already the correct foundation. Every proposed system enhances rather than replaces it. The pure-function architecture and TDD practices make incremental implementation safe and testable.

---

## Appendix: Quick Reference Comparison

### How Our Game Compares to Researched Games

| Feature | Our Design | Closest Inspiration |
|---|---|---|
| 3-stage pipeline | Buy → Cook → Sell | Idle Miner Tycoon (Shaft → Elevator → Warehouse) |
| Recipe system | Multiple recipes with time/value tradeoffs | Melvor Idle (skill-based crafting) |
| Manager automation | 3 basic + efficiency + specialist + super | AdVenture Capitalist + Idle Miner Tycoon |
| Star prestige | sqrt(revenue) formula, upgrade tree | Egg Inc (Soul Eggs) + Cookie Clicker (Heavenly Chips) |
| Franchise system | Multiple parallel locations | AdVenture Capitalist (Earth/Moon/Mars) |
| 3-layer prestige | Stars → Crowns → Diamonds | Antimatter Dimensions (Infinity → Eternity → Reality) |
| Milestone bonuses | Multipliers at sales/revenue thresholds | AdVenture Capitalist (milestone unlocks) |
| Achievement challenges | Restricted run goals | Antimatter Dimensions (challenges) |
| Offline earnings | Simulated with efficiency scaling | Melvor Idle (full offline simulation) |
| Completion tracking | Percentage across all systems | Melvor Idle (completion log) |
