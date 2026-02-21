# Strategy Document: Prestige & Endgame Systems

**Date:** 2026-02-21
**Purpose:** Define the prestige system, endgame progression, and long-term retention mechanics for Chicken Shop Idle. Target: at least 1 month of continuous gameplay to "beat" the game.

---

## Design Philosophy

Prestige systems are what transform a short clicker into a month-long idle game. Research findings:

- **Cookie Clicker:** Heavenly Chips + upgrade tree = deep prestige spending decisions
- **Clicker Heroes:** Two-layer prestige (Ascension + Transcension) creates weeks of content per layer
- **Antimatter Dimensions:** Three-layer prestige (Infinity + Eternity + Reality) creates months of content
- **AdVenture Capitalist:** Angel Investors as both passive multiplier AND spendable currency creates an elegant tension
- **Egg Inc:** Soul Eggs + Prophecy Eggs compound multiplicatively for exponential long-term growth
- **Realm Grinder:** Each prestige layer fundamentally changes what you optimize

**Core Principle:** Each prestige layer should make the player feel powerful while opening entirely new strategic dimensions. The game should never feel like "doing the same thing again" — each cycle should feel fresh.

---

## Prestige Layer 1: "New Menu" (Stars System)

### Thematic Framing

You've made your chicken shop as good as it can be. Time to tear up the menu, rebrand, and start fresh with the wisdom (and reputation) you've earned.

### When It Unlocks

- Prestige button appears when total lifetime revenue reaches **$1 billion**
- At this point, upgrade costs have far outpaced revenue growth
- Player has been playing ~8-12 hours of active play (or ~1-2 weeks of casual idle play)

### What You Get: Stars

**Stars** are the Layer 1 prestige currency.

```
Stars earned = floor(sqrt(lifetimeRevenue / 1,000,000))
```

| Lifetime Revenue | Stars Earned |
|---|---|
| $1B | 31 |
| $5B | 70 |
| $10B | 100 |
| $50B | 223 |
| $100B | 316 |
| $500B | 707 |
| $1T | 1,000 |

**Key insight from AdVenture Capitalist:** To double your Stars, you need to earn 4x more revenue. This naturally paces prestige timing — you want to push as far as possible before resetting.

### What Resets

| Resets | Keeps |
|---|---|
| Cash balance | **Stars** (cumulative across all prestiges) |
| All upgrades (speed, capacity, value) | **Star Upgrades** (permanent purchases) |
| Equipment levels | **Super Managers** |
| Staff levels | **Recipes unlocked** |
| Manager levels (but not unlock status) | **Achievements** |
| Milestone progress | **Golden Drumsticks** |
| | **Offline earning upgrades** |

### Star Upgrade Tree

Stars are spent on permanent bonuses that persist across all future prestiges.

#### Tier 1: Foundation (1-50 Stars)

| Upgrade | Cost | Effect |
|---|---|---|
| Reputation I | 5 Stars | x1.5 all revenue |
| Quick Start I | 10 Stars | Start each run with $50 instead of $5 |
| Kitchen Memory I | 15 Stars | Cook speed upgrades cost 20% less |
| Loyal Customers I | 20 Stars | x2 customer arrival rate |
| Offline Earner I | 25 Stars | Offline earnings +10% efficiency |
| Supplier Deal I | 30 Stars | Raw chicken costs 15% less |
| Quick Start II | 50 Stars | Start each run with $500 |

#### Tier 2: Growth (50-200 Stars)

| Upgrade | Cost | Effect |
|---|---|---|
| Reputation II | 75 Stars | x2 all revenue (stacks with I: total x3) |
| Manager Expertise I | 100 Stars | Managers start at Level 2 |
| Kitchen Memory II | 100 Stars | All speed upgrades cost 30% less |
| Equipment Retention I | 125 Stars | Keep 25% of equipment levels through prestige |
| Quick Start III | 150 Stars | Start each run with $5,000 |
| Bulk Mastery | 150 Stars | Unlock max bulk buy from the start |
| Offline Earner II | 175 Stars | Offline duration cap +4 hours |
| Loyal Customers II | 200 Stars | x3 customer arrival rate |

