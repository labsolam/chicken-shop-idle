# Decision 007: GitHub Pages Deployment on Merge to Main

**Status:** Superseded by 009
**Date:** 2026-02-14

## Context

The game needs to be publicly accessible without managing hosting infrastructure.

## Decision

- A GitHub Actions workflow (`.github/workflows/deploy.yml`) deploys to GitHub Pages on every push to `main`.
- The workflow builds the project (`npm run build`) and uploads the `dist/` folder as a Pages artifact.
- Deployment uses `actions/deploy-pages@v4` with the Pages environment.
- The workflow can also be triggered manually via `workflow_dispatch`.

## Rationale

- GitHub Pages is free, zero-ops, and tightly integrated with the repository.
- Deploying only from `main` ensures that only reviewed, merged code reaches production.
- The build step (`npm ci && npm run build`) guarantees the deployed artifact is a clean production build, not a dev build.
- Manual dispatch allows re-deploying without a code change if needed.

## Consequences

- The repository must have GitHub Pages enabled (Settings > Pages > Source: GitHub Actions).
- The game is served at `https://<owner>.github.io/chicken-shop-idle/`.
- Vite's `base` config must match the repository name for asset paths to resolve correctly.
- Feature branches are not deployed — only `main`.
