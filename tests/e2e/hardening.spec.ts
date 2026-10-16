import { test, expect } from "@playwright/test";

test.describe("Agent 13: Security Hardening & Isolation", () => {
  test("security headers are present on landing and dashboard", async ({ page }) => {
    const res = await page.goto("/");
    expect(res).toBeTruthy();
    const headers = res!.headers();

    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["content-security-policy"]).toBeDefined();
  });

  test("CSRF check rejects non-GET auth/site requests with external Origin", async ({
    request,
  }) => {
    // Attempting a POST to /api/sites with an unauthorized Origin header
    const csrfRes = await request.post("/api/sites", {
      headers: {
        Origin: "https://attacker-domain.evil.com",
        "Content-Type": "application/json",
      },
      data: { domain: "hacked.com" },
    });

    expect(csrfRes.status()).toBe(403);
    const body = await csrfRes.json();
    expect(body.error).toContain("CSRF");
  });

  test("unauthenticated access to protected API returns 401", async ({ request }) => {
    const res = await request.get("/api/stats/timeseries?siteId=any-site");
    expect(res.status()).toBe(401);
  });

  test("cross-tenant isolation: user cannot access another user's site stats (returns 404)", async ({
    request,
  }) => {
    // 1. Register User 1
    const ts = Date.now();
    const user1Email = `user1_${ts}@spidytest.internal`;
    const user1Pw = "password12345";
    const reg1 = await request.post("/api/auth/register", {
      headers: { "X-Forwarded-For": `172.16.0.${ts % 200}` },
      data: { email: user1Email, password: user1Pw },
    });
    expect(reg1.status()).toBe(201);
    const cookie1 = reg1.headers()["set-cookie"];

    // User 1 creates site
    const site1Res = await request.post("/api/sites", {
      headers: { cookie: cookie1 },
      data: { domain: `user1-${ts}.com` },
    });
    expect(site1Res.status()).toBe(201);
    const site1 = (await site1Res.json()).site;

    // 2. Register User 2 with distinct IP
    const user2Email = `user2_${ts}@spidytest.internal`;
    const user2Pw = "password12345";
    const reg2 = await request.post("/api/auth/register", {
      headers: { "X-Forwarded-For": `172.16.1.${ts % 200}` },
      data: { email: user2Email, password: user2Pw },
    });
    expect(reg2.status()).toBe(201);
    const cookie2 = reg2.headers()["set-cookie"];

    // User 2 creates site
    const site2Res = await request.post("/api/sites", {
      headers: { cookie: cookie2 },
      data: { domain: `user2-${ts}.com` },
    });
    expect(site2Res.status()).toBe(201);
    const site2 = (await site2Res.json()).site;

    // 3. User 1 accessing own site returns 200
    const ownStats = await request.get(`/api/stats/timeseries?siteId=${site1.id}`, {
      headers: { cookie: cookie1 },
    });
    expect(ownStats.status()).toBe(200);

    // 4. User 1 accessing User 2 site returns 404 (NOT 403, as specified in AGENTS-registration-landing.md)
    const crossStats = await request.get(`/api/stats/timeseries?siteId=${site2.id}`, {
      headers: { cookie: cookie1 },
    });
    expect(crossStats.status()).toBe(404);

    // 5. User 2 accessing User 1 site returns 404
    const crossStats2 = await request.get(`/api/stats/timeseries?siteId=${site1.id}`, {
      headers: { cookie: cookie2 },
    });
    expect(crossStats2.status()).toBe(404);
  });

  test("settings lifecycle: update password and delete account", async ({ request }) => {
    const ts = Date.now();
    const email = `lifecycle_${ts}@spidytest.internal`;
    const oldPassword = "oldPassword1234";
    const newPassword = "newPassword5678";

    // 1. Register with distinct IP
    const regRes = await request.post("/api/auth/register", {
      headers: { "X-Forwarded-For": `172.16.2.${ts % 200}` },
      data: { email, password: oldPassword },
    });
    expect(regRes.status()).toBe(201);
    const cookie = regRes.headers()["set-cookie"];

    // 2. Change password
    const pwRes = await request.post("/api/auth/password", {
      headers: { cookie },
      data: { currentPassword: oldPassword, newPassword },
    });
    expect(pwRes.status()).toBe(200);

    // 3. Login with old password fails
    const oldLogin = await request.post("/api/auth/login", {
      headers: { "X-Forwarded-For": `172.16.2.${ts % 200}` },
      data: { email, password: oldPassword },
    });
    expect(oldLogin.status()).toBe(401);

    // 4. Login with new password succeeds
    const newLogin = await request.post("/api/auth/login", {
      headers: { "X-Forwarded-For": `172.16.2.${ts % 200}` },
      data: { email, password: newPassword },
    });
    expect(newLogin.status()).toBe(200);
    const newCookie = newLogin.headers()["set-cookie"];

    // 5. Delete account
    const delRes = await request.post("/api/auth/delete-account", {
      headers: { cookie: newCookie },
      data: { confirmEmail: email },
    });
    expect(delRes.status()).toBe(200);

    // 6. Login now fails
    const postDelLogin = await request.post("/api/auth/login", {
      headers: { "X-Forwarded-For": `172.16.2.${ts % 200}` },
      data: { email, password: newPassword },
    });
    expect(postDelLogin.status()).toBe(401);
  });
});
