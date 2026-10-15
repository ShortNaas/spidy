import crypto from "node:crypto";
import { neon } from "@neondatabase/serverless";

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("Error: DATABASE_URL is not set.");
    console.error("Please set DATABASE_URL in your environment or in .env / .env.local file.");
    process.exit(1);
  }
  return url;
}

interface Location {
  country: string;
  city: string;
  lat: number;
  lon: number;
  weight: number;
}

const LOCATIONS: Location[] = [
  { country: "US", city: "New York", lat: 40.7128, lon: -74.006, weight: 30 },
  { country: "US", city: "San Francisco", lat: 37.7749, lon: -122.4194, weight: 20 },
  { country: "GB", city: "London", lat: 51.5074, lon: -0.1278, weight: 15 },
  { country: "DE", city: "Berlin", lat: 52.52, lon: 13.405, weight: 12 },
  { country: "FR", city: "Paris", lat: 48.8566, lon: 2.3522, weight: 10 },
  { country: "JP", city: "Tokyo", lat: 35.6762, lon: 139.6503, weight: 9 },
  { country: "CA", city: "Toronto", lat: 43.6532, lon: -79.3832, weight: 8 },
  { country: "AU", city: "Sydney", lat: -33.8688, lon: 151.2093, weight: 7 },
  { country: "NL", city: "Amsterdam", lat: 52.3676, lon: 4.9041, weight: 6 },
  { country: "SE", city: "Stockholm", lat: 59.3293, lon: 18.0686, weight: 5 },
  { country: "IN", city: "Bangalore", lat: 12.9716, lon: 77.5946, weight: 8 },
  { country: "SG", city: "Singapore", lat: 1.3521, lon: 103.8198, weight: 5 },
];

const PATHS = [
  "/",
  "/pricing",
  "/docs",
  "/docs/quickstart",
  "/docs/api",
  "/docs/self-hosting",
  "/docs/privacy",
  "/features",
  "/features/realtime",
  "/features/analytics",
  "/blog",
  "/blog/cookieless-future",
  "/blog/privacy-by-design",
  "/blog/v2-release",
  "/about",
  "/contact",
  "/careers",
  "/changelog",
  "/terms",
  "/privacy",
  "/dashboard-demo",
];

const REFERRERS = [
  "google.com",
  "github.com",
  "news.ycombinator.com",
  "x.com",
  "reddit.com",
  "linkedin.com",
  "producthunt.com",
  "duckduckgo.com",
  "bing.com",
  "", // direct traffic
];

const DEVICES = [
  { device: "desktop", os: "macOS", browser: "Chrome", weight: 35 },
  { device: "desktop", os: "macOS", browser: "Safari", weight: 20 },
  { device: "desktop", os: "Windows", browser: "Chrome", weight: 25 },
  { device: "desktop", os: "Windows", browser: "Edge", weight: 8 },
  { device: "desktop", os: "Linux", browser: "Firefox", weight: 5 },
  { device: "mobile", os: "iOS", browser: "Safari", weight: 25 },
  { device: "mobile", os: "Android", browser: "Chrome", weight: 15 },
  { device: "tablet", os: "iOS", browser: "Safari", weight: 5 },
];

