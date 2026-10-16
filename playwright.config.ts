import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  timeout: 60000,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "./node_modules/.bin/next start",
    url: "http://localhost:3000",
    reuseExistingServer: false,
    timeout: 30000,
    env: {
      DASHBOARD_PASSWORD: process.env.DASHBOARD_PASSWORD || "spidy",
      SALT: process.env.SALT || "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    },
  },
});
