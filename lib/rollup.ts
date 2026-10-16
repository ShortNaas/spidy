import { sql } from "@/lib/db";

export interface RollupResult {
  date: string;
  upsertedRows: number;
  deletedOldEvents: number;
  archivedToStorage?: boolean;
}

/**
 * Aggregates events for a given target day (defaults to yesterday UTC)
 * into daily_stats via an idempotent upsert, and deletes raw events
 * older than 90 days.
 */
export async function performRollup(targetDateStr?: string): Promise<RollupResult> {
  // Determine target date (default: yesterday UTC)
  let date = targetDateStr;
  if (!date) {
    const yesterday = new Date(Date.now() - 86400000);
    date = yesterday.toISOString().slice(0, 10);
  }

  // Validate YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`Invalid date format '${date}'. Expected YYYY-MM-DD.`);
  }

  // 1. Idempotent upsert into daily_stats
  const upsertRes = (await sql`
    INSERT INTO daily_stats (day, site_id, path, referrer, country, device, views, visitors)
    SELECT
      ts::date as day,
      site_id,
      path,
      COALESCE(referrer, '') as referrer,
      COALESCE(country, '') as country,
      COALESCE(device, '') as device,
      COUNT(*)::int as views,
      COUNT(DISTINCT visitor)::int as visitors
    FROM events
    WHERE ts >= ${date}::date AND ts < (${date}::date + INTERVAL '1 day')
    GROUP BY 1, 2, 3, 4, 5, 6
    ON CONFLICT (day, site_id, path, referrer, country, device)
    DO UPDATE SET
      views = EXCLUDED.views,
      visitors = EXCLUDED.visitors
    RETURNING 1;
  `) as Array<{ "?column?": number }>;

  // 2. Retention cleanup: delete raw events older than 90 days
  const deleteRes = (await sql`
    DELETE FROM events
    WHERE ts < (CURRENT_DATE - INTERVAL '90 days')
    RETURNING 1;
  `) as Array<{ "?column?": number }>;

  const upsertedRows = Array.isArray(upsertRes) ? upsertRes.length : 0;
  const deletedOldEvents = Array.isArray(deleteRes) ? deleteRes.length : 0;

  // 3. Clean up expired sessions and old auth_attempts (older than 1 day)
  try {
    await sql`DELETE FROM sessions WHERE expires_at < now();`;
    await sql`DELETE FROM auth_attempts WHERE ts < (now() - INTERVAL '1 day');`;
  } catch {
    // If tables are not provisioned in older branch schemas
  }

  // 3. Archive rollup snapshot to Neon Object Storage if configured
  let archivedToStorage = false;
  if (process.env.AWS_ENDPOINT_URL_S3 && process.env.AWS_ACCESS_KEY_ID) {
    try {
      const { uploadObject } = await import("@/lib/storage");
      await uploadObject(
        `rollups/${date}.json`,
        JSON.stringify(
          {
            date,
            upsertedRows,
            deletedOldEvents,
            archivedAt: new Date().toISOString(),
          },
          null,
          2
        )
      );
      archivedToStorage = true;
    } catch (storageErr) {
      console.warn("Neon Object Storage archival skipped:", storageErr);
    }
  }

  return {
    date,
    upsertedRows,
    deletedOldEvents,
    archivedToStorage,
  };
}
