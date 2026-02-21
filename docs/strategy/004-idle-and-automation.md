# Strategy Document: Idle Managers & Automation Systems

**Date:** 2026-02-21
**Purpose:** Define the idle gameplay, manager/automation systems, and offline earnings mechanics for Chicken Shop Idle.

---

## Design Philosophy

The transition from active clicking to automated idle play is the core emotional arc of idle games. Research shows:

- **AdVenture Capitalist:** Managers automate individual businesses one at a time. The joy of "going AFK" after full automation is the genre's signature moment.
- **Idle Miner Tycoon:** Regular managers automate, Super Managers provide powerful cooldown-based active abilities.
- **Egg Inc:** Internal Hatchery (passive chicken generation) replaces active tapping over time.
- **Cookie Clicker:** Automation is baked into buildings from the start; upgrades shift from clicking to idle.

**Core Principle:** Active play should always be slightly more efficient than idle, but idle should still provide meaningful progress. Target: 60% of optimal progress from idle, 40% bonus from active engagement (per industry standard research).

---

## Manager System

### Overview

Managers are hired staff that automate specific parts of the pipeline. Each manager handles one job and can be upgraded to perform it better.

### Manager Types

#### Tier 1: Basic Managers (Automate Core Pipeline)

| Manager | Job | Unlock | Hire Cost | Effect |
|---|---|---|---|---|
| **Buyer Bob** | Auto-Buy | $50K revenue | $10K | Automatically buys raw chicken when cold storage has room |
| **Chef Carmen** | Auto-Cook | $25K revenue | $5K | Automatically starts cooking when raw chicken available |
| **Seller Sam** | Auto-Sell | $25K revenue | $5K | Automatically sells when cooked chicken ready |

Once all three Tier 1 managers are hired, the core loop is fully automated. This is the **key milestone** — the moment the game becomes a true idle game.

**Target timing:** Players should be able to afford all three Tier 1 managers after ~2-3 hours of active play.

#### Tier 2: Efficiency Managers (Improve Automation)

| Manager | Job | Unlock | Hire Cost | Effect |
|---|---|---|---|---|
| **Speedy Steve** | Speed Boost | $500K revenue | $100K | All automation runs 25% faster |
| **Bulk Betty** | Batch Operations | $500K revenue | $100K | Managers process in batches of 5 instead of 1 |
| **Quality Quinn** | Quality Control | $1M revenue | $250K | +20% sale value on all automated sales |

#### Tier 3: Specialist Managers (Recipe-Specific)

| Manager | Job | Unlock | Hire Cost | Effect |
|---|---|---|---|---|
| **Fryer Frank** | Fried Specialist | Fried Chicken recipe | $50K | +50% speed and +25% value for fried recipes |
| **Grill Master Gary** | Grill Specialist | Grilled Chicken recipe | $75K | +50% speed and +25% value for grilled recipes |
| **Wing Queen Wendy** | Wings Specialist | Wings recipe | $60K | +50% speed and +25% value for wings |
| *(one per recipe)* | ... | ... | ... | ... |

#### Tier 4: Super Managers (Active Abilities)

Inspired by **Idle Miner Tycoon's** Super Manager system:

| Manager | Ability | Cooldown | Duration | Effect |
|---|---|---|---|---|
| **Gordon** | Rush Hour | 4 hours | 30 seconds | 10x cooking speed |
| **Martha** | Fire Sale | 4 hours | 30 seconds | 10x selling speed |
| **Colonel** | Supply Drop | 6 hours | Instant | Fill cold storage to max for free |
| **Chef Ramsay** | Kitchen Nightmare | 8 hours | 60 seconds | 5x all speed + 3x value |
| **Julia** | Signature Touch | 12 hours | 120 seconds | All sales are the highest recipe value |

Super Managers are unlocked through prestige currency (Stars) and are permanent across prestiges.

---

## Manager Upgrade System

### Upgrade Paths

Each basic manager can be upgraded to improve their efficiency:

