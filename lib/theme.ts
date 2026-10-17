/**
 * Spidy v3 Central Theme Tokens & Data Ramps (DESIGN.md)
 * All chart components and visual projections import styling strictly from this module.
 */

export interface RampStep {
  step: number;
  fill: string;
  hatch: boolean;
  opacity: number;
  label?: string;
}

/**
 * 6-step Ember volume ramp for heatmaps, choropleth, and bar distributions
 */
export const emberRamp: RampStep[] = [
  { step: 0, fill: "#161616", hatch: false, opacity: 1, label: "0 / Empty" },
  { step: 1, fill: "#fb5c34", hatch: true, opacity: 0.35, label: "Low (35% hatch)" },
  { step: 2, fill: "#fb5c34", hatch: true, opacity: 0.75, label: "Mid-Low (75% hatch)" },
  { step: 3, fill: "#c4472a", hatch: false, opacity: 1, label: "Mid (Solid)" },
  { step: 4, fill: "#fb5c34", hatch: false, opacity: 1, label: "High (Solid)" },
  { step: 5, fill: "#ff7a57", hatch: false, opacity: 1, label: "Peak (Solid)" },
];

/**
 * Maps a ratio (0.0 to 1.0) to an Ember volume ramp step
 */
export function getEmberRampStep(ratio: number): RampStep {
  if (ratio <= 0) return emberRamp[0];
  if (ratio < 0.2) return emberRamp[1];
  if (ratio < 0.45) return emberRamp[2];
  if (ratio < 0.7) return emberRamp[3];
  if (ratio < 0.9) return emberRamp[4];
  return emberRamp[5];
}

export interface CategoricalColor {
  color: string;
  hatch: boolean;
  name: string;
}

/**
 * 8-step Categorical Palette for Streamgraphs & Multi-series Charts
 * Series beyond 4 use hatch textures to remain clearly distinguishable
 */
export const CATEGORICAL_PALETTE: CategoricalColor[] = [
  { color: "#fb5c34", hatch: false, name: "Ember" },
  { color: "#ffffff", hatch: false, name: "White" },
  { color: "#22d3ee", hatch: false, name: "Cyan" },
  { color: "#86d4b2", hatch: false, name: "Mint" },
  { color: "#2861eb", hatch: true, name: "Blue (Hatched)" },
  { color: "#bdbdbd", hatch: true, name: "Light Gray (Hatched)" },
  { color: "#8d8d8d", hatch: true, name: "Muted Gray (Hatched)" },
  { color: "#5f5f5f", hatch: true, name: "Faint Gray (Hatched)" },
];

export function categorical(n: number): CategoricalColor[] {
  return CATEGORICAL_PALETTE.slice(0, Math.min(n, 8));
}

/**
 * Line and stroke styles for sparklines, trends, and real-time feeds
 */
export const lineColors = {
  live: "#22d3ee",
  static: "#ffffff",
  track: "#1c1c1c",
  grid: "rgba(255, 255, 255, 0.08)",
  gridHalf: "rgba(255, 255, 255, 0.04)",
} as const;

/**
 * Sankey journey transition colors
 */
export const sankeyColors = {
  referrer: "#ffffff",
  referrerMuted: "#8d8d8d",
  landing: "#fb5c34",
  next: "#86d4b2",
  link: "rgba(255, 255, 255, 0.12)",
  linkActive: "rgba(251, 92, 52, 0.4)",
} as const;

/**
 * Global color tokens matching DESIGN.md frontmatter
 */
export const tokens = {
  colors: {
    canvas: "#050505",
    surface: "#0f0f0f",
    raised: "#161616",
    subtle: "#1c1c1c",
    border: "rgba(255, 255, 255, 0.08)",
    borderHover: "rgba(255, 255, 255, 0.16)",
    borderHalf: "rgba(255, 255, 255, 0.04)",
    text: "#ffffff",
    muted: "#8d8d8d",
    faint: "#5f5f5f",
    accent: "#fb5c34",
    accentBright: "#ff7a57",
    accentMid: "#c4472a",
    accentDeep: "#7a2a16",
    live: "#22d3ee",
    liveDeep: "#083344",
    positive: "#86d4b2",
    info: "#2861eb",
    danger: "#f43f5e",
  },
  radii: {
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
    xxl: "32px",
    full: "9999px",
  },
} as const;
