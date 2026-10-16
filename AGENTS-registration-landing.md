# AGENTS addendum: Registration + Landing Page

Extends `AGENTS.md`. Where this file conflicts with `AGENTS.md`, this file wins. Run these tasks after Agent 8 (or in place of Agent 6's single-password auth).

## What changes
- `/` becomes a public landing page teasing the 3D globe and linking to `/demo`.
- `/demo` is a public, read-only interactive dashboard displaying every visualization at full scale on static seeded dummy data with zero live database queries.
- New users can register, log in, add their own sites, and see only their own data.
- Single `DASHBOARD_PASSWORD` auth is replaced by per-user accounts.
- Logged-in users don't need the gallery; `/viz-gallery` returns 404 in production.

## Constraint updates
Hard constraints 1-5 and 7-8 from `AGENTS.md` still apply. Constraint 6 becomes:

6. Public routes: `/`, `/demo`, `/privacy`, `/register`, `/login`, `/api/collect`, `/a.js` (or its renamed path). Everything under `/dashboard` and `/api/stats` requires a valid session.

Added:
9. The tracked sites' visitors never receive cookies. The only cookie is the dashboard session cookie (`httpOnly`, `secure`, `sameSite=lax`), set on your own domain for logged-in account owners.
10. Store only what accounts need: email and password hash. No names, no phone, no third-party identity providers.
11. Passwords are hashed with argon2id (`@node-rs/argon2`). Never log passwords, hashes, or session tokens.
12. Every data query is scoped by the authenticated user's sites. No query may run without a `site_id IN (user's sites)` filter. Return 404 (not 403) for sites the user does not own.

## Stack additions
| Piece | Choice |
|---|---|
| Password hashing | `@node-rs/argon2` |
| Sessions | Own `sessions` table, random 32-byte token, store SHA-256 of token only |
| Validation | Zod (already in stack) |
| Rate limiting | DB-backed counter table (no new service) |
| Demo visuals | Existing viz components in `/components/viz`, fed by static seeded demo data |

No new third-party services. Email verification and password reset need an email provider, so they are out of scope here (see Deferred).

## Schema changes
```sql
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,          -- stored lowercased
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE sessions (
  token_hash text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX sessions_user ON sessions (user_id);

CREATE TABLE auth_attempts (
  key text NOT NULL,                   -- e.g. 'reg:' || ip_hash or 'login:' || email_hash
  ts timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX auth_attempts_key_ts ON auth_attempts (key, ts DESC);

ALTER TABLE sites ADD COLUMN user_id uuid REFERENCES users(id) ON DELETE CASCADE;
CREATE INDEX sites_user ON sites (user_id);
```
`auth_attempts.key` uses a hash of IP or email, never raw values. Delete rows older than 1 day in the nightly cron.

## New and changed routes
```
/app
  /(marketing)/page.tsx            # landing page (public, Option B)
  /(marketing)/layout.tsx
  /demo/page.tsx                   # public read-only full-scale demo dashboard
  /register/page.tsx
  /login/page.tsx                  # updated: email + password
  /dashboard/...                   # moved under auth
  /dashboard/sites/new/page.tsx    # add a site, shows embed snippet
  /dashboard/settings/page.tsx     # change password, delete account
  /api/auth/register/route.ts
  /api/auth/login/route.ts
  /api/auth/logout/route.ts
  /api/sites/route.ts              # POST create site, GET list own sites
/lib
  auth.ts                          # hash/verify, create/validate/destroy session
  rate-limit.ts                    # DB-backed rate limiting on hashed keys
  demo-data.json                   # static seeded demo dataset
middleware.ts                      # protect /dashboard and /api/stats only, CSP, CSRF
```

---

## Eight Implementation Tasks

Execute in order. Each task specifies required files, implementation steps, and a verifiable "done when" check.

### Task 1: Accounts backend
- **Files**:
  - `db/migrations/0002_accounts.sql`
  - `lib/auth.ts`
  - `lib/rate-limit.ts`
  - `app/api/auth/register/route.ts`
  - `app/api/auth/login/route.ts`
  - `app/api/auth/logout/route.ts`
  - `scripts/seed.ts`
- **Steps**:
  1. Write migration `0002_accounts.sql` creating `users`, `sessions`, `auth_attempts`, and adding `user_id` to `sites`.
  2. Implement `lib/auth.ts`: `hashPassword` and `verifyPassword` using argon2id (`@node-rs/argon2`); `createSession` generating random 32-byte tokens and storing SHA-256 hashes with 30-day expiry; `getSessionUser` hashing incoming cookies and validating expiry; `destroySession`.
  3. Implement `lib/rate-limit.ts`: DB-backed counter using SHA-256 hashed keys (`reg:ip_hash` capped at 5/hr, `login:ip_hash` & `login:email_hash` capped at 10/15min).
  4. Build `POST /api/auth/register`: validate email & password (10-128 chars), lowercase email, rate limit, generic rejection for duplicates, set session cookie.
  5. Build `POST /api/auth/login`: rate limit, constant-time dummy verification on unknown emails to avoid timing leaks, verify password, set cookie.
  6. Build `POST /api/auth/logout`: delete session record and clear cookie.
  7. Update `scripts/seed.ts` to assign existing unowned sites to an admin user if `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set.
- **Done when**:
  - Unit tests in `tests/unit/auth.test.ts` pass (11/11).
  - Register, login, protected endpoint access, and logout verify cleanly via API requests.

### Task 2: Site ownership and tenant scoping
- **Files**:
  - `app/api/sites/route.ts`
  - `lib/queries.ts`
  - `app/api/stats/[metric]/route.ts`
  - `app/api/live/route.ts`
  - `app/api/collect/route.ts`
- **Steps**:
  1. Build `POST /api/sites`: create a site for the session user (domain validated, normalized, lowercased, unique), generate short random `site_id`, enforce 10-site limit per user.
  2. Build `GET /api/sites`: return only sites where `user_id = session.userId`.
  3. Update all query functions in `lib/queries.ts` and `/api/stats/*` routes to enforce `site_id IN (SELECT id FROM sites WHERE user_id = $1)`. Return HTTP 404 (not 403) for sites the user does not own to prevent tenant enumeration.
  4. Update `/api/collect`: look up site by `site_id` with 60-second in-memory caching, reject unknown sites, and validate request `Origin` against that site's domain.
- **Done when**:
  - Unit tests in `tests/unit/sites-scoping.test.ts` pass (6/6).
  - User A cannot view User B's statistics on any route (receives HTTP 404). Collector rejects cross-origin events from unauthorized domains.

### Task 3: Auth pages and dashboard onboarding flow
- **Files**:
  - `middleware.ts`
  - `app/register/page.tsx`
  - `components/auth/RegisterForm.tsx`
  - `app/login/page.tsx`
  - `app/dashboard/sites/new/page.tsx`
  - `app/dashboard/settings/page.tsx`
  - `app/api/auth/password/route.ts`
  - `app/api/auth/delete-account/route.ts`
- **Steps**:
  1. Configure `middleware.ts` to protect `/dashboard/:path*` and `/api/stats/:path*`; redirect unauthenticated users to `/login?next=...`; return 401 for API routes. Logged-in users hitting `/login` or `/register` redirect to `/dashboard`.
  2. Build `/register` and `/login` pages: dark aesthetic, email + password fields, inline validation, loading states, correct `autocomplete` attributes, safe `next` URL validation.
  3. Redirect new users directly to `/dashboard/sites/new` after registration.
  4. Build `/dashboard/sites/new`: domain input, instant embed snippet generation with public `site_id`, and a live polling indicator that flips to "First pageview received!" when an event arrives.
  5. Build `/dashboard/settings`: change password (verifies current password, invalidates other sessions) and delete account (requires typing email, cascades users, sites, sessions, and events).
- **Done when**:
  - Playwright E2E flow in `tests/e2e/auth-flow.spec.ts` passes end-to-end: register -> add site -> copy snippet -> live indicator flips -> dashboard -> logout -> redirect from `/dashboard`.

### Task 4: Public demo dashboard (`/demo`)
- **Files**:
  - `app/demo/page.tsx`
  - `components/demo/DemoDashboardClient.tsx`
  - `lib/demo-data.json`
  - `app/sitemap.ts`
- **Steps**:
  1. Create `app/demo/page.tsx` rendering `DemoDashboardClient.tsx`. Ensure `/demo` is public, read-only, and executes zero database queries.
  2. Implement `DemoDashboardClient.tsx` fed entirely by static seeded data (`lib/demo-data.json`).
  3. Render all 8 visualization components at full scale with exact IDs:
     - `#viz-kpi-strip`: `KpiStrip`
     - `#viz-globe-live`: `GlobeLive`
     - `#viz-pulse-live`: `PulseLive`
     - `#viz-world-choropleth`: `WorldChoropleth`
     - `#viz-flow-sankey`: `FlowSankey`
     - `#viz-page-stream`: `PageStream`
     - `#viz-calendar-heatmap`: `CalendarHeatmap`
     - `#viz-hour-weekday`: `HourWeekdayHeatmap`
  4. Render top pages, top referrers, top countries, and device breakdown tables.
  5. Add interactive date preset toggles (24h, 7d, 30d, 12mo) that scale the sample metrics.
  6. Add top demo banner with "Interactive Live Demo" badge and "Track your own site →" link to `/register`.
  7. Add `/demo` to `app/sitemap.ts`.
- **Done when**:
  - `/demo` loads without auth, makes 0 SQL queries, renders all 8 full-scale components, and passes visual screenshot assertions in `tests/e2e/viz-gallery.spec.ts`.

### Task 5: Marketing landing page (Option B)
- **Files**:
  - `app/(marketing)/page.tsx`
  - `app/(marketing)/layout.tsx`
  - `components/landing/HeroGlobe.tsx`
  - `components/landing/DemoTeaserSection.tsx`
  - `app/privacy/page.tsx`
  - `app/robots.ts`
  - `app/sitemap.ts`
- **Steps**:
  1. Build fast server-rendered landing page at `/` (Option B: only teases the 3D globe and links to `/demo`, avoiding heavy stacked chart embeds inline).
  2. Implement 6 sections in order:
     - **Nav**: Spidy brand, Live Demo link with pulse indicator, Features, Privacy, How it works, Log in / Get started (switches to "Go to dashboard" for logged-in users).
     - **Hero**: Clear value proposition, subline emphasizing cookieless zero-IP privacy, primary CTA "Get started free", secondary CTA "See live demo" linking to `/demo`, interactive 3D `HeroGlobe` on demo data.
     - **Demo Teaser Section**: Highlights the full dashboard capabilities with cards for Realtime Pulse, Geographic Density, and Journey Flows, with direct link to `/demo`.
     - **Privacy Section**: 4 concrete claims backed by code (Daily Rotating Salt, Zero Visitor Cookies, Clean URLs & Referrers, 90-Day Raw Retention).
     - **How It Works**: 3 steps (Add your domain, Paste one tag &lt;1 KB, Watch data arrive).
     - **Footer**: Privacy policy link, demo link, source link, copyright.
  3. Author plain-language `/privacy` policy page matching actual implementation.
  4. Configure `robots.ts` (disallowing `/dashboard` and `/api`) and `sitemap.ts`.
- **Done when**:
  - `tests/e2e/landing.spec.ts` passes: mobile (390px) and desktop (1440px) screenshots captured; "See live demo" navigates to `/demo`; "Get started" navigates to `/register`; logged-in users see "Go to dashboard".

### Task 6: Gallery retirement & production 404
- **Files**:
  - `app/viz-gallery/page.tsx`
  - `components/viz/VizGalleryClient.tsx`
  - `components/dashboard/Header.tsx`
  - `tests/e2e/viz-gallery.spec.ts`
- **Steps**:
  1. Remove "Gallery" link from authenticated dashboard header (`components/dashboard/Header.tsx`) because logged-in users use the real dashboard and `/demo` serves public previews.
  2. In `app/viz-gallery/page.tsx`, call Next.js `notFound()` when `process.env.NODE_ENV === "production"`.
  3. Extract dev-only gallery rendering to `components/viz/VizGalleryClient.tsx` for local component development.
- **Done when**:
  - Header has no gallery link.
  - In production (`NODE_ENV=production`), visiting `/viz-gallery` returns HTTP 404.
  - Verified by `tests/e2e/viz-gallery.spec.ts`.

### Task 7: Hardening, CSRF & registration control
- **Files**:
  - `middleware.ts`
  - `lib/rollup.ts`
  - `app/api/sites/route.ts`
  - `app/register/page.tsx`
  - `app/api/auth/register/route.ts`
  - `README.md`
- **Steps**:
  1. Apply security headers in `middleware.ts`: Content-Security-Policy (CSP), X-Frame-Options (DENY), X-Content-Type-Options (nosniff), Referrer-Policy, Permissions-Policy.
  2. Implement CSRF protection in `middleware.ts`: reject non-`GET` mutation requests to `/api/auth/*` and `/api/sites/*` whose `Origin` does not match the request host.
  3. Enforce 10-site cap per user on `POST /api/sites`.
  4. Add nightly cron cleanup in `lib/rollup.ts`: delete expired sessions (`expires_at < now()`) and old `auth_attempts` (`ts < now() - INTERVAL '1 day'`).
  5. Add `ALLOW_REGISTRATION` env flag (default `true`); when `false`, return 404 on `/register` and `/api/auth/register`.
  6. Update `README.md` documenting multi-user architecture, env vars, and setup.
- **Done when**:
  - `tests/e2e/hardening.spec.ts` passes (5/5 tests): security headers verified, CSRF rejected, 401 unauthenticated API access, 404 tenant isolation, and account deletion.

### Task 8: End-to-end verification & quality checks
- **Files**:
  - `tests/e2e/auth-dashboard.spec.ts`
  - `tests/e2e/auth-flow.spec.ts`
  - `tests/e2e/hardening.spec.ts`
  - `tests/e2e/landing.spec.ts`
  - `tests/e2e/viz-gallery.spec.ts`
  - `playwright.config.ts`
- **Steps**:
  1. Configure `playwright.config.ts` with `NODE_ENV: "production"` and `reuseExistingServer: false`.
  2. Execute all unit test suites (`pnpm test`).
  3. Execute ESLint (`pnpm lint`).
  4. Execute Next.js production build (`pnpm build`).
  5. Execute all 16 Playwright E2E tests (`pnpm test:e2e`).
- **Done when**:
  - 16/16 Playwright E2E tests pass across 5 test suites.
  - 67/67 Vitest unit tests pass across 8 test suites.
  - `pnpm lint` reports 0 errors and 0 warnings.
  - `pnpm build` completes cleanly.

---

## Environment variable changes
```
ADMIN_EMAIL=            # optional, seeds the first user and claims existing sites
ADMIN_PASSWORD=         # optional, used once by the seed script
ALLOW_REGISTRATION=true # set to false to close public signup (returns 404)
# DASHBOARD_PASSWORD is removed
```

## Deferred (not in this pass)
- Email verification and password reset (needs an email provider).
- OAuth / magic-link login.
- Teams, shared dashboards, public share links.
- Billing.

## Definition of done
- `/` is a public landing page teasing the 3D globe and linking to `/demo`.
- `/demo` is a public, read-only dashboard rendering all 8 visualizations at full scale on static dummy data without live DB queries.
- Anyone can register (unless `ALLOW_REGISTRATION=false`), add a site, paste the snippet, and see only their own data.
- No cross-user data access on any route (unowned sites return 404).
- Passwords hashed with argon2id; session tokens stored hashed.
- Logged-in header has no gallery link; `/viz-gallery` returns 404 in production.
- Visitors of tracked sites still receive zero cookies.
- All 67 unit tests, lint checks, Next.js production build, and all 16 Playwright E2E tests pass.
