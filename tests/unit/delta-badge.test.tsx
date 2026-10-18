import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DeltaBadge } from "@/components/ui/DeltaBadge";
import { KpiCard } from "@/components/ui/KpiCard";

describe("DeltaBadge Primitive", () => {
  it("renders positive delta with positive token styling and + sign", () => {
    const html = renderToStaticMarkup(<DeltaBadge value={12.4} />);
    expect(html).toContain("text-positive");
    expect(html).toContain("bg-positive/15");
    expect(html).toContain("+12.4%");
    expect(html).toContain('aria-label="Up 12.4 percent versus previous period"');
    expect(html).not.toContain("text-negative");
  });

  it("renders negative delta with soft rose negative token styling and real minus sign U+2212", () => {
    const html = renderToStaticMarkup(<DeltaBadge value={-12.4} />);
    expect(html).toContain("text-negative");
    expect(html).toContain("bg-negative/15");
    expect(html).toContain("\u221212.4%"); // Real minus sign U+2212
    expect(html).toContain('aria-label="Down 12.4 percent versus previous period"');
    expect(html).not.toContain("text-positive");
  });

  it("strictly enforces real minus sign (U+2212) instead of ASCII hyphen", () => {
    const html = renderToStaticMarkup(<DeltaBadge value={-5.5} />);
    // Check for U+2212 (character code 8722)
    expect(html).toContain("\u22125.5%");
    // Ensure no ASCII hyphen in the percentage number itself
    expect(html).not.toContain("-5.5%");
  });

  it("renders zero delta with neutral style and flat dash", () => {
    const html = renderToStaticMarkup(<DeltaBadge value={0} />);
    expect(html).toContain("text-muted");
    expect(html).toContain("bg-raised");
    expect(html).toContain("0%");
    expect(html).toContain('aria-label="0 percent change versus previous period"');
    expect(html).not.toContain("text-positive");
    expect(html).not.toContain("text-negative");
  });

  it("renders null delta with neutral style and en-dash", () => {
    const html = renderToStaticMarkup(<DeltaBadge value={null} />);
    expect(html).toContain("text-muted");
    expect(html).toContain("bg-raised");
    expect(html).toContain("\u2013"); // en-dash
    expect(html).toContain('aria-label="No previous data"');
    expect(html).not.toContain("NaN");
    expect(html).not.toContain("Infinity");
  });

  it("renders previous-zero state with 'New' label", () => {
    const html = renderToStaticMarkup(<DeltaBadge value={null} isPreviousZero={true} />);
    expect(html).toContain("text-muted");
    expect(html).toContain("bg-raised");
    expect(html).toContain("New");
    expect(html).toContain('aria-label="New metric"');
  });

  it("handles non-finite values safely without showing Infinity or NaN", () => {
    const htmlNaN = renderToStaticMarkup(<DeltaBadge value={NaN} />);
    expect(htmlNaN).toContain("\u2013");
    expect(htmlNaN).not.toContain("NaN");

    const htmlInf = renderToStaticMarkup(<DeltaBadge value={Infinity} />);
    expect(htmlInf).toContain("\u2013");
    expect(htmlInf).not.toContain("Infinity");
    expect(htmlInf).not.toContain("+∞%");
  });

  it("supports invert: true for bounce rate (decrease is positive style, increase is negative style)", () => {
    // Decrease in bounce rate (-4%) is good -> positive style, but down arrow and - sign
    const htmlDecrease = renderToStaticMarkup(<DeltaBadge value={-4} invert={true} />);
    expect(htmlDecrease).toContain("text-positive");
    expect(htmlDecrease).toContain("bg-positive/15");
    expect(htmlDecrease).toContain("\u22124%"); // still shows minus sign
    expect(htmlDecrease).toContain('aria-label="Down 4 percent versus previous period"');

    // Increase in bounce rate (+4%) is bad -> negative style, but up arrow and + sign
    const htmlIncrease = renderToStaticMarkup(<DeltaBadge value={4} invert={true} />);
    expect(htmlIncrease).toContain("text-negative");
    expect(htmlIncrease).toContain("bg-negative/15");
    expect(htmlIncrease).toContain("+4%"); // still shows plus sign
    expect(htmlIncrease).toContain('aria-label="Up 4 percent versus previous period"');
  });

  it("correctly rounds at 0.04, 12.46, 100, and 1234.5", () => {
    // 0.04: under 100%, 1 decimal -> 0 -> +0%
    const html004 = renderToStaticMarkup(<DeltaBadge value={0.04} />);
    expect(html004).toContain("+0%");

    // 12.46: under 100%, 1 decimal -> 12.5 -> +12.5%
    const html1246 = renderToStaticMarkup(<DeltaBadge value={12.46} />);
    expect(html1246).toContain("+12.5%");

    // 100: at 100%, 0 decimals -> 100 -> +100%
    const html100 = renderToStaticMarkup(<DeltaBadge value={100} />);
    expect(html100).toContain("+100%");

    // 1234.5: >= 100%, 0 decimals -> 1,235 -> +1,235%
    const html1234 = renderToStaticMarkup(<DeltaBadge value={1234.5} />);
    expect(html1234).toMatch(/\+(1,235|1235)%/);
  });

  it("passes invert={true} from KpiCard to DeltaBadge correctly for bounce rate", () => {
    // Decrease in bounce rate (-4%) with invert={true} -> mint positive style
    const htmlDecrease = renderToStaticMarkup(
      <KpiCard label="Bounce Proxy" value="36%" deltaPct={-4} invert={true} />
    );
    expect(htmlDecrease).toContain("text-positive");
    expect(htmlDecrease).toContain("bg-positive/15");
    expect(htmlDecrease).toContain("\u22124%");

    // Increase in bounce rate (+4%) with invert={true} -> soft rose negative style
    const htmlIncrease = renderToStaticMarkup(
      <KpiCard label="Bounce Proxy" value="44%" deltaPct={4} invert={true} />
    );
    expect(htmlIncrease).toContain("text-negative");
    expect(htmlIncrease).toContain("bg-negative/15");
    expect(htmlIncrease).toContain("+4%");
  });
});
