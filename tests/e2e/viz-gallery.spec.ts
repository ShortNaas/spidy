import { test, expect } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

test.describe("Visualization Gallery (/viz-gallery)", () => {
  const screenshotsDir = path.resolve(process.cwd(), "test-results/screenshots");

  test.beforeAll(() => {
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
  });

  test("renders all 8 visual components and captures screenshots", async ({ page }) => {
    test.setTimeout(240000);
    // Navigate to gallery
    await page.goto("/viz-gallery");
    await page.waitForLoadState("load");
    await page.waitForSelector("#viz-kpi-strip");
    await page.waitForTimeout(1000);
    const kpiStrip = page.locator("#viz-kpi-strip");
    await expect(kpiStrip).toBeVisible();
    await kpiStrip.screenshot({ path: path.join(screenshotsDir, "01-kpi-strip.png") });

    // 2. Globe Live
    const globeLive = page.locator("#viz-globe-live");
    await expect(globeLive).toBeVisible();
    // Allow canvas WebGL frame render
    await page.waitForTimeout(500);
    await globeLive.screenshot({ path: path.join(screenshotsDir, "02-globe-live.png") });

    // 3. Pulse Live
    const pulseLive = page.locator("#viz-pulse-live");
    await expect(pulseLive).toBeVisible();
    await pulseLive.screenshot({ path: path.join(screenshotsDir, "03-pulse-live.png") });

    // 4. World Choropleth
    const worldChoropleth = page.locator("#viz-world-choropleth");
    await expect(worldChoropleth).toBeVisible();
    await page.waitForTimeout(300);
    await worldChoropleth.screenshot({ path: path.join(screenshotsDir, "04-world-choropleth.png") });

    // 5. Flow Sankey
    const flowSankey = page.locator("#viz-flow-sankey");
    await expect(flowSankey).toBeVisible();
    await flowSankey.screenshot({ path: path.join(screenshotsDir, "05-flow-sankey.png") });

    // 6. Page Stream
    const pageStream = page.locator("#viz-page-stream");
    await expect(pageStream).toBeVisible();
    await pageStream.screenshot({ path: path.join(screenshotsDir, "06-page-stream.png") });

    // 7. Calendar Heatmap
    const calendarHeatmap = page.locator("#viz-calendar-heatmap");
    await expect(calendarHeatmap).toBeVisible();
    await calendarHeatmap.screenshot({ path: path.join(screenshotsDir, "07-calendar-heatmap.png") });

    // 8. Hour-Weekday Heatmap
    const hourWeekday = page.locator("#viz-hour-weekday");
    await expect(hourWeekday).toBeVisible();
    await hourWeekday.screenshot({ path: path.join(screenshotsDir, "08-hour-weekday.png") });

    // Verify all 8 screenshot files exist
    const files = fs.readdirSync(screenshotsDir);
    expect(files.filter((f) => f.endsWith(".png")).length).toBe(8);
    await page.close();
  });
});
