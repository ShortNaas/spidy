import { describe, it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest } from "next/server";
import { isBot } from "@/lib/bots";
import { getVisitorHash } from "@/lib/hash";
import {
  cleanPath,
  cleanReferrer,
  collectPayloadSchema,
  isOriginAllowed,
  parseUserAgent,
} from "@/lib/validate";
import { setDbClient, type QueryExecutor } from "@/lib/db";

describe("Tracker & Collector Unit Tests", () => {
  describe("Salted Daily Visitor Hash (lib/hash.ts)", () => {
    const salt = "test-salt-secret-0123456789abcdef";
    const ip = "203.0.113.195";
    const ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36";

    it("produces a 16-character hex hash", () => {
      const hash = getVisitorHash(ip, ua, new Date("2026-10-15T12:00:00Z"), salt);
      expect(hash).toHaveLength(16);
      expect(hash).toMatch(/^[0-9a-f]{16}$/);
    });

    it("rotates daily: produces different hashes across UTC midnight for identical IP and UA", () => {
      const day1 = new Date("2026-10-15T23:59:59Z");
      const day2 = new Date("2026-10-16T00:00:01Z");

      const hashDay1 = getVisitorHash(ip, ua, day1, salt);
      const hashDay2 = getVisitorHash(ip, ua, day2, salt);

      expect(hashDay1).not.toBe(hashDay2);
    });

    it("is deterministic within the same UTC day", () => {
      const morning = new Date("2026-10-15T08:00:00Z");
      const evening = new Date("2026-10-15T20:00:00Z");

      const hashMorning = getVisitorHash(ip, ua, morning, salt);
      const hashEvening = getVisitorHash(ip, ua, evening, salt);

      expect(hashMorning).toBe(hashEvening);
    });

    it("produces different hashes for different IPs on the same day", () => {
      const date = new Date("2026-10-15T12:00:00Z");
      const hashA = getVisitorHash("198.51.100.1", ua, date, salt);
      const hashB = getVisitorHash("198.51.100.2", ua, date, salt);

      expect(hashA).not.toBe(hashB);
    });
  });

  describe("Bot Detection (lib/bots.ts)", () => {
    it("rejects empty, null, or whitespace user agents", () => {
      expect(isBot("")).toBe(true);
      expect(isBot(null)).toBe(true);
      expect(isBot(undefined)).toBe(true);
      expect(isBot("   ")).toBe(true);
    });

    it("detects search crawlers and bots", () => {
      expect(isBot("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)")).toBe(
        true
      );
      expect(
        isBot(
          "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)"
        )
      ).toBe(true);
      expect(isBot("DuckDuckBot/1.0; (+http://duckduckgo.com/duckduckbot.html)")).toBe(true);
    });

    it("detects automated testing and CLI tools", () => {
      expect(isBot("curl/7.88.1")).toBe(true);
      expect(isBot("Wget/1.21.3")).toBe(true);
      expect(isBot("python-requests/2.31.0")).toBe(true);
      expect(isBot("Playwright/1.40.0")).toBe(true);
      expect(isBot("HeadlessChrome/120.0.0.0")).toBe(true);
      expect(isBot("UptimeRobot/2.0")).toBe(true);
    });

    it("allows real browsers", () => {
      expect(
        isBot(
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
      ).toBe(false);
      expect(
        isBot(
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1"
        )
      ).toBe(false);
      expect(
        isBot("Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0")
      ).toBe(false);
    });
  });

  describe("Validation & Sanitization (lib/validate.ts)", () => {
    it("cleans paths by stripping query parameters and hash fragments", () => {
      expect(cleanPath("/pricing?utm_source=twitter&plan=pro")).toBe("/pricing");
      expect(cleanPath("/docs/quickstart#step-3")).toBe("/docs/quickstart");
      expect(cleanPath("/about/?source=web#team")).toBe("/about");
      expect(cleanPath("")).toBe("/");
      expect(cleanPath("/")).toBe("/");
    });

    it("cleans referrers to hostname only", () => {
      expect(cleanReferrer("https://news.ycombinator.com/item?id=38000")).toBe(
        "news.ycombinator.com"
      );
      expect(cleanReferrer("http://github.com/repository/pulls")).toBe("github.com");
      expect(cleanReferrer("sub.domain.co.uk/path/to/page")).toBe("sub.domain.co.uk");
      expect(cleanReferrer("")).toBe("");
      expect(cleanReferrer(null)).toBe("");
    });

    it("validates payload schema rejects invalid inputs", () => {
      expect(collectPayloadSchema.safeParse({}).success).toBe(false);
      expect(
        collectPayloadSchema.safeParse({ site_id: "", path: "/valid" }).success
      ).toBe(false);
      expect(
        collectPayloadSchema.safeParse({ site_id: "site-1", path: "" }).success
      ).toBe(false);
      expect(
        collectPayloadSchema.safeParse({
          site_id: "site-1",
          path: "/home",
          referrer: "google.com",
        }).success
      ).toBe(true);
    });

    it("correctly parses user agents into device, os, and browser", () => {
      const macChrome =
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
      const iPhoneSafari =
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1";
      const iPadSafari =
        "Mozilla/5.0 (iPad; CPU OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1";

      expect(parseUserAgent(macChrome)).toEqual({
        device: "desktop",
        os: "macOS",
        browser: "Chrome",
      });

      expect(parseUserAgent(iPhoneSafari)).toEqual({
        device: "mobile",
        os: "iOS",
        browser: "Safari",
      });

      expect(parseUserAgent(iPadSafari)).toEqual({
        device: "tablet",
        os: "iOS",
        browser: "Safari",
      });
    });

    it("verifies allowed origins correctly", () => {
      expect(
        isOriginAllowed("https://example.com", "https://example.com, https://app.spidy.dev")
      ).toBe(true);
      expect(
        isOriginAllowed("https://malicious.org", "https://example.com, https://app.spidy.dev")
      ).toBe(false);
      expect(isOriginAllowed("https://anywhere.com", "*")).toBe(true);
      expect(isOriginAllowed("https://anywhere.com", "")).toBe(true);
    });
  });

  describe("Tracker Script Constraints (public/a.js)", () => {
    it("is under 1024 bytes and does not use cookies, localStorage, or fingerprinting", async () => {
      const trackerPath = path.resolve(process.cwd(), "public/a.js");
      const scriptCode = await readFile(trackerPath, "utf-8");

      // Hard constraint 1: No cookies, no localStorage, no fingerprinting
      expect(scriptCode).not.toContain("document.cookie");
      expect(scriptCode).not.toContain("localStorage");
      expect(scriptCode).not.toContain("sessionStorage");
      expect(scriptCode).not.toContain("indexedDB");

      // Hard constraint 4: Honor Do Not Track
      expect(scriptCode).toContain("doNotTrack");

      // Hard constraint 5: Tracker script stays under 1 KB minified (1024 bytes)
      const minified = scriptCode
        .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "")
        .replace(/\s*([{};:,=()[\]])\s*/g, "$1")
        .replace(/\s+/g, " ")
        .trim();
      expect(minified.length).toBeLessThan(1024);
    });
  });

  describe("Collector API Route (app/api/collect/route.ts)", () => {
    it("inserts event into database without raw IP", async () => {
      const { POST } = await import("@/app/api/collect/route");
      const insertedRows: unknown[][] = [];

      // Mock database tagged template executor
      const mockSql = ((_strings: TemplateStringsArray, ...values: unknown[]) => {
        insertedRows.push(values);
        return Promise.resolve([]);
      }) as unknown as QueryExecutor;

      setDbClient(mockSql);

      const req = new NextRequest("http://localhost:3000/api/collect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "user-agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "x-forwarded-for": "198.51.100.42",
          "x-vercel-ip-country": "US",
          "x-vercel-ip-city": "San Francisco",
          "x-vercel-ip-latitude": "37.7749",
          "x-vercel-ip-longitude": "-122.4194",
        },
        body: JSON.stringify({
          site_id: "spidy-test",
          path: "/features?utm_source=twitter",
          referrer: "https://twitter.com/spidy/status/123",
          session: "test-session-123",
        }),
      });

      const response = await POST(req);
      expect(response.status).toBe(204);
      expect(insertedRows.length).toBe(1);

      const values = insertedRows[0];
      // Check values: site_id, path, referrer, country, city, lat, lon, device, browser, os, visitor, session
      expect(values).toContain("spidy-test");
      expect(values).toContain("/features"); // stripped query string
      expect(values).toContain("twitter.com"); // stripped to hostname only
      expect(values).toContain("US");
      expect(values).toContain("San Francisco");

      // Verify Hard Constraint 2: Raw IP is NEVER in the inserted values
      expect(values).not.toContain("198.51.100.42");
    });

    it("rejects payloads exceeding the 16 KB size limit with 413 Payload Too Large", async () => {
      const { POST } = await import("@/app/api/collect/route");

      const oversizedBody = JSON.stringify({
        site_id: "spidy-test",
        path: "/oversized",
        extra_garbage: "x".repeat(20000),
      });

      const req = new NextRequest("http://localhost:3000/api/collect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "content-length": String(oversizedBody.length),
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
        },
        body: oversizedBody,
      });

      const response = await POST(req);
      expect(response.status).toBe(413);
      expect(await response.text()).toBe("Payload Too Large");
    });

    it("handles tracker neutral script name /s.js mapping to /api/e", async () => {
      const trackerPath = path.resolve(process.cwd(), "public/a.js");
      const scriptCode = await readFile(trackerPath, "utf-8");

      expect(scriptCode).toMatch(/\/s\\\.js/);
      expect(scriptCode).toContain("/api/e");
    });
  });
});
