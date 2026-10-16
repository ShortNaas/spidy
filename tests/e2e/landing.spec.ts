import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

test.describe("Agent 12: Landing Page Showcase & Visuals (Option B)", () => {
  test.beforeAll(() => {
    const dir = path.resolve(process.cwd(), "tests/screenshots");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  test("captures mobile screenshot at 390px and desktop at 1440px", async ({ page }) => {
    // 1. Mobile viewport 390px
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page).toHaveTitle(/Spidy/);
    await page.waitForTimeout(1000); // Wait for canvas / components to mount
    await page.screenshot({ path: "tests/screenshots/landing-390px.png", fullPage: true });

    // 2. Desktop viewport 1440px
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForTimeout(1000);
    await page.screenshot({ path: "tests/screenshots/landing-1440px.png", fullPage: true });
  });

  test("contains all required marketing sections and privacy claims", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");

    // 1. Nav
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("header")).toContainText("Spidy");

    // 2. Hero
    await expect(page.locator("h1")).toContainText("Privacy-first analytics");
    await expect(page.locator("main")).toContainText("No cookies");
    await expect(page.locator("main")).toContainText("No IP addresses stored");

    // 3. Demo Teaser & Features (Option B)
    const features = page.locator("#features");
    await expect(features).toBeVisible();
    await expect(features).toContainText("The Dashboard Experience");
    await expect(features).toContainText("Explore every visualization at full scale");
    const demoLink = page.getByRole("link", { name: /see live demo/i }).first();
    await expect(demoLink).toBeVisible();

    // 4. Privacy section
    const privacy = page.locator("#privacy");
    await expect(privacy).toBeVisible();
    await expect(privacy).toContainText("Daily Rotating Salt");
    await expect(privacy).toContainText("Zero Visitor Cookies");
    await expect(privacy).toContainText("Clean URLs & Referrers");
    await expect(privacy).toContainText("90-Day Raw Retention");

    // 5. How It Works
    const howItWorks = page.locator("#how-it-works");
    await expect(howItWorks).toBeVisible();
    await expect(howItWorks).toContainText("Add your domain");
    await expect(howItWorks).toContainText("Paste one tag (<1 KB)");

    // 6. Footer & Links
    await expect(page.locator("footer")).toBeVisible();
    const privacyLink = page.locator("footer a[href='/privacy']");
    await expect(privacyLink).toBeVisible();
    const demoFooterLink = page.locator("footer a[href='/demo']");
    await expect(demoFooterLink).toBeVisible();
  });

  test("clicking 'See live demo' navigates to /demo", async ({ page }) => {
    await page.goto("/");
    const demoLink = page.getByRole("link", { name: /see live demo/i }).first();
    await expect(demoLink).toBeVisible();
    await demoLink.click();
    await expect(page).toHaveURL(/\/demo/);
    await expect(page.locator("#viz-kpi-strip")).toBeVisible();
  });

  test("unauthenticated visitor sees 'Get started' and lands on /register", async ({ page }) => {
    await page.goto("/");
    const getStarted = page.getByRole("link", { name: /get started free/i }).first();
    await expect(getStarted).toBeVisible();
    await getStarted.click();
    await expect(page).toHaveURL(/\/register/);
  });

  test("authenticated user sees 'Go to dashboard' on landing page", async ({
    page,
    context,
  }) => {
    // Set a valid 64-char hex session cookie
    const dummyToken = "a".repeat(64);
    await context.addCookies([
      {
        name: "spidy_session",
        value: dummyToken,
        domain: "localhost",
        path: "/",
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);

    await page.goto("/");
    const dashboardBtn = page.getByRole("link", { name: /dashboard/i }).first();
    await expect(dashboardBtn).toBeVisible();
    await expect(dashboardBtn).toContainText(/dashboard/i);
  });
});
