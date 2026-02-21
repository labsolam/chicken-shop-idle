# Strategy Document: Upgrade & Enhancement Systems

**Date:** 2026-02-21
**Purpose:** Define all upgrade systems, cost curves, reward structures, and enhancement mechanics for Chicken Shop Idle.

---

## Design Philosophy

Upgrades are the primary way players feel progress. Drawing from research across 10 idle games:

- **Cookie Clicker:** Upgrades should have clear, compounding effects. Players love seeing multipliers stack.
- **AdVenture Capitalist:** Milestone unlocks at specific thresholds create satisfying "breakthrough" moments.
- **Idle Miner Tycoon:** Boost milestones (2x at levels 10, 25, 50, 100) are simple but effective.
- **NGU Idle:** Gradual system reveals prevent overwhelm while maintaining long-term discovery.

**Core Principle:** Cost grows exponentially (1.15x per level), revenue grows slightly slower (1.10x per level). This guarantees eventual slowdown and creates natural prestige timing.

---

## Upgrade Categories

### Category 1: Speed Upgrades (Decrease Time)

These reduce the time for each stage of the pipeline.

#### Cooking Speed

| Level | Cook Time | Cost | Cost Formula |
|---|---|---|---|
| 0 (base) | 10.0s | — | — |
| 1 | 8.5s | $5 | Base |
| 2 | 7.2s | $12 | $5 × 1.15^level × level_factor |
| 3 | 6.1s | $28 | |
| 4 | 5.2s | $64 | |
| 5 | 4.4s | $147 | |
| 10 | 2.0s | $10K | |
| 15 | 1.0s | $750K | |
| 20 | 0.5s | $55M | |
| 25 | 0.25s | $4B | |
| 30 (cap) | 0.1s | $300B | |

**Formula:** `cookTime = baseTime × 0.85^level` (diminishing returns naturally)
**Cost Formula:** `cost = baseCost × 2.3^level`

#### Selling Speed

Same curve as cooking speed, applied to sell timer.

| Level | Sell Time | Cost |
|---|---|---|
| 0 (base) | 10.0s | — |
| 5 | 4.4s | $147 |
| 10 | 2.0s | $10K |
| 15 | 1.0s | $750K |
| 20 | 0.5s | $55M |
| 30 (cap) | 0.1s | $300B |

#### Buying Speed (Supply Delivery)

Later upgrade — reduces time for bulk auto-purchases.

| Level | Delivery Interval | Cost |
|---|---|---|
| 0 (base) | Manual only | — |
| 1 | 30s auto-buy | $1K (requires Auto-Supplier manager) |
| 5 | 15s | $15K |
| 10 | 5s | $500K |
| 15 | 2s | $20M |
| 20 (cap) | 1s | $1B |

---

### Category 2: Capacity Upgrades

These increase how much you can store/process at once.

#### Cold Storage Capacity

| Level | Capacity | Cost |
|---|---|---|
| 0 | 10 | — |
| 1 | 25 | $15 |
| 2 | 50 | $75 |
| 3 | 100 | $350 |
| 4 | 250 | $2K |
| 5 | 500 | $10K |
| 6 | 1,000 | $50K |
| 7 | 2,500 | $250K |
| 8 | 5,000 | $1.5M |
| 9 | 10,000 | $10M |
| 10 (cap) | 25,000 | $75M |

#### Cooking Slots (Parallel Processing)

Inspired by **Egg Inc's** hen house expansion:

| Level | Slots | Cost |
|---|---|---|
| 0 | 1 | — |
| 1 | 2 | $50 |
| 2 | 3 | $500 |
| 3 | 4 | $5K |
| 4 | 5 | $50K |
| 5 | 6 | $500K |
| 6 | 8 | $5M |
| 7 | 10 | $50M |
| 8 | 15 | $500M |
| 9 | 20 | $5B |
| 10 (cap) | 30 | $50B |

#### Selling Registers (Parallel Selling)

Same structure as cooking slots, slightly cheaper (selling is downstream).

| Level | Registers | Cost |
|---|---|---|
| 0 | 1 | — |
| 1 | 2 | $30 |
| 2 | 3 | $300 |
| 3 | 4 | $3K |
| 4 | 5 | $30K |
| ... | ... | ... |
| 10 (cap) | 30 | $30B |

---

### Category 3: Value Upgrades (Reward System)

These increase how much money you earn per sale.

#### Chicken Sale Value

| Level | Multiplier | Cost | Cumulative Effect |
|---|---|---|---|
| 0 | 1.0x | — | $0.50 per basic chicken |
| 1 | 1.2x | $10 | $0.60 |
| 2 | 1.4x | $35 | $0.70 |
| 3 | 1.7x | $120 | $0.85 |
| 4 | 2.0x | $400 | $1.00 |
| 5 | 2.5x | $1.5K | $1.25 |
| 10 | 5.0x | $200K | $2.50 |
| 15 | 10.0x | $25M | $5.00 |
| 20 | 20.0x | $3B | $10.00 |
| 25 (cap) | 50.0x | $400B | $25.00 |

