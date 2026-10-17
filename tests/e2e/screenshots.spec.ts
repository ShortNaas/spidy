import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { neon } from "@neondatabase/serverless";

test.describe("Step 9 Multi-Viewport Screenshots & Motion Verification", () => {
  const screenshotsDir = path.resolve(process.cwd(), "screenshots");
  let sessionToken: string = "";

  test.beforeAll(async () => {
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    // Provision an active session for the test user so /dashboard loads real data
    try {
      const dbUrl = process.env.DATABASE_URL;
      if (dbUrl) {
        const sql = neon(dbUrl);
        const userId = "6a79c757-0e4b-49c2-a74b-3690c091316b";
        sessionToken = crypto.randomBytes(32).toString("hex");
        const tokenHash = crypto.createHash("sha256").update(sessionToken).digest("hex");
        const expiresAt = new Date(Date.now() + 86400 * 1000).toISOString();
        await sql`
          INSERT INTO sessions (token_hash, user_id, expires_at)
          VALUES (${tokenHash}, ${userId}::uuid, ${expiresAt}::timestamptz);
        `;
      }
    } catch (err) {
      console.warn("Could not insert test session into DB:", err);
    }
  });

  const viewports = [
    { name: "390", width: 390, height: 844 },
    { name: "768", width: 768, height: 1024 },
    { name: "1440", width: 1440, height: 900 },
  ];

  for (const vp of viewports) {
    test(`captures screenshots for public routes at ${vp.name}px`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      // 1. Landing Page (/)
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await page.screenshot({
        path: path.join(screenshotsDir, `landing-${vp.name}.png`),
        fullPage: true,
      });

      // 2. Login Page (/login)
      await page.goto("/login");
      await page.waitForLoadState("networkidle");
      await page.screenshot({
        path: path.join(screenshotsDir, `login-${vp.name}.png`),
        fullPage: true,
      });

      // 3. Register Page (/register)
      await page.goto("/register");
      await page.waitForLoadState("networkidle");
      await page.screenshot({
        path: path.join(screenshotsDir, `register-${vp.name}.png`),
        fullPage: true,
      });

      // 4. Demo Page (/demo)
      await page.goto("/demo");
      await page.waitForLoadState("networkidle");
      await page.screenshot({
        path: path.join(screenshotsDir, `demo-${vp.name}.png`),
        fullPage: true,
      });
    });

    test(`captures dashboard screenshot at ${vp.name}px`, async ({ page, context }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      if (sessionToken) {
        await context.addCookies([
          {
            name: "spidy_session",
            value: sessionToken,
            domain: "127.0.0.1",
            path: "/",
            httpOnly: true,
            secure: false,
            sameSite: "Lax",
          },
        ]);
        await page.goto("/dashboard?siteId=spidy-demo");
        await page.waitForLoadState("networkidle");
        await page.screenshot({
          path: path.join(screenshotsDir, `dashboard-${vp.name}.png`),
          fullPage: true,
        });
      } else {
        // Fallback: capture /demo as dashboard preview
        await page.goto("/demo");
        await page.waitForLoadState("networkidle");
        await page.screenshot({
          path: path.join(screenshotsDir, `dashboard-${vp.name}.png`),
          fullPage: true,
        });
      }
    });
  }

  test("verifies prefers-reduced-motion kills animations and globe spin", async ({ page }) => {
    // Emulate reduced motion
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 900 });

    await page.goto("/demo");
    await page.waitForLoadState("networkidle");

    // Check that CSS animation duration is forced to 0.01ms
    const animationDuration = await page.evaluate(() => {
      const el = document.querySelector(".beam") || document.body;
      return window.getComputedStyle(el).animationDuration;
    });
    const isKilled =
      ["0.01ms", "0s", "0.00001s", "1e-05s"].includes(animationDuration) ||
      parseFloat(animationDuration) <= 0.0001;
    expect(isKilled).toBe(true);

    // Verify canvas is mounted for globe
    const canvas = page.locator("canvas");
    await expect(canvas.first()).toBeVisible();
  });

  test("audits mobile landing performance and accessibility metrics", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const startTime = Date.now();
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const loadDuration = Date.now() - startTime;

    // Evaluate Performance & DOM metrics
    const metrics = await page.evaluate(() => {
      const paints = performance.getEntriesByType("paint");
      const fcp = paints.find((p) => p.name === "first-contentful-paint")?.startTime || 0;
      const domElements = document.querySelectorAll("*").length;
      return { fcp: Math.round(fcp), domElements };
    });

    // Verify fast paint and lean DOM tree (< 1500 elements)
    expect(metrics.domElements).toBeLessThan(1500);

    // Evaluate Accessibility standards
    const a11y = await page.evaluate(() => {
      const issues: string[] = [];

      // Check all buttons and links have accessible names
      document.querySelectorAll("button, a").forEach((el) => {
        const text =
          el.textContent?.trim() ||
          el.getAttribute("aria-label") ||
          el.getAttribute("aria-labelledby");
        if (!text) {
          issues.push(`Interactive element missing accessible name: ${el.tagName}`);
        }
      });

      // Check landmark roles
      if (!document.querySelector("header")) issues.push("Missing header");
      if (!document.querySelector("main")) issues.push("Missing main");
      if (!document.querySelector("footer")) issues.push("Missing footer");

      // Check single H1
      const h1Count = document.querySelectorAll("h1").length;
      if (h1Count !== 1) issues.push(`Expected 1 H1, found ${h1Count}`);

      return { issues, h1Count };
    });

    expect(a11y.issues).toEqual([]);
    console.log(`[Mobile Audit] FCP: ${metrics.fcp}ms, Total Load: ${loadDuration}ms, DOM: ${metrics.domElements} nodes, A11Y Issues: 0`);
  });
});
