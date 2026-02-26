# Plan 008: Fix Strategy Doc Inconsistencies

**Status:** In Progress
**Date:** 2026-02-26

## Context

An audit of docs/strategy/006-comprehensive-implementation-strategy.md identified potential issues. After triage against the full doc set (002-006), most were already addressed in the detailed docs. This plan tracks the genuine fixes.

## Steps

- [x] Triage all 21 reported issues against docs 002-005
- [x] Fix broken markdown tables (blockquotes splitting table rows) in docs 003 and 005
- [x] Fix Stars formula cents/dollars ambiguity in doc 005 (add implementation note)
- [x] Add cross-references to Revenue Formula in doc 006 (tip, starPower, milestone sources)
- [x] Add migration note + doc references to Cost Curve Summary table in doc 006
- [x] Add cents conversion note to Prestige Math section in doc 006
- [x] Fix misleading pacing checkpoint (first upgrade is immediately affordable, not 30s)
- [x] Create this plan file (referenced in agents.md but missing)

## Triage Summary

Of 21 issues reported:
- **13** already addressed in docs 002-005 (agent reading all docs would find the answer)
- **4** valid but only relevant for Phase 5+ (BigInt, Super Manager costs, save versioning, test guidance)
- **4** genuinely needed fixing (Stars cents/dollars, revenue formula cross-refs, pacing, missing plan file)

## Outcome

All fixes applied. The strategy docs are now internally consistent and cross-referenced. An implementing agent reading docs 002-006 together has unambiguous specifications for Phases 1-4.
