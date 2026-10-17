# TASK: Remove cyan from Spidy completely

`DESIGN.md` has been updated: there is no cyan, teal, or blue-green anywhere. Read it first (especially Colors, Elevation, Components, Don'ts). It wins over any older code or docs.

## New rules for what cyan used to do
| Was cyan | Now |
|---|---|
| Live beacons, live counter dot, "waiting for first pageview" dot | White dot with a pulsing white ring and the white live halo |
| 30-minute pulse line, live sparkline | White 1.5px line, ring-dot markers, pulsing white end dot |
| Globe blips | White blips with a pulsing ring; globe container gets the white live halo |
| Focus rings (`ring-live`, `ring-cyan-*`) | `focus-visible:ring-2 ring-white ring-offset-2 ring-offset-canvas` |
| Input focus | `border-white ring-1 ring-white/60` |
| Active chips and filter pills | White-on-Raised: `bg-raised text-white border-border-hover` (warm variant stays `accent-deep` with `text-accent`) |
| Heatmaps, choropleth, bars | Already ember ramp. Replace any remaining cyan steps with the ember ramp |
| Categorical series (streamgraph, max 8) | ember, white, mint, blue, then grays `#bdbdbd`, `#8d8d8d`, `#5f5f5f`; hatch beyond the fourth |
| Sankey | referrers gray-white, landing pages ember, next pages mint (no cyan) |
| `hatch-live` utility, `--color-live`, `--color-live-deep`, `live` Tailwind colors | Delete them. Use `hatch-white` or `hatch-accent` |

## Steps
1. **Find every cyan.** Search the whole repo (source, CSS, Tailwind config, `lib/theme.ts`, SVGs, favicons, OG image generator, docs, tests, Playwright snapshots) for: `cyan`, `teal`, `sky-`, `#06b6d4`, `#22d3ee`, `#0e7490`, `#083344`, `#0891b2`, `#67e8f9`, `rgba(34,211,238`, `rgba(6,182,212`, `--color-live`, `live-deep`, `ring-live`, `border-live`, `bg-live`, `text-live`, `hatch-live`, `lineColors.live`. Save the hit list to `CYAN-AUDIT.md`.
2. **Tokens.** Remove `live` and `live-deep` from `app/globals.css`, the Tailwind theme, and `lib/theme.ts`. In `lib/theme.ts`: `lineColors` becomes `{ live: text-white, static: text-white }` with live distinguished by the pulsing end dot, `categorical(n)` follows the new list above. Update the live halo token to `0 0 24px rgba(255,255,255,0.25)`.
3. **Components.** Replace every use per the table. Shared primitives (`Button`, `Input`, `Chip`, `Tabs`, `Tooltip`, `Banner`, `Skeleton`) use white focus rings. Delete dead variants.
4. **Visualizations.** Update `GlobeLive`, `PulseLive`, `KpiStrip` sparklines, `PageStream`, `FlowSankey`, and any heatmap or choropleth that still references cyan. Live elements pulse (scale 1 to 1.8, fade out, 1.6 s loop); under `prefers-reduced-motion` they stay static.
5. **Pages.** Landing, auth, add-site page (the waiting indicator is a white pulsing dot), demo banner, settings, empty states.
6. **Assets.** Regenerate favicon, OG image, and any SVG that contains cyan; they must be neutral black and white, with orange only if needed.
7. **Docs and tests.** Update README, `PROGRESS.md`, `/dev/ui`, unit tests, and Playwright snapshots that mention or contain cyan. Re-record screenshots.

## Verification (record results in PROGRESS.md)
- The step 1 search returns zero hits (except `CYAN-AUDIT.md` itself, which can be deleted at the end).
- Pixel check: run a script over the Playwright screenshots of `/`, `/login`, `/register`, `/demo`, `/dashboard` at 390 and 1440 px and confirm no pixel falls within hue 160 to 210 with saturation above 30%.
- Contrast: white focus ring and white live elements on `canvas`, `surface`, and `raised` are all at least 3:1.
- Visual rules still hold: at most one solid-orange element per viewport, at most one `.beam` per page.
- `pnpm lint && pnpm test && pnpm build` pass, and e2e passes.

## Constraints
Visual change only. No behavior, routes, queries, or auth changes. Commit in small steps with conventional messages and add one line per step to `PROGRESS.md`. If stuck, write the problem to `BLOCKERS.md` and continue.
