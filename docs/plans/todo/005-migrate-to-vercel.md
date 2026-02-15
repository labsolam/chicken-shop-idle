# Plan 005: Migrate Deployment from GitHub Pages to Vercel

**Status:** In Progress

## Goal

Replace GitHub Pages deployment with Vercel.

## Steps

- [x] Remove GitHub Pages base path (`/chicken-shop-idle/`) from `vite.config.ts` — Vercel serves at `/`
- [x] Delete `.github/workflows/deploy.yml` (GitHub Actions deploy workflow)
- [x] Supersede decision 007 and create decision 009 for Vercel deployment
- [x] Update `agents.md` — Source Map, Design Decisions table
- [x] Run `npm run check` to verify nothing is broken
- [x] Move plan to `docs/plans/complete/` and update agents.md Plans table
