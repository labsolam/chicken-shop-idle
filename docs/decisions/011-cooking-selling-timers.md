# Decision 011: Cooking and Selling Timers

**Status:** Accepted
**Date:** 2026-02-16

## Context

The game's Buy → Cook → Sell flow was instant — clicking Cook or Sell immediately converted chickens. This made the game feel trivial with no pacing. Adding timers to cooking and selling creates meaningful waiting and decision-making.

## Decision

Cooking and selling are now timed actions:

- **Cooking:** 10 seconds per chicken (base, reduced by cook speed upgrades)
- **Selling:** 10 seconds per chicken (base)

Clicking "Cook" queues a raw chicken for cooking. Clicking "Sell" queues all ready chickens for selling. The `tick()` function advances timers each frame and completes actions when their timer elapses.

State tracks: `cookingCount`, `cookingElapsedMs`, `sellingCount`, `sellingElapsedMs`, `sellTimeSeconds`.

The game loop uses `requestAnimationFrame` to call `tick()` every frame.

## Rationale

- Timers add pacing and strategic depth (queue management, upgrade decisions)
- The tick-based approach keeps engine functions pure — no side effects, fully testable
- Queue model allows multiple chickens to be queued, with time carrying over between completions
- `requestAnimationFrame` provides smooth UI updates without fixed intervals

## Consequences

- The `tick()` function is no longer a no-op — it now processes cooking and selling
- `clickCook()` queues instead of instant-converting; `sellChickens()` queues instead of instant-selling
- `cookTimeSeconds` default changed from 5 to 10
- E2e tests now require waiting for timers (15s timeouts)
- Old saves without timer fields are backward-compatible (default to 0 / 10)
