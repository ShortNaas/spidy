import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { setDbClient, type QueryExecutor } from "@/lib/db";
import { SESSION_COOKIE_NAME } from "@/lib/auth";
import { GET as getSitesHandler, POST as postSitesHandler } from "@/app/api/sites/route";
import { GET as getStatsHandler } from "@/app/api/stats/[metric]/route";
import { GET as getLiveHandler } from "@/app/api/live/route";
import { NextRequest } from "next/server";

describe("Site Ownership & Scoping (Agent 10)", () => {
  const originalEnv = process.env;

  // Mock database tables
  const users = [
    { id: "user-a-uuid", email: "usera@example.com" },
    { id: "user-b-uuid", email: "userb@example.com" },
  ];

  const RAW_TOKEN_A = "raw-token-user-a-64-characters-000000000000000000000000000000000";
  const RAW_TOKEN_B = "raw-token-user-b-64-characters-000000000000000000000000000000000";
  let tokenHashA = "";
  let tokenHashB = "";
  let sessions: Array<{ token_hash: string; user_id: string }> = [];

  let sites: Array<{ id: string; domain: string; user_id: string; created_at: string }> = [];

  beforeEach(async () => {
    process.env = { ...originalEnv };
    sites = [
      { id: "site-a-1", domain: "site-a.com", user_id: "user-a-uuid", created_at: new Date().toISOString() },
      { id: "site-b-1", domain: "site-b.com", user_id: "user-b-uuid", created_at: new Date().toISOString() },
    ];
    const { hashToken } = await import("@/lib/auth");
    tokenHashA = await hashToken(RAW_TOKEN_A);
    tokenHashB = await hashToken(RAW_TOKEN_B);

    sessions = [
      { token_hash: tokenHashA, user_id: "user-a-uuid" },
      { token_hash: tokenHashB, user_id: "user-b-uuid" },
    ];

    const mockDb: QueryExecutor = ((
      stringsOrQuery: TemplateStringsArray | string,
      ...values: unknown[]
    ) => {
      const sqlText =
        typeof stringsOrQuery === "string" ? stringsOrQuery : stringsOrQuery.join("?");

      // 1. Session user lookup
      if (sqlText.includes("FROM sessions") && sqlText.includes("JOIN users")) {
        const hash = values[0] as string;
        const s = sessions.find((item) => item.token_hash === hash);
        if (s) {
          const u = users.find((user) => user.id === s.user_id);
          if (u) return Promise.resolve([{ id: u.id, email: u.email }]);
        }
        return Promise.resolve([]);
      }

      // 2. Sites list by user_id
      if (sqlText.includes("FROM sites") && sqlText.includes("WHERE user_id =")) {
        const userId = values[0] as string;
        const matched = sites.filter((s) => s.user_id === userId);
        return Promise.resolve(matched);
      }

      // 3. Site count for user
      if (sqlText.includes("SELECT count(*)::int as count FROM sites WHERE user_id =")) {
        const userId = values[0] as string;
        const count = sites.filter((s) => s.user_id === userId).length;
        return Promise.resolve([{ count }]);
      }

      // 4. Domain uniqueness check
      if (sqlText.includes("FROM sites WHERE domain =")) {
        const domain = values[0] as string;
        const existing = sites.filter((s) => s.domain === domain);
        return Promise.resolve(existing);
      }

      // 5. Site creation insert
      if (sqlText.includes("INSERT INTO sites")) {
        const siteId = values[0] as string;
        const domain = values[1] as string;
        const userId = values[2] as string;
        const newSite = { id: siteId, domain, user_id: userId, created_at: new Date().toISOString() };
        sites.push(newSite);
        return Promise.resolve([newSite]);
      }

      // 6. Site ownership check: SELECT id FROM sites WHERE id = $1 AND user_id = $2
      if (sqlText.includes("FROM sites WHERE id =") && sqlText.includes("AND user_id =")) {
        const siteId = values[0] as string;
        const userId = values[1] as string;
        const matched = sites.filter((s) => s.id === siteId && s.user_id === userId);
        return Promise.resolve(matched);
      }

      // 7. General mock queries for stats metrics
      if (sqlText.includes("date_trunc")) {
        return Promise.resolve([{ ts: "2026-10-15", views: 10, visitors: 8 }]);
      }

      return Promise.resolve([]);
    }) as QueryExecutor;

    setDbClient(mockDb);
  });

  afterEach(() => {
    process.env = originalEnv;
    setDbClient(null);
  });

  it("GET /api/sites returns only sites belonging to the authenticated user", async () => {
    // Mock user A session
    const reqA = new NextRequest("http://localhost:3000/api/sites", {
      headers: { Cookie: `${SESSION_COOKIE_NAME}=${RAW_TOKEN_A}` },
    });

    // Provide getSessionUser mock resolution
    const resA = await getSitesHandler(reqA);
    expect(resA.status).toBe(200);
    const dataA = await resA.json();
    expect(dataA.sites).toBeDefined();
    expect(dataA.sites.every((s: { domain: string }) => s.domain === "site-a.com")).toBe(true);
  });

  it("POST /api/sites normalizes domain and creates site for authenticated user", async () => {
    const req = new NextRequest("http://localhost:3000/api/sites", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `${SESSION_COOKIE_NAME}=${RAW_TOKEN_A}`,
      },
      body: JSON.stringify({ domain: "https://New-Blog.dev/path" }),
    });

    const res = await postSitesHandler(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.site.domain).toBe("new-blog.dev");
    expect(data.site.id).toHaveLength(10); // 5 bytes = 10 hex chars
  });

  it("POST /api/sites rejects duplicate domains", async () => {
    const req = new NextRequest("http://localhost:3000/api/sites", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `${SESSION_COOKIE_NAME}=${RAW_TOKEN_A}`,
      },
      body: JSON.stringify({ domain: "site-a.com" }),
    });

    const res = await postSitesHandler(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("already exists");
  });

  it("enforces cross-user isolation: user A cannot access user B's stats (returns 404)", async () => {
    // User A attempts to view User B's site stats
    const reqCross = new NextRequest("http://localhost:3000/api/stats/timeseries?siteId=site-b-1", {
      headers: { Cookie: `${SESSION_COOKIE_NAME}=${RAW_TOKEN_A}` },
    });

    const resCross = await getStatsHandler(reqCross, {
      params: Promise.resolve({ metric: "timeseries" }),
    });

    // Hard Constraint 12: Must return 404 (not 403)
    expect(resCross.status).toBe(404);
    const dataCross = await resCross.json();
    expect(dataCross.error).toBe("Site not found");
  });

  it("user A can access own site stats (returns 200)", async () => {
    const reqOwn = new NextRequest("http://localhost:3000/api/stats/timeseries?siteId=site-a-1", {
      headers: { Cookie: `${SESSION_COOKIE_NAME}=${RAW_TOKEN_A}` },
    });

    const resOwn = await getStatsHandler(reqOwn, {
      params: Promise.resolve({ metric: "timeseries" }),
    });

    expect(resOwn.status).toBe(200);
  });

  it("enforces cross-user isolation on live endpoint: user A cannot access user B's live stats (returns 404)", async () => {
    const reqLive = new NextRequest("http://localhost:3000/api/live?siteId=site-b-1", {
      headers: { Cookie: `${SESSION_COOKIE_NAME}=${RAW_TOKEN_A}` },
    });

    const resLive = await getLiveHandler(reqLive);
    expect(resLive.status).toBe(404);
    const data = await resLive.json();
    expect(data.error).toBe("Site not found");
  });
});
