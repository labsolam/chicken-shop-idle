# Decision 004: Static Analysis and Formatting

**Status:** Accepted
**Date:** 2026-02-13

## Context

Need automated code quality enforcement that runs before every commit, catching issues before they reach the repo.

## Decision

- **Linter:** ESLint v9 (flat config) with typescript-eslint strict preset
- **Formatter:** Prettier
- **Pre-commit enforcement:** Husky + lint-staged
- **Integration:** eslint-config-prettier disables ESLint rules that conflict with Prettier

## Pre-commit Pipeline

On every `git commit`, Husky triggers:

1. `lint-staged` — runs Prettier + ESLint (with auto-fix) on staged files only
2. `npm test` — runs the full test suite

A commit is blocked if any step fails.

## Key ESLint Rules

- `@typescript-eslint/explicit-function-return-type: error` — all functions must declare return types (aids agent comprehension)
- `@typescript-eslint/no-unused-vars: error` — with `argsIgnorePattern: ^_` for intentionally unused params
- typescript-eslint strict preset — catches common type safety issues

## Consequences

- Every commit is guaranteed to be formatted, linted, and tested.
- Agents writing code must ensure `explicit-function-return-type` compliance.
- Format-on-save in editors is optional since lint-staged auto-fixes on commit.
