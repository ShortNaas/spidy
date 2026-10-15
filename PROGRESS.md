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

## Agent 3: Tracker and Collector
- **What was built**:
  - Created cookieless, zero-dependency tracker script `public/a.js` (845 bytes minified, well under 1 KB limit). Supports initial pageview, SPA `pushState` and `popstate`, `sendBeacon` with `fetch` fallback, and honors Do Not Track (`navigator.doNotTrack === '1'`).
  - Created bot rejection utility `lib/bots.ts` blocking crawlers, scrapers, and headless tools.
  - Implemented privacy-first visitor hashing in `lib/hash.ts` via `sha256(SALT + utcDate + ip + ua).slice(0, 16)`, rotating strictly at UTC midnight.
  - Implemented schema validation, path & referrer stripping, and UA device/browser/OS parser in `lib/validate.ts`.
  - Built high-performance `/api/collect/route.ts` with CORS handling, DNT verification, rate limiting, and geo header ingestion.
  - Added unit test suite `tests/unit/tracker-collector.test.ts` testing hash rotation, bot filtering, path/referrer cleaning, script size, and verifying that raw IP is never stored.
- **How verified**:
  - All 18 unit tests passed, lint passed, Next.js build compiled `/api/collect` dynamically.
- **What's next**:
  - Agent 4: Query Layer (`lib/queries.ts`, `/api/stats/[metric]/route.ts`, `/api/live/route.ts`).

## Agent 4: Query Layer
- **What was built**:
  - Implemented typed SQL analytics query functions in `lib/queries.ts`: `getTimeseries`, `getTopPages`, `getTopReferrers`, `getTopCountries`, `getDevices`, `getBrowsers`, `getHourWeekdayMatrix`, `getSankeyFlows`, `getPageStream`, `getLiveEvents`, and `getKpis`.
  - Added cutoff optimization: reads from pre-aggregated `daily_stats` table for date ranges older than 2 days, and `events` table for recent data.
  - Implemented Zod-validated `/api/stats/[metric]/route.ts` supporting metrics (`timeseries`, `pages`, `referrers`, `countries`, `devices`, `browsers`, `hour-weekday`, `flows`, `stream`, `kpis`, `live`, `all`).
  - Implemented `/api/live/route.ts` supporting both standard JSON polling and SSE (Server-Sent Events) live streaming for the 30-minute realtime window.
  - Added unit test suite `tests/unit/queries.test.ts` covering all SQL shapes, calculations, deltas, and API validation.
- **How verified**:
  - All 29 unit tests passed, lint passed, Next.js build compiled `/api/stats/[metric]` and `/api/live` dynamically.
- **What's next**:
  - Agent 5: Visualizations (`components/viz/*` for all 8 components and `/viz-gallery`).



