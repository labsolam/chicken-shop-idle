# Strategy vs Code Audit

**Date:** 2026-03-17
**Scope:** Phase 1 (Plan 008) + Phase 2 (Plan 009) — strategy docs vs actual implementation

## Summary

Cross-referenced all 6 strategy documents and 2 completed phase plans against the full source code. Found **3 bugs** requiring fixes. All other mechanics, formulas, and features match the strategy.

## Bugs Found

### Bug 1: Tips Cost Table Uses Wrong Scaling Factor

**Strategy (docs/strategy/003-upgrades-and-enhancements.md):**
Tips costs should follow formula `$5K × 2.5^level`, producing:
$5K, $12.5K, $31.25K, $78.1K, $195.3K, $488.3K, $1.22M, $3.05M, $7.63M, $19.1M

**Code (src/engine/buy.ts:43-54):**
Uses a hand-tuned lookup table with ~5× scaling:
$5K, $25K, $125K, $600K, $3M, $15M, $75M, $400M, $2B, $5B

**Impact:** Tips are 5–260× more expensive than designed at higher levels. This breaks late-game balance — tips become unaffordable long after they should be, reducing the value of the tips system and slowing progression.

**Fix:** Replace lookup table with formula-based costs: `floor(500_000 × 2.5^level)` cents.

---

### Bug 2: Click Bonuses Don't Count Toward Revenue

**Strategy (docs/plans/complete/009-phase2-managers-and-automation.md):**
All earned money should count as revenue for milestone tracking and offline rate calculations.

**Code (src/engine/managers.ts:167-195):**
`applyClickBonus()` adds bonus to `money` but does NOT increment `totalRevenueCents`.

**Impact:** Click bonuses are "invisible" to the milestone system and offline earnings tracker. Players who actively click while managers run miss out on milestone progress they should be earning.

**Fix:** Add `totalRevenueCents: state.totalRevenueCents + bonus` to the return object.

---

### Bug 3: Offline Earnings Don't Count Toward Revenue

**Strategy (docs/strategy/004-idle-and-automation.md):**
Offline earnings are real revenue that should trigger milestones.

**Code (src/engine/offline.ts:56-61):**
`calculateOfflineEarnings()` returns updated state with `money` incremented but `totalRevenueCents` unchanged.

**Impact:** Players who earn significant offline income never trigger revenue milestones from it. This creates a loophole where large offline sessions don't advance progression, and the offline earnings rate doesn't compound.

**Fix:** Add `totalRevenueCents: state.totalRevenueCents + moneyEarned` to the returned state.

---

## Verified Correct (No Issues)

| Area | Strategy Spec | Code Match |
|------|--------------|------------|
| Milestone revenue thresholds | $500 → $50T (13 levels) | ✓ Exact match |
| Milestone speed multipliers | Applied to cook/sell times | ✓ Applied in tick() via division |
| Sale value formula | base × upgrade × milestone | ✓ Correct composition in tick() |
| Tick processing order | Sell → Cook → Managers → Tracker → Milestones | ✓ Correct |
| Manager speed formula | `base / (1 + speedBonus)` (reciprocal) | ✓ Decision 013 |
| Manager upgrade costs | `hireCost × 5^level` | ✓ Exact match |
| Recipe system | 8 recipes, correct unlock conditions | ✓ All values match |
| Bulk operations | x1, x5, x10, x25 | ✓ All wired |
| Bulk cook unlock | 2,500 chickens sold milestone | ✓ Correct |
| Cold storage capacity | 10 → 25,000 over 10 levels | ✓ Lookup table matches |
| Cooking slots | 1 → 30 over 10 levels | ✓ Lookup table matches |
| Selling registers | 1 → 30 over 10 levels | ✓ Lookup table matches |
| Cook speed formula | `baseTime × 0.85^level` (min 0.1s) | ✓ Exact match |
| Sell speed formula | `10 × 0.85^level` (min 0.1s) | ✓ Exact match |
| Revenue tracker window | 60 seconds | ✓ 60,000ms |
| Offline efficiency | 30% | ✓ |
| Offline max duration | 4 hours | ✓ 14,400,000ms |
| Manager intervals | Buyer 3s, Cook 2s, Sell 2s | ✓ |
| Manager hire costs | Buyer $10K, Cook $5K, Sell $5K | ✓ |
| Manager unlock thresholds | Buyer $50K, Cook $25K, Sell $25K | ✓ |
| Feature unlock conditions | All 14 features | ✓ Correct thresholds |
| Number formatting | $K/$M/$B/$T + scientific | ✓ |
| Auto-save interval | 30 seconds | ✓ |
| Starting money | $5.00 (500 cents) | ✓ |
| Raw chicken cost | $0.25 (25 cents) | ✓ |
