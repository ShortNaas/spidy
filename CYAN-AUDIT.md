# Cyan Audit

Comprehensive inventory of all cyan, teal, sky, legacy live tokens, and blue-green color occurrences across the repository.

**Total Files Affected:** 22

**Total Hits:** 90

## Tokens & Styles

### `app/globals.css` (6 hits)

| Line | Content |
|---|---|
| 16 | `  --color-live: #22d3ee;` |
| 17 | `  --color-live-deep: #083344;` |
| 45 | `  --color-live: var(--color-live);` |
| 46 | `  --color-live-deep: var(--color-live-deep);` |
| 98 | `.hatch-live {` |
| 101 | `    var(--color-live) 0 1.5px,` |

### `lib/theme.ts` (4 hits)

| Line | Content |
|---|---|
| 51 | `  { color: "#22d3ee", hatch: false, name: "Cyan" },` |
| 67 | `  live: "#22d3ee",` |
| 105 | `    live: "#22d3ee",` |
| 106 | `    liveDeep: "#083344",` |

## Primitives & UI Components

### `components/ui/Button.tsx` (1 hits)

| Line | Content |
|---|---|
| 41 | `      "inline-flex items-center justify-center font-sans font-medium text-[13px] rounded-full transition-all duration-150 outline-none select-none cursor-pointer focus-visible:ring-2 focus-visible:ring-live focus-visible:ring-offset-2 focus-visible:ring-offset-canvas active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none";` |

### `components/ui/Chip.tsx` (2 hits)

| Line | Content |
|---|---|
| 24 | `    styleClasses = "bg-live-deep/60 border-live/40 text-live";` |
| 25 | `    dotColor = "bg-live shadow-[0_0_8px_var(--color-live)]";` |

### `components/ui/Input.tsx` (1 hits)

| Line | Content |
|---|---|
| 39 | `                : "border-border hover:border-border-hover focus:border-live focus:ring-1 focus:ring-live"` |

### `components/ui/Tabs.tsx` (1 hits)

| Line | Content |
|---|---|
| 41 | `            className={'rounded-full font-sans font-medium transition-all duration-150 outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-live focus-visible:ring-offset-2 focus-visible:ring-offset-canvas ${padClass} ${` |

### `components/ui/Wordmark.tsx` (1 hits)

| Line | Content |
|---|---|
| 23 | `      <Link href={href} className="inline-flex items-center outline-none focus-visible:ring-2 focus-visible:ring-live focus-visible:ring-offset-2 focus-visible:ring-offset-canvas rounded-sm">` |

## Visualizations

### `components/viz/GlobeLive.tsx` (6 hits)

| Line | Content |
|---|---|
| 56 | `    // Pure neutral gray landmass [0.15, 0.15, 0.15], cyan live blips [0.133, 0.827, 0.933]` |
| 68 | `      markerColor: [0.133, 0.827, 0.933], // Live Orbital Cyan` |
| 105 | `        <div className="w-48 h-48 rounded-full border border-live/20 border-t-live animate-spin" />` |
| 118 | `          : 'relative flex flex-col items-center justify-center bg-surface border border-border rounded-3xl p-6 sheen overflow-hidden shadow-[0_0_24px_rgba(34,211,238,0.15)] ${className}'` |
| 127 | `            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live opacity-75" />` |
| 128 | `            <span className="relative inline-flex rounded-full h-2 w-2 bg-live" />` |

### `components/viz/PulseLive.tsx` (6 hits)

| Line | Content |
|---|---|
| 95 | `              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live opacity-75" />` |
| 96 | `              <span className="relative inline-flex rounded-full h-2 w-2 bg-live" />` |
| 108 | `          <div className="text-xl font-mono font-semibold tabular-nums text-live mt-0.5">` |
| 120 | `      {/* Per-minute 1.5px live cyan sparkline */}` |
| 139 | `          {/* Stroke path: 1.5px live cyan */}` |
| 164 | `          {/* End marker: ring-dot (hollow circle with live cyan border) */}` |

### `components/viz/VizGalleryClient.tsx` (2 hits)

| Line | Content |
|---|---|
| 208 | `              2. Globe Live (Pure Gray Landmass &amp; Live Cyan Blips)` |
| 215 | `              3. Pulse Live (1.5px Cyan Stroke &amp; Ring-Dot End Marker)` |

## Pages & App Routes

### `app/dashboard/page.tsx` (1 hits)

| Line | Content |
|---|---|
| 41 | `          <div className="w-8 h-8 rounded-full border-2 border-live border-t-transparent animate-spin" />` |

### `app/dashboard/sites/[id]/page.tsx` (1 hits)

| Line | Content |
|---|---|
| 34 | `          <div className="w-8 h-8 rounded-full border-2 border-live border-t-transparent animate-spin" />` |

