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

