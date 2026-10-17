---
name: Spidy
description: Self-hosted, cookieless, privacy-first web analytics. Dark-only, near-monochrome, one hot accent, hatched data texture.
sources: Behance "NEXORA" cyber-security dashboard (neutral blacks, card sheen, Poppins, light beams, dot grid) and Dribbble "Sales" analytics dashboard (orange accent, hatched fills, pill-shaped bars, large radii).
colors:
  canvas: "#050505"
  surface: "#0f0f0f"          # NEXORA palette value
  raised: "#161616"
  subtle: "#1c1c1c"
  border: "rgba(255,255,255,0.08)"
  border-hover: "rgba(255,255,255,0.16)"
  text: "#ffffff"             # NEXORA palette value
  muted: "#8d8d8d"
  faint: "#5f5f5f"            # decorative and disabled only, never readable body text
  accent: "#fb5c34"           # NEXORA / Dribbble orange
  accent-bright: "#ff7a57"
  accent-deep: "#7a2a16"
  positive: "#86d4b2"         # NEXORA mint swatch [ASSUMED: label in the image reads #66FE4C but the swatch renders softer]
  info: "#2861eb"             # NEXORA blue
  danger: "#f43f5e"
typography:
  display:
    fontFamily: "var(--font-sans), system-ui, sans-serif"      # Poppins
    fontSize: "clamp(2.75rem, 6vw, 4.5rem)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  heading:
    fontFamily: "var(--font-sans), system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  subheading:
    fontFamily: "var(--font-sans), system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  title:
    fontFamily: "var(--font-sans), system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.4
  body:
    fontFamily: "var(--font-sans), system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
  kpi:
    fontFamily: "var(--font-sans), system-ui, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 300
    lineHeight: 1
    letterSpacing: "-0.02em"
  data:
    fontFamily: "var(--font-mono), ui-monospace, monospace"    # Geist Mono
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  xxl: "32px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.text}"
    textColor: "{colors.canvas}"
    rounded: "{rounded.full}"
    padding: "10px 20px"
  button-accent:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.canvas}"
    rounded: "{rounded.full}"
    padding: "10px 20px"
  button-secondary:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.text}"
    rounded: "{rounded.full}"
    padding: "10px 20px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.full}"
    padding: "10px 16px"
  input-field:
    backgroundColor: "{colors.subtle}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
  card-container:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: "20px 24px"
---

# Design System: Spidy

## Overview

**Creative North Star: "The Orbital Observatory", now in monochrome**

Spidy is a quiet, black instrument. The v3 look takes the NEXORA material (neutral black, soft-sheen cards, thin white lines, grayscale light beams, dot-grid texture, Poppins) and the Dribbble Sales dashboard's data language (one hot orange, hatched fills, pill-shaped bars, big rounded cards). Everything is near-monochrome so that the single orange accent carries meaning.

The interface should feel minimal and aesthetic: generous radii, soft surfaces, thin white strokes, two-tone headlines (white then gray), and texture used as information (hatching means "less", solid means "more").

Anti-references: no light mode, no pastel gradients, no colored gradients of any kind, no mascots or illustrations, no heavy drop shadows, no neon glow on every element, no emoji in UI.

**Key Characteristics:**
- **Neutral Black:** `#050505` canvas, `#0f0f0f` cards. No blue tint.
- **Soft-Sheen Cards:** 24px radius, hairline border, a faint white sheen toward the bottom-right corner.
- **One Hot Accent:** Orange `#fb5c34`, used for volume data, the hero CTA, and emphasis.
- **Live = White:** Real-time elements are white with a soft white halo and motion. There is no blue-green anywhere.
- **Hatch as Data:** Diagonal hatching fills low and mid values; solid fills mark peaks.
- **Pills Everywhere:** Buttons, tabs, tags, and delta badges are fully rounded.
- **Poppins + Geist Mono:** Poppins for structure and static KPIs, Geist Mono for anything that updates or sits in a column.

## Colors

