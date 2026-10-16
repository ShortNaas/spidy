# Architecture & Dependency Decisions

## Decision Log

### 1. Zero Extra Script Dependencies for Migrations & Seeds

- **Decision**: Use native Node.js 22 runtime features (`--experimental-strip-types` and `--env-file`) rather than adding third-party runners like `tsx` or `dotenv`.
- **Reason**: Aligns with AGENTS.md rule 4 (no unlisted dependencies) and the ponytail principle of using standard platform capabilities over external packages.

### 2. Pinned Exact Dependencies

- **Decision**: All production and development dependencies are pinned to exact semantic versions in `package.json` without carets (`^`) or tildes (`~`).
- **Reason**: Strict reproducibility across Vercel deployments and local execution per AGENTS.md instructions.

### 3. Edge Runtime Compatible Auth via Web Crypto API

- **Decision**: Implemented `lib/auth.ts` using standard Web Crypto API (`crypto.subtle`) for constant-time password check and HMAC-SHA256 session signatures rather than Node.js `node:crypto`.
- **Reason**: Next.js Edge Middleware runs in an isolated V8 environment where Node builtins are constrained. Web Crypto works natively everywhere (Edge, Serverless, and Browser).

### 4. Idempotent Nightly Rollups via Postgres ON CONFLICT

- **Decision**: Built `/api/cron/rollup` using `INSERT INTO daily_stats ... ON CONFLICT (day, site_id, path, referrer, country, device) DO UPDATE SET views = EXCLUDED.views, visitors = EXCLUDED.visitors`.
- **Reason**: Guarantees idempotent operations regardless of execution retries or manual backfills, while cleaning events older than 90 days in a single cron execution.

### 5. Adblock Resilience via Neutral Rewrites

- **Decision**: Configured Next.js rewrites mapping `/s.js` -> `/a.js` and `/api/e` -> `/api/collect`.
- **Reason**: Ensures privacy-respecting analytics continue functioning when aggressive cosmetic filter rules block terms like `tracker` or `collect`.

### 6. Dependency Pruning & Native Transitions (Ponytail Audit)

- **Decision**: Pruned unused dependencies `@observablehq/plot`, `@neon/config`, and `@neon/env`. Replaced `framer-motion` in `KpiStrip.tsx` with native Tailwind CSS transitions (`transition-all duration-300`).
- **Reason**: Simplifies dependency tree (-63 transitive packages total), lowers bundle size and compile overhead, and eliminates unnecessary runtime abstraction while maintaining 60fps card entry transitions.

### 7. Per-User Authentication with Argon2id

- **Decision**: Added `@node-rs/argon2` (pinned 2.2.2) for secure password hashing.
- **Reason**: Mandated by AGENTS-registration-landing.md constraint 11 for per-user accounts and session isolation.

### 8. Static Demo Data for Public Landing Page

- **Decision**: Landing page (`/`) renders high-fidelity visual showcases (`FlowSankey`, `CalendarHeatmap`, `HourWeekdayHeatmap`, `PageStream`, `WorldChoropleth`, and `HeroGlobe`) fed entirely by committed static demo data in `lib/demo-data.json`.
- **Reason**: Guarantees zero database queries on public marketing traffic, satisfies extreme performance budgets (LCP < 2.5s), and ensures complete tenant privacy by never querying live analytics on the public homepage.

### 9. Strict Multi-Tenant Scoping with 404 Obfuscation

- **Decision**: Enforced `site_id IN (SELECT id FROM sites WHERE user_id = $1)` on all data queries and returned HTTP 404 (not 403) whenever a user accesses a site they do not own.
- **Reason**: Prevents cross-tenant enumeration of site IDs or existence probing per AGENTS-registration-landing.md constraint 12.

### 10. CSRF & Origin Defense on Mutation Endpoints

- **Decision**: Implemented Origin-to-Host validation in `middleware.ts` on all non-`GET` mutation requests to `/api/auth/*` and `/api/sites/*`, combined with strict Content-Security-Policy and security headers.
- **Reason**: Blocks cross-site request forgery without requiring custom CSRF tokens, keeping client-server communication clean, fast, and simple.

### 11. Option B Landing Page & Dedicated `/demo` Route

- **Decision**: Rather than embedding 5 stacked heavy visualization charts directly on the public homepage, adopt Option B: the landing page teases the 3D rotating `GlobeLive` in the Hero section and links to `/demo` ("See live demo"). A dedicated public route `/demo` displays every visualization at full scale on real components, backed exclusively by static seeded data (`lib/demo-data.json`).
- **Reason**: Keeps the landing page lightning-fast (LCP < 1s, minimal DOM nodes and JS bundle) while providing visitors with a full-screen, uncompromised interactive experience of the entire analytics suite on `/demo` with zero live database queries.

### 12. Dev Gallery Retirement & Production 404

- **Decision**: Removed the "Gallery" link from the authenticated dashboard header (`components/dashboard/Header.tsx`) and configured `app/viz-gallery/page.tsx` to return `notFound()` (HTTP 404) whenever `process.env.NODE_ENV === "production"`.
- **Reason**: Logged-in users view real data on the real dashboard, and visitors view visualizations on `/demo`. The gallery was only a dev preview and should not be exposed in production.


