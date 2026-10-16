import { test, expect } from "@playwright/test";

test.describe("Dashboard Authentication Flow", () => {
  test("unauthenticated request to /dashboard redirects to /login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login\?next=%2Fdashboard/);
    await expect(page.locator("input#email")).toBeVisible();
    await expect(page.locator("input#password")).toBeVisible();
  });

  test("invalid credentials displays error message", async ({ page }) => {
    await page.goto("/login");
    await page.fill("input#email", "nonexistent@user.com");
    await page.fill("input#password", "incorrect-pwd-1234");
    await page.click("button[type='submit']");

    await expect(page.locator("[data-testid='login-error']")).toBeVisible();
    await expect(page.locator("[data-testid='login-error']")).toContainText(
      "Invalid credentials"
    );
  });

  test("valid user logs in and reaches dashboard", async ({ page, request, context }) => {
    const ts = Date.now();
    const testIp = `10.10.1.${ts % 250}`;
    const email = `loginflow_${ts}@spidytest.internal`;
    const password = "ValidPassword123!";

    await context.setExtraHTTPHeaders({
      "X-Forwarded-For": testIp,
    });

    // Register user first with unique test IP
    const regRes = await request.post("/api/auth/register", {
      headers: { "X-Forwarded-For": testIp },
      data: { email, password },
    });
    expect(regRes.status()).toBe(201);

    // Create a site for this user so /dashboard doesn't bounce to /new
    const cookie = regRes.headers()["set-cookie"];
    await request.post("/api/sites", {
      headers: { cookie },
      data: { domain: `logintest-${ts}.com` },
    });

    // Now test browser login
    await page.goto("/login");
    await page.fill("input#email", email);
    await page.fill("input#password", password);
    await page.click("button[type='submit']");

    // Redirects to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator("header").first()).toBeVisible({ timeout: 10000 });
    await page.close();
  });
});
