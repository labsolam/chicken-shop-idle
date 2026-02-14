# Plan 002: Update agents.md with Missing Items

**Status:** In Progress
**Date:** 2026-02-14

## Goal

Add undocumented config/build files and commands to agents.md so the navigation map accurately reflects the full codebase.

## Changes

### 1. Add missing entries to Source Map table

| Path | Purpose |
| --- | --- |
| `tsconfig.json` | TypeScript config — strict mode, path aliases (@engine, @ui, @types) |
| `vite.config.ts` | Vite build config — sets `/chicken-shop-idle/` base for GitHub Pages |
| `vitest.config.ts` | Vitest config — path aliases, test include pattern |
| `index.html` | HTML entry point — game UI shell, inline styles, module script |
| `.github/workflows/deploy.yml` | GitHub Actions — build + deploy to GitHub Pages on push to main |

### 2. Add missing entry to Commands table

| Action | Command |
| --- | --- |
| Prepare (Husky) | `npm run prepare` |

## Steps

- [x] Audit codebase against current agents.md
- [ ] Add 5 config/build files to Source Map
- [ ] Add `prepare` script to Commands table
- [ ] Update Plans table to reference this plan
- [ ] Commit changes
