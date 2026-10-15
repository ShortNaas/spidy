# Project Progress Log

## Agent 1: Scaffold
- **What was built**:
  - Initialized Next.js 16 (App Router, TypeScript strict, Tailwind CSS v4, ESLint).
  - Installed and pinned exact versions of all stack dependencies: `@neondatabase/serverless`, `@observablehq/plot`, `cobe`, `d3-geo`, `d3-scale`, `d3-sankey`, `d3-shape`, `framer-motion`, `zod`, `vitest`, `@playwright/test`, `prettier`, and corresponding `@types/*`.
  - Configured Prettier, Vitest (`vitest.config.ts`), Playwright (`playwright.config.ts`), ESLint (`eslint.config.mjs` with `eslint-config-prettier`).
  - Set up full repo folder structure (`/app`, `/components/viz`, `/lib`, `/db`, `/tests`, `/scripts`).
  - Added `.env.example`, `.gitignore`, `DECISIONS.md`, `BLOCKERS.md`.
- **How verified**:
  - `pnpm lint`, `pnpm test`, and `pnpm build` ran and passed with zero errors or warnings.
- **What's next**:
  - Agent 2: Database (`db/schema.sql`, `lib/db.ts`, `scripts/migrate.ts`, `scripts/seed.ts`).

## Agent 2: Database
- **What was built**:
  - Created `db/schema.sql` and `db/migrations/0001_initial.sql` defining `sites`, `events`, and `daily_stats` with all required columns, constraints, and indexes. Strictly adheres to Hard Constraint 2 (zero raw IPs stored).
  - Implemented `lib/db.ts` exporting Neon client and custom client injection for flexible testing.
  - Implemented `scripts/migrate.ts` migration runner tracking executed migrations in `_migrations`.
  - Implemented `scripts/seed.ts` generating 30 days of realistic synthetic event data across 12 countries, 21 paths, 9 referrers with diurnal and weekend seasonality, plus pre-aggregated `daily_stats`.
  - Added unit test suite `tests/unit/database.test.ts` verifying schema columns, tables, and privacy constraints.
- **How verified**:
  - Unit tests run and pass. `pnpm lint`, `pnpm test`, and `pnpm build` pass with zero errors.
- **What's next**:
  - Agent 3: Tracker and Collector (`public/a.js`, `app/api/collect/route.ts`, `lib/bots.ts`, `lib/hash.ts`, `lib/validate.ts`).