**Formula:** `saleValue = baseValue × (1 + 0.2 × level)^1.3`
**Cost Formula:** `cost = 10 × 3.5^level`

#### Customer Tips

A secondary value multiplier, unlocked mid-game:

| Level | Tip Chance | Tip Amount | Cost |
|---|---|---|---|
| 0 | 0% | — | — |
| 1 | 5% | +25% bonus | $5K |
| 2 | 10% | +25% bonus | $25K |
| 3 | 15% | +50% bonus | $125K |
| 4 | 20% | +50% bonus | $600K |
| 5 | 25% | +75% bonus | $3M |
| 10 (cap) | 50% | +200% bonus | $5B |

---

### Category 4: Milestone Bonuses

Inspired by **AdVenture Capitalist's** milestone system and **Idle Miner Tycoon's** boost levels.

#### Total Chickens Sold Milestones

| Milestone | Reward |
|---|---|
| 10 chickens sold | x2 sale value |
| 50 chickens sold | x2 cooking speed |
| 100 chickens sold | x2 sale value |
| 250 chickens sold | Unlock Chicken Wings recipe |
| 500 chickens sold | x3 sale value |
| 1,000 chickens sold | x2 all speeds |
| 2,500 chickens sold | Unlock Bulk Cook (x5) |
| 5,000 chickens sold | x5 sale value |
| 10,000 chickens sold | x2 all speeds |
| 25,000 chickens sold | Unlock Chicken Burger recipe |
| 50,000 chickens sold | x10 sale value |
| 100,000 chickens sold | x3 all speeds |
| 500,000 chickens sold | x25 sale value |
| 1,000,000 chickens sold | x5 all speeds, title: "Chicken Millionaire" |

#### Total Revenue Milestones

| Milestone | Reward |
|---|---|
| $50 | Unlock Grilled Chicken recipe |
| $500 | Unlock second cooking slot hint |
| $5,000 | x2 all revenue |
| $50,000 | Unlock Bulk Buy (x10) |
| $500,000 | x3 all revenue |
| $5,000,000 | Unlock Chicken Katsu recipe |
| $50,000,000 | x5 all revenue |
| $500,000,000 | x10 all revenue |
| $5,000,000,000 | Unlock Rotisserie recipe |
| $50B | x25 all revenue |
| $500B | x50 all revenue |
| $5T | Unlock Chicken Feast recipe |
| $50T | x100 all revenue |
| $500T | Prestige layer 2 unlock |

---

### Category 5: Equipment System

Inspired by **NGU Idle's** gear farming and **Melvor Idle's** crafting.

Equipment provides passive bonuses and can be upgraded.

#### Kitchen Equipment

| Equipment | Base Bonus | Max Level | Upgrade Cost Scaling |
|---|---|---|---|
| Basic Oven | +10% cook speed | 10 | Starting equipment |
| Commercial Oven | +25% cook speed, +1 slot | 15 | $10K base, x2 per level |
| Industrial Fryer | +20% cook speed, +15% value for fried items | 15 | $50K base, x2 per level |
| Charcoal Grill | +15% cook speed, +25% value for grilled items | 15 | $25K base, x2 per level |
| Rotisserie Spit | Enables Rotisserie Chicken, +10% all value | 10 | $500K base, x2.5 per level |
| Chef's Wok | +30% cook speed, +20% value for stir-fry items | 15 | $1M base, x2 per level |
| Smoker | Enables Smoked Chicken, +35% value | 10 | $5M base, x3 per level |

#### Front-of-House Equipment

| Equipment | Base Bonus | Max Level | Unlock |
|---|---|---|---|
| Cash Register | +10% sell speed | 10 | Starting |
| Display Case | +15% customer attraction | 10 | $5K |
| Drive-Through Window | +1 sell slot, +20% sell speed | 15 | $100K |
| Neon Sign | +25% customer attraction, +10% tips | 10 | $500K |
| Loyalty Card Printer | +5% repeat customer bonus per level | 20 | $50K |
| Catering Van | Enables catering orders (+50% batch value) | 10 | $5M |

---

### Category 6: Staff Upgrades

Distinct from managers (who automate), staff provide passive bonuses.

| Staff Member | Bonus | Cost | Max Level |
|---|---|---|---|
| Line Cook | +15% cook speed per level | $1K, x2.5/lvl | 10 |
| Sous Chef | +10% recipe value per level | $5K, x2.5/lvl | 10 |
| Cashier | +15% sell speed per level | $1K, x2.5/lvl | 10 |
| Marketing Intern | +10% customer rate per level | $10K, x3/lvl | 10 |
| Accountant | -5% upgrade costs per level (max -30%) | $50K, x3/lvl | 6 |
| Health Inspector | +5% all revenue per level (reputation) | $25K, x3/lvl | 10 |

---

## Upgrade Cost Curves: Mathematical Foundation

### General Formula

```
cost(level) = baseCost × scalingFactor^level
```

### Scaling Factors by Category

