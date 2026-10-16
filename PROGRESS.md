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

## Post-Launch: Usr-Test Fixes & Ponytail Audit Optimization

- **What was fixed**:
  - **Usr-Test Issue 1 & 4 (Rendering 500 Error / Postgres 42803)**: In `lib/queries.ts`, fixed SQL query generation where dynamic interval interpolation in `date_trunc` caused PostgreSQL error 42803 (`column "events.ts" must appear in the GROUP BY clause or be used in an aggregate function`). Rewrote timeseries queries with static intervals and `GROUP BY 1 ORDER BY 1 ASC`.
  - **Usr-Test Issue 2 (Dummy Data Expansion)**: In `scripts/seed.ts`, expanded synthetic data generation to 365 days of `daily_stats` (12,434 rows), 60 days of granular raw `events` (10,935 rows), and 40 live beacons in the last 30 minutes across 11 countries and 21 paths, fully populating the 12-month calendar heatmap, Sankey diagrams, and live streamgraphs.
  - **Usr-Test Issue 3 (Globe Rotation State)**: In `components/viz/GlobeLive.tsx`, replaced flawed radian/pixel subtraction with persistent `phiRef = useRef(0)` and `pointerStartRef = useRef<number | null>(null)` with `setPointerCapture`. Subsequent drags continue seamlessly from exact coordinates without snapping back.
  - **Ponytail Audit Removals & Simplifications**:
    - Removed unused `@observablehq/plot` (-31 packages).
    - Removed redundant `@neon/config` and `@neon/env` (-29 packages).
    - Replaced `framer-motion` in `components/viz/KpiStrip.tsx` with native Tailwind CSS transitions and removed `framer-motion` dependency (-3 packages).
    - Collapsed 45 individual regex patterns and array iteration in `lib/bots.ts` into a single combined regex literal (-51 lines).
    - Eliminated unnecessary database client swapping abstraction in `lib/db.ts` in favor of direct module-level `neon` export (-22 lines).
    - Replaced per-call S3 client instantiation in `lib/storage.ts` with cached module-scoped `s3Client`.
    - Simplified collector JSON parsing in `app/api/collect/route.ts` (-20 lines).
    - Implemented Edge Runtime-safe Web Crypto API in `lib/auth.ts` avoiding `node:crypto` and `Buffer` imports for Next.js Edge proxy compatibility.
- **How verified**:
  - Vitest unit tests: 53/53 passed (`pnpm test`).
  - Playwright E2E tests: 4/4 passed (`pnpm test:e2e`), capturing all 8 visual component screenshots.
  - ESLint: 0 errors, 0 warnings (`pnpm lint`).
  - Prettier: 100% compliant (`pnpm format`).
  - Production build: `pnpm build` passed with 0 errors.
  - Production server runtime: `pnpm start` booted cleanly (`Ready in 251ms`), tested `/api/auth` login and `/api/stats/all?siteId=spidy-demo` end-to-end with HTTP 200 responses and 0 server errors.

## Agent 9: Accounts Backend

- **What was built**:
  - Authored and applied migration `db/migrations/0002_accounts.sql` provisioning `users`, `sessions`, `auth_attempts` tables, and adding `user_id` foreign key column to `sites`.
  - Installed `@node-rs/argon2` (pinned 2.2.2) for secure password hashing with constant-time dummy verify mitigation against timing attacks.
  - Implemented `lib/rate-limit.ts` using DB-backed `auth_attempts` table with SHA-256 hashed keys (IP/email hashes, never storing raw identifiers).
  - Implemented `lib/auth.ts` with Argon2id password hashing, SHA-256 session token generation (raw 32-byte tokens returned only to user cookies, stored as hashes in DB), session lookup with expiry checks, and session destruction.
  - Implemented `POST /api/auth/register` with Zod validation, email normalization, rate limiting (5/hr per IP hash), duplicate suppression with generic response, user insertion, and session cookie attachment.
  - Implemented `POST /api/auth/login` with Zod validation, rate limiting (10/15min per IP and email hash), constant-time dummy verify on nonexistent users, Argon2id verification, and session cookie attachment.
  - Implemented `POST /api/auth/logout` invalidating session records from DB and clearing the cookie.
  - Updated `scripts/seed.ts` to provision an admin user if `ADMIN_EMAIL` and `ADMIN_PASSWORD` are present and assign unowned sites to that admin user.
  - Added unit test suite `tests/unit/auth.test.ts` (11 tests) verifying hashing, rate limiting, session lifecycles, and endpoint behaviors.
