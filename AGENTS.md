# Repository Guidelines

## Project Structure & Module Organization

Sink is a Nuxt 4 app: Vue single-file components live in `app/`, UI primitives under `app/components/ui`, dashboards under `app/components/dashboard`, and composables in `app/composables`. Serverless handlers reside in `server/api` with shared helpers in `server/utils`, while request schemas live in `schemas/`. Static assets ship from `public/`, tests sit in `tests/`, and reference material is in `docs/`.

## Build, Test, and Development Commands

- `pnpm dev` launches the Nuxt dev server with hot module reload.
- `pnpm build` generates the production worker bundle (`dist/`).
- `pnpm preview` or `pnpm wrangler dev` (see `package.json`) runs the built worker locally.
- `pnpm test` executes the Vitest suite, including Cloudflare Worker pools.
- `pnpm lint` / `pnpm lint:fix` apply the ESLint stack configured in `eslint.config.mjs`.
- `pnpm build:map` and `pnpm build:colo` regenerate geographic datasets consumed by analytics maps.

## Coding Style & Naming Conventions

Write TypeScript with Vue 3 Composition API patterns. Follow the ESLint config (`@antfu` + Nuxt presets) and Tailwind utility classes; run `pnpm lint` before committing. Use 2-space indentation, PascalCase for components (`Header.vue`), camelCase for variables and composables, and kebab-case for CSS classes. Store reusable logic in `/app/utils` or `/app/composables`, preferring named exports.

## Testing Guidelines

Tests use Vitest (`vitest.config.ts`) with helpers in `tests/utils.ts`; import from there for mock environments. Co-locate API tests under `tests/api/*` named `<feature>.spec.ts`. Cover link creation, verification, and analytics with success and failure assertions. Run `pnpm test --runInBand` when debugging worker-specific behavior.

## Commit & Pull Request Guidelines

Commits follow Conventional Commit prefixes (`feat`, `fix`, `chore`, `style`, etc.), as seen in recent history (`fix: Update button styles…`). Keep scopes meaningful (`feat(dashboard): …`) and limit each commit to one logical change. Pull requests must summarize the change, link related issues, list tests or screenshots for user-facing work, and call out environment or Wrangler updates plus any dataset rebuilds.

## Security & Configuration Tips

Use `.env.example` as the template for required Cloudflare credentials (`NUXT_CF_ACCOUNT_ID`, `NUXT_CF_API_TOKEN`, `NUXT_DATASET`, `NUXT_SITE_TOKEN`). Never commit secrets or worker tokens. Leverage Zod validators in `schemas/` to guard inputs, apply rate limiting when exposing new endpoints, and configure KV or analytics IDs through environment variables rather than hardcoding values.
