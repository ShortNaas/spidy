# Architecture & Dependency Decisions

## Decision Log

### 1. Zero Extra Script Dependencies for Migrations & Seeds
- **Decision**: Use native Node.js 22 runtime features (`--experimental-strip-types` and `--env-file`) rather than adding third-party runners like `tsx` or `dotenv`.
- **Reason**: Aligns with AGENTS.md rule 4 (no unlisted dependencies) and the ponytail principle of using standard platform capabilities over external packages.

### 2. Pinned Exact Dependencies
- **Decision**: All production and development dependencies are pinned to exact semantic versions in `package.json` without carets (`^`) or tildes (`~`).
- **Reason**: Strict reproducibility across Vercel deployments and local execution per AGENTS.md instructions.
