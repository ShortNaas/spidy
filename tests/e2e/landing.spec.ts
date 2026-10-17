import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

test.describe("Landing Page", () => {
  test.beforeAll(() => {
    const screenshotsDir = path.resolve(process.cwd(), "screenshots");
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
  });

  test("renders minimal landing page and captures 1440px and 390px screenshots", async ({
    page,
  }) => {
    // Desktop Viewport (1440px)
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Verify wordmark and primary elements
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("h1")).toContainText("Clean web telemetry.");
    await expect(page.getByRole("link", { name: "Open live demo" }).first()).toBeVisible();

    // Screenshot at 1440px
    await page.screenshot({ path: "screenshots/landing-1440.png", fullPage: true });

    // Mobile Viewport (390px)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Screenshot at 390px
    await page.screenshot({ path: "screenshots/landing-390.png", fullPage: true });
  });

  test("navigates from Open live demo button to /demo", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("link", { name: "Open live demo" }).first().click();
    await expect(page).toHaveURL(/\/demo/);
  });

  test("navigates from Get started button to /register", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("link", { name: "Get started" }).first().click();
    await expect(page).toHaveURL(/\/register/);
  });
});
