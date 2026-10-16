# Spidy 🕷️

> Self-hosted, cookieless, privacy-first web analytics with a visually striking dashboard. Deployed on Vercel and Neon Postgres.

Spidy provides high-resolution website analytics without sacrificing visitor privacy or slowing down pages. The entire tracking script is under 1 KB, requires zero external dependencies, stores no cookies or device fingerprints, and never logs raw IP addresses.

---

## 🔒 Privacy Architecture & Hard Constraints

Spidy was architected from the ground up to respect user sovereignty and comply with the strictest global privacy regulations (GDPR, PECR, CCPA):

1. **No Cookies, No LocalStorage, No Fingerprinting**: Zero client-side persistent state. Tracked sites never issue cookies or store tokens.
2. **Never Stores Raw IPs**: IP addresses are used solely in-memory to compute a salted daily hash: `sha256(SALT + utcDate + ip + ua).slice(0, 16)`. Hashes rotate automatically at 00:00:00 UTC, preventing cross-day visitor linkage.
3. **Query & Hash Stripping**: Query parameters (`?utm_source=...`) and hash fragments (`#section`) are stripped before storage to prevent accidental ingestion of personal data. Referrers are sanitized to hostnames only.
4. **Honors Do Not Track (DNT)**: If `navigator.doNotTrack === '1'`, the tracking script silently terminates and transmits zero network packets.
5. **Ultra-Lightweight (< 1 KB)**: Minified tracker script is ~850 bytes, with no external dependencies or render-blocking overhead.
6. **Isolated Auth**: Dashboard requires password authentication via signed `httpOnly` session cookies. The collector endpoint remains fast and public.
7. **Zero Third-Party Services**: No external CDNs, fonts, or tracking beacons. All charts and projections render natively via D3 and WebGL.

---

## ⚡ Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router, strict TypeScript, Tailwind CSS v4) |
| Hosting & Edge | Vercel (Fluid/Serverless Functions, Vercel Cron) |
| Database | Neon Serverless Postgres via `@neondatabase/serverless` |
| Visualizations (2D) | D3 (`d3-geo`, `d3-scale`, `d3-sankey`, `d3-shape`), `@observablehq/plot` |
| 3D Globe | `cobe` (WebGL interactive globe) |
| Animations | `framer-motion` |
| Validation | `zod` |
| Testing | Vitest (unit), Playwright (E2E) |

---

## 📦 Embed Snippet

Add the embed script to your website's `<head>` or `<body>`.

### Standard Embed
```html
<script
  defer
  data-site="your-site-id"
  src="https://your-spidy-instance.vercel.app/a.js"
></script>
```

### Adblock-Resilient Embed
Spidy includes neutral alias endpoints out of the box (`/s.js` serving the tracker and `/api/e` receiving beacons) to prevent false-positive adblock disruptions:
```html
<script
  defer
  data-site="your-site-id"
  src="https://your-spidy-instance.vercel.app/s.js"
></script>
```

---

## 🛠️ Environment Variables

Create a `.env` file in the project root:

```ini
# Neon Postgres connection string
DATABASE_URL="postgres://user:password@endpoint-pooler.region.neon.tech/neondb?sslmode=require"

# Random 32+ byte hex string used for daily salted visitor hashing
SALT="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

# Dashboard unlock password
DASHBOARD_PASSWORD="your-strong-dashboard-password"

# Authorization secret for Vercel Cron rollup
CRON_SECRET="your-cron-secret-token"

# Comma-separated list of allowed origins (or * to allow any)
ALLOWED_ORIGINS="*"

# Optional: Custom neutral paths for tracker & collector
TRACKER_PATH="/s.js"
COLLECTOR_PATH="/api/e"
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Database Migration & Seeding
Ensure `DATABASE_URL` is configured in your `.env`, then run:
```bash
# Run database schema migrations (creates sites, events, daily_stats)
pnpm db:migrate

# Seed with 30 days of realistic seasonal analytics data
pnpm db:seed
```

### 3. Run Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) to log into the dashboard (or view the component gallery at [http://localhost:3000/viz-gallery](http://localhost:3000/viz-gallery)).

---

## 📊 Dashboard Visualizations

Spidy features 8 custom data visualizations:

1. **`GlobeLive`**: 3D interactive WebGL globe with rotating velocity, active geo-markers, and pulse beacons.
2. **`PulseLive`**: 30-minute real-time sparkline with live visitor count and 5-second polling updates.
3. **`WorldChoropleth`**: Natural Earth geographic map projection with country visitor density gradients.
4. **`FlowSankey`**: User navigation journeys (Referrer → Landing Page → Next Page) with full-path hover highlighting.
5. **`PageStream`**: Silhouette streamgraph visualizing top 8 pages over time.
6. **`CalendarHeatmap`**: 12-month GitHub-style daily activity matrix with sequential gradients.
7. **`HourWeekdayHeatmap`**: 7x24 diurnal matrix showing hourly peak traffic patterns across days of the week.
8. **`KpiStrip`**: Animated KPI cards displaying Pageviews, Visitors, Bounce Proxy, and Top Country with comparative delta badges.

---

## ⏰ Cron Rollup & Retention

A nightly rollup function runs via Vercel Cron (configured in `vercel.json` at `0 3 * * *`):
- **Aggregation**: Idempotently aggregates raw events into `daily_stats` using `ON CONFLICT (day, site_id, path, referrer, country, device) DO UPDATE`.
- **Retention**: Automatically deletes raw event rows older than 90 days (`DELETE FROM events WHERE ts < (CURRENT_DATE - INTERVAL '90 days')`).
- **Endpoint**: `/api/cron/rollup` (protected via `Authorization: Bearer <CRON_SECRET>`).

---

## 🧪 Testing & Verification

```bash
# Run all Vitest unit tests (46 tests)
pnpm test

# Run ESLint check
pnpm lint

# Production Next.js build
pnpm build

# Run Playwright E2E tests (Authentication, Dashboard, and Visual Gallery)
pnpm test:e2e
```

---

## 📄 License
MIT
