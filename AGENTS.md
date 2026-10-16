# AGENTS.md: Privacy-First Web Analytics (Vercel)

## Objective

Build a self-hosted, cookieless, privacy-respecting web analytics tool with a visually striking dashboard. Deploy on Vercel. Keep the codebase small and simple.

## Hard constraints (never violate)

1. No cookies, no localStorage, no fingerprinting.
2. Raw IP is never stored or logged. Only a salted daily hash is stored.
3. Query strings and URL fragments are stripped. Referrer is stored as hostname only.
4. Honor Do Not Track (`navigator.doNotTrack === '1'` -> send nothing).
5. Tracker script stays under 1 KB minified, no dependencies.
6. Dashboard is auth-protected. Collector endpoint is public.
7. No third-party services beyond the stack below.
8. Secrets live in env vars only. Never commit them.

## Stack

| Layer           | Choice                                                                                                     |
| --------------- | ---------------------------------------------------------------------------------------------------------- |
| Framework       | Next.js (latest stable), App Router, TypeScript strict                                                     |
| Hosting         | Vercel (Fluid/Serverless functions, Vercel Cron)                                                           |
| Database        | Neon Postgres via `@neondatabase/serverless`                                                               |
| Styling         | Tailwind CSS, dark-first theme                                                                             |
| Charts (2D)     | Observable Plot, D3 (`d3-geo`, `d3-scale`, `d3-sankey`, `d3-shape`)                                        |
| Globe           | `cobe`                                                                                                     |
| Animation       | Framer Motion                                                                                              |
| Validation      | Zod                                                                                                        |
| Testing         | Vitest (unit), Playwright (e2e)                                                                            |
| Lint/format     | ESLint, Prettier                                                                                           |
| Package manager | pnpm                                                                                                       |
| Geo             | Vercel headers: `x-vercel-ip-country`, `x-vercel-ip-city`, `x-vercel-ip-latitude`, `x-vercel-ip-longitude` |

Verify current versions with `pnpm view <pkg> version` before installing. Pin exact versions in `package.json`.

## Environment variables

```
DATABASE_URL=        # Neon connection string
SALT=                # random 32+ byte hex
DASHBOARD_PASSWORD=  # dashboard login
CRON_SECRET=         # Vercel Cron auth
ALLOWED_ORIGINS=     # comma-separated origins allowed to send events
```

## Repo structure

```
/app
  /api/collect/route.ts        # POST collector
  /api/stats/[metric]/route.ts # JSON aggregates for dashboard
  /api/cron/rollup/route.ts    # nightly aggregation
  /api/live/route.ts           # SSE or polling: last 30 min
  /(dashboard)/page.tsx        # overview
  /(dashboard)/sites/[id]/page.tsx
  /login/page.tsx
/components
  /viz                         # one file per visualization
/lib
  db.ts  hash.ts  validate.ts  queries.ts  bots.ts
/public/a.js                   # tracker
/db/schema.sql  /db/migrations
/tests
middleware.ts                  # dashboard auth
vercel.json                    # cron schedule
```

## Data model

```sql
CREATE TABLE sites (
  id text PRIMARY KEY, domain text UNIQUE NOT NULL, created_at timestamptz DEFAULT now()
);

CREATE TABLE events (
  ts timestamptz NOT NULL DEFAULT now(),
  site_id text NOT NULL REFERENCES sites(id),
  path text NOT NULL,
  referrer text,
  country text, city text, lat real, lon real,
  device text, browser text, os text,
  visitor text NOT NULL,
  session text
);
CREATE INDEX events_site_ts ON events (site_id, ts DESC);

CREATE TABLE daily_stats (
  day date, site_id text, path text, referrer text, country text, device text,
  views int, visitors int,
  PRIMARY KEY (day, site_id, path, referrer, country, device)
);
```

## Agent roles and methods

Run roles in order. Each role has inputs, outputs, and an exit check. Do not start the next role until the exit check passes.

### Agent 1: Scaffold

- Inputs: this file.
- Tasks: `pnpm create next-app` (TypeScript, Tailwind, App Router, ESLint), install deps, set up Prettier, Vitest, Playwright, folder structure, `.env.example`, `.gitignore`.
- Exit check: `pnpm build` and `pnpm lint` pass.

### Agent 2: Database

- Tasks: write `db/schema.sql`, a migration runner script (`pnpm db:migrate`), `lib/db.ts` exporting a Neon client, seed script (`pnpm db:seed`) that generates 30 days of realistic fake events across 10+ countries, 20+ paths, 8+ referrers, with weekday/hour seasonality.
- Exit check: migrate and seed run against a Neon branch; row counts verified.

### Agent 3: Tracker and collector

