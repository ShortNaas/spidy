# Redesign Audit Checklist (Spidy v3)

This checklist tracks every file with hardcoded colors (`zinc-*`, `slate-*`, `indigo-*`, `emerald-*`, `rose-*`, `bg-black`, hex, `rgb`), fonts, radii, shadows, or gradients that must be refactored to use the design tokens and utilities defined in `DESIGN.md`.

---

## 1. Config & Global Styling

- [ ] `app/globals.css`
  - Remove legacy `--background` and `--foreground` CSS variables.
  - Define design tokens: `--color-canvas`, `surface`, `raised`, `subtle`, `border`, `border-hover`, `text`, `muted`, `faint`, `accent`, `accent-bright`, `accent-deep`, `positive`, `info`, `danger`, and `--radius-*`.
  - Expose tokens to Tailwind (`@theme inline`).
  - Implement utilities: `.sheen`, `.hatch-accent`, `.hatch-white`, `.dotgrid`, `.beam`, `.mono-num`.
- [ ] `app/layout.tsx`
  - Replace `Geist` sans with self-hosted `Poppins` (`300, 400, 500, 600`) as `--font-sans`.
  - Retain `Geist_Mono` as `--font-mono`.
  - Replace `body` classes `bg-black text-zinc-100` with `bg-canvas text-text font-sans antialiased`.

---

## 2. Shared & UI Primitives (`/components/ui`, `/components`)

- [ ] New UI Primitives (`/components/ui/`):
  - `Button.tsx`: primary (white pill), accent (orange pill, max 1), secondary (raised pill), ghost, icon (40px circle), danger.
  - `Tag.tsx`: full pill with 8px ring-dot (hollow circle).
  - `Tabs.tsx`: pill group on Subtle (active = white pill with black text).
  - `Card.tsx`: 24px radius (`rounded-3xl`), hairline border, `.sheen`, header with 40px circle icon.
  - `KpiCard.tsx`: label (muted 13px), value (Poppins 300, 40px), delta pill (mint/rose).
  - `Input.tsx`: Subtle background, hairline border, 12px radius, white focus ring.
  - `Chip.tsx` / `DeltaBadge.tsx`: pill status badges.
  - `Table.tsx`: Raised header, hairline divider, right-aligned mono numbers.
  - `Tooltip.tsx`: Raised background, hairline hover border, mono 12px.
  - `Skeleton.tsx`: Raised background with 1.6s sheen sweep.
  - `EmptyState.tsx`: dot-grid backdrop with ghost action pill.
  - `Banner.tsx`: 36px slim pill banner for demo.
  - `Wordmark.tsx`: `SPIDY`, Poppins 600, 18px, tracking-[0.12em], white text, no icon.
- [ ] `components/auth/RegisterForm.tsx`
  - Replace `bg-zinc-950`, `border-zinc-800`, `bg-white`, `text-white` with UI primitives and token utilities.
  - Wrap in 32px-radius card on canvas with `.dotgrid` backdrop.
- [ ] `components/dashboard/Header.tsx`
  - Convert top bar into a 72px floating pill bar: wordmark left, centered tab pill group, search & avatar circles right.
- [ ] `components/dashboard/DashboardClient.tsx`
  - Replace `bg-zinc-950`, `border-zinc-800/80`, `rounded-xl`, `text-white` with `Card` and token classes.
- [ ] `components/demo/DemoDashboardClient.tsx`
  - Shared shell with dashboard; add 36px Demo Banner; remove duplicated layout styles.
- [ ] `components/landing/DemoTeaserSection.tsx`
  - Refactor to match minimal airy layout with 24px/32px frames.
- [ ] `components/landing/HeroGlobe.tsx`
  - Replace white spinner with live-token or neutral indicator in 32px frame with `.sheen`.
- [ ] `components/landing/ShowcaseSection.tsx`
  - Consolidate into single 32px-radius showcase frame with ember heatmap and hatched bar chart.

---

## 3. Visualization Components (`/components/viz/`)

- [ ] `lib/theme.ts` (New):
  - Export `emberRamp` (6 steps: empty, hatched light 35%, hatched dense 75%, solid mid `#c4472a`, solid full `#fb5c34`, peak `#ff7a57`).
  - Export `categorical(n)` (max 8 colors per DESIGN.md).
  - Export `lineColors` (live white `#ffffff`, static white `#ffffff`).
  - Export `sankeyColors` (referrers white-gray, landing ember `#fb5c34`, next pages mint `#86d4b2`).
- [ ] `components/viz/CalendarHeatmap.tsx`
  - Replace viridis gradient with Ember volume ramp + diagonal hatching.
  - Update legend to 4 swatches (hatch light, hatch dense, solid mid, solid full).
- [ ] `components/viz/HourWeekdayHeatmap.tsx`
  - Replace blue-green colors with Ember volume ramp + diagonal hatching.
- [ ] `components/viz/FlowSankey.tsx`
  - Apply `sankeyColors` (referrers gray-white, landing ember, next mint).
  - 12px rounded node cards with 3px left colored edge.
- [ ] `components/viz/GlobeLive.tsx`
  - Dotted gray landmass, white live blips (`#ffffff`), container live halo.
- [ ] `components/viz/KpiStrip.tsx`
  - Refactor to `KpiCard` primitives with Poppins 300 40px numerals and mint/rose delta pills.
- [ ] `components/viz/PageStream.tsx`
  - Apply `categorical(n)` palette with hatched texture for series 5–8.
- [ ] `components/viz/PulseLive.tsx`
  - 1.5px white live line with ring-dot markers.
- [ ] `components/viz/WorldChoropleth.tsx`
  - Replace blue-green scale with Ember volume ramp; empty countries Surface with hairline.
- [ ] `components/viz/VizGalleryClient.tsx`
  - Update to preview all updated components.

---

## 4. Pages (`/app/`)

- [ ] `app/(marketing)/page.tsx`
  - Minimal and aesthetic redesign: 128px+ between sections, two-tone headlines, one hot orange CTA button, `.dotgrid` fade, single `.beam`, 32px showcase frame, connected steps with dot nodes, privacy cards, footer.
- [ ] `app/(marketing)/layout.tsx`
  - Neutral canvas wrapper without colored artifacts.
- [ ] `app/dashboard/page.tsx` & `app/dashboard/sites/[id]/page.tsx`
  - Render inside shared shell with 3-column cockpit grid.
- [ ] `app/dashboard/sites/new/page.tsx`
  - Snippet in Raised block with mono text; white live waiting indicator.
- [ ] `app/dashboard/settings/page.tsx`
  - Replace all custom form styles with shared UI primitives.
- [ ] `app/login/page.tsx`
  - 32px-radius card on canvas, `.dotgrid` backdrop, `Wordmark`, pill primary button.
- [ ] `app/privacy/page.tsx`
  - Clean two-tone headings, Card containers, pill tags.
- [ ] `app/dev/ui/page.tsx` (New dev preview page, 404 in production)
  - Showcase every primitive in every state (default, hover, focus, active, disabled).
