# Decision 001: Tech Stack

**Status:** Accepted
**Date:** 2026-02-13

## Context

Starting a new idle game from scratch. Needs to be agent-maintainable, testable, and simple.

## Decision

- **Language:** TypeScript (strict mode)
- **Bundler:** Vite
- **Tests:** Vitest
- **UI:** Vanilla DOM (no framework)
- **Architecture:** Pure state machine — engine functions are pure, UI is a thin rendering layer

## Rationale

- TypeScript strict mode: types serve as documentation. `noUncheckedIndexedAccess` catches common bugs.
- Vite: zero-config TS support, fast HMR for development.
- Vitest: native TS, same config as Vite, fast execution.
- No framework: an idle game's UI is simple enough that a framework adds complexity without benefit. Can revisit if UI grows.
- Pure state machine: enables TDD without mocking. Game logic is fully deterministic and testable.

## Consequences

- All game logic must remain pure (no side effects in engine/).
- UI code in ui/ is the only place that touches the DOM.
- Adding a framework later would only require replacing ui/, not engine/.
