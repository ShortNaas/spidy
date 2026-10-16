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

## Agent 5: Visualizations
- **What was built**:
  - Implemented all 8 required visual components in `components/viz/`:
    1. `GlobeLive.tsx`: 3D interactive rotating globe built with `cobe` WebGL canvas, pulsing beacons from recent geo-coordinates, responsive resizing, and drag controls.
    2. `FlowSankey.tsx`: Visualized user journey transitions (Referrer → Landing → Next Page) using `d3-sankey`, featuring interactive full-path hover highlighting.
    3. `CalendarHeatmap.tsx`: 12-month GitHub-style daily activity heatmap with 5-stage sequential cyan/viridis color gradient and date tooltip.
    4. `HourWeekdayHeatmap.tsx`: 7x24 diurnal matrix grid revealing peak activity hours across days of the week.
    5. `PageStream.tsx`: Smooth silhouette streamgraph using `d3-shape` stack/area curves showing top 8 pages over time.
    6. `PulseLive.tsx`: Realtime ticking visitor counter and 30-minute minute-by-minute sparkline with pulsing indicator.
    7. `WorldChoropleth.tsx`: Natural Earth geographic map projection rendered with `d3-geo`, country density color scale, and hover tooltips.
    8. `KpiStrip.tsx`: Key metrics cards (Pageviews, Visitors, Bounce Proxy, Top Country) with Framer Motion entry animations and delta comparison badges.
  - Built interactive preview gallery `/viz-gallery` with loading skeleton toggle and seeded datasets.
  - Added Playwright e2e test suite `tests/e2e/viz-gallery.spec.ts` capturing 8 component screenshots to `test-results/screenshots/`.
- **How verified**:
  - All 8 Playwright screenshots generated successfully.
  - All 29 unit tests passed. `pnpm lint`, `pnpm test`, and `pnpm build` passed with zero errors or warnings.
- **What's next**:
  - Agent 6: Dashboard & Authentication (`middleware.ts`, `app/login/page.tsx`, `app/(dashboard)/page.tsx`, `app/(dashboard)/sites/[id]/page.tsx`).

## Agent 6: Dashboard & Authentication
- **What was built**:
  - Implemented `lib/auth.ts` with constant-time password verification using Web Crypto API (`crypto.subtle`) and signed HMAC-SHA256 session tokens compatible with Edge Runtime.
  - Implemented `middleware.ts` protecting dashboard routes and API endpoints, redirecting unauthenticated visitors to `/login?next=...` while allowing public access to `/api/collect`, `/api/auth`, `/a.js`, `/world.geojson`, and `/viz-gallery`.
  - Implemented `/login/page.tsx` with high-contrast dark aesthetic, accessible form inputs, and testable error displays.
  - Implemented authentication route `/api/auth/route.ts` setting signed httpOnly, Secure, SameSite=Lax session cookies.
  - Composed responsive overview and site-specific dashboard layouts in `app/(dashboard)/layout.tsx`, `app/(dashboard)/page.tsx`, and `app/(dashboard)/sites/[id]/page.tsx`.
  - Built `components/dashboard/Header.tsx` with interactive site switcher dropdown, date range presets (24h, 7d, 30d, 12mo), and logout button.
  - Built `components/dashboard/DashboardClient.tsx` bringing all 8 visual components together alongside summary breakdown tables and 5-second live polling.
  - Added unit test suite `tests/unit/auth.test.ts` (6 tests) and Playwright E2E test suite `tests/e2e/auth-dashboard.spec.ts` (3 tests).
- **How verified**:
  - Unit tests in `tests/unit/auth.test.ts` passed (6/6).
  - Playwright E2E tests in `tests/e2e/auth-dashboard.spec.ts` passed (3/3), verifying unauthenticated redirect, bad password alert, and successful dashboard unlock.
  - `pnpm lint`, `pnpm test`, and `pnpm build` passed with zero errors or warnings.
- **What's next**:
  - Agent 7: Rollup and Retention (`/api/cron/rollup/route.ts`, `vercel.json`).

## Agent 7: Rollup and Retention
- **What was built**:
  - Implemented `lib/rollup.ts` executing idempotent daily rollups aggregating yesterday's events into `daily_stats` using `ON CONFLICT (day, site_id, path, referrer, country, device) DO UPDATE SET views = EXCLUDED.views, visitors = EXCLUDED.visitors`.
  - Added retention policy deleting raw events older than 90 days (`DELETE FROM events WHERE ts < (CURRENT_DATE - INTERVAL '90 days')`).
  - Implemented `/api/cron/rollup` route (supporting `GET` and `POST`) secured by constant-time verification against `Authorization: Bearer CRON_SECRET`.
  - Configured `vercel.json` with Vercel Cron schedule (`0 3 * * *`, daily at 03:00 UTC).
  - Added unit test suite `tests/unit/rollup.test.ts` (9 tests) verifying authorization checks, idempotent multi-run stability, date format parsing, and 90-day retention query generation.
- **How verified**:
  - Unit tests in `tests/unit/rollup.test.ts` passed (9/9).
  - All 44 unit tests passed (`pnpm test`).
  - Playwright E2E tests passed.
  - `pnpm lint` and `pnpm build` passed with zero errors or warnings.
- **What's next**:
  - Agent 8: Hardening and Deploy (`next.config.ts` security headers & neutral script rewrites, `README.md`).

## Agent 8: Hardening and Deploy
- **What was built**:
  - Configured neutral path rewrites in `next.config.ts` (`/s.js` -> `/a.js`, `/api/e` -> `/api/collect`) with configurable `TRACKER_PATH` and `COLLECTOR_PATH` environment variables for adblock resilience.
  - Implemented strict input payload size limits (16 KB max) on `/api/collect` returning HTTP 413 Payload Too Large.
  - Added enterprise-grade security headers in `next.config.ts`: Content-Security-Policy (CSP), X-Frame-Options (DENY), X-Content-Type-Options (nosniff), Referrer-Policy (strict-origin-when-cross-origin), and Permissions-Policy.
  - Configured public CORS and caching headers for tracker scripts (`public, max-age=86400, stale-while-revalidate=604800`).
  - Authored comprehensive `README.md` documenting architecture, privacy guarantees, setup guide, embed snippets, environment variables, and cron schedule.
  - Updated `DECISIONS.md` documenting Web Crypto usage, idempotent upserts, and neutral path rewrites.
- **How verified**:
  - All 46 Vitest unit tests passed (`pnpm test`).
  - Playwright E2E tests for authentication and visual gallery passed (`pnpm test:e2e`).
  - ESLint passed with 0 errors or warnings (`pnpm lint`).
  - Next.js production build succeeded with Turbopack and dynamic route rendering (`pnpm build`).
- **Status**: ALL 8 AGENT ROLES COMPLETE.
