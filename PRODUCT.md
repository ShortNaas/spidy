# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Site owners, indie hackers, and developers who need honest, lightweight website traffic analytics without cookies, compliance burdens, or invasive trackers.

## Product Purpose

Spidy is a self-hosted, cookieless, privacy-first web analytics tool with a quiet, minimal, dark-first dashboard. It exists to provide clear, essential traffic insights while strictly honoring visitor sovereignty. Success means zero cookies, zero local storage, no raw IP logging, an embed script under 1 KB, and a quiet, dark aesthetic that feels effortless to self-host.

## Positioning

Architectural privacy guarantee over policy promises:
- Zero cookies, zero localStorage, zero device fingerprinting. Tracked sites' visitors never receive cookies or persistent client tokens.
- Raw IP addresses are never stored or logged anywhere in the database. Hashes rotate daily at 00:00:00 UTC using a secret salt (`sha256(SALT + utcDate + ip + ua).slice(0, 16)`), making cross-day visitor linkage mathematically impossible.
- Query strings and URL hash fragments are stripped before storage; referrers are sanitized to hostnames only.
- Strict adherence to Do Not Track (`navigator.doNotTrack === '1'`), resulting in zero network transmissions.

Unlike minimal analytics tools that sacrifice visual depth for simplicity, Spidy pairs strict privacy guarantees with rich, interactive visualizations (3D WebGL globe, user journey Sankey flows, streamgraphs, diurnal matrices) and a public zero-query live demo (`/demo`).

## Operating Context

- **Deployment**: Vercel Fluid/Serverless Edge runtime paired with Neon Serverless Postgres (`@neondatabase/serverless`).
- **Integration**: A single embed script (`<script defer data-site="..." src=".../a.js"></script>` or neutral adblock-resilient `/s.js`) added to `<head>` or `<body>`.
- **Dashboard Access**: Password-authenticated account access via Argon2id hashes and signed httpOnly session cookies (`sameSite=lax`), strictly scoped to authenticated user sites.
- **Rollup & Retention**: Automated nightly Vercel Cron (`0 3 * * *`) that idempotently rolls raw events into `daily_stats` and prunes raw event records older than 90 days.

## Capabilities and Constraints

- **Collector**: Public HTTP POST `/api/collect` (and neutral alias `/api/e`), rejects bots, validates origins, enforces a 16 KB payload cap, extracts Vercel geo headers (`country`, `city`, `lat`, `lon`), computes daily visitor hash, and returns HTTP 204 No Content.
- **Multi-Tenant Scoping**: All analytics queries require an authenticated session and apply `site_id IN (SELECT id FROM sites WHERE user_id = $1)`. Requests for unowned sites return HTTP 404 (not 403) to prevent tenant enumeration.
- **Query Optimization**: Reads from pre-aggregated `daily_stats` for date windows older than 2 days, querying granular `events` only for recent and real-time windows.
- **Public Demo (`/demo`)**: Zero live database queries; renders all 8 visualization components at full scale using static committed seed data (`lib/demo-data.json`).
- **Zero Third-Party Services**: No external CDNs, fonts, or tracking services. Only Neon Postgres and Vercel hosting.

## Brand Commitments

- **Name & Symbol**: Spidy 🕷️
- **Voice & Tone**: Direct, transparent, technical, unapologetically privacy-focused, free of marketing jargon.
- **Visual Baseline**: High-contrast dark-first aesthetic, dense data presentation, monospace/tabular numerals (`tabular-nums`), smooth 60fps animations respecting `prefers-reduced-motion`.

## Evidence on Hand

- **Production Tracker**: `public/a.js` (845 bytes minified, zero external dependencies).
- **Visualization Suite**: 8 production visual components in `components/viz/` (`GlobeLive`, `PulseLive`, `WorldChoropleth`, `FlowSankey`, `PageStream`, `CalendarHeatmap`, `HourWeekdayHeatmap`, `KpiStrip`).
- **Public Surfaces**: Server-rendered marketing page at `/` and public full-scale demo dashboard at `/demo`.
- **Automated Test Coverage**: 67 Vitest unit tests and 16 Playwright E2E tests validating privacy constraints, security headers, auth lifecycle, and visual component renders.
- **Synthetic Dataset**: 365-day diurnal/seasonal seed dataset (`scripts/seed.ts` and `lib/demo-data.json`).
- **Absences**: No fake customer logos, fabricated testimonials, or artificial pricing tiers.

## Product Principles

1. **Privacy by Architecture, Not Policy**: Enforce privacy constraints directly in schemas and algorithms rather than relying on terms of service.
2. **Lightness is Respect**: Maintain an embed script under 1 KB to respect visitor bandwidth and page load performance.
3. **Information Density Over Vanity**: Surface meaningful visual patterns (geographic distribution, navigation flows, diurnal cycles) over empty card layouts.
4. **Self-Contained Simplicity**: Zero third-party runtime dependencies beyond Vercel and Neon; zero external asset CDNs.
5. **Zero Tenant Leakage**: Enforce strict account isolation with silent 404s for unowned resources.

## Accessibility & Inclusion

- Dark-first theme with high-contrast foregrounds and color-blind safe sequential palettes (ember/viridis/inferno).
- Tabular numerals across all data tables and KPI cards for scanability.
- Strict adherence to `prefers-reduced-motion` for WebGL rotations and interface animations.
- Accessible ARIA labeling, keyboard navigation, and semantic HTML on all forms and controls.
