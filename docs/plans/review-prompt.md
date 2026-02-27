# Plan Review Prompt

Copy the prompt below and give it to a fresh agent.

---

## Prompt

You are reviewing the implementation plans for Chicken Shop Idle, a browser-based idle game. Your job is to find problems — gaps, contradictions, missing steps, incorrect formulas, wrong file paths, scope creep, and anything that would block or confuse the implementing agent.

### Setup

1. Read `agents.md` first — it's the project entry point.
2. Read the current source code to understand what exists today:
   - `src/types/game-state.ts` — current GameState shape
   - `src/engine/buy.ts` — current upgrade system and formulas
   - `src/engine/tick.ts` — current tick processing
   - `src/engine/buy-chicken.ts` — current buy action
   - `src/engine/click.ts` — current cook action
   - `src/engine/sell.ts` — current sell action
   - `src/engine/save.ts` — current save/load
   - `src/engine/offline.ts` — current offline earnings (no-op)
3. Read all 5 strategy docs (the source of truth for game design):
   - `docs/strategy/002-core-gameplay-loop.md`
   - `docs/strategy/003-upgrades-and-enhancements.md`
   - `docs/strategy/004-idle-and-automation.md`
   - `docs/strategy/005-prestige-and-endgame.md`
   - `docs/strategy/006-comprehensive-implementation-strategy.md`
4. Read all 7 implementation plans (the things you're reviewing):
   - `docs/plans/todo/008-phase1-enhanced-core-loop.md`
   - `docs/plans/todo/009-phase2-managers-and-automation.md`
   - `docs/plans/todo/010-phase3-equipment-and-staff.md`
   - `docs/plans/todo/011-phase4-prestige-stars.md`
   - `docs/plans/todo/012-phase5-super-managers.md`
   - `docs/plans/todo/013-phase6-prestige-crowns-franchise.md`
   - `docs/plans/todo/014-phase7-prestige-diamonds-endgame.md`

### Review Checklist

For **each plan** (008-014), check:

#### Accuracy
- [ ] Do all formulas match the strategy docs exactly? (cost curves, time curves, multiplier tables, prestige formulas, unit conversions)
- [ ] Are all dollar values correctly noted as needing cents conversion?
- [ ] Do level caps match the strategy doc tables?
- [ ] Do unlock conditions match doc 003's Feature Unlock Order (the canonical source)?

#### Completeness
- [ ] Does the plan cover every feature listed for that phase in doc 006?
- [ ] Are there GameState fields mentioned in the strategy docs that the plan forgets to add?
- [ ] Does the plan include save/load updates for new fields?
- [ ] Does the plan include test steps for every new engine function?
- [ ] Does the plan include UI updates?
- [ ] Does the plan include e2e test updates?

#### Scope
- [ ] Does the plan accidentally include features from a later phase? (e.g., plan 008 should NOT include managers)
- [ ] Does the "What Phase N Does NOT Add" section correctly list all deferred features?
- [ ] Are features that span multiple phases clearly assigned to ONE plan? (no duplicates, no orphans)

#### Dependencies
- [ ] Is the dependency chain correct? (each plan lists what it depends on)
- [ ] Are there implicit dependencies the plan doesn't mention? (e.g., a formula that needs a field added in a prior phase)
- [ ] Within each plan, are the steps in the right order? (e.g., GameState changes before engine functions that use them)

#### Consistency Across Plans
- [ ] Is every feature from doc 006 Phases 1-7 covered by exactly one plan?
- [ ] Do any two plans claim to implement the same feature?
- [ ] If plan N says "defer to Phase M," does plan M actually include it?
- [ ] Are the "What Phase N Does NOT Add" lists consistent with what later plans DO add?
- [ ] Do the plans collectively cover the full revenue formula from doc 006? (every multiplier term should be added in some plan)

#### Implementability
- [ ] Could an agent follow this plan without reading the strategy docs? (plans should be self-contained enough, with doc references for deep dives)
- [ ] Are file paths correct? (check against the Source Map in agents.md)
- [ ] Are new file paths reasonable? (follow existing conventions: engine code in `src/engine/`, types in `src/types/`)
- [ ] Are there ambiguous instructions that could be interpreted two different ways?

### Output Format

Produce a single report with this structure:

```
## Plan 008: Phase 1 — Enhanced Core Loop
### Issues Found
1. [SEVERITY: high/medium/low] Description of issue
   - What the plan says: ...
   - What the strategy doc says: ...
   - Suggested fix: ...

### No Issues (if clean)
Plan 008 looks correct and complete.

## Plan 009: Phase 2 — Managers & Automation
### Issues Found
...

(repeat for each plan)

## Cross-Plan Issues
1. ...

## Summary
- Total issues found: N
- High severity: N
- Plans that need revision: ...
- Plans that are ready to implement: ...
```

Severity guide:
- **High**: Would cause incorrect game behavior, data loss, or block implementation (wrong formula, missing state field, broken dependency)
- **Medium**: Would cause confusion or extra work but is recoverable (ambiguous instruction, missing test step, unclear scope boundary)
- **Low**: Cosmetic or style issue (inconsistent formatting, unnecessary detail, minor wording)

**Do NOT make any changes to files.** This is a read-only review. Output your report as text.