- Tasks:
  - Write `public/a.js` (pageview on load, on `history.pushState`, on `popstate`; use `navigator.sendBeacon`; skip on DNT).
  - Write `/api/collect`: Zod-validate body, reject bots (`lib/bots.ts`), check origin against `ALLOWED_ORIGINS`, add CORS headers, compute `visitor = sha256(SALT + utcDate + ip + ua).slice(0,16)`, parse UA to browser/OS/device, read geo headers, insert row, return 204.
  - Basic rate limit per visitor hash (in-memory or DB count check).
- Tests: unit tests for hash rotation across days, bot filter, validation rejects, no IP in any stored column.
- Exit check: curl and Playwright test post an event, the row appears, and no raw IP exists anywhere in the DB.

### Agent 4: Query layer

- Tasks: in `lib/queries.ts`, write typed SQL functions using `date_trunc`, `GROUP BY`, `COUNT(DISTINCT visitor)`:
  - timeseries(views, visitors) by hour/day
  - top pages, top referrers, top countries, devices, browsers
  - hour x weekday matrix
  - referrer -> landing -> next-page flows (Sankey nodes and links)
  - per-page timeseries (streamgraph)
  - live events last 30 min
  - all accept `siteId`, `from`, `to`; read from `daily_stats` for ranges older than 2 days, `events` otherwise.
- Expose through `/api/stats/[metric]`, Zod-validated params.
- Exit check: unit tests against seeded data return expected shapes and counts.

### Agent 5: Visualization

One component per file in `/components/viz`. Each takes plain props (no fetching inside), has loading and empty states, is responsive, and animates on mount.

1. `GlobeLive`: cobe globe, rotating, markers from lat/lon of recent events, pulse on new events.
2. `FlowSankey`: d3-sankey, referrer -> landing page -> next page, hover highlights a full path.
3. `CalendarHeatmap`: GitHub-style, daily views, 12 months.
4. `HourWeekdayHeatmap`: 7x24 grid.
5. `PageStream`: streamgraph of top 8 pages over time with hover tooltip.
6. `PulseLive`: last 30 min, per-minute sparkline plus ticking counter, SSE or 5s polling.
7. `WorldChoropleth`: d3-geo, Natural Earth projection, color scale by visitors.
8. `KpiStrip`: views, visitors, bounce proxy, top country, with delta vs previous period.

Design rules: dark background, one accent hue plus a perceptually uniform sequential scale (viridis/inferno), tabular numerals, generous spacing, 60fps animation, `prefers-reduced-motion` respected, accessible labels and color-blind-safe palettes.

- Exit check: each component renders in a Storybook-less preview page `/viz-gallery` using seeded data; Playwright screenshot per component.

### Agent 6: Dashboard

- Tasks: compose overview page grid, date range picker (24h, 7d, 30d, 12mo, custom), site switcher, filters (country, path, referrer) that update URL search params, server components fetch aggregates, client components render viz.
- Auth: `middleware.ts` checks signed httpOnly session cookie set by `/login` against `DASHBOARD_PASSWORD` (constant-time compare). Dashboard cookie only; the tracked sites never receive cookies.
- Exit check: unauthenticated request to dashboard redirects to `/login`; authenticated flow shows all 8 viz with seeded data.

### Agent 7: Rollup and retention

- Tasks: `/api/cron/rollup` (authorized via `Authorization: Bearer CRON_SECRET`) aggregates yesterday's events into `daily_stats` (idempotent upsert), deletes raw events older than 90 days. Schedule in `vercel.json` (daily, 03:00 UTC).
- Exit check: running twice yields identical `daily_stats`; old rows deleted.

### Agent 8: Hardening and deploy

- Tasks:
  - Serve tracker and endpoint with neutral names for adblock resilience (e.g. `/s.js`, `/api/e`). Make paths configurable through env.
  - Security headers, CSP for dashboard, input size limits on collector.
  - README: setup, embed snippet, env vars, privacy statement.
  - Deploy to Vercel, set env vars, run migration against production Neon, create first site, embed snippet.
- Exit check: production pageview from a real browser appears on the dashboard within 5 seconds.

## Working method for every agent

1. Read this file and the current repo state before editing.
2. Make small, reviewable commits, one logical change each, conventional commit messages.
3. Write tests alongside code. Run `pnpm lint && pnpm test && pnpm build` before every commit.
4. Do not add dependencies not listed in Stack without recording the reason in `DECISIONS.md`.
5. Do not change hard constraints, schema columns, or env var names without updating this file.
6. If blocked, write the blocker and attempted fixes to `BLOCKERS.md` and move to the next independent task.
7. Keep functions small and typed. No `any`. No dead code.
8. On finishing a role, append a short entry to `PROGRESS.md`: what was built, how verified, what's next.

## Definition of done

- Tracker under 1 KB, no cookies or storage.
- Database contains no raw IPs.
- All 8 visualizations render on live data.
- Dashboard behind auth.
- Cron rollup and retention working.
- Deployed on Vercel with one embeddable script tag.
- `pnpm lint`, `pnpm test`, `pnpm build`, and Playwright e2e all pass.
