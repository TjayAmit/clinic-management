---
name: project-cicd-setup
description: CI/CD pipeline design decisions for the clinic-management Laravel + React project
metadata:
  type: project
---

Phase 1 CI pipeline established (push-to-build, no deployment yet).

**Key decisions:**

- Three jobs: `php` (Pint lint + Pest), `frontend` (ESLint + tsc), `docker` (build+push gated on both)
- SQLite is the test database — no MySQL service container needed in CI. `phpunit.xml` sets `DB_DATABASE=testing`; `touch database/database.sqlite` is enough.
- GHCR (`ghcr.io`) used as registry; auth via built-in `GITHUB_TOKEN` — no extra secrets required for phase 1.
- Docker image only pushed on `push` events (not PRs from forks), but Dockerfile is still built on PRs to validate it.
- Image tagged with short git SHA (`sha-XXXXXXX`) + `latest` (master only).
- Existing workflows `lint.yml` and `tests.yml` remain in place — `ci.yml` is additive and unified.

**Dockerfile structure:**
- Stage 1: `composer:2.8` — prod deps only (`--no-dev`)
- Stage 2: `node:22-alpine` — `npm ci` + `vite build`
- Stage 3: `php:8.3-fpm-alpine` — production image with compiled assets baked in
- PHP config files live in `docker/php/` (php-production.ini, www.conf)

**Why:** Existing `tests.yml` used `actions/checkout@v6` (doesn't exist — typo). New workflow uses `@v4`.

**How to apply:** When extending CI (adding deployment, staging, etc.), build on the `ci.yml` pattern with `needs: [php, frontend, docker]` gates.