#### Tier 3: Mastery (200-750 Stars)

| Upgrade | Cost | Effect |
|---|---|---|
| Reputation III | 250 Stars | x3 all revenue (total x9 with I+II) |
| Manager Expertise II | 300 Stars | Managers start at Level 4 |
| Recipe Mastery I | 350 Stars | All recipes cook 20% faster permanently |
| Equipment Retention II | 400 Stars | Keep 50% of equipment levels through prestige |
| Star Power I | 500 Stars | Each unspent Star gives +0.5% revenue |
| Quick Start IV | 500 Stars | Start each run with $50,000 |
| Permanent Slot I | 600 Stars | Keep ONE upgrade through prestige (player's choice) |
| Staff Retention I | 700 Stars | Staff start at 50% of pre-prestige levels |
| Offline Earner III | 750 Stars | Offline efficiency +20% |

#### Tier 4: Legendary (750-2000 Stars)

| Upgrade | Cost | Effect |
|---|---|---|
| Reputation IV | 1000 Stars | x5 all revenue (total x45 with I+II+III) |
| Manager Expertise III | 1000 Stars | Managers start at Level 7 |
| Equipment Retention III | 1200 Stars | Keep 100% of equipment levels |
| Permanent Slot II | 1500 Stars | Keep TWO upgrades through prestige |
| Star Power II | 1500 Stars | Each unspent Star gives +1% revenue |
| Recipe Mastery II | 1750 Stars | All recipes cook 40% faster permanently |
| Franchise License | 2000 Stars | **Unlock Prestige Layer 2** |

### Prestige Pacing (Layer 1)

| Prestige # | Expected Stars | Cumulative Stars | Run Duration (Active) | Run Duration (Casual) |
|---|---|---|---|---|
| 1st | ~31-70 | 31-70 | 8-12 hours | 1-2 weeks |
| 2nd | ~100-150 | 131-220 | 4-6 hours | 5-7 days |
| 3rd | ~200-300 | 331-520 | 3-5 hours | 4-6 days |
| 4th | ~300-500 | 631-1020 | 3-4 hours | 3-5 days |
| 5th+ | ~500-800 | 1131-1820 | 2-4 hours | 2-4 days |
| Franchise unlock | ~2000+ total | 2000+ | After ~8-12 prestiges | 4-8 weeks |

---

## Prestige Layer 2: "Franchise" (Crown System)

### Thematic Framing

Your single chicken shop has become legendary. Now expand into a franchise — open locations across the city, each with its own personality and specialization.

### When It Unlocks

- Requires "Franchise License" Star upgrade (2000 Stars)
- This is approximately 8-12 Layer 1 prestiges deep
- Target: ~2-4 weeks of active play, or ~6-10 weeks of casual play to reach

### What You Get: Crowns

**Crowns** are the Layer 2 prestige currency.

```
Crowns earned = floor(totalStarsEarned / 500)
```

A "Franchise Reset" resets EVERYTHING that a Star reset resets, PLUS resets your Stars to zero. But you keep your Crowns and Crown upgrades.

| Total Stars Before Reset | Crowns Earned |
|---|---|
| 2,000 | 4 |
| 5,000 | 10 |
| 10,000 | 20 |
| 25,000 | 50 |
| 50,000 | 100 |

### What Additionally Resets (Beyond Star Reset)

| Resets | Keeps |
|---|---|
| Stars balance (to zero) | **Crowns** (cumulative) |
| Star Upgrades | **Crown Upgrades** (permanent) |
| | **Super Managers** |
| | **Achievements** |
| | **Golden Drumsticks** |

### Crown Upgrade Tree

#### Franchise Perks (1-25 Crowns)

| Upgrade | Cost | Effect |
|---|---|---|
| Brand Recognition I | 2 Crowns | x5 all revenue at all times |
| Star Accelerator I | 3 Crowns | Stars earned x1.5 |
| Speed Heritage I | 5 Crowns | All speed upgrades start at Level 3 |
| Franchise HQ | 5 Crowns | Unlock franchise location management |
| Brand Recognition II | 10 Crowns | x10 all revenue |
| Star Accelerator II | 10 Crowns | Stars earned x2 |
| Manager Academy | 15 Crowns | All managers start at Level 5 |
| Premium Supplier | 20 Crowns | Raw chicken costs 50% less always |
| Autoprestige I | 25 Crowns | Auto-prestige when Stars earned would double current total |

#### Franchise Empire (25-100 Crowns)

| Upgrade | Cost | Effect |
|---|---|---|
| Brand Recognition III | 30 Crowns | x25 all revenue |
| Star Accelerator III | 40 Crowns | Stars earned x3 |
| Location Slot I | 40 Crowns | Unlock second franchise location |
| Speed Heritage II | 50 Crowns | All speed upgrades start at Level 10 |
| Location Slot II | 60 Crowns | Unlock third franchise location |
| Express Training | 75 Crowns | All staff start at max level |
| Location Slot III | 80 Crowns | Unlock fourth franchise location |
| Crown Jewel | 100 Crowns | **Unlock Prestige Layer 3** |

### Franchise Locations

Each location is a semi-independent chicken shop that runs in parallel:
- Has its own managers, staff, equipment
- Earns revenue that contributes to your total
- Different locations can specialize in different recipes
- Combined revenue counts toward Star earning on prestige
- Inspired by **AdVenture Capitalist's** Moon/Mars planets

| Location | Unlock | Specialty | Bonus |
|---|---|---|---|
| Downtown | Franchise HQ upgrade | General | Baseline location |
| Food Court | Location Slot I | Fast recipes only | x2 speed, x0.7 value |
| Uptown | Location Slot II | Premium recipes only | x0.5 speed, x3 value |
| Airport | Location Slot III | All recipes | x2 customer rate, x1.5 value |

---

## Prestige Layer 3: "Legacy" (Diamond System)

### Thematic Framing

Your franchise is a household name. Time to create a legacy — a chicken empire that spans generations. Start a new franchise from scratch, but your brand's legacy lives on.

### When It Unlocks

- Requires "Crown Jewel" Crown upgrade (100 Crowns)
- This is approximately 5-8 Layer 2 resets deep
- Target: ~1-2 months of active play to reach, longer for casual

### What You Get: Diamonds

**Diamonds** are the Layer 3 prestige currency.

```
Diamonds earned = floor(totalCrownsEarned / 25)
```

### Diamond Upgrade Tree (Endgame)

| Upgrade | Cost | Effect |
|---|---|---|
| Dynasty I | 1 Diamond | x50 all revenue permanently |
| Crown Accelerator | 2 Diamonds | Crowns earned x2 |
| Star Accelerator Max | 3 Diamonds | Stars earned x5 |
| Dynasty II | 5 Diamonds | x200 all revenue |
| Auto-Franchise | 5 Diamonds | Auto-franchise-reset when optimal |
| Instant Kitchen | 8 Diamonds | All cooking starts at 1s base time |
| Dynasty III | 10 Diamonds | x1000 all revenue |
| Location Mastery | 10 Diamonds | All franchise locations auto-unlocked each run |
| The Golden Chicken | 15 Diamonds | **Endgame trophy — "You beat the game!"** |
| Infinity Mode | 20 Diamonds | Remove all caps, pure number-go-up |

---

## Prestige Timing Strategy Guide (for players)

### Layer 1 (Stars): When to Prestige?

**Rule of thumb:** Prestige when your next meaningful upgrade would take longer than restarting with the bonus Stars.

**Mathematical guidance:**
- Check how many Stars you'd earn right now
- If that number hasn't increased meaningfully in the last 30 minutes of play, it's time
- First prestige: push until you've earned at least 30-50 Stars
- Later prestiges: push until Stars would at least double your current total

### Layer 2 (Crowns): When to Franchise Reset?

- Each franchise reset requires significant Star accumulation
- Push until earning additional Stars per run becomes minimal
- The Star Accelerator upgrades make this faster each time
- Target: Franchise reset every 5-10 Star prestiges

### Layer 3 (Diamonds): When to Legacy Reset?

- Only do this when Crown earning has deeply plateaued
- Each Diamond provides such massive bonuses that even one is transformative
- Expect 1-3 Legacy resets total before reaching endgame

---

## Endgame Content & Completion

### Achievement System

Achievements provide Golden Drumsticks and give long-term goals:

#### Progression Achievements

| Achievement | Condition | Reward |
|---|---|---|
| First Sale | Sell 1 chicken | 1 Golden Drumstick |
| Hundred Club | Sell 100 chickens | 5 GD |
| Chicken Tycoon | Earn $1M total | 10 GD |
| Speed Demon | Cook in under 1 second | 10 GD |
| Full House | Max all cooking slots | 15 GD |
| Star Collector | Earn 100 Stars | 20 GD |
| Franchise Owner | Open first franchise | 25 GD |
| Crown Royal | Earn 10 Crowns | 50 GD |
| Diamond Chef | Earn first Diamond | 100 GD |
| The Golden Chicken | Purchase final upgrade | 500 GD |

#### Challenge Achievements (Inspired by Antimatter Dimensions)

| Achievement | Condition | Reward |
|---|---|---|
| Speedrun | Reach $1M in under 30 minutes | 25 GD |
| No Upgrades | Reach $10K without buying any upgrades | 15 GD |
| One Recipe Only | Reach $100K using only Basic Fried Chicken | 20 GD |
| Pacifist Chef | Reach $1M without clicking Cook (managers only) | 30 GD |
| Minimalist | Prestige with only 1 cooking slot | 20 GD |
| Slow and Steady | Reach $1B without any speed upgrades | 50 GD |

#### Secret Achievements

| Achievement | Condition | Reward |
|---|---|---|
| ??? | Sell exactly 1,337 chickens | 10 GD |
| ??? | Have $0.00 with cooked chicken waiting | 5 GD |
| ??? | Play for 24 hours straight (browser tab open) | 15 GD |
| ??? | Prestige within 5 minutes of unlocking prestige | 25 GD |

### Completion Percentage

Inspired by **Melvor Idle's** completion log:

```
Completion = (
  Recipes Unlocked / Total Recipes +
  Upgrades Maxed / Total Upgrades +
  Equipment Maxed / Total Equipment +
  Staff Maxed / Total Staff +
  Achievements Earned / Total Achievements +
  Star Upgrades / Total Star Upgrades +
  Crown Upgrades / Total Crown Upgrades +
  Diamond Upgrades / Total Diamond Upgrades
) / 8 × 100%
```

**100% Completion = "You Beat the Game"**

---

## Progression Duration Estimates

### To "Beat" the Game (100% Completion or The Golden Chicken)

| Play Style | Estimated Duration |
|---|---|
| Hardcore Active (8+ hrs/day) | ~1 month |
| Regular Active (2-4 hrs/day) | ~2 months |
| Casual Active (1 hr/day) | ~3-4 months |
| Pure Idle (check in 3x/day, 5 min each) | ~4-6 months |
| Very Casual (check in 1x/day) | ~6-12 months |

### Layer Timing Breakdown

| Layer | Active Player | Casual Player |
|---|---|---|
| Reach first prestige | 8-12 hours | 1-2 weeks |
| Complete Layer 1 (earn Franchise) | 1-2 weeks | 4-8 weeks |
| Complete Layer 2 (earn Legacy) | 2-3 weeks | 6-12 weeks |
| Complete Layer 3 (Golden Chicken) | 1-2 weeks | 4-8 weeks |
| 100% Completion (all achievements) | Additional 1-2 weeks | Additional 4-8 weeks |

**Total: ~5-8 weeks active, 3-6+ months casual**

This meets the requirement of "at least a month of continuous gameplay to beat, longer if not played continuously."

---

## Anti-Frustration Features

1. **Prestige preview:** Always show how many Stars/Crowns/Diamonds you'd earn before committing
2. **Undo prestige:** Within 30 seconds of prestiging, allow undo (in case of misclick)
3. **Auto-prestige option:** Unlockable — auto-prestiges when optimal
4. **Progress bars:** Show progress toward next prestige threshold
5. **"Best run" tracking:** Show your fastest run to each milestone
6. **No permanent mistakes:** All prestige currency spending can be "refunded" at a small cost
