# Plan 010: Implement Phase 3 — Equipment & Staff

**Status:** Todo
**Date:** 2026-02-27
**Depends on:** Plan 009 (Phase 2 complete)

## Context

Phase 3 adds lateral progression through equipment and staff. These provide passive bonuses that interact with the recipe system and create build diversity. Players now make meaningful choices about where to invest.

**Read these docs before starting:**

1. `agents.md` — Source map, conventions, commands
2. `docs/strategy/003-upgrades-and-enhancements.md` — Equipment tables (Category 5), Staff tables (Category 6)
3. `docs/strategy/006-comprehensive-implementation-strategy.md` — Phase 3 summary, revenue formula with equipment/staff multipliers

## What Phase 3 Adds

1. **Kitchen Equipment** (7 items) — passive bonuses to cook speed and sale value
   - Basic Oven, Commercial Oven, Industrial Fryer, Charcoal Grill, Rotisserie Spit, Chef's Wok, Smoker
   - Each has max level (10-15), upgrade cost scaling (×2 to ×3 per level)
   - Some give recipe-type-specific bonuses (e.g., +15% value for fried items)
   - Rotisserie Spit and Smoker enable new recipe types

2. **Front-of-House Equipment** (6 items) — sell speed, customer attraction, tips
   - Cash Register, Display Case, Drive-Through Window, Neon Sign, Loyalty Card Printer, Catering Van
   - Drive-Through gives +1 sell slot

3. **Staff system** (6 staff members) — passive bonuses per level
   - Line Cook (+15% cook speed/lvl), Sous Chef (+10% recipe value/lvl)
   - Cashier (+15% sell speed/lvl), Marketing Intern (+10% customer rate/lvl)
   - Accountant (-5% upgrade costs/lvl, max -30%), Health Inspector (+5% all revenue/lvl)
   - Cost scaling: ×2.5 to ×3 per level, max level 6-10

4. **Equipment unlock progression** — tied to revenue milestones (doc 003 Feature Unlock Order #10+)

5. **Diminishing returns on long idle sessions** (doc 004) — after 8h continuous idle, earnings drop to 80%, then 60% after 10h

## What Phase 3 Does NOT Add

- Prestige / Stars (Phase 4)
- Equipment retention through prestige (Phase 4 Star upgrade)
- Staff retention through prestige (Phase 4 Star upgrade)
- Catering orders mechanic (deferred — van just provides batch value bonus)

## Steps

### Step 1: Expand GameState

- [ ] Add `equipment: Record<string, { owned: boolean; level: number }>` to GameState
- [ ] Add `staff: Record<string, { hired: boolean; level: number }>` to GameState
- [ ] Define equipment and staff data tables in new files
- [ ] Update `createInitialState()` and save/load

### Step 2: Equipment system

- [ ] Create `src/engine/equipment.ts` with equipment definitions, buy/upgrade functions
- [ ] Recipe-type tagging: each recipe gets a `types: string[]` field (fried, grilled, wings, etc.)
- [ ] Equipment bonuses apply conditionally based on active recipe type
- [ ] Integrate equipment multipliers into cook speed and sale value calculations in `tick()`
- [ ] Write tests for equipment purchase, upgrade, type-specific bonuses

### Step 3: Staff system

- [ ] Create `src/engine/staff.ts` with staff definitions, hire/upgrade functions
- [ ] Staff bonuses are always-on passive multipliers (not recipe-specific)
- [ ] Accountant reduces upgrade costs — integrate into `getUpgradeCost()`
- [ ] Integrate staff multipliers into revenue formula
- [ ] Write tests

### Step 4: Idle diminishing returns

- [ ] Track continuous idle time (reset on any click)
- [ ] After 8h: linear ramp to 80% over 2h; after 10h: cap at 60%
- [ ] Write tests

### Step 5: UI updates

- [ ] Equipment and Staff tabs in upgrade panel
- [ ] Show recipe-type bonuses clearly
- [ ] Equipment/staff unlock conditions displayed for locked items
- [ ] Integrate into existing tabbed interface

### Step 6: Run full check

- [ ] `npm run check` and `npm run test:e2e` — fix any failures
