# Decision 002: Money Stored as Integer Cents

**Status:** Accepted
**Date:** 2026-02-13

## Context

Idle games involve large numbers and frequent arithmetic. Floating point causes display bugs (e.g. $1.0000000001).

## Decision

Store all monetary values as integer cents. 100 = $1.00.

## Rationale

- Integer arithmetic is exact.
- Avoids floating point display artifacts.
- Formatting to dollars is a UI concern handled in render.ts.

## Consequences

- All engine code works in cents.
- UI must convert cents to display strings.
- If sub-cent precision is needed later, multiply by a larger factor (e.g. 10000 = $1.00).
