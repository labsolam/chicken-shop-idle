# Decision 009: Vercel Deployment

**Status:** Accepted
**Date:** 2026-02-15

## Context

The game was previously deployed to GitHub Pages via a GitHub Actions workflow (decision 007). Vercel offers a simpler deployment model with automatic preview deploys for branches, no workflow configuration, and serves at root `/` without needing a custom base path.

## Decision

- Deploy to Vercel instead of GitHub Pages.
- Remove the GitHub Actions deploy workflow (`.github/workflows/deploy.yml`).
- Remove the `/chicken-shop-idle/` base path from `vite.config.ts` — Vercel serves at `/`.
- Vercel auto-detects Vite projects and runs `npm run build` with `dist/` as the output directory.

## Rationale

- Vercel auto-detects the Vite framework and requires zero configuration.
- Preview deploys for every branch/PR provide a way to test changes before merging.
- Serving at root `/` simplifies asset paths and avoids the GitHub Pages base-path workaround.
- No GitHub Actions workflow to maintain.

## Consequences

- The Vercel project must be connected to the GitHub repository (via Vercel dashboard or `vercel` CLI).
- Decision 007 (GitHub Pages) is superseded.
- The game URL changes from `https://<owner>.github.io/chicken-shop-idle/` to the Vercel-assigned domain.
- GitHub Pages can be disabled in the repository settings.
