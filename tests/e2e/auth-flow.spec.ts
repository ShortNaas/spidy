import { test, expect } from "@playwright/test";

test.describe("Agent 11: End-to-End Auth & Onboarding Flow", () => {
  test("complete flow: landing -> register -> add site -> snippet shown -> post event -> indicator flips -> dashboard -> logout", async ({
    page,
    request,
    context,
  }) => {
    const timestamp = Date.now();
    const testEmail = `user_${timestamp}@spidytest.internal`;
    const testPassword = "securePassword123!";
    const testDomain = `blog-${timestamp}.dev`;

    // Set custom IP on context to isolate from rate limits
    await context.setExtraHTTPHeaders({
      "X-Forwarded-For": `10.20.1.${timestamp % 250}`,
    });

    // 1. Landing: visit / and click "Get started"
    await page.goto("/");
    await expect(page).toHaveTitle(/Spidy/);
    const getStartedLink = page.getByRole("link", { name: /get started/i }).first();
    await expect(getStartedLink).toBeVisible();
    await getStartedLink.click();

    // 2. Register: verify redirected to /register, fill form and submit
    await expect(page).toHaveURL(/\/register/);
    await page.fill("input#email", testEmail);
    await page.fill("input#password", testPassword);
    await page.click("button[type='submit']");

    // 3. First-run onboarding: redirected to /dashboard/sites/new
    await expect(page).toHaveURL(/\/dashboard\/sites\/new/, { timeout: 15000 });
    await expect(page.getByRole("heading", { name: "Add New Site" })).toBeVisible({ timeout: 15000 });

    // 4. Add site: fill domain
    await page.fill("input#domain", testDomain);
    await page.click("button[type='submit']");

    // 5. Snippet shown: wait for embed snippet to appear
    const snippetCode = page.locator("[data-testid='embed-snippet']");
    await expect(snippetCode).toBeVisible();
    const snippetText = await snippetCode.innerText();
    expect(snippetText).toContain("data-site=");

    // Extract siteId from snippet
    const siteIdMatch = snippetText.match(/data-site="([^"]+)"/);
    expect(siteIdMatch).toBeTruthy();
    const siteId = siteIdMatch![1];
    expect(siteId.length).toBeGreaterThan(0);

    // 6. Live status indicator: initially shows "Waiting for first pageview..."
    const indicator = page.locator("[data-testid='live-status-indicator']");
    await expect(indicator).toBeVisible();
    await expect(indicator).toContainText("Waiting for first pageview...");

    // 7. Post a test event from allowed origin
    const collectRes = await request.post("/api/collect", {
      headers: {
        Origin: `https://${testDomain}`,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Content-Type": "application/json",
      },
      data: {
        site_id: siteId,
        path: "/",
        referrer: "https://google.com/search",
      },
    });
    expect(collectRes.status()).toBe(204);

    // 8. Indicator flips: polls and detects the event within 15s
    await expect(indicator).toContainText("First pageview received!", { timeout: 15000 });

    // 9. Dashboard shows it: click "View Dashboard →"
    const viewDashboardBtn = page.getByRole("button", { name: /view dashboard/i });
    await expect(viewDashboardBtn).toBeVisible();
    await viewDashboardBtn.click();

    await expect(page).toHaveURL(new RegExp(`/dashboard/sites/${siteId}`));
    await expect(page.locator("header").first()).toBeVisible();

    // 10. Logout: click Logout button in header
    const logoutBtn = page.getByRole("button", { name: /logout/i }).first();
    await expect(logoutBtn).toBeVisible();
    await logoutBtn.click();

    // Should redirect to /login
    await expect(page).toHaveURL(/\/login/);

    // 11. Redirected from /dashboard: trying to visit /dashboard redirects back to /login
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login\?next=%2Fdashboard/);
  });
});
