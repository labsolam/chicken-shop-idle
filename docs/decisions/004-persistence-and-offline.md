# Decision 004: localStorage Persistence and Offline Earnings Cap

**Status:** Accepted
**Date:** 2026-02-14

## Context

An idle game must preserve player progress across browser sessions and reward players who return after being away.

## Decision

- Game state is serialized to `localStorage` under the key `chicken-shop-idle-save`.
- Auto-save runs every 30 seconds and on `beforeunload`.
- On load, if a save exists it is deserialized and validated; invalid saves are discarded and a fresh state is created.
- Offline earnings are calculated on return: elapsed time since `lastUpdateTimestamp` is fed through `tick`, and produced chickens are auto-sold.
- Offline time is capped at **8 hours** (`MAX_OFFLINE_MS = 8 * 60 * 60 * 1000`). Any time beyond that is ignored.

## Rationale

- `localStorage` is the simplest persistence option — no backend, no auth, works offline.
- Auto-save + `beforeunload` minimizes data loss from crashes or accidental tab closes.
- The 8-hour cap prevents returning players from receiving unreasonably large windfalls that would break game balance.
- Because the engine is a pure state machine (Decision 003), offline earnings are just `tick(state, clampedElapsedMs)` — no special-case logic needed.

## Consequences

- Progress is per-browser, per-device. Clearing browser data loses the save.
- The 8-hour cap value lives in `src/engine/offline.ts` and can be tuned as game balance evolves.
- A welcome-back banner shows offline earnings so the player knows what they gained.
