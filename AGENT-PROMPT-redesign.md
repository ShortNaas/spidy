# TASK: Apply the Spidy v3 redesign

Read `DESIGN.md` fully before touching code. It is the single source of truth for colors, type, radii, textures, components, motion, and accessibility. If this prompt and DESIGN.md differ, DESIGN.md wins.

Reference images (if present) are in `/design-refs`: `B1` to `B5` (Behance NEXORA, dark) and `dribbble.png` (orange analytics dashboard). View them before Step 2. Match their feeling: neutral black, soft-sheen cards, thin white lines, grayscale light beam, dot-grid, pills, hatched orange data.

Work through the steps in order. After each step run `pnpm lint && pnpm test && pnpm build`, commit (one logical change per commit, conventional message), and add one line to `PROGRESS.md`.

## Rules
- Visual change only. Do not change routes, data queries, auth, privacy logic, or behavior.
- Dark only. No light mode, no theme toggle.
- No colored gradients. Allowed gradients: card sheen, light beam, dot-grid fade (all grayscale). Hatch is a pattern, not a gradient.
- Fonts via `next/font` (self-hosted at build time): Poppins and Geist Mono. No external CDN at runtime.
- No new dependencies except `lucide-react` if missing.
- After Step 2, no raw hex, `zinc-*`, `slate-*`, `bg-black`, or hardcoded `rgb()` in components. Everything reads from tokens and utilities.
- Respect `prefers-reduced-motion` on everything you add or touch.

## Step 1: Audit (no edits)
List every file with hardcoded colors, fonts, radii, shadows, or gradients. Save to `REDESIGN-AUDIT.md`, grouped by: pages, shared components, viz components, config. This is your checklist.

## Step 2: Tokens and textures
1. In `app/globals.css`, define CSS variables for every color, radius, and font in the DESIGN.md frontmatter: `--color-canvas`, `surface`, `raised`, `subtle`, `border`, `border-hover`, `text`, `muted`, `faint`, `accent`, `accent-bright`, `accent-deep`, `positive`, `info`, `danger`, and `--radius-*`.
2. Expose them to Tailwind through the theme (`@theme` in v4 or `theme.extend` in v3), so `bg-surface`, `border-border`, `text-muted`, `text-accent`, `rounded-3xl` etc. work. Map `rounded-3xl` to 24px and `rounded-4xl` to 32px if needed.
3. Create utilities in `globals.css`:
   - `.sheen`: `position:relative` with `::before` overlay `radial-gradient(120% 120% at 100% 100%, rgba(255,255,255,0.06), transparent 55%)` and a 1px inner top highlight. Overlay is `pointer-events:none` and sits behind content.
   - `.hatch-accent`, `.hatch-white`: `repeating-linear-gradient(-45deg, <color> 0 1.5px, transparent 1.5px 4.5px)`. Accept an `--hatch-opacity` variable.
   - `.dotgrid`: `radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)` at 12px with a radial mask fade.
   - `.beam`: blurred, rotated (-28deg) grayscale light streak, `pointer-events:none`, `aria-hidden`.
   - `.mono-num`: `font-family: var(--font-mono); font-variant-numeric: tabular-nums`.
4. Fonts: load Poppins (300, 400, 500, 600) as `--font-sans` and Geist Mono as `--font-mono`. Remove any previous sans.
5. Create `lib/theme.ts` exporting `emberRamp` (6 steps as `{ fill, hatch, opacity }`), `categorical(n)` (max 8, per DESIGN.md), `lineColors` (`live`, `static`), and `sankeyColors`. Charts import only from here.
6. Set `body` to `bg-canvas text-text font-sans antialiased`.
Done when: build passes and the app renders on the neutral black canvas with Poppins, even if components still use old classes.

## Step 3: Primitives (`/components/ui`)
Create or update: `Button` (primary, accent, secondary, ghost, danger, icon; all pills), `Tag` (ring-dot pill), `Tabs` (pill group, active = white pill with black text), `Card` (24px, hairline, `.sheen`, header with 40px circular icon button), `KpiCard`, `Input`, `Chip`, `DeltaBadge`, `Table`, `Tooltip`, `Skeleton`, `EmptyState`, `Banner`, `Wordmark`.
- Follow DESIGN.md Components exactly.
- `Wordmark`: text `SPIDY`, Poppins 600, 18px, `tracking-[0.12em]`, white, no icon.
- `Button` variant `accent` logs a dev warning if more than one is mounted at once.
- Every interactive primitive has hover, focus-visible (white ring), active, and disabled states.
Done when: a `/dev/ui` page (404 in production) shows every primitive in every state.

## Step 4: Shell
- Rebuild the top bar as a floating pill bar (72px, sticky, backdrop blur, Surface at 80%): wordmark left, tab pill group centered (range presets and views), search and avatar circles right.
- Dashboard and demo use the same shared shell and 3-column grid. Panels are `Card`.
- Demo banner per DESIGN.md.
Done when: `/dashboard` and `/demo` share one shell with no duplicated layout code.

