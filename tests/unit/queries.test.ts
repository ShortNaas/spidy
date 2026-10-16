import { describe, it, expect, beforeEach } from "vitest";
import { setDbClient, type QueryExecutor } from "@/lib/db";
import {
  getBrowsers,
  getDevices,
  getHourWeekdayMatrix,
  getKpis,
  getLiveEvents,
  getPageStream,
  getSankeyFlows,
  getTimeseries,
  getTopCountries,
  getTopPages,
  getTopReferrers,
} from "@/lib/queries";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/stats/[metric]/route";

describe("Query Layer Unit Tests (lib/queries.ts)", () => {
  const from = new Date("2026-10-01T00:00:00Z");
  const to = new Date("2026-10-15T23:59:59Z");
  const siteId = "test-site";

  beforeEach(() => {
    // Mock db client returning representative database records
    const mockDb = ((strings: TemplateStringsArray | string) => {
      const sqlText = typeof strings === "string" ? strings : strings.join("?");

      if (sqlText.includes("FROM sessions") && sqlText.includes("JOIN users")) {
        return Promise.resolve([{ id: "test-user-id", email: "test@example.com" }]);
      }

      if (sqlText.includes("FROM sites WHERE id =")) {
        return Promise.resolve([{ id: "test" }]);
      }

      if (sqlText.includes("date_trunc") && sqlText.includes("count(DISTINCT visitor)")) {
        return Promise.resolve([
          { ts: "2026-10-14 00:00:00+00", views: 42, visitors: 30 },
          { ts: "2026-10-15 00:00:00+00", views: 55, visitors: 38 },
        ]);
      }

      if (sqlText.includes("FROM daily_stats") && sqlText.includes("GROUP BY day")) {
        return Promise.resolve([
          { ts: "2026-10-05", views: 120, visitors: 80 },
          { ts: "2026-10-06", views: 140, visitors: 95 },
        ]);
      }

      if (sqlText.includes("path as name")) {
        return Promise.resolve([
          { name: "/", views: 100, visitors: 80 },
          { name: "/docs", views: 40, visitors: 30 },
        ]);
      }

      if (sqlText.includes("referrer") && sqlText.includes("as name")) {
        return Promise.resolve([
          { name: "google.com", views: 60, visitors: 45 },
          { name: "Direct / None", views: 30, visitors: 25 },
        ]);
      }

      if (sqlText.includes("country") && sqlText.includes("as name")) {
        return Promise.resolve([
          { name: "US", views: 80, visitors: 60 },
          { name: "DE", views: 30, visitors: 25 },
        ]);
      }

      if (sqlText.includes("device") && sqlText.includes("as name")) {
        return Promise.resolve([
          { name: "desktop", views: 70, visitors: 50 },
          { name: "mobile", views: 30, visitors: 25 },
        ]);
      }

      if (sqlText.includes("browser") && sqlText.includes("as name")) {
        return Promise.resolve([
          { name: "Chrome", views: 75, visitors: 55 },
          { name: "Safari", views: 25, visitors: 20 },
        ]);
      }

      if (sqlText.includes("EXTRACT(DOW FROM ts)")) {
        return Promise.resolve([
          { weekday: 1, hour: 14, views: 25 },
          { weekday: 2, hour: 15, views: 30 },
        ]);
      }

      if (sqlText.includes("session_events")) {
        return Promise.resolve([
          {
            source_referrer: "google.com",
            landing_page: "/",
            next_page: "/pricing",
            flow_count: 15,
          },
          {
            source_referrer: "github.com",
            landing_page: "/docs",
            next_page: "(Exit)",
            flow_count: 8,
          },
        ]);
      }

      if (sqlText.includes("SELECT path") && sqlText.includes("GROUP BY path")) {
        return Promise.resolve([{ path: "/" }, { path: "/pricing" }]);
      }

      if (sqlText.includes("date_trunc('day', ts)")) {
        return Promise.resolve([
          { date: "2026-10-15", path: "/", views: 50 },
          { date: "2026-10-15", path: "/pricing", views: 20 },
        ]);
      }

      if (
        sqlText.includes("count(DISTINCT visitor)::int as count") &&
        sqlText.includes("fiveMinAgo")
      ) {
        return Promise.resolve([{ count: 12 }]);
      }

      if (sqlText.includes("date_trunc('minute', ts)")) {
        return Promise.resolve([
          { minute: "2026-10-15 21:20:00+00", count: 4 },
          { minute: "2026-10-15 21:21:00+00", count: 6 },
        ]);
      }

      if (sqlText.includes("lat::real") && sqlText.includes("lon::real")) {
        return Promise.resolve([
          {
            lat: 37.77,
            lon: -122.41,
            country: "US",
            city: "San Francisco",
            path: "/",
            ts: "2026-10-15T21:20:00Z",
          },
        ]);
      }

      if (sqlText.includes("total_sessions")) {
        return Promise.resolve([{ views: 500, visitors: 350, total_sessions: 300 }]);
      }

      if (sqlText.includes("bounce_count")) {
        return Promise.resolve([{ bounce_count: 120 }]);
      }

      if (sqlText.includes("SELECT COALESCE(NULLIF(country")) {
        return Promise.resolve([{ country: "US" }]);
      }

      return Promise.resolve([]);
    }) as unknown as QueryExecutor;

    setDbClient(mockDb);
  });

  it("getTimeseries returns structured points", async () => {
    const res = await getTimeseries(siteId, from, to, "day");
    expect(res).toBeInstanceOf(Array);
    expect(res.length).toBeGreaterThan(0);
    expect(res[0]).toHaveProperty("ts");
    expect(res[0]).toHaveProperty("views");
    expect(res[0]).toHaveProperty("visitors");
  });

  it("getTopPages returns ranked paths with counts", async () => {
    const res = await getTopPages(siteId, from, to, 5);
    expect(res[0].name).toBe("/");
    expect(res[0].views).toBe(100);
  });

  it("getTopReferrers returns referrer names", async () => {
    const res = await getTopReferrers(siteId, from, to);
    expect(res[0].name).toBe("google.com");
  });

  it("getTopCountries returns country counts", async () => {
    const res = await getTopCountries(siteId, from, to);
    expect(res[0].name).toBe("US");
  });

  it("getDevices and getBrowsers return breakdowns", async () => {
    const dev = await getDevices(siteId, from, to);
    expect(dev[0].name).toBe("desktop");

    const brow = await getBrowsers(siteId, from, to);
    expect(brow[0].name).toBe("Chrome");
  });

  it("getHourWeekdayMatrix returns 2D grid cells", async () => {
    const matrix = await getHourWeekdayMatrix(siteId, from, to);
    expect(matrix[0]).toHaveProperty("weekday");
    expect(matrix[0]).toHaveProperty("hour");
    expect(matrix[0]).toHaveProperty("views");
  });

  it("getSankeyFlows returns indexed nodes and links", async () => {
    const flows = await getSankeyFlows(siteId, from, to);
    expect(flows).toHaveProperty("nodes");
    expect(flows).toHaveProperty("links");
    expect(flows.nodes.length).toBeGreaterThan(0);
    expect(flows.links.length).toBeGreaterThan(0);
    expect(flows.links[0]).toHaveProperty("source");
    expect(flows.links[0]).toHaveProperty("target");
    expect(flows.links[0]).toHaveProperty("value");
  });

  it("getPageStream returns streamgraph data points", async () => {
    const stream = await getPageStream(siteId, from, to);
    expect(stream.length).toBeGreaterThan(0);
    expect(stream[0]).toHaveProperty("date");
    expect(stream[0]).toHaveProperty("path");
    expect(stream[0]).toHaveProperty("views");
  });

  it("getLiveEvents returns 30-min window stats and markers", async () => {
    const live = await getLiveEvents(siteId, 30);
    expect(live).toHaveProperty("activeVisitors5Min");
    expect(live).toHaveProperty("totalViews30Min");
    expect(live).toHaveProperty("perMinute");
    expect(live).toHaveProperty("recentMarkers");
  });

  it("getKpis returns current, previous and deltas", async () => {
    const kpis = await getKpis(siteId, from, to);
    expect(kpis.current.views).toBe(500);
    expect(kpis.current.bounceRate).toBe(40); // 120 / 300 * 100
    expect(kpis.deltas).toHaveProperty("viewsPct");
  });

  it("/api/stats/[metric] endpoint handles validation and dispatch", async () => {
    const authHeaders = {
      Cookie: "spidy_session=valid-test-token-64-characters-000000000000000000000000000000000",
    };

    // Missing siteId -> 400
    const badReq = new NextRequest("http://localhost:3000/api/stats/pages", {
      headers: authHeaders,
    });
    const badRes = await GET(badReq, { params: Promise.resolve({ metric: "pages" }) });
    expect(badRes.status).toBe(400);

    // Unknown metric -> 404
    const unknownReq = new NextRequest("http://localhost:3000/api/stats/invalid?siteId=test", {
      headers: authHeaders,
    });
    const unknownRes = await GET(unknownReq, {
      params: Promise.resolve({ metric: "invalid" }),
    });
    expect(unknownRes.status).toBe(404);

    // Valid metric -> 200
    const validReq = new NextRequest("http://localhost:3000/api/stats/pages?siteId=test", {
      headers: authHeaders,
    });
    const validRes = await GET(validReq, { params: Promise.resolve({ metric: "pages" }) });
    expect(validRes.status).toBe(200);
    const data = await validRes.json();
    expect(data[0].name).toBe("/");
  });
});
