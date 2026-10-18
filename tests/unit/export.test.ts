import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock dependencies before importing route
vi.mock("@/lib/auth", () => ({
  SESSION_COOKIE_NAME: "spidy_session",
  getSessionUser: vi.fn(),
}));

vi.mock("@/lib/queries", () => ({
  getKpis: vi.fn(),
  getTopPages: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  sql: vi.fn(),
}));

import { getSessionUser } from "@/lib/auth";
import { getKpis, getTopPages } from "@/lib/queries";
import { sql } from "@/lib/db";
import { GET } from "@/app/api/export/route";

describe("Export Route (/api/export)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 Unauthorized when session is missing or invalid", async () => {
    vi.mocked(getSessionUser).mockResolvedValue(null);

    const req = new NextRequest("http://localhost:3000/api/export?siteId=my-site");
    const res = await GET(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 404 Not Found when user does not own the requested site", async () => {
    vi.mocked(getSessionUser).mockResolvedValue({ id: "user-123", email: "user@example.com" });
    vi.mocked(sql).mockResolvedValue([] as unknown as never);

    const req = new NextRequest("http://localhost:3000/api/export?siteId=unowned-site", {
      headers: { cookie: "spidy_session=valid-token" },
    });
    const res = await GET(req);

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Site not found");
  });

  it("downloads in-memory export JSON with correct attachment headers and payload structure", async () => {
    vi.mocked(getSessionUser).mockResolvedValue({ id: "user-123", email: "user@example.com" });
    vi.mocked(sql).mockResolvedValue([{ id: "my-site" }] as unknown as never);

    const mockKpis = {
      current: { views: 1000, visitors: 400, bounceRate: 35, topCountry: "US" },
      previous: { views: 800, visitors: 300, bounceRate: 40, topCountry: "US" },
      deltas: { viewsPct: 25, visitorsPct: 33, bounceRatePct: -5 },
    };
    const mockPages = [
      { name: "/home", views: 600, visitors: 300 },
      { name: "/pricing", views: 400, visitors: 150 },
    ];

    vi.mocked(getKpis).mockResolvedValue(mockKpis);
    vi.mocked(getTopPages).mockResolvedValue(mockPages);

    const req = new NextRequest("http://localhost:3000/api/export?siteId=my-site", {
      headers: { cookie: "spidy_session=valid-token" },
    });
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/json; charset=utf-8");

    const contentDisposition = res.headers.get("Content-Disposition");
    expect(contentDisposition).toMatch(/^attachment; filename="my-site-export-\d{4}-\d{2}-\d{2}\.json"$/);

    const data = await res.json();
    expect(data.siteId).toBe("my-site");
    expect(data.exportedAt).toBeDefined();
    expect(data.range).toBeDefined();
    expect(data.range.from).toBeDefined();
    expect(data.range.to).toBeDefined();
    expect(data.kpis).toEqual(mockKpis);
    expect(data.topPages).toEqual(mockPages);
  });
});
