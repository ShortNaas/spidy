import { describe, it, expect, beforeEach } from "vitest";
import { setDbClient, type QueryExecutor } from "@/lib/db";
import { performRollup } from "@/lib/rollup";
import { GET, POST } from "@/app/api/cron/rollup/route";
import { NextRequest } from "next/server";

describe("Cron Rollup and Retention Unit Tests", () => {
  let executedQueries: string[] = [];
  const CRON_SECRET = "test_cron_secret_778899";

  beforeEach(() => {
    process.env.CRON_SECRET = CRON_SECRET;
    executedQueries = [];

    const mockDb = ((stringsOrQuery: TemplateStringsArray | string) => {
      const sqlText =
        typeof stringsOrQuery === "string" ? stringsOrQuery : stringsOrQuery.join("?");
      executedQueries.push(sqlText);

      if (sqlText.includes("INSERT INTO daily_stats")) {
        // Return 5 upserted rows
        return Promise.resolve([
          { "?column?": 1 },
          { "?column?": 1 },
          { "?column?": 1 },
          { "?column?": 1 },
          { "?column?": 1 },
        ]);
      }

      if (sqlText.includes("DELETE FROM events")) {
        // Return 12 deleted old rows
        return Promise.resolve(new Array(12).fill({ "?column?": 1 }));
      }

      return Promise.resolve([]);
    }) as unknown as QueryExecutor;

    setDbClient(mockDb);
  });

  describe("performRollup logic", () => {
    it("executes idempotent upsert into daily_stats with ON CONFLICT DO UPDATE", async () => {
      const result = await performRollup("2026-10-15");

      expect(result.date).toBe("2026-10-15");
      expect(result.upsertedRows).toBe(5);
      expect(result.deletedOldEvents).toBe(12);

      const upsertQuery = executedQueries.find((q) => q.includes("INSERT INTO daily_stats"));
      expect(upsertQuery).toBeDefined();
      expect(upsertQuery).toContain("ON CONFLICT (day, site_id, path, referrer, country, device)");
      expect(upsertQuery).toContain("DO UPDATE SET");
      expect(upsertQuery).toContain("views = EXCLUDED.views");
      expect(upsertQuery).toContain("visitors = EXCLUDED.visitors");
    });

    it("executes 90-day retention cleanup on raw events table", async () => {
      await performRollup("2026-10-15");

      const deleteQuery = executedQueries.find((q) => q.includes("DELETE FROM events"));
      expect(deleteQuery).toBeDefined();
      expect(deleteQuery).toContain("ts < (CURRENT_DATE - INTERVAL '90 days')");
    });

    it("is strictly idempotent when executed multiple times", async () => {
      // First run
      const run1 = await performRollup("2026-10-15");
      const queries1 = [...executedQueries];

      // Second run with the same target date
      executedQueries = [];
      const run2 = await performRollup("2026-10-15");
      const queries2 = [...executedQueries];

      expect(run1).toEqual(run2);
      expect(queries1).toEqual(queries2);
    });

    it("rejects invalid date format", async () => {
      await expect(performRollup("invalid-date")).rejects.toThrow(
        "Invalid date format 'invalid-date'. Expected YYYY-MM-DD."
      );
    });

    it("defaults to yesterday UTC if target date is not provided", async () => {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const res = await performRollup();
      expect(res.date).toBe(yesterday);
    });
  });

  describe("/api/cron/rollup endpoint authorization and handling", () => {
    it("rejects unauthenticated requests with 401", async () => {
      const req = new NextRequest("http://localhost:3000/api/cron/rollup");
      const res = await GET(req);

      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe("Unauthorized");
    });

    it("rejects requests with incorrect bearer token with 401", async () => {
      const req = new NextRequest("http://localhost:3000/api/cron/rollup", {
        headers: { Authorization: "Bearer wrong-secret" },
      });
      const res = await GET(req);

      expect(res.status).toBe(401);
    });

    it("accepts requests with valid Bearer CRON_SECRET", async () => {
      const req = new NextRequest(`http://localhost:3000/api/cron/rollup?date=2026-10-14`, {
        headers: { Authorization: `Bearer ${CRON_SECRET}` },
      });
      const res = await GET(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.date).toBe("2026-10-14");
      expect(json.upsertedRows).toBe(5);
      expect(json.deletedOldEvents).toBe(12);
    });

    it("supports POST method with valid Bearer token", async () => {
      const req = new NextRequest(`http://localhost:3000/api/cron/rollup?date=2026-10-14`, {
        method: "POST",
        headers: { Authorization: `Bearer ${CRON_SECRET}` },
      });
      const res = await POST(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
    });
  });
});