### `app/dashboard/sites/new/page.tsx` (4 hits)

| Line | Content |
|---|---|
| 158 | `          icon={<Globe className="w-5 h-5 text-live" />}` |
| 173 | `              <div className="bg-raised border border-border rounded-xl p-3.5 font-mono text-xs text-live break-all select-all flex items-center justify-between gap-4">` |
| 221 | `                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live opacity-75" />` |
| 222 | `                      <span className="relative inline-flex rounded-full h-3 w-3 bg-live shadow-[0_0_12px_rgba(34,211,238,0.6)]" />` |

### `components/dashboard/Header.tsx` (1 hits)

| Line | Content |
|---|---|
| 224 | `                className="w-8 h-8 rounded-full bg-raised border border-border text-muted hover:text-white flex items-center justify-center cursor-pointer transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-live"` |

### `components/landing/HeroGlobe.tsx` (1 hits)

| Line | Content |
|---|---|
| 23 | `    <div className="relative w-full max-w-[440px] aspect-square mx-auto flex items-center justify-center rounded-4xl bg-surface border border-border p-4 sheen overflow-hidden shadow-[0_0_24px_rgba(34,211,238,0.12)]">` |

## Tests & E2E

### `tests/unit/theme.test.ts` (1 hits)

| Line | Content |
|---|---|
| 11 | `    expect(tokens.colors.live).toBe("#22d3ee");` |

## Documentation & Configuration

### `impeccable/design.json` (14 hits)

| Line | Content |
|---|---|
| 9 | `        "displayName": "Orbital Cyan",` |
| 11 | `        "tonalRamp": ["#04232c", "#083344", "#0e7490", "#06b6d4", "#22d3ee", "#67e8f9", "#a5f3fc", "#ecfeff"]` |
| 17 | `        "tonalRamp": ["#04232c", "#083344", "#0e7490", "#06b6d4", "#22d3ee", "#67e8f9", "#a5f3fc", "#ecfeff"]` |
| 23 | `        "tonalRamp": ["#04232c", "#083344", "#0e7490", "#06b6d4", "#22d3ee", "#67e8f9", "#a5f3fc", "#ecfeff"]` |
| 140 | `      "css": ".ds-btn-primary { background: #06b6d4; color: #000; font-family: ui-monospace, SFMono-Regular, monospace; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; padding: 10px 18px; border: none; border-radius: 8px; cursor: pointer; transition: background 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease; box-shadow: 0 0 24px rgba(6,182,212,0.25); } .ds-btn-primary:hover { background: #22d3ee; transform: scale(1.02); }"` |
| 156 | `      "css": ".ds-input-field { background: #18181b; color: #ededed; font-family: ui-monospace, SFMono-Regular, monospace; font-size: 13px; padding: 8px 12px; border: 1px solid rgba(63,63,70,0.8); border-radius: 8px; outline: none; width: 100%; box-sizing: border-box; transition: border-color 0.15s ease, box-shadow 0.15s ease; } .ds-input-field:focus { border-color: #06b6d4; box-shadow: 0 0 0 1px #06b6d4; }"` |
| 164 | `      "css": ".ds-status-pill { display: inline-flex; align-items: center; gap: 6px; background: rgba(8,51,68,0.5); color: #67e8f9; border: 1px solid rgba(14,116,144,0.6); padding: 4px 10px; border-radius: 9999px; font-family: ui-monospace, SFMono-Regular, monospace; font-size: 11px; font-weight: 500; } .ds-pulse-dot { width: 6px; height: 6px; border-radius: 50%; background: #22d3ee; box-shadow: 0 0 8px #22d3ee; }"` |
| 180 | `      "css": ".ds-preset-bar { display: inline-flex; background: rgba(24,24,27,0.9); border: 1px solid #27272a; border-radius: 8px; padding: 2px; gap: 2px; } .ds-preset-item { background: transparent; border: none; border-radius: 6px; color: #a1a1aa; font-family: ui-monospace, SFMono-Regular, monospace; font-size: 11px; font-weight: 500; padding: 4px 10px; cursor: pointer; transition: all 0.15s ease; } .ds-preset-item.active { background: #27272a; color: #22d3ee; font-weight: 600; } .ds-preset-item:hover:not(.active) { color: #ededed; }"` |
| 185 | `    "overview": "Spidy treats web analytics not as commercial surveillance or marketing fluff, but as high-precision telemetry gathered from a deep-space vantage point. The interface is an astronomical cockpit: pitch-black canvases, muted obsidian instrument housings, and bioluminescent cyan vector projections that slice cleanly through the dark. Every element feels measured, silent, and mathematically sound.\n\nInformation is structured with rigorous density and immediate optical clarity. Rather than hiding data behind nested accordions or generic cards, Spidy showcases continuous geographic, diurnal, and navigational motion—rotating 3D WebGL globes, fluid Sankey journey rivers, and 7x24 diurnal matrices. The emotional tone is authoritative, honest, and calm: a nocturnal operations center monitoring live orbital data with zero corporate clutter.\n\nVisual anti-references are strictly rejected: no pastel gradients, no rounded-blob cards, no playful illustration mascots, no light-mode default, and no low-contrast gray-on-white text. If an element does not convey spatial, temporal, or numerical truth, it does not belong in the viewport.",` |
| 187 | `      "Void Canvas & Phosphor Highlights: Pure pitch black (#000000) canvas paired with radiant Orbital Cyan (#06b6d4) indicators.",` |
| 196 | `        "body": "Phosphor accents (Orbital Cyan #06b6d4, Growth Emerald #10b981) must strictly appear over pitch-black (#000000) or deep obsidian (#09090b) surfaces, never over mid-tone grays or low-contrast backgrounds.",` |
| 201 | `        "body": "Cyan (#06b6d4) represents live telemetry and primary navigation, Emerald (#10b981) signifies healthy growth and referrers, and Rose (#f43f5e) is reserved exclusively for destructive actions or metric degradation.",` |
| 231 | `        "body": "Diffuse cyan halos (0 0 24px rgba(6,182,212,0.25)) are strictly reserved for live pulse beacons, interactive hero catalysts, and active coordinate blips.",` |
| 243 | `      "Do reserve radiant cyan glows (shadow-[0_0_24px_rgba(6,182,212,0.25)]) exclusively for primary action triggers and live beacons.",` |

