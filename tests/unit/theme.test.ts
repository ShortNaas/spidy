import { describe, it, expect } from "vitest";
import { emberRamp, getEmberRampStep, categorical, tokens, lineColors } from "@/lib/theme";

describe("Theme Tokens & Data Ramps", () => {
  it("defines all core color tokens without blue tinting", () => {
    expect(tokens.colors.canvas).toBe("#050505");
    expect(tokens.colors.surface).toBe("#0f0f0f");
    expect(tokens.colors.raised).toBe("#161616");
    expect(tokens.colors.subtle).toBe("#1c1c1c");
    expect(tokens.colors.accent).toBe("#fb5c34");
    expect(tokens.colors.positive).toBe("#86d4b2");
    expect(tokens.colors.danger).toBe("#f43f5e");
    expect(tokens.shadows.liveHalo).toBe("0 0 24px rgba(255, 255, 255, 0.25)");
  });

  it("defines the 6-step Ember volume ramp correctly", () => {
    expect(emberRamp).toHaveLength(6);
    expect(emberRamp[0].fill).toBe("#161616");
    expect(emberRamp[0].hatch).toBe(false);
    expect(emberRamp[1].hatch).toBe(true);
    expect(emberRamp[1].opacity).toBe(0.35);
    expect(emberRamp[2].hatch).toBe(true);
    expect(emberRamp[2].opacity).toBe(0.75);
    expect(emberRamp[3].fill).toBe("#c4472a");
    expect(emberRamp[4].fill).toBe("#fb5c34");
    expect(emberRamp[5].fill).toBe("#ff7a57");
  });

  it("maps ratios to ember ramp steps", () => {
    expect(getEmberRampStep(0).step).toBe(0);
    expect(getEmberRampStep(0.1).step).toBe(1);
    expect(getEmberRampStep(0.3).step).toBe(2);
    expect(getEmberRampStep(0.6).step).toBe(3);
    expect(getEmberRampStep(0.85).step).toBe(4);
    expect(getEmberRampStep(0.99).step).toBe(5);
  });

  it("provides 8 categorical series with hatch textures for series beyond 4", () => {
    const palette = categorical(8);
    expect(palette).toHaveLength(8);
    expect(palette[0].hatch).toBe(false);
    expect(palette[1].hatch).toBe(false);
    expect(palette[2].hatch).toBe(false);
    expect(palette[3].hatch).toBe(false);
    expect(palette[4].hatch).toBe(true);
    expect(palette[5].hatch).toBe(true);
    expect(palette[6].hatch).toBe(true);
    expect(palette[7].hatch).toBe(true);
  });

  it("defines lineColors with live and static both as white", () => {
    expect(lineColors.live).toBe("#ffffff");
    expect(lineColors.static).toBe("#ffffff");
  });
});