- **How verified**:
  - `pnpm test` passed 59/59 unit tests across 7 test suites.
  - `pnpm build` completed with 0 errors.
  - Live exit check passed: curl register (201 Created), curl login (200 OK), curl access to protected endpoint (200 OK), curl logout (200 OK with cleared cookie), and subsequent access to protected endpoint rejected with 401 Unauthorized.
- **What's next**:
  - Agent 10: Site ownership and scoping (`POST /api/sites`, `GET /api/sites`, query scoping in `lib/queries.ts` and `/api/stats/*`, origin checks in `/api/collect`).

## Agent 10: Site Ownership & Scoping

- **What was built**:
  - Implemented `app/api/sites/route.ts` supporting `POST` (create site with domain normalization, uniqueness check, short random `site_id`, and 10-site limit per user) and `GET` (list authenticated user's sites).
  - Enforced tenant isolation across all query functions in `lib/queries.ts` and routes `/api/stats/[metric]` and `/api/live`: require user session and enforce `site_id IN (SELECT id FROM sites WHERE user_id = $1)`, returning 404 (not 403) for sites not owned by the user.
  - Updated `/api/collect/route.ts` with 60-second in-memory site caching (`getCachedSite`) and strict origin validation (`isOriginAllowedForSite`) matching the site's domain.
  - Added unit test suite `tests/unit/sites-scoping.test.ts` (6 tests).
- **How verified**:
  - Unit tests passed (6/6). Cross-tenant live test on running server verified User 1 gets 200 on own site, and 404 on User 2 site.
- **What's next**:
  - Agent 11: Auth pages and dashboard structure (`/register`, `/login`, `/dashboard/sites/new`, `/dashboard/settings`).

## Agent 11: Auth Pages & Dashboard Structure

- **What was built**:
  - Reorganized dashboard routes under `app/dashboard` (`/dashboard`, `/dashboard/sites/[id]`, `/dashboard/sites/new`, `/dashboard/settings`).
  - Built `app/register/page.tsx` and `components/auth/RegisterForm.tsx` with email/password validation, autocomplete attributes, error feedback, and redirect to `/dashboard/sites/new`.
  - Updated `app/login/page.tsx` with email + password authentication, inline error states, safe redirect (`getSafeNextUrl`), and link to register.
  - Built `app/dashboard/sites/new/page.tsx` with domain input, instant embed tag generation, and a live polling indicator that flips to "First pageview received!" when an event arrives.
  - Built `app/dashboard/settings/page.tsx` with password change (invalidates other active sessions) and account deletion (cascading user, sites, sessions, and events).
  - Implemented `app/api/auth/password/route.ts` and `app/api/auth/delete-account/route.ts`.
  - Updated `components/dashboard/Header.tsx` with multi-tenant site switcher, "+ Site", "Settings", and "Logout" buttons.
  - Created Playwright E2E test `tests/e2e/auth-flow.spec.ts` verifying the full onboarding lifecycle.
- **How verified**:
  - E2E flow test passed: `landing -> register -> add site -> snippet shown -> post event -> indicator flips -> dashboard -> logout`.
- **What's next**:
  - Agent 12: Public Landing Page (`app/(marketing)/page.tsx`, `lib/demo-data.json`, `app/privacy/page.tsx`).

## Agent 12: Landing Page

- **What was built**:
  - Created public marketing page `app/(marketing)/page.tsx` and layout `app/(marketing)/layout.tsx`. Server-rendered, fast, zero live database queries.
  - Generated realistic static demo data committed in `lib/demo-data.json`.
  - Assembled all 6 required sections:
    1. Nav: brand, feature links, Log in, Get started / Go to dashboard.
    2. Hero: value proposition, subline, primary and secondary CTAs, interactive `GlobeLive` on demo data (`HeroGlobe.tsx`).
    3. Visualization Showcase: lazy-loaded `ShowcaseSection.tsx` with `PageStream`, `FlowSankey`, `WorldChoropleth`, `CalendarHeatmap`, and `HourWeekdayHeatmap`, each with a one-line caption.
    4. Privacy Section: 4 concrete claims matching the codebase (daily rotating salt, zero visitor cookies, clean URLs/referrers, 90-day raw retention).
    5. How It Works: 3-step guide with actual embed snippet and &lt;1 KB size callout.
    6. Footer: privacy statement link, source link, contact.
  - Authored plain-language `/privacy` policy page (`app/privacy/page.tsx`).
  - Added `app/robots.ts` and `app/sitemap.ts` for SEO.
  - Added Playwright test `tests/e2e/landing.spec.ts` capturing mobile (390px) and desktop (1440px) screenshots to `tests/screenshots/`.
- **How verified**:
  - Mobile (`tests/screenshots/landing-390px.png`) and desktop (`tests/screenshots/landing-1440px.png`) screenshots captured and visually verified.
  - "Get started" button navigates to `/register`; logged-in session switches CTA to "Go to dashboard".
- **What's next**:
  - Agent 13: Hardening for Public Signup.

## Agent 13: Hardening for Public Signup

- **What was built**:
  - Updated `middleware.ts` with Content-Security-Policy (CSP), X-Frame-Options (DENY), X-Content-Type-Options (nosniff), Referrer-Policy, and Permissions-Policy headers.
  - Implemented CSRF protection in `middleware.ts`: rejects non-`GET` mutation requests to `/api/auth/*` and `/api/sites/*` whose `Origin` header does not match the request host.
  - Added session cleanup (`DELETE FROM sessions WHERE expires_at < now()`) and old attempt cleanup (`DELETE FROM auth_attempts WHERE ts < (now() - INTERVAL '1 day')`) in nightly rollup cron (`lib/rollup.ts`).
  - Enforced 10 sites per user cap on `POST /api/sites`.
  - Added `ALLOW_REGISTRATION` env flag support: returns 404 on `/register` and `/api/auth/register` when `ALLOW_REGISTRATION=false`.
  - Created `tests/e2e/hardening.spec.ts` verifying security headers, CSRF rejection, 401 unauthenticated API access, 404 cross-tenant isolation, and settings account lifecycle.
- **How verified**:
  - All 14 Playwright E2E tests passed across all 4 suites (`pnpm test:e2e`).
  - All 67 Vitest unit tests passed across all 8 suites (`pnpm test`).
  - `pnpm lint` and `pnpm build` both pass with zero errors.
- **Status**: ALL AGENT ROLES THROUGH AGENT 13 COMPLETE.

## Tasks 1–8: Registration, Option B Landing, /demo Dashboard & Gallery Retirement

- **What was built**:
  - **Option B Landing Page (`app/(marketing)/page.tsx`)**: Replaced heavy inline stacked charts with lightweight `HeroGlobe.tsx` (rotating WebGL 3D globe on static demo data) and `DemoTeaserSection.tsx` linking to `/demo`. Preserved all 4 concrete privacy claims, 3-step setup guide, responsive header with dynamic auth button ("Go to dashboard" for logged-in users), and footer.
  - **Public Demo Dashboard (`app/demo/page.tsx` & `components/demo/DemoDashboardClient.tsx`)**: Public, read-only interactive dashboard running strictly on static seeded data (`lib/demo-data.json`) with 0 database queries. Displays all 8 visual components at full scale (`#viz-kpi-strip`, `#viz-globe-live`, `#viz-pulse-live`, `#viz-world-choropleth`, `#viz-flow-sankey`, `#viz-page-stream`, `#viz-calendar-heatmap`, `#viz-hour-weekday`), interactive range presets (24h, 7d, 30d, 12mo), and telemetry breakdown tables. Added to `app/sitemap.ts`.
  - **Dev Gallery Retirement**: Removed "Gallery" link from authenticated dashboard header (`components/dashboard/Header.tsx`). In `app/viz-gallery/page.tsx`, calls `notFound()` (HTTP 404) when `process.env.NODE_ENV === "production"`. Extracted dev component to `components/viz/VizGalleryClient.tsx`.
  - **Specification Alignment (`AGENTS-registration-landing.md`)**: Rewrote specification into eight discrete tasks with files, steps, and verifiable "done when" checks.
- **How verified**:
  - `pnpm lint`: 0 errors, 0 warnings.
  - `pnpm test`: 67/67 unit tests passed across all 8 suites (`auth`, `database`, `queries`, `rollup`, `scaffold`, `sites-scoping`, `storage`, `tracker-collector`).
  - `pnpm build`: Compiled successfully with Turbopack, generated static pages for `/demo`, `/privacy`, `/register`, `/login`, `/viz-gallery` (404 in prod), and `/robots.txt`.
  - `pnpm test:e2e`: All 16 Playwright tests passed across all 5 test files (`auth-dashboard.spec.ts`, `auth-flow.spec.ts`, `hardening.spec.ts`, `landing.spec.ts`, `viz-gallery.spec.ts`), including capturing all 8 visual component screenshots on `/demo` and verifying 404 on `/viz-gallery`.
- **Status**: ALL 8 TASKS VERIFIED AND COMPLETE.