### `AGENT-PROMPT-redesign.md` (8 hits)

| Line | Content |
|---|---|
| 22 | `1. In 'app/globals.css', define CSS variables for every color, radius, and font in the DESIGN.md frontmatter: '--color-canvas', 'surface', 'raised', 'subtle', 'border', 'border-hover', 'text', 'muted', 'faint', 'accent', 'accent-bright', 'accent-deep', 'live', 'live-deep', 'positive', 'info', 'danger', and '--radius-*'.` |
| 23 | `2. Expose them to Tailwind through the theme ('@theme' in v4 or 'theme.extend' in v3), so 'bg-surface', 'border-border', 'text-muted', 'text-accent', 'bg-live', 'rounded-3xl' etc. work. Map 'rounded-3xl' to 24px and 'rounded-4xl' to 32px if needed.` |
| 26 | `   - '.hatch-accent', '.hatch-live', '.hatch-white': 'repeating-linear-gradient(-45deg, <color> 0 1.5px, transparent 1.5px 4.5px)'. Accept an '--hatch-opacity' variable.` |
| 40 | `- Every interactive primitive has hover, focus-visible (live cyan ring), active, and disabled states.` |
| 54 | `- **Sparklines and line charts:** 1.5px white lines with ring-dot markers; the live pulse uses cyan.` |
| 58 | `- **Globe:** dotted gray landmass, cyan live blips, live halo on the container only.` |
| 79 | `- Add-site page: snippet in a Raised block with mono text and a copy icon button; the waiting indicator is a live-cyan dot.` |
| 89 | `1. Grep for '#000', 'bg-black', 'zinc-', 'slate-', 'indigo-', 'cyan-', 'emerald-', 'rgb(', and raw hex outside 'globals.css' and 'lib/theme.ts'. Fix every hit. Record the result in 'PROGRESS.md'.` |

### `DESIGN.md` (2 hits)

| Line | Content |
|---|---|
| 122 | `- **Live = White:** Real-time elements are white with a soft white halo and motion. There is no cyan anywhere.` |
| 300 | `- Don't use cyan, teal, or any blue-green anywhere (UI, charts, focus rings, glows, favicons, OG image).` |

### `PRODUCT.md` (1 hits)

| Line | Content |
|---|---|
| 67 | `- Dark-first theme with high-contrast foregrounds and color-blind safe sequential palettes (cyan/viridis/inferno).` |

### `PROGRESS.md` (12 hits)

