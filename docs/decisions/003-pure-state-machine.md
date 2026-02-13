# Decision 003: Pure State Machine Architecture

**Status:** Accepted
**Date:** 2026-02-13

## Context

Need an architecture that is easy to test, reason about, and extend for an idle game.

## Decision

The game engine is a pure state machine:
- `tick(state, deltaMs) => newState` — advances time
- `sellChickens(state) => newState` — player action
- All functions in `src/engine/` are pure: no side effects, no DOM, no timers.

## Rationale

- Pure functions are trivially testable (no mocking needed).
- State is serializable (enables save/load for free).
- Offline progress is just `tick(state, offlineDurationMs)`.
- Agents can understand behavior by reading function signatures and tests.

## Consequences

- `src/engine/` must never import from `src/ui/`.
- The game loop in `main.ts` is the only place that manages time and mutable state.
- New features follow the pattern: write pure function, test it, wire it into main.ts.
