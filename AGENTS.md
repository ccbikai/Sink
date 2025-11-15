# Repository Guidelines

## Project Structure & Module Organization

Sink runs on Nuxt 4 and Cloudflare Workers. Application code lives in `app/` (pages, layouts, components, composables) while Worker entry points and API handlers are in `server/`. Zod schemas for payload validation are in `schemas/`, static assets in `public/`, and reference docs (deployment, API, configuration) in `docs/`. Automated scripts (`build-map.js`, `build-colo.js`) sit in `scripts/`; tests reside in `tests/` with `setup.ts`, `sink.spec.ts`, and utilities. Core configuration is centralized in `nuxt.config.ts`, `wrangler.jsonc`, `eslint.config.mjs`, and `vitest.config.ts`.

## Build, Test, and Development Commands

Use pnpm with Node 20.11+. Key commands:

- `pnpm dev` spins up the Nuxt dev server with local Worker bindings.
- `pnpm build` runs `nuxt build` plus the map generator to verify production bundles.
- `pnpm preview` executes `wrangler dev --var ...` for a full Worker preview.
- `pnpm lint` / `pnpm lint:fix` invoke ESLint (`@antfu/eslint-config`, `eslint-plugin-better-tailwindcss`).
- `pnpm test` triggers the Vitest suite.
- `pnpm deploy:worker` and `pnpm deploy:pages` publish to Cloudflare Workers or Pages respectively.

## Coding Style & Naming Conventions

Favor TypeScript with `<script setup>` single-file components, 2-space indentation, single quotes, and trailing commas. Components and composables use PascalCase (`app/components/StatsCard.vue`), route directories use kebab-case (`app/dashboard/links`), and functions/state use camelCase. Keep Tailwind or shadcn-vue tokens in reusable helpers under `app/lib` or `components/ui`; avoid magic values inline. Run `pnpm lint` before every commit to satisfy ESLint, Tailwind, and lint-staged hooks.

## Testing Guidelines

Vitest is configured in `vitest.config.ts` with `@cloudflare/vitest-pool-workers` handling Worker contexts. Place new specs in `tests/*.spec.ts`, reusing `tests/utils.ts` and `tests/setup.ts` for shared fixtures. Prioritize coverage for link creation flows, analytics counters, and permission boundaries. Mock Cloudflare KV and Analytics interactions—credentials must never be required for local runs. CI executes `pnpm test`, so ensure suites pass offline.

## Commit & Pull Request Guidelines

Git history follows Conventional Commits (`fix: adjust analytics filter`, `chore(release): bump version to v0.2.1`). Before pushing, confirm `pnpm lint && pnpm test` pass and attach screenshots or recordings for UI changes. PR descriptions should outline motivation, scope, related issues, and rollout considerations. When adding or renaming environment variables, update `docs/configuration.md` and mention new `.env` keys in the PR body.

## Configuration & Security Tips

Environment variables (e.g., `NUXT_SITE_TOKEN`, KV bindings, Analytics tokens) live in `.env`, while `wrangler.jsonc` defines Worker bindings. Use `pnpm preview` or `wrangler dev --var KEY:VALUE` to inject local secrets. Never commit real credentials—document placeholders in `docs/configuration.md` instead. If Cloudflare resources or binding names change, update both `wrangler` config and the corresponding references under `server/` to avoid deployment regressions.