```
Manager Level 1: Base automation
Manager Level 2: +25% speed (cost: 5x hire cost)
Manager Level 3: +50% speed (cost: 25x hire cost)
Manager Level 4: +100% speed (cost: 125x hire cost)
Manager Level 5: +200% speed, batch size +1 (cost: 625x hire cost)
Manager Level 6: +300% speed, batch size +2 (cost: 3125x hire cost)
Manager Level 7: +500% speed, batch size +5 (cost: 15625x hire cost)
Manager Level 8: +800% speed, batch size +10 (cost: 78125x hire cost)
Manager Level 9: +1200% speed, batch size +20 (cost: ~390K x hire cost)
Manager Level 10 (MAX): +2000% speed, batch size +50 (cost: ~2M x hire cost)
```

### Manager Upgrade Scaling
- Cost formula: `hireCost × 5^level`
- This is deliberately expensive — manager upgrades are a major cash sink
- Creates interesting choice: buy new managers vs upgrade existing ones

---

## Idle Earnings System

### Active vs Idle vs Offline

| Mode | Description | Efficiency |
|---|---|---|
| **Active** | Player is clicking, making decisions, using abilities | 100% (baseline) |
| **Idle** | Game tab is open, managers running, player away | 70-80% of active |
| **Offline** | Game is closed entirely | 30-50% of active (configurable) |

### Why Idle < Active?

Active play benefits:
- Player can time Super Manager abilities for maximum effect
- Player can switch recipes based on what's most profitable
- Player can optimize which upgrades to buy and when
- Click bonuses (if implemented) add extra income

### Offline Earnings Calculation

Inspired by **Melvor Idle's** full offline simulation and **Egg Inc's** simpler approach:

```
offlineEarnings = baseRate × offlineDuration × offlineEfficiency × prestigeMultiplier

Where:
  baseRate = current automated revenue per second (at time of closing)
  offlineDuration = min(timeSinceLastOpen, maxOfflineHours × 3600)
  offlineEfficiency = 0.30 + (offlineUpgradeLevel × 0.05)  // 30% base, up to 80%
  prestigeMultiplier = 1 + (stars × starBonus)
```

### Offline Earnings Cap

| Upgrade Level | Max Offline Duration | Offline Efficiency |
|---|---|---|
| 0 (base) | 4 hours | 30% |
| 1 | 6 hours | 35% |
| 2 | 8 hours | 40% |
| 3 | 10 hours | 45% |
| 4 | 12 hours | 50% |
| 5 | 16 hours | 55% |
| 6 | 20 hours | 60% |
| 7 | 24 hours | 65% |
| 8 | 36 hours | 70% |
| 9 | 48 hours | 75% |
| 10 (max) | 72 hours | 80% |

Offline duration upgrades purchased with Stars (prestige currency) — they persist across prestiges.

### Offline Return Experience

When the player returns after being offline:

```
┌──────────────────────────────────────────────┐
│         Welcome Back, Chef!                   │
│                                               │
│  You were away for 8 hours, 23 minutes        │
│                                               │
│  Your managers kept the shop running:          │
│    🍗 Chickens sold: 4,521                    │
│    💰 Revenue earned: $12,450.75              │
│                                               │
│  Current balance: $18,203.50                   │
│                                               │
│            [ Collect & Continue ]              │
└──────────────────────────────────────────────┘
```

---

## Automation Progression Timeline

### The Journey from Clicking to Idling

| Time | State | Player Activity |
|---|---|---|
| 0-15 min | Full manual | Click Buy, Cook, Sell constantly |
| 15-30 min | Partial manual | Bulk buy helps, but still clicking Cook and Sell |
| 30 min - 1 hr | First automation hints | Game suggests managers exist, player works toward them |
| 1-2 hrs | Saving for managers | Active play focused on earning enough to hire |
| 2-3 hrs | First manager hired | One stage automated, still clicking other two |
| 3-4 hrs | All basic managers | **The idle moment** — full pipeline automated |
| 4-8 hrs | Optimization phase | Upgrading managers, choosing recipes, buying equipment |
| 8-12 hrs | Advanced automation | Efficiency managers, specialist managers unlocked |
| Post-prestige | Super Managers | Cooldown abilities add active-play value layer |

### The "Idle Moment"

The transition from "I must click" to "the shop runs itself" should feel like a genuine achievement. Design cues:

1. **Visual change:** When all 3 basic managers are hired, the UI should subtly change — buttons become "auto" mode with a visual indicator
2. **Celebratory message:** "Your shop is now self-running! Check back anytime to collect profits."
3. **New UI panel:** An "Overview" panel shows income/second, projected hourly earnings
4. **Notification option:** "Notify me when I can afford [next upgrade]"