| Line | Content |
|---|---|
| 62 | `    3. 'CalendarHeatmap.tsx': 12-month GitHub-style daily activity heatmap with 5-stage sequential cyan/viridis color gradient and date tooltip.` |
| 249 | `- **Step 2: Tokens and textures**: Defined CSS variables for all DESIGN.md colors, radii, and fonts in 'app/globals.css', mapped to Tailwind '@theme inline'. Created '.sheen', '.hatch-accent', '.hatch-live', '.hatch-white', '.dotgrid', '.beam', and '.mono-num' utilities. Configured self-hosted Poppins (300-600) and Geist Mono in 'app/layout.tsx'. Implemented 'lib/theme.ts' exporting 'emberRamp', 'categorical(n)', 'lineColors', and 'sankeyColors'.` |
| 255 | `    - 'GlobeLive.tsx': Neutral gray landmass '[0.15, 0.15, 0.15]', live cyan blips '[0.133, 0.827, 0.933]', container live halo 'shadow-[0_0_24px_rgba(34,211,238,0.15)]', and motion preference support.` |
| 256 | `    - 'PulseLive.tsx': 1.5px live cyan stroke, ring-dot end marker ('#0f0f0f' fill with cyan outline), flat area fill, hover data points, and shared 'Tooltip'.` |
| 271 | `    - *Multi-color / rainbow chart ramps*: Impeccable typically suggests distinctive saturated hues per metric. Skipped because DESIGN.md explicitly enforces "The Status Rule" (Orange is volume, Cyan is live, Mint is positive, Rose is harm) and "The No Colored Gradient Rule".` |
| 289 | `  - Restyled 'app/dashboard/sites/new/page.tsx' using 'Card', 'Input', and 'Button' primitives; tracking snippet displayed in Raised block ('bg-raised border border-border text-live') with mono text and Copy button with Lucide icons; connection verification displays live-cyan pulsing indicator ('bg-live animate-ping').` |
| 304 | `    - Scanned all components and application routes with AST/regex verification for '#000', 'bg-black', 'zinc-*', 'slate-*', 'indigo-*', 'cyan-*', 'emerald-*', and raw hex codes.` |
| 319 | `      \| 'live' on Canvas \| '#22d3ee' \| '#050505' \| **11.28:1** \| Pass AAA \|` |
| 320 | `      \| 'live' on Surface \| '#22d3ee' \| '#0f0f0f' \| **10.61:1** \| Pass AAA \|` |
| 321 | `      \| 'live' on Raised \| '#22d3ee' \| '#161616' \| **10.01:1** \| Pass AAA \|` |
| 357 | `    - *Persona 3 (Keyboard & Screen Reader User)*: Semantic HTML landmarks ('<header>', '<main>', '<footer>'), keyboard trap prevention, Escape key modal dismiss, visible live-cyan focus rings.` |
| 364 | `    1. *Multi-color / rainbow chart ramps*: Impeccable suggests distinct saturated hues for each chart panel. Skipped because DESIGN.md explicitly enforces "The Status Rule" (Orange is volume, Cyan is live, Mint is positive, Rose is harm) and "The Near-Monochrome Rule" (austere dark palette with no blue tint).` |

### `REDESIGN-AUDIT.md` (14 hits)

| Line | Content |
|---|---|
| 3 | `This checklist tracks every file with hardcoded colors ('zinc-*', 'slate-*', 'cyan-*', 'indigo-*', 'emerald-*', 'rose-*', 'bg-black', hex, 'rgb'), fonts, radii, shadows, or gradients that must be refactored to use the design tokens and utilities defined in 'DESIGN.md'.` |
| 11 | `  - Define design tokens: '--color-canvas', 'surface', 'raised', 'subtle', 'border', 'border-hover', 'text', 'muted', 'faint', 'accent', 'accent-bright', 'accent-deep', 'live', 'live-deep', 'positive', 'info', 'danger', and '--radius-*'.` |
| 13 | `  - Implement utilities: '.sheen', '.hatch-accent', '.hatch-live', '.hatch-white', '.dotgrid', '.beam', '.mono-num'.` |
| 29 | `  - 'Input.tsx': Subtle background, hairline border, 12px radius, live cyan focus ring.` |
| 38 | `  - Replace 'bg-zinc-950', 'border-zinc-800', 'bg-cyan-500', 'text-cyan-400' with UI primitives and token utilities.` |
| 43 | `  - Replace 'bg-zinc-950', 'border-zinc-800/80', 'rounded-xl', 'text-cyan-400' with 'Card' and token classes.` |
| 49 | `  - Replace cyan spinner with live-token or neutral indicator in 32px frame with '.sheen'.` |
| 60 | `  - Export 'lineColors' (live cyan '#22d3ee', static white '#ffffff').` |
| 63 | `  - Replace cyan/viridis gradient with Ember volume ramp + diagonal hatching.` |
| 66 | `  - Replace cyan colors with Ember volume ramp + diagonal hatching.` |
| 71 | `  - Dotted gray landmass, cyan live blips ('#22d3ee'), container live halo.` |
| 77 | `  - 1.5px cyan live line with ring-dot markers.` |
| 79 | `  - Replace cyan scale with Ember volume ramp; empty countries Surface with hairline.` |
| 94 | `  - Snippet in Raised block with mono text; live cyan waiting indicator.` |