- **Neutral stack (pure gray-black):**
  - Canvas `#050505`: page background.
  - Surface `#0f0f0f`: cards and panels.
  - Raised `#161616`: nested blocks, table headers, secondary buttons, hovered rows.
  - Subtle `#1c1c1c`: inputs and inactive tab backgrounds.
  - Border `rgba(255,255,255,0.08)` (hover `0.16`): every outline.
  - Text `#ffffff`: headings, metric values, text on dark.
  - Muted `#8d8d8d`: secondary text (at least 5:1 on Surface).
  - Faint `#5f5f5f`: decorative strokes, disabled states, axis ticks. Never used for readable body text.
- **Accent, Ember (`#fb5c34`):** volume and density data, the hero CTA, selected series, key deltas, hatch fills.
  - *Bright (`#ff7a57`):* hover and peak values.
  - *Deep (`#7a2a16`):* subdued badges and the low end of the ramp.
- **Live signal (white):** real-time elements (globe blips, live counter dot, 30-minute pulse line, the "waiting for first pageview" indicator) use `text` white with a pulsing ring and the white live halo. Focus rings are white.
- **Positive, Mint (`#86d4b2`) [ASSUMED swatch]:** positive deltas, healthy states, "next page" flows.
- **Info, Blue (`#2861eb`):** extra categorical series and links on marketing pages. Never a status color.
- **Danger, Rose (`#f43f5e`):** negative deltas, errors, destructive actions only.

### Data ramps
- **Ember volume ramp (heatmaps, choropleth, bars):** step 0 empty (`#161616` with hairline), step 1 hatched ember at 35%, step 2 hatched ember at 75%, step 3 solid `#c4472a`, step 4 solid `#fb5c34`, peak `#ff7a57`.
- **Live line:** white 1.5px stroke with ring-dot markers and a pulsing end dot.
- **Static trend lines and sparklines:** white 1.5px with ring-dot markers (NEXORA style).
- **Sankey:** referrers white-gray, landing pages ember, next pages mint.
- **Categorical (streamgraph, max 8):** ember, white, mint, blue, then gray steps `#bdbdbd`, `#8d8d8d`, `#5f5f5f`. Series beyond the fourth also use hatch to stay distinguishable.

### Named Rules
**The Status Rule.** White with motion means live. Mint means positive. Rose means harm. Orange is emphasis and volume, never an error. Blue is never a status.

**The One Hot Thing Rule.** At most one solid-orange filled UI element (button or highlighted series) competes per viewport. Hatched orange data does not count.

**The No Colored Gradient Rule.** Gradients are limited to grayscale: card sheen, light beam, and dot-grid fade. Color is always flat or hatched.

## Typography

Sans: **Poppins** (400, 500, 600, plus 300 for KPI). Mono: **Geist Mono**. Both self-hosted through `next/font`. No runtime font CDN.

| Role | Size | Weight | Notes |
|---|---|---|---|
| Display | clamp(44px, 6vw, 72px) | 600 | Landing hero. Two-tone: white then muted. |
| Heading | 36px | 600 | Section and page titles (NEXORA "Heading 36px Semibold"). |
| Subheading | 24px | 400 | Often in muted, or the muted half of a two-tone line. |
| Title | 16px | 500 | Panel headings. |
| Body | 14px | 400 | Copy and form text. |
| KPI | 40px | 300 | Big static numbers. |
| Data | 12px | 500 mono | Live numbers, table cells, timestamps, paths, code. |

### Named Rules
**The Two-Tone Headline Rule.** Hero and section headlines split into a white lead and a muted continuation, as in the NEXORA references.

**The Tabular Rule.** Any number that updates live, or sits in a column, uses Geist Mono with `tabular-nums`. Poppins numerals are only for static headline KPIs.

**The Sentence Case Rule.** Buttons, tabs, tags, and labels use sentence case in Poppins 500, 13px. No uppercase mono labels.

## Layout

