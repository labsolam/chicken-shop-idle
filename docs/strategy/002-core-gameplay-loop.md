# Strategy Document: Core Gameplay Loop Design

**Date:** 2026-02-21
**Purpose:** Define the expanded core gameplay loop for Chicken Shop Idle, building on the existing Buy -> Cook -> Sell pipeline.

---

## Current State

The game currently has a 3-step clicker flow:
1. **Buy** raw chicken ($0.25 per unit)
2. **Cook** chicken (10s timer)
3. **Sell** cooked chicken (10s timer)

Player starts with $5.00. All actions are manual clicks. Two upgrades exist: cook speed and chicken value, both with exponential cost scaling.

---

## Expanded Core Loop Design

### Philosophy

Drawing from **Idle Miner Tycoon's** three-stage pipeline and **Egg Inc's** bottleneck management, the core loop should:
- Keep the satisfying Buy -> Cook -> Sell pipeline as the foundation
- Add depth through multiple chicken products, equipment, and staff
- Create natural bottlenecks that players must strategize around
- Transition from active clicking to automated idle play over time

### The Pipeline (Expanded)

```
[Supplier] --> [Kitchen] --> [Counter] --> [Customer]
   Buy           Cook          Sell         Revenue
```

Each stage becomes a "department" with its own capacity, speed, and upgrade path.

---

## Stage 1: Buying (Supply Chain)

### Basic Mechanic
- Click "Buy" to purchase raw chicken from supplier
- Raw chicken goes into **Cold Storage** (limited capacity)
- Cost per chicken increases slightly as you buy more per "delivery"

### Enhancements Over Time

| Feature | Unlock | Description |
|---|---|---|
| Bulk Buy (x5, x10, x25) | $50 earned | Buy multiple chickens per click |
| Cold Storage Expansion | $100 earned | Increase raw chicken storage capacity |
| Supplier Contracts | First prestige | Reduce base chicken cost by negotiated % |
| Premium Ingredients | Mid-game | Unlock higher-tier raw materials (organic, free-range) |
| Auto-Supplier | Manager unlock | Automatically purchases chicken when storage has room |

### Cold Storage (Capacity Mechanic)

Inspired by **Idle Miner Tycoon's** elevator bottleneck:
- Starting capacity: 10 raw chickens
- If storage is full, cannot buy more
- Upgrades increase capacity: 10 -> 25 -> 50 -> 100 -> 250 -> 500 -> 1000
- Cost scaling: each level costs 3x the previous level
- Creates a natural reason to upgrade beyond just "buy more"

---

## Stage 2: Cooking (Production)

### Basic Mechanic
- Click "Cook" to move 1 raw chicken into the cooking queue
- Cooking takes time (starts at 10 seconds)
- Cooked chicken moves to "Ready" counter
- Limited cooking slots (starts at 1)

### Enhancements Over Time

| Feature | Unlock | Description |
|---|---|---|
| Faster Ovens | Upgrade purchase | Reduce cook time (10s -> 8s -> 6s -> 4s -> 2s -> 1s -> 0.5s) |
| Additional Cooking Slots | Upgrade purchase | Cook multiple chickens simultaneously |
| Recipes | Revenue milestone | Different recipes = different cook times + sale values |
| Batch Cooking | Mid-game | Cook 5/10/25 at once per click |
| Auto-Cook | Manager unlock | Automatically starts cooking when raw chickens available |
| Kitchen Equipment | Equipment system | Ovens, grills, fryers each affect different recipe types |

### Recipe System

Inspired by **Melvor Idle's** interconnected skills:

| Recipe | Cook Time | Sale Value | Unlock |
|---|---|---|---|
| Basic Fried Chicken | 10s | $0.50 | Start |
| Grilled Chicken | 15s | $1.00 | $25 revenue |
| Chicken Wings | 8s | $0.75 | $100 revenue |
| Chicken Burger | 20s | $2.00 | $500 revenue |
| Chicken Katsu | 25s | $3.50 | $2,000 revenue |
| Rotisserie Chicken | 45s | $8.00 | $10,000 revenue |
| Chicken Feast Platter | 120s | $25.00 | $100,000 revenue |
| Signature Dish | 300s | $100.00 | First prestige |

Each recipe has independent cook time reduction upgrades. Higher-value recipes take longer but are more profitable per unit of time once upgraded.

---

## Stage 3: Selling (Revenue)

### Basic Mechanic
- Click "Sell" to sell 1 cooked chicken to a customer
- Selling takes time (starts at 10 seconds, representing serving + payment)
- Revenue goes to your cash balance
- Limited selling slots (starts at 1)

### Enhancements Over Time