---

## Smart Automation Features

### Auto-Recipe Selection

Unlocked at mid-game:
- **Manual mode (default):** Player chooses which recipe to cook
- **Most Profitable mode:** Auto-selects recipe with best revenue/second
- **Fastest mode:** Auto-selects recipe with shortest cook time
- **Balanced mode:** Distributes cooking slots across recipes proportionally

### Auto-Upgrade

Very late game feature (post second prestige):
- Player can set upgrade priority rules
- Example: "Always upgrade cheapest available" or "Prioritize cooking speed"
- This prevents the late game from feeling like pure upgrade clicking

### Batch Size Scaling

As the game progresses, batch sizes should grow with the player:

| Phase | Buy Batch | Cook Batch | Sell Batch |
|---|---|---|---|
| Start | 1 | 1 | 1 |
| Early | 5 | 1 | 1 |
| Mid | 10-25 | 5 | 5 |
| Late | 100 | 25 | 25 |
| End | 1000 | 100 | all |

---

## Idle Income Boosters

### Temporary Boosts

Inspired by **AdVenture Communist's** boost stacking:

| Boost | Source | Duration | Effect |
|---|---|---|---|
| Happy Hour | Daily login | 30 min | x2 revenue |
| Rush Order | Achievement reward | 15 min | x3 selling speed |
| Fresh Delivery | Achievement reward | 15 min | x3 buying speed |
| Master Chef | Super Manager | 30-120s | x5-10 cooking speed |
| Grand Opening | Per-prestige (once) | 60 min | x5 all revenue |

### Stacking Rules

Boosts of the same type do NOT stack (only highest applies).
Boosts of different types DO stack multiplicatively.

Example: Happy Hour (x2 revenue) + Master Chef (x10 cook speed) = both active simultaneously.

---

## Notification System (for true idle play)

### Push-style Notifications (in-browser)

| Event | Notification |
|---|---|
| Cold storage full | "Storage full! Your supplier is waiting." |
| Can afford next manager | "You can now hire [Manager Name]!" |
| Can afford next upgrade | "New upgrade available: [Upgrade Name]" |
| Offline earnings ready | "Your shop earned $X while you were away!" |
| Super Manager ready | "[Manager] ability is off cooldown!" |
| Prestige recommended | "Your earnings are slowing. Consider prestige for X Stars." |

Notifications are opt-in and respect browser notification permissions.

---

## Balancing Active vs Idle

### The 60/40 Split

Research consistently recommends 60% idle / 40% active for optimal engagement:

**How we achieve this:**

1. **Idle (60%):** Managers run the full pipeline. Offline earnings accumulate. Upgrades provide passive multipliers.

2. **Active bonus (40%):**
   - Click bonuses: Clicking during automation gives small bonus income
   - Super Manager abilities: Must be manually activated, provide huge temporary boosts
   - Recipe optimization: Actively switching recipes based on what's needed
   - Strategic upgrade purchasing: Choosing the right upgrade at the right time
   - Prestige timing: Knowing when to prestige for optimal Stars

### Anti-AFK Farming Measures

To prevent the game from being trivially "solved" by leaving it open forever:
- **Diminishing returns on long sessions:** After 8 hours of continuous idle, earnings slowly decrease to 80%, then 60%
- **Daily login bonus:** Encourages closing and reopening (which also triggers offline earnings display)
- **Energy system for Super Managers:** Abilities recharge on real-time cooldowns, not game-time

---

## Key Design Decisions

1. **Managers are a purchase, not a grind:** You buy a manager once, they work forever (within a prestige cycle). No "manager stamina" or "manager food" mechanics.

2. **Automation is earned, not given:** The transition to idle should feel like a reward for 2-3 hours of active play.

3. **Idle is viable, active is optimal:** A player who checks in 3x daily for 5 minutes should make meaningful progress. A player who plays actively for an hour should make more, but not so much more that idle feels pointless.

4. **Super Managers bridge the gap:** They give active players powerful tools without punishing idle players. A missed cooldown is lost potential, not a penalty.

5. **Offline earnings are generous but capped:** The cap prevents "just leave it for a month" but 72 hours at max upgrade level is very generous for casual players.