## Step 5: Visualizations (`/components/viz`)
Restyle all of them using `lib/theme.ts` and the utilities only:
- **Heatmaps (calendar, hour x weekday):** 6px-radius cells in the ember ramp: empty, hatched light, hatched dense, solid mid, solid full. Legend with four swatches.
- **Bars/histograms:** pill-ended bars, hatched ember normally, solid ember for the active or peak bar, label bubble above the active bar.
- **Gauges and donuts:** segmented rounded arc gauge (filled ember, remaining hatched) and thin donut with rounded caps on a `#1c1c1c` track.
- **Sparklines and line charts:** 1.5px white lines with ring-dot markers; the live pulse uses white.
- **Sankey:** thin nodes with a 3px colored left edge, 12px-rounded node cards, links at 30% opacity; referrers gray-white, landing pages ember, next pages mint. Hover dims others to 25%.
- **Streamgraph:** `categorical(n)` colors, hatch for series beyond the fourth.
- **Choropleth:** ember ramp, empty cells Surface with a hairline.
- **Globe:** dotted gray landmass, white live blips, live halo on the container only.
- Shared `Tooltip` everywhere. Add a text alternative (title plus visually hidden summary) to each chart.
- Mount animations per DESIGN.md Motion, disabled under reduced motion.
Done when: every chart renders on the demo data with the new styling and no hardcoded colors remain in `/components/viz`.

## Step 6: Landing page (minimal and aesthetic)
Route `/`. Server component. This page is airy, not dense. Use 128px or more between sections, left-aligned text, and lots of empty black.
1. **Nav:** `Wordmark` left, pill links (`Demo`, `Privacy`), `Log in` ghost pill, `Get started` primary pill (logged-in users see `Dashboard`).
2. **Hero:** `Tag` ("Privacy-first analytics"), a two-tone display headline (white lead, muted continuation), one muted sentence (no cookies, no IPs stored, no banner needed), buttons: `Open live demo` (accent, the only accent on the page) and `Get started` (secondary). Behind: `.dotgrid` fade and one `.beam`. The globe on static data sits to the right on desktop and below on mobile in a 32px-radius frame with `.sheen`.
3. **One showcase frame:** a single large 32px-radius frame with the ember heatmap and one hatched bar chart on `lib/demo-data.json`, a heading and one muted line. Nothing else visual.
4. **How it works:** `Tag` + heading, three steps connected by thin lines with dot nodes (NEXORA workflow style), showing the real embed snippet and its byte size.
5. **Privacy:** `Tag` + heading, four small cards with one plain sentence each (true statements only: daily salted hash, no visitor cookies, referrer hostname only, Do Not Track honored, 90-day raw retention).
6. **Closing:** large two-tone line, the two buttons again.
7. **Footer:** wordmark, `/privacy`, source link.
- The landing page never queries the database. Static data only.
- Add `/privacy`, `sitemap.xml`, `robots.txt` (disallow `/dashboard`, `/api`), Open Graph image if missing.
- Budget: Lighthouse mobile performance >= 90, LCP < 2.5 s, above-the-fold JS < 150 KB gzipped (globe may load after first paint).
Done when: screenshots at 390 and 1440 px exist, and `Open live demo` reaches `/demo`, `Get started` reaches `/register`.

## Step 7: Auth, settings, add-site
- Auth card: 32px radius, Surface, hairline, `.sheen`, `.dotgrid` backdrop, `Wordmark` on top, pill primary button full width, inline errors.
- Add-site page: snippet in a Raised block with mono text and a copy icon button; the waiting indicator is a white live dot.
- Settings: only shared primitives.
Done when: all these pages use shared primitives only, with no page-specific color code.

## Step 8: States and polish
- Loading: `Skeleton` on every panel. Empty: `EmptyState` with dot-grid backdrop. Error: inline rose block with `Retry`.
- Add `transition-colors duration-150` to every interactive element.
- Replace any remaining icon set with Lucide (16/20px, 1.5px stroke).

## Step 9: Verification
1. Grep for `#000`, `bg-black`, `zinc-`, `slate-`, `indigo-`, `emerald-`, `rgb(`, and raw hex outside `globals.css` and `lib/theme.ts`. Fix every hit. Record the result in `PROGRESS.md`.
2. Contrast: check `text`, `muted`, `accent`, `live`, `positive`, `danger` on `canvas`, `surface`, `raised` (4.5:1 for text, 3:1 for large text and chart marks). Record a table in `PROGRESS.md`. Fix failing pairs by adjusting tokens, not components. `faint` is verified decorative-only (not used for readable text).
3. Check one-hot-thing: no page has more than one solid accent element in view; no page has more than one `.beam`.
4. Playwright screenshots at 390, 768, and 1440 px for `/`, `/login`, `/register`, `/demo`, `/dashboard`. Save to `/screenshots`.
5. Run with `reducedMotion: 'reduce'`: no globe rotation, no mount animation, no skeleton sweep.
6. Lighthouse on `/` (mobile): performance >= 90, accessibility >= 95. Record results.
7. All existing unit and e2e tests pass.

## Definition of done
- Every color, radius, font, and texture comes from tokens and utilities; changing a token restyles the whole app.
- Dashboard, demo, landing, and auth match DESIGN.md.
- Charts use hatch for low values, solid for peaks, pills for bars, and the shared tooltip.
- Landing page is minimal: hero, one showcase frame, three steps, privacy cards, closing line, footer.
- No behavior changes. All checks recorded in `PROGRESS.md`.

## If you get stuck
Write the problem and what you tried to `BLOCKERS.md`, then continue with the next step that does not depend on it.