| Feature | Unlock | Description |
|---|---|---|
| Faster Service | Upgrade purchase | Reduce sell time |
| Additional Registers | Upgrade purchase | Serve multiple customers simultaneously |
| Customer Queue | Mid-game | Customers wait in line, overflow = lost sales |
| Bulk Sell | Upgrade | Sell multiple at once |
| Auto-Sell | Manager unlock | Automatically sells when cooked chicken available |
| Marketing | Late-game | Increase customer demand and willingness to pay |
| Catering Orders | Late-game | Large batch orders with bonus multipliers |

### Customer Demand System

Inspired by **Idle Miner Tycoon's** warehouse pacing:
- Customers arrive at a rate (starts at 1 per 10 seconds)
- If you have cooked chicken and a free register, sale begins automatically (once auto-sell unlocked)
- If no cooked chicken available when customer arrives, customer leaves (lost sale)
- Customer patience upgradable
- Creating a pull-based system where you need to keep up with demand

---

## Revenue & Economy

### Money Flow

```
Revenue = (Base Chicken Value × Recipe Multiplier × Upgrade Multipliers × Prestige Bonus)
Cost    = (Base Chicken Cost × Supplier Discount × Bulk Discount)
Profit  = Revenue - Cost
```

### Currency Types (3 currencies, inspired by industry best practices)

| Currency | Earned By | Spent On |
|---|---|---|
| **Cash ($)** | Selling chicken | Upgrades, equipment, staff, expansion |
| **Stars** | Prestige (reset) | Permanent bonuses, unlock new features |
| **Golden Drumsticks** | Achievements, milestones | Premium upgrades, cosmetics, time skips |

### Economic Pacing

Following the research on exponential cost vs polynomial revenue:
- **Upgrade costs:** Grow at 1.15x per level (base)
- **Revenue growth:** Grows at ~1.10x per upgrade level
- This ensures costs eventually outpace revenue, creating natural prestige points
- Target: First prestige wall at ~2-3 hours of active play

---

## Progression Pacing (Target: 1+ Month to "Beat")

### Phase Breakdown

| Phase | Real Time (Active) | Real Time (Casual) | Content |
|---|---|---|---|
| **Tutorial** | 5 min | 5 min | Buy, Cook, Sell basics |
| **Early Game** | 30 min - 2 hrs | 1-3 days | First upgrades, unlock recipes |
| **Core Loop** | 2-8 hrs | 3-7 days | Multiple recipes, bulk operations |
| **First Prestige** | 8-12 hrs | 1-2 weeks | Hit revenue wall, prestige for Stars |
| **Mid Game** | 1-3 days | 2-4 weeks | Managers, equipment, multiple prestiges |
| **Late Game** | 3-7 days | 1-2 months | Franchise system, deep optimization |
| **Endgame** | 1-2 weeks | 2-4 months | Super-prestige, completion goals |
| **"Beaten"** | ~1 month active | 3-6 months casual | All milestones, max prestige tier |

### How Each Phase Feels

**Tutorial (0-5 min):** "Oh, I click to buy chicken, click to cook, click to sell. The money goes up!"

**Early Game (5 min - 2 hrs):** "I can upgrade my oven speed! And there are recipes that sell for more. Let me figure out which recipe is most efficient..."

**Core Loop (2-8 hrs):** "I'm juggling 3 recipes, my cold storage is full, and I need another register. This is getting complex but satisfying."

**First Prestige (8-12 hrs):** "Progress is really slowing down. But if I prestige, I get Stars that make everything faster next time. Let me push a bit more..."

**Mid Game (post-first prestige):** "With Stars boosting me, I'm flying through early content again. Now I can afford managers! The shop runs itself while I focus on strategy."

**Late Game:** "I have a franchise now. Each location has its own managers and recipes. Optimizing across locations is a whole new puzzle."

**Endgame:** "Going for 100% completion. Need to unlock every recipe, max every upgrade, prestige enough times to afford the final tier..."

---

## Core Loop Interactions

### Bottleneck Management (Key Strategic Element)

At any time, one of the three stages will be the bottleneck:

- **Supply bottleneck:** Can cook/sell faster than you can buy -> upgrade cold storage, bulk buy, auto-supplier
- **Cooking bottleneck:** Have raw chicken and customers, but kitchen is slow -> upgrade ovens, add slots, choose faster recipes
- **Selling bottleneck:** Cooked chicken piling up, customers leaving -> add registers, upgrade service speed, marketing

This creates the strategic core: **identify your bottleneck and invest there**.

Inspired by **Idle Miner Tycoon** where balancing shaft/elevator/warehouse is the primary strategic decision.

---

## Key Design Principles

1. **Meaningful choices:** Players should regularly face "do I upgrade cooking or selling?" decisions
2. **Visible progress:** Numbers go up, new things unlock, the shop visually grows
3. **Natural walls:** Progression slows predictably, pointing toward prestige or new features
4. **Respect for time:** Active play is rewarded but idle play still progresses meaningfully
5. **Discovery:** New mechanics reveal themselves over days and weeks, not all at once
6. **No dead ends:** Every investment eventually pays off; no "trap" upgrades