function pickWeighted<T extends { weight: number }>(items: T[]): T {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let r = Math.random() * total;
  for (const item of items) {
    if (r < item.weight) return item;
    r -= item.weight;
  }
  return items[0];
}

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export async function seedDatabase(targetSiteId = "spidy-demo"): Promise<void> {
  const url = getDatabaseUrl();
  const sql = neon(url);

  console.log(`Seeding database for site '${targetSiteId}'...`);

  // Ensure site exists
  await sql`
    INSERT INTO sites (id, domain, created_at)
    VALUES (${targetSiteId}, 'spidy.dev', now() - interval '60 days')
    ON CONFLICT (id) DO UPDATE SET domain = EXCLUDED.domain;
  `;

  // Clear existing events and daily_stats for a clean idempotent seed
  console.log("Cleaning old seed data for site...");
  await sql`DELETE FROM events WHERE site_id = ${targetSiteId};`;
  await sql`DELETE FROM daily_stats WHERE site_id = ${targetSiteId};`;

  const now = new Date();
  const DAYS = 30;
  const eventsToInsert: Array<{
    ts: string;
    site_id: string;
    path: string;
    referrer: string | null;
    country: string;
    city: string;
    lat: number;
    lon: number;
    device: string;
    browser: string;
    os: string;
    visitor: string;
    session: string;
  }> = [];

  const dailyAggs = new Map<
    string,
    {
      day: string;
      site_id: string;
      path: string;
      referrer: string;
      country: string;
      device: string;
      views: number;
      visitorsSet: Set<string>;
    }
  >();

  console.log("Generating 30 days of synthetic event data with seasonality...");

  for (let dayOffset = DAYS - 1; dayOffset >= 0; dayOffset--) {
    const currentDate = new Date(now.getTime() - dayOffset * 86400000);
    const dayStr = currentDate.toISOString().slice(0, 10);
    const dayOfWeek = currentDate.getUTCDay(); // 0 = Sun, 6 = Sat
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const weekdayMultiplier = isWeekend ? 0.6 : 1.25;

    // Number of sessions for this day
    const baseSessions = 70 + Math.floor(Math.random() * 40);
    const totalDailySessions = Math.floor(baseSessions * weekdayMultiplier);

    for (let s = 0; s < totalDailySessions; s++) {
      // Diurnal hour distribution: peak at 14-18 UTC, low at 02-06 UTC
      let hour: number;
      if (Math.random() < 0.65) {
        // Peak hours (12:00 - 21:00)
        hour = 12 + Math.floor(Math.random() * 10);
      } else if (Math.random() < 0.85) {
        // Morning hours (07:00 - 11:00)
        hour = 7 + Math.floor(Math.random() * 5);
      } else {
        // Night hours (22:00 - 06:00)
        hour = Math.floor(Math.random() * 7);
      }

      const minute = Math.floor(Math.random() * 60);
      const second = Math.floor(Math.random() * 60);

      const sessionDate = new Date(currentDate);
      sessionDate.setUTCHours(hour, minute, second, 0);

      const loc = pickWeighted(LOCATIONS);
      const dev = pickWeighted(DEVICES);
      const referrer = Math.random() < 0.75 ? pickRandom(REFERRERS) : "";
      const sessionId = crypto.randomUUID().slice(0, 12);
      const visitor = crypto
        .createHash("sha256")
        .update(`visitor-${loc.country}-${s % 30}-${dayStr}`)
        .digest("hex")
        .slice(0, 16);

      // Multi-step journey for this session (1 to 4 pages)
      const pageCount = Math.random() < 0.45 ? 1 : Math.random() < 0.8 ? 2 : 4;
      const landingPath = Math.random() < 0.6 ? "/" : pickRandom(PATHS);

      for (let p = 0; p < pageCount; p++) {
        const pageTs = new Date(sessionDate.getTime() + p * (15000 + Math.random() * 45000));
        const currentPath = p === 0 ? landingPath : pickRandom(PATHS);
        const eventReferrer = p === 0 ? (referrer || null) : "";

        eventsToInsert.push({
          ts: pageTs.toISOString(),
          site_id: targetSiteId,
          path: currentPath,
          referrer: eventReferrer,
          country: loc.country,
          city: loc.city,
          lat: loc.lat,
          lon: loc.lon,
          device: dev.device,
          browser: dev.browser,
          os: dev.os,
          visitor,
          session: sessionId,
        });

        // Group into daily aggregates
        const aggKey = `${dayStr}|${targetSiteId}|${currentPath}|${eventReferrer || ""}|${loc.country}|${dev.device}`;
        let agg = dailyAggs.get(aggKey);
        if (!agg) {
          agg = {
            day: dayStr,
            site_id: targetSiteId,
            path: currentPath,
            referrer: eventReferrer || "",
            country: loc.country,
            device: dev.device,
            views: 0,
            visitorsSet: new Set<string>(),
          };
          dailyAggs.set(aggKey, agg);
        }
        agg.views++;
        agg.visitorsSet.add(visitor);
      }
    }
  }

  console.log(`Generated ${eventsToInsert.length} events across 30 days.`);

  // Insert events in batches of 250
  const BATCH_SIZE = 250;
  for (let i = 0; i < eventsToInsert.length; i += BATCH_SIZE) {
    const chunk = eventsToInsert.slice(i, i + BATCH_SIZE);
    // Build multi-row INSERT statement
    const valuePlaceholders: string[] = [];
    const params: unknown[] = [];

    chunk.forEach((ev, idx) => {
      const offset = idx * 13;
      valuePlaceholders.push(
        `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10}, $${offset + 11}, $${offset + 12}, $${offset + 13})`
      );
      params.push(
        ev.ts,
        ev.site_id,
        ev.path,
        ev.referrer,
        ev.country,
        ev.city,
        ev.lat,
        ev.lon,
        ev.device,
        ev.browser,
        ev.os,
        ev.visitor,
        ev.session
      );
    });

    const insertQuery = `
      INSERT INTO events (
        ts, site_id, path, referrer, country, city, lat, lon, device, browser, os, visitor, session
      ) VALUES ${valuePlaceholders.join(", ")}
    `;

    await (sql as unknown as (q: string, p: unknown[]) => Promise<unknown>)(insertQuery, params);
  }

  console.log("Inserted events. Now populating daily_stats for historical aggregation...");

  // Populate daily_stats
  const aggArray = Array.from(dailyAggs.values());
  for (let i = 0; i < aggArray.length; i += BATCH_SIZE) {
    const chunk = aggArray.slice(i, i + BATCH_SIZE);
    const valuePlaceholders: string[] = [];
    const params: unknown[] = [];

    chunk.forEach((ag, idx) => {
      const offset = idx * 8;
      valuePlaceholders.push(
        `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8})`
      );
      params.push(
        ag.day,
        ag.site_id,
        ag.path,
        ag.referrer,
        ag.country,
        ag.device,
        ag.views,
        ag.visitorsSet.size
      );
    });

    const insertQuery = `
      INSERT INTO daily_stats (
        day, site_id, path, referrer, country, device, views, visitors
      ) VALUES ${valuePlaceholders.join(", ")}
      ON CONFLICT (day, site_id, path, referrer, country, device)
      DO UPDATE SET
        views = EXCLUDED.views,
        visitors = EXCLUDED.visitors;
    `;

    await (sql as unknown as (q: string, p: unknown[]) => Promise<unknown>)(insertQuery, params);
  }

  // Verification checks
  const eventCountRes = (await sql`SELECT count(*)::int as count FROM events WHERE site_id = ${targetSiteId};`) as Array<{ count: number }>;
  const dailyCountRes = (await sql`SELECT count(*)::int as count FROM daily_stats WHERE site_id = ${targetSiteId};`) as Array<{ count: number }>;
  const countryCountRes = (await sql`SELECT count(DISTINCT country)::int as count FROM events WHERE site_id = ${targetSiteId};`) as Array<{ count: number }>;
  const pathCountRes = (await sql`SELECT count(DISTINCT path)::int as count FROM events WHERE site_id = ${targetSiteId};`) as Array<{ count: number }>;
  const referrerCountRes = (await sql`SELECT count(DISTINCT referrer)::int as count FROM events WHERE site_id = ${targetSiteId} AND referrer != '';`) as Array<{ count: number }>;

  console.log("\n=== Seed Verification Summary ===");
  console.log(`Total Events: ${eventCountRes[0].count}`);
  console.log(`Total Daily Stats rows: ${dailyCountRes[0].count}`);
  console.log(`Distinct Countries: ${countryCountRes[0].count} (requirement: >= 10)`);
  console.log(`Distinct Paths: ${pathCountRes[0].count} (requirement: >= 20)`);
  console.log(`Distinct Referrers: ${referrerCountRes[0].count} (requirement: >= 8)`);
  console.log("=================================\n");
}

if (process.argv[1]?.endsWith("seed.ts")) {
  seedDatabase()
    .then(() => {
      console.log("Seeding completed successfully.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Seeding failed:", err);
      process.exit(1);
    });
}