| Category | Scaling Factor | Rationale |
|---|---|---|
| Speed upgrades | 2.3x | Core progression driver, should feel rewarding but pace out |
| Capacity upgrades | 3.0-5.0x | Big jumps in capability, less frequent purchases |
| Value multipliers | 3.5x | Multiplicative effect compounds, so cost must be steep |
| Equipment | 2.0x | Side-grade feel, steady linear progression |
| Staff | 2.5x | Moderate scaling, fills gaps between major upgrades |

### Revenue vs Cost Growth

Following the research from Kongregate's "Math of Idle Games":

```
Revenue growth per upgrade: ~1.10-1.20x (linear to low polynomial)
Cost growth per upgrade:    ~1.15-2.30x (exponential)
```

This guarantees that at some point costs overtake revenue, creating the prestige wall. The exact timing depends on which upgrades the player chooses, creating strategic depth.

### Balancing Target

- **Minutes 0-30:** Player can afford a new upgrade every 30-60 seconds
- **Hours 1-3:** New upgrades every 2-5 minutes
- **Hours 3-8:** New upgrades every 10-30 minutes
- **Hours 8-12:** New upgrades every 30-60 minutes (prestige wall approaching)
- **Post-first prestige:** Cycle restarts but 2-3x faster due to prestige bonuses

---

## Upgrade UI/UX Design

### Upgrade Panel Organization

```
┌──────────────────────────────────────────────┐
│ UPGRADES                                      │
├──────────────────────────────────────────────┤
│ ⏱ Speed                                      │
│   Cook Speed    Lv.3  [Upgrade $28]          │
│   Sell Speed    Lv.1  [Upgrade $5]           │
│                                               │
│ 📦 Capacity                                   │
│   Cold Storage  Lv.2  [Upgrade $75]          │
│   Cook Slots    Lv.0  [Upgrade $50]          │
│   Registers     Lv.0  [Upgrade $30]          │
│                                               │
│ 💰 Value                                      │
│   Sale Value    Lv.1  [Upgrade $10]          │
│   Tips          🔒 Unlock at $5K revenue      │
│                                               │
│ 🔧 Equipment                                  │
│   Basic Oven    Lv.2  [Upgrade $250]         │
│   Cash Register Lv.1  [Upgrade $100]         │
│   Display Case  🔒 Unlock at $5K revenue      │
│                                               │
│ 👥 Staff                                      │
│   Line Cook     🔒 Unlock at $1K revenue      │
│   Cashier       🔒 Unlock at $1K revenue      │
└──────────────────────────────────────────────┘
```

### Affordability Indicators
- **Green:** Can afford right now
- **Yellow:** Can afford within ~2 minutes at current rate
- **Red/Gray:** Cannot afford, show cost clearly
- **Locked:** Show unlock condition

### Upgrade Tooltips
Every upgrade shows:
- Current effect and next level effect
- Cost
- Effective DPS/revenue change (inspired by Cookie Clicker's "CPS increase" display)

---

## Unlock Progression

### Feature Unlock Order

This ensures features are introduced one at a time (per research best practices):

| # | Feature | Unlock Condition | Time Target |
|---|---|---|---|
| 1 | Cook Speed upgrade | Available at start | 0 min |
| 2 | Sell Speed upgrade | Available at start | 0 min |
| 3 | Chicken Value upgrade | Available at start | 0 min |
| 4 | Bulk Buy (x5) | $50 total earned | ~5 min |
| 5 | Cold Storage expansion | $100 total earned | ~8 min |
| 6 | Grilled Chicken recipe | $500 total earned | ~15 min |
| 7 | 2nd Cooking Slot | $500 total earned | ~15 min |
| 8 | 2nd Register | $300 total earned | ~12 min |
| 9 | Chicken Wings recipe | 250 chickens sold | ~20 min |
| 10 | Basic Equipment upgrades | $1K total earned | ~25 min |
| 11 | Staff hiring | $1K total earned | ~25 min |
| 12 | Bulk Buy (x10) | $5K total earned | ~45 min |
| 13 | Chicken Burger recipe | $5K total earned | ~45 min |
| 14 | Display Case equipment | $5K total earned | ~45 min |
| 15 | Tips system | $5K total earned | ~45 min |
| 16 | More recipes | $10K-$100K | 1-3 hrs |
| 17 | Manager system | $50K total earned | ~2 hrs |
| 18 | Drive-Through | $100K total earned | ~3 hrs |
| 19 | Catering system | $5M total earned | ~8 hrs |
| 20 | Prestige available | Revenue wall hit | ~8-12 hrs |

---

## Anti-Patterns to Avoid

Based on research into common idle game mistakes:

1. **No trap upgrades:** Every upgrade should have a use case. No "never buy this" options.
2. **No hidden math:** Effects should be clearly stated. "x2 cooking speed" not "improves cooking."
3. **No mandatory premium:** All content achievable without premium currency.
4. **No false choices:** When two upgrades cost the same, one should clearly serve a different playstyle, not be strictly worse.
5. **No exponential overload:** Don't stack too many multiplicative bonuses or numbers become meaningless.
6. **Cost transparency:** Always show cost AND effect before purchase. No "buy to discover" mechanics for upgrades.