- **Container:** `max-w-7xl`, `px-4 sm:px-6 lg:px-8`.
- **Dashboard grid:** `grid-cols-1 lg:grid-cols-3 gap-6`. Large visuals (globe, choropleth, sankey, streamgraph) span 2 columns; breakdown tables take 1. KPI strip on top: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`.
- **Top bar:** 72px, sticky, floating pill: a centered pill group of tabs on Subtle (active tab = white pill with black text), wordmark left, search and avatar circles right. Backdrop blur, Surface at 80%.
- **Landing:** single column, `max-w-6xl`, 128px or more between sections, text left-aligned, big empty areas on purpose.
- **Auth:** centered 420px card on Canvas with dot-grid texture behind.

### Named Rules
**The Density Split Rule.** The dashboard is compact and glanceable. The landing page and auth pages are airy. Do not carry dashboard density onto marketing pages.

## Elevation, Texture & Depth

Flat at rest. Depth comes from tone, hairlines, and texture.

- **Panels:** `bg-surface border border-border rounded-3xl`, hover `border-border-hover`.
- **Card sheen:** an overlay inside each card: `radial-gradient(120% 120% at 100% 100%, rgba(255,255,255,0.06), transparent 55%)` plus a 1px inner top highlight `rgba(255,255,255,0.04)`. Utility: `.sheen`.
- **Hatch fill:** `repeating-linear-gradient(-45deg, var(--color-accent) 0 1.5px, transparent 1.5px 4.5px)`. Utilities: `.hatch-accent`, `.hatch-white`. Opacity is set per ramp step.
- **Dot grid:** `radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)` at 12px spacing, masked with a radial fade so it vanishes toward the edges. Utility: `.dotgrid`. Used on the landing hero, the auth backdrop, and empty states.
- **Light beam:** one blurred, rotated grayscale streak (`rotate(-28deg)`, `blur(40px)`, white at 15 to 45% opacity along its length), `pointer-events-none`, `aria-hidden`. Maximum one per page, on the landing hero and at most one on the auth page. Utility: `.beam`.
- **Live halo:** `shadow-[0_0_24px_rgba(255,255,255,0.25)]` on live beacons and the globe container only.
- **Accent halo:** `shadow-[0_0_28px_rgba(251,92,52,0.28)]` on the single hero CTA only.

### Named Rules
**The Texture Means Something Rule.** Hatch encodes "lower", solid encodes "higher". Never use hatch as decoration on non-data elements, except the landing hero's single decorative bar.

**The Hairline Rule.** Separation is a 1px low-alpha white border. Resting surfaces never cast shadows.

## Shapes

- **8px:** tooltips, small chips, heatmap cells (6px for cells).
- **12px:** inputs, selects, nested blocks.
- **16px:** popovers, modals' inner panels.
- **24px:** cards, KPI cards, chart panels.
- **32px:** large feature frames on the landing page and the auth card.
- **Full:** buttons, tabs, tags, delta badges, avatars, circular icon buttons (40px), status dots, and the ends of bars.

### Named Rules
**The Pill Rule.** Anything clickable and compact is a pill or a circle. Anything that contains content is 24px or larger.

## Components

### Buttons (all pills, Poppins 500, 13px)
- **Primary:** `bg-white text-[#050505] hover:bg-white/90 px-5 py-2.5`. The default CTA, like the white "Add cases" pill in NEXORA.
- **Accent:** `bg-accent text-[#050505] hover:bg-accent-bright`. One per viewport.
- **Secondary:** `bg-raised border border-border text-white hover:border-border-hover`.
- **Ghost:** `text-muted hover:text-white`.
- **Icon button:** 40px circle on Raised with a hairline, 16px Lucide icon.
- **Danger:** ghost that turns `hover:text-rose-400`.
- **Disabled:** 40% opacity, `cursor-not-allowed`.
- **Focus (all):** `focus-visible:ring-2 ring-white ring-offset-2 ring-offset-canvas`.

### Tag (section label)
Full pill, Raised background, hairline border, a 8px ring-dot (hollow circle) on the left, text 13px white. Used as the section label on the landing page (for example "Privacy", "How it works").

### Tabs / Range presets
Pill group on Subtle with 4px padding; active item is a white pill with black text; inactive items muted with hover to white.

### Cards
`bg-surface border border-border rounded-3xl p-6 sheen`. Header: a 40px circular icon button on the left, title (16px 500) next to it, a ghost "more" icon button on the right. Footer link as a ghost pill.

### KPI Card
Label (muted 13px), value (Poppins 300, 40px; live values in mono), delta pill (mint or rose tinted background at 15%, text in the same hue), optional 28px white sparkline with ring-dot end marker.

### Charts
- **Bars:** pill-shaped (full-radius tops), hatched ember for normal values, solid ember for the active or peak value, a small label bubble above the active bar. Gridlines are `border` at 50%.
- **Heatmaps:** 6px-radius cells in the Ember volume ramp; legend as four small swatches with thresholds (hatch light, hatch dense, solid mid, solid full).
- **Radial gauge:** segmented arc with rounded segments (Dribbble style) filled in ember, remaining segments hatched; the value centered in Poppins 300.
- **Donut:** gray track `#1c1c1c`, white or ember arc with rounded caps.
- **Line charts:** 1.5px strokes, ring-dot markers at the hovered point and the last point, soft vertical highlight band on hover.
- **Sankey:** thin nodes with a 3px colored left edge (NEXORA flow style), rounded 12px node cards, links in 30% opacity.
- **Globe:** dotted gray landmass, white live blips with a pulsing ring, container with live halo.
- **Tooltip:** `bg-raised border border-border-hover rounded-xl px-3 py-2`, mono 12px values.

### Inputs
`bg-subtle border border-border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-faint`. Focus: `border-white ring-1 ring-white/60`. Error: `border-rose-500/50 bg-rose-950/30`, message in 12px rose below.

### Tables
Header row on Raised with muted 12px text, rows divided by hairlines, hover Raised, numeric columns right-aligned in mono, optional inline hatched-ember bar behind the value for share of total.

### Demo Banner
A slim pill-shaped bar (36px) below the top bar: ring-dot, text "You are viewing demo data", an accent pill "Create your own". It is the single accent element on `/demo`.

### Wordmark
Text only: `SPIDY`, Poppins 600, 18px, `tracking-[0.12em]`, white. No icon.

### Empty, Loading, Error
- **Loading:** Raised skeleton blocks with a slow 1.6s sheen sweep.
- **Empty:** dot-grid backdrop, a muted sentence, a ghost pill "Change range".
- **Error:** inline rose-tinted block with a ghost "Retry" pill.

## Motion
- Interactions: 150ms ease-out.
- Mount: 400ms opacity and 8px rise, 40ms stagger between sibling cards.
- KPI count-up: 600ms. Bars grow from baseline once on first view. Heatmap cells fade in diagonally.
- The globe rotates at 0.003 rad/frame.
- Everything respects `prefers-reduced-motion` (no rotation, no stagger, no count-up, no sheen sweep).

## Iconography
Lucide, 16px in controls and 20px in headers, 1.5px stroke, inherits color. No filled icons.

## Accessibility
- Text contrast at least 4.5:1; chart marks and large text at least 3:1. Faint is decorative only.
- Hatch and solid are distinguishable without color; every series also has a label or legend text.
- Every chart has a title plus a visually hidden summary or data table.
- Full keyboard access with visible focus rings.

## Do's and Don'ts

### Do
- Keep surfaces neutral and let orange carry meaning.
- Use hatch for lower values and solid for peaks.
- Use pills for controls and 24px or larger radii for containers.
- Use white for primary actions and headings.
- Pull all colors, radii, fonts, and textures from tokens and utilities.
- Split headlines into white and muted halves.

### Don't
- Don't add a light mode.
- Don't use blue-green anywhere (UI, charts, focus rings, glows, favicons, OG image).
- Don't tint the black blue; the neutrals stay pure gray.
- Don't use colored gradients; only grayscale sheen, beam, and dot-grid.
- Don't use orange for errors or warnings.
- Don't put more than one beam or one solid-orange element in view.
- Don't show raw IPs or personal data anywhere.
- Don't load fonts or assets from external CDNs.
