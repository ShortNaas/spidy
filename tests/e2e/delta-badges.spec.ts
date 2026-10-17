import { test, expect } from "@playwright/test";

test.describe("Delta Badges on /demo Verification", () => {
  const viewports = [
    { name: "390", width: 390, height: 844 },
    { name: "1440", width: 1440, height: 900 },
  ];

  for (const vp of viewports) {
    test(`renders green (positive), red (negative), and neutral badges side by side at ${vp.name}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/demo");
      await page.waitForLoadState("networkidle");

      // Locate the KPI strip
      const kpiStrip = page.locator('div[aria-label="Key Performance Indicators"]');
      await expect(kpiStrip).toBeVisible();

      // Card 1: Total Pageviews (+18%, positive mint)
      const positiveBadge = kpiStrip.locator('span[role="status"]:has-text("+18%")');
      await expect(positiveBadge).toBeVisible();
      await expect(positiveBadge).toHaveAttribute(
        "aria-label",
        "Up 18 percent versus previous period"
      );

      // Card 2: Unique Visitors (−8.4%, negative soft rose)
      const negativeBadge = kpiStrip.locator('span[role="status"]:has-text("\u22128.4%")');
      await expect(negativeBadge).toBeVisible();
      await expect(negativeBadge).toHaveAttribute(
        "aria-label",
        "Down 8.4 percent versus previous period"
      );

      // Card 4: Top Country (neutral)
      const neutralBadge = kpiStrip.locator('span[role="status"]:has-text("\u2013")');
      await expect(neutralBadge).toBeVisible();
      await expect(neutralBadge).toHaveAttribute("aria-label", "No previous data");

      // Verify computed colors
      const positiveColor = await positiveBadge.evaluate((el) => window.getComputedStyle(el).color);
      const positiveBg = await positiveBadge.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor
      );

      const negativeColor = await negativeBadge.evaluate((el) => window.getComputedStyle(el).color);
      const negativeBg = await negativeBadge.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor
      );

      const neutralColor = await neutralBadge.evaluate((el) => window.getComputedStyle(el).color);

      // Assert that negative badge color is NOT the positive color
      expect(negativeColor).not.toEqual(positiveColor);
      expect(negativeBg).not.toEqual(positiveBg);

      // Assert that positive matches mint rgb(134, 212, 178)
      expect(positiveColor).toBe("rgb(134, 212, 178)");

      // Assert that negative matches soft rose rgb(242, 125, 147)
      expect(negativeColor).toBe("rgb(242, 125, 147)");

      // Assert neutral matches muted rgb(141, 141, 141)
      expect(neutralColor).toBe("rgb(141, 141, 141)");

      // Capture screenshot showing green badge, red badge, and neutral badge side by side
      await kpiStrip.screenshot({
        path: `screenshots/delta-badges-${vp.name}.png`,
      });
    });
  }
});
