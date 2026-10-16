import { test, expect } from "@playwright/test";

test.describe("Dashboard Authentication Flow", () => {
  test("unauthenticated request redirects to /login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator("input#password")).toBeVisible();
  });

  test("invalid password displays error message", async ({ page }) => {
    await page.goto("/login");
    await page.fill("input#password", "incorrect-pwd-1234");
    await page.click("button[type='submit']");

    await expect(page.locator("[data-testid='login-error']")).toBeVisible();
    await expect(page.locator("[data-testid='login-error']")).toContainText("Invalid password");
  });

  test("valid password logs in and reaches dashboard", async ({ page }) => {
    await page.goto("/login");
    // In dev mode when DASHBOARD_PASSWORD is not set or default, password is 'spidy'
    await page.fill("input#password", process.env.DASHBOARD_PASSWORD || "spidy");
    await page.click("button[type='submit']");

    // Redirects to dashboard /
    await expect(page).toHaveURL(/\/(sites.*)?$/);
    await expect(page.locator("header")).toBeVisible();
    await page.close();
  });
});
