import { sql } from "@/lib/db";

export interface DateRangeParams {
  siteId: string;
  from: Date;
  to: Date;
}

export interface TimeseriesPoint {
  ts: string;
  views: number;
  visitors: number;
}

export interface ItemCount {
  name: string;
  views: number;
  visitors: number;
}

export interface HourWeekdayCell {
  weekday: number; // 0 = Sunday, 6 = Saturday
  hour: number; // 0 - 23
  views: number;
}

export interface SankeyNode {
  name: string;
  category: "referrer" | "landing" | "next";
}

export interface SankeyLink {
  source: number;
  target: number;
  value: number;
}

export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

export interface StreamDataPoint {
  date: string;
  path: string;
  views: number;
}

export interface LiveStats {
  activeVisitors5Min: number;
  totalViews30Min: number;
  perMinute: Array<{ minute: string; count: number }>;
  recentMarkers: Array<{
    lat: number;
    lon: number;
    country: string;
    city: string;
    path: string;
    ts: string;
  }>;
}

export interface KpiData {
  views: number;
  visitors: number;
  bounceRate: number; // percentage 0 - 100
  topCountry: string;
}

export interface KpiResult {
  current: KpiData;
  previous: KpiData;
  deltas: {
    viewsPct: number;
    visitorsPct: number;
    bounceRatePct: number;
  };
}

export class SiteNotFoundError extends Error {
  constructor(message = "Site not found") {
    super(message);
    this.name = "SiteNotFoundError";
  }
}

export async function verifySiteOwnership(siteId: string, userId?: string): Promise<void> {
  if (!userId) return;
  const rows = (await sql`
    SELECT id FROM sites WHERE id = ${siteId} AND user_id = ${userId}::uuid;
  `) as Array<{ id: string }>;
  if (!rows || rows.length === 0) {
    throw new SiteNotFoundError();
  }
}

/**
 * 1. Timeseries (views, visitors) by hour or day
 */
export async function getTimeseries(
  siteId: string,
  from: Date,
  to: Date,
  interval: "hour" | "day" = "day",
  userId?: string
): Promise<TimeseriesPoint[]> {
  await verifySiteOwnership(siteId, userId);
  const fromIso = from.toISOString();
  const toIso = to.toISOString();

  // If interval is hour, aggregate directly from events grouped by hour
  if (interval === "hour") {
    const rows = (await sql`
      SELECT
        date_trunc('hour', ts)::text as ts,
        count(*)::int as views,
        count(DISTINCT visitor)::int as visitors
      FROM events
      WHERE site_id = ${siteId}
        AND ts >= ${fromIso}::timestamptz
        AND ts <= ${toIso}::timestamptz
      GROUP BY 1
      ORDER BY 1 ASC;
    `) as Array<{ ts: string; views: number; visitors: number }>;

    return rows;
  }

  // Otherwise (interval === "day"): seamlessly combine daily_stats and real-time events
  const fromDay = fromIso.slice(0, 10);
  const toDay = toIso.slice(0, 10);

  const rows = (await sql`
    SELECT
      day::text as ts,
      SUM(views)::int as views,
      SUM(visitors)::int as visitors
    FROM (
      SELECT
        day,
        COALESCE(SUM(views), 0)::int as views,
        COALESCE(SUM(visitors), 0)::int as visitors
      FROM daily_stats
      WHERE site_id = ${siteId}
        AND day >= ${fromDay}::date
        AND day <= ${toDay}::date
      GROUP BY day

      UNION ALL

      SELECT
        ts::date as day,
        count(*)::int as views,
        count(DISTINCT visitor)::int as visitors
      FROM events
      WHERE site_id = ${siteId}
        AND ts::date NOT IN (
          SELECT DISTINCT day FROM daily_stats WHERE site_id = ${siteId} AND day >= ${fromDay}::date
        )
        AND ts >= ${fromIso}::timestamptz
        AND ts <= ${toIso}::timestamptz
      GROUP BY ts::date
    ) sub
    GROUP BY day
    ORDER BY day ASC;
  `) as Array<{ ts: string; views: number; visitors: number }>;

  return rows;
}

/**
 * 2. Top Pages
 */
export async function getTopPages(
  siteId: string,
  from: Date,
  to: Date,
  limit = 10
): Promise<ItemCount[]> {
  const fromIso = from.toISOString();
  const toIso = to.toISOString();
  const fromDay = fromIso.slice(0, 10);
  const toDay = toIso.slice(0, 10);

  const rows = (await sql`
    SELECT
      name,
      SUM(views)::int as views,
      SUM(visitors)::int as visitors
    FROM (
      SELECT
        path as name,
        COALESCE(SUM(views), 0)::int as views,
        COALESCE(SUM(visitors), 0)::int as visitors
      FROM daily_stats
      WHERE site_id = ${siteId}
        AND day >= ${fromDay}::date
        AND day <= ${toDay}::date
      GROUP BY path

      UNION ALL

      SELECT
        path as name,
        count(*)::int as views,
        count(DISTINCT visitor)::int as visitors
      FROM events
      WHERE site_id = ${siteId}
        AND ts::date NOT IN (
          SELECT DISTINCT day FROM daily_stats WHERE site_id = ${siteId} AND day >= ${fromDay}::date
        )
        AND ts >= ${fromIso}::timestamptz
        AND ts <= ${toIso}::timestamptz
      GROUP BY path
    ) combined
    GROUP BY name
    ORDER BY views DESC
    LIMIT ${limit};
  `) as ItemCount[];

  return rows;
}

/**
 * 3. Top Referrers
 */
export async function getTopReferrers(
  siteId: string,
  from: Date,
  to: Date,
  limit = 10
): Promise<ItemCount[]> {
  const fromIso = from.toISOString();
  const toIso = to.toISOString();
  const fromDay = fromIso.slice(0, 10);
  const toDay = toIso.slice(0, 10);

  const rows = (await sql`
    SELECT
      name,
      SUM(views)::int as views,
      SUM(visitors)::int as visitors
    FROM (
      SELECT
        CASE WHEN referrer = '' OR referrer IS NULL THEN 'Direct / None' ELSE referrer END as name,
        COALESCE(SUM(views), 0)::int as views,
        COALESCE(SUM(visitors), 0)::int as visitors
      FROM daily_stats
      WHERE site_id = ${siteId}
        AND day >= ${fromDay}::date
        AND day <= ${toDay}::date
      GROUP BY name

      UNION ALL

      SELECT
        CASE WHEN referrer = '' OR referrer IS NULL THEN 'Direct / None' ELSE referrer END as name,
        count(*)::int as views,
        count(DISTINCT visitor)::int as visitors
      FROM events
      WHERE site_id = ${siteId}
        AND ts::date NOT IN (
          SELECT DISTINCT day FROM daily_stats WHERE site_id = ${siteId} AND day >= ${fromDay}::date
        )
        AND ts >= ${fromIso}::timestamptz
        AND ts <= ${toIso}::timestamptz
      GROUP BY name
    ) combined
    GROUP BY name
    ORDER BY views DESC
    LIMIT ${limit};
  `) as ItemCount[];

  return rows;
}

/**
 * 4. Top Countries
 */
export async function getTopCountries(
  siteId: string,
  from: Date,
  to: Date,
  limit = 15
): Promise<ItemCount[]> {
  const fromIso = from.toISOString();
  const toIso = to.toISOString();
  const fromDay = fromIso.slice(0, 10);
  const toDay = toIso.slice(0, 10);

  const rows = (await sql`
    SELECT
      name,
      SUM(views)::int as views,
      SUM(visitors)::int as visitors
    FROM (
      SELECT
        COALESCE(NULLIF(country, ''), 'Unknown') as name,
        COALESCE(SUM(views), 0)::int as views,
        COALESCE(SUM(visitors), 0)::int as visitors
      FROM daily_stats
      WHERE site_id = ${siteId}
        AND day >= ${fromDay}::date
        AND day <= ${toDay}::date
      GROUP BY name

      UNION ALL

      SELECT
        COALESCE(NULLIF(country, ''), 'Unknown') as name,
        count(*)::int as views,
        count(DISTINCT visitor)::int as visitors
      FROM events
      WHERE site_id = ${siteId}
        AND ts::date NOT IN (
          SELECT DISTINCT day FROM daily_stats WHERE site_id = ${siteId} AND day >= ${fromDay}::date
        )
        AND ts >= ${fromIso}::timestamptz
        AND ts <= ${toIso}::timestamptz
      GROUP BY name
    ) combined
    GROUP BY name
    ORDER BY views DESC
    LIMIT ${limit};
  `) as ItemCount[];

  return rows;
}

/**
 * 5. Devices Breakdown
 */
export async function getDevices(siteId: string, from: Date, to: Date): Promise<ItemCount[]> {
  const fromIso = from.toISOString();
  const toIso = to.toISOString();
  const fromDay = fromIso.slice(0, 10);
  const toDay = toIso.slice(0, 10);

  const rows = (await sql`
    SELECT
      name,
      SUM(views)::int as views,
      SUM(visitors)::int as visitors
    FROM (
      SELECT
        COALESCE(NULLIF(device, ''), 'desktop') as name,
        COALESCE(SUM(views), 0)::int as views,
        COALESCE(SUM(visitors), 0)::int as visitors
      FROM daily_stats
      WHERE site_id = ${siteId}
        AND day >= ${fromDay}::date
        AND day <= ${toDay}::date
      GROUP BY name

      UNION ALL

      SELECT
        COALESCE(NULLIF(device, ''), 'desktop') as name,
        count(*)::int as views,
        count(DISTINCT visitor)::int as visitors
      FROM events
      WHERE site_id = ${siteId}
        AND ts::date NOT IN (
          SELECT DISTINCT day FROM daily_stats WHERE site_id = ${siteId} AND day >= ${fromDay}::date
        )
        AND ts >= ${fromIso}::timestamptz
        AND ts <= ${toIso}::timestamptz
      GROUP BY name
    ) combined
    GROUP BY name
    ORDER BY views DESC;
  `) as ItemCount[];

  return rows;
}

/**
 * 6. Browsers Breakdown
 */
export async function getBrowsers(siteId: string, from: Date, to: Date): Promise<ItemCount[]> {
  const fromIso = from.toISOString();
  const toIso = to.toISOString();

  const rows = (await sql`
    SELECT
      COALESCE(NULLIF(browser, ''), 'Other') as name,
      count(*)::int as views,
      count(DISTINCT visitor)::int as visitors
    FROM events
    WHERE site_id = ${siteId}
      AND ts >= ${fromIso}::timestamptz
      AND ts <= ${toIso}::timestamptz
    GROUP BY name
    ORDER BY views DESC;
  `) as ItemCount[];

  return rows;
}

/**
 * 7. Hour x Weekday Matrix
 */
export async function getHourWeekdayMatrix(
  siteId: string,
  from: Date,
  to: Date
): Promise<HourWeekdayCell[]> {
  const fromIso = from.toISOString();
  const toIso = to.toISOString();

  const rows = (await sql`
    SELECT
      EXTRACT(DOW FROM ts)::int as weekday,
      EXTRACT(HOUR FROM ts)::int as hour,
      count(*)::int as views
    FROM events
    WHERE site_id = ${siteId}
      AND ts >= ${fromIso}::timestamptz
      AND ts <= ${toIso}::timestamptz
    GROUP BY weekday, hour
    ORDER BY weekday ASC, hour ASC;
  `) as HourWeekdayCell[];

  return rows;
}

/**
 * 8. Referrer -> Landing -> Next-Page flows (Sankey data)
 */
export async function getSankeyFlows(
  siteId: string,
  from: Date,
  to: Date,
  limit = 20
): Promise<SankeyData> {
  const fromIso = from.toISOString();
  const toIso = to.toISOString();

  // Query ordered pageviews per session
  const sessionPageviews = (await sql`
    WITH session_events AS (
      SELECT
        session,
        path,
        COALESCE(NULLIF(referrer, ''), 'Direct') as referrer,
        ROW_NUMBER() OVER (PARTITION BY session ORDER BY ts ASC) as step
      FROM events
      WHERE site_id = ${siteId}
        AND session IS NOT NULL
        AND ts >= ${fromIso}::timestamptz
        AND ts <= ${toIso}::timestamptz
    )
    SELECT
      s1.referrer as source_referrer,
      s1.path as landing_page,
      COALESCE(s2.path, '(Exit)') as next_page,
      count(*)::int as flow_count
    FROM session_events s1
    LEFT JOIN session_events s2 ON s1.session = s2.session AND s2.step = 2
    WHERE s1.step = 1
    GROUP BY s1.referrer, s1.path, s2.path
    ORDER BY flow_count DESC
    LIMIT ${limit};
  `) as Array<{
    source_referrer: string;
    landing_page: string;
    next_page: string;
    flow_count: number;
  }>;

  // Build unique nodes and indexed links
  const nodeMap = new Map<string, number>();
  const nodes: SankeyNode[] = [];
  const links: SankeyLink[] = [];

  function getNodeIndex(name: string, category: SankeyNode["category"]): number {
    const key = `${category}:${name}`;
    if (!nodeMap.has(key)) {
      const idx = nodes.length;
      nodes.push({ name, category });
      nodeMap.set(key, idx);
    }
    return nodeMap.get(key)!;
  }

  for (const row of sessionPageviews) {
    const refIdx = getNodeIndex(row.source_referrer, "referrer");
    const landIdx = getNodeIndex(row.landing_page, "landing");
    const nextIdx = getNodeIndex(row.next_page, "next");

    // Link: Referrer -> Landing
    links.push({
      source: refIdx,
      target: landIdx,
      value: row.flow_count,
    });

    // Link: Landing -> Next Page
    links.push({
      source: landIdx,
      target: nextIdx,
      value: row.flow_count,
    });
  }

  return { nodes, links };
}

/**
 * 9. Per-Page Timeseries (Streamgraph of top 8 pages over time)
 */
export async function getPageStream(
  siteId: string,
  from: Date,
  to: Date,
  topN = 8
): Promise<StreamDataPoint[]> {
  const fromIso = from.toISOString();
  const toIso = to.toISOString();

  // Find top N pages first
  const topPagesRes = (await sql`
    SELECT path
    FROM events
    WHERE site_id = ${siteId}
      AND ts >= ${fromIso}::timestamptz
      AND ts <= ${toIso}::timestamptz
    GROUP BY path
    ORDER BY count(*) DESC
    LIMIT ${topN};
  `) as Array<{ path: string }>;

  const topPaths = topPagesRes.map((r) => r.path);
  if (topPaths.length === 0) return [];

  // Group by day for each of those top paths
  const rows = (await sql`
    SELECT
      date_trunc('day', ts)::date::text as date,
      path,
      count(*)::int as views
    FROM events
    WHERE site_id = ${siteId}
      AND path = ANY(${topPaths})
      AND ts >= ${fromIso}::timestamptz
      AND ts <= ${toIso}::timestamptz
    GROUP BY 1, 2
    ORDER BY 1 ASC, views DESC;
  `) as StreamDataPoint[];

  return rows;
}

/**
 * 10. Live Events (last 30 minutes)
 */
export async function getLiveEvents(siteId: string, windowMinutes = 30): Promise<LiveStats> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMinutes * 60 * 1000).toISOString();
  const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();

  // 1. Active visitors in last 5 minutes
  const activeVisitorsRes = (await sql`
    SELECT count(DISTINCT visitor)::int as count
    FROM events
    WHERE site_id = ${siteId}
      AND ts >= ${fiveMinAgo}::timestamptz;
  `) as Array<{ count: number }>;

  // 2. Per-minute views sparkline for last 30 minutes
  const perMinuteRes = (await sql`
    SELECT
      date_trunc('minute', ts)::text as minute,
      count(*)::int as count
    FROM events
    WHERE site_id = ${siteId}
      AND ts >= ${windowStart}::timestamptz
    GROUP BY minute
    ORDER BY minute ASC;
  `) as Array<{ minute: string; count: number }>;

  // 3. Recent geographic markers with lat/lon for the 3D Globe
  const recentMarkersRes = (await sql`
    SELECT
      lat::real,
      lon::real,
      country,
      city,
      path,
      ts::text
    FROM events
    WHERE site_id = ${siteId}
      AND lat IS NOT NULL
      AND lon IS NOT NULL
      AND ts >= ${windowStart}::timestamptz
    ORDER BY ts DESC
    LIMIT 100;
  `) as Array<{
    lat: number;
    lon: number;
    country: string;
    city: string;
    path: string;
    ts: string;
  }>;

  const totalViews = perMinuteRes.reduce((acc, row) => acc + row.count, 0);

  return {
    activeVisitors5Min: activeVisitorsRes[0]?.count || 0,
    totalViews30Min: totalViews,
    perMinute: perMinuteRes,
    recentMarkers: recentMarkersRes,
  };
}

/**
 * 11. KPI Summary with delta comparison to previous period
 */
export async function getKpis(siteId: string, from: Date, to: Date): Promise<KpiResult> {
  const durationMs = to.getTime() - from.getTime();
  const prevTo = new Date(from.getTime());
  const prevFrom = new Date(from.getTime() - durationMs);

  async function calculatePeriodKpis(pFrom: Date, pTo: Date): Promise<KpiData> {
    const fIso = pFrom.toISOString();
    const tIso = pTo.toISOString();

    const aggRes = (await sql`
      SELECT
        count(*)::int as views,
        count(DISTINCT visitor)::int as visitors,
        count(DISTINCT session)::int as total_sessions
      FROM events
      WHERE site_id = ${siteId}
        AND ts >= ${fIso}::timestamptz
        AND ts <= ${tIso}::timestamptz;
    `) as Array<{ views: number; visitors: number; total_sessions: number }>;

    // Single-page session bounce count proxy
    const bounceRes = (await sql`
      WITH session_counts AS (
        SELECT session, count(*) as page_count
        FROM events
        WHERE site_id = ${siteId}
          AND session IS NOT NULL
          AND ts >= ${fIso}::timestamptz
          AND ts <= ${tIso}::timestamptz
        GROUP BY session
      )
      SELECT count(*)::int as bounce_count
      FROM session_counts
      WHERE page_count = 1;
    `) as Array<{ bounce_count: number }>;

    // Top country
    const topCountryRes = (await sql`
      SELECT COALESCE(NULLIF(country, ''), 'US') as country
      FROM events
      WHERE site_id = ${siteId}
        AND ts >= ${fIso}::timestamptz
        AND ts <= ${tIso}::timestamptz
      GROUP BY country
      ORDER BY count(*) DESC
      LIMIT 1;
    `) as Array<{ country: string }>;

    const views = aggRes[0]?.views || 0;
    const visitors = aggRes[0]?.visitors || 0;
    const totalSessions = aggRes[0]?.total_sessions || 0;
    const bounceCount = bounceRes[0]?.bounce_count || 0;
    const bounceRate = totalSessions > 0 ? Math.round((bounceCount / totalSessions) * 100) : 0;
    const topCountry = topCountryRes[0]?.country || "—";

    return { views, visitors, bounceRate, topCountry };
  }

  const current = await calculatePeriodKpis(from, to);
  const previous = await calculatePeriodKpis(prevFrom, prevTo);

  const calcDelta = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 100);
  };

  return {
    current,
    previous,
    deltas: {
      viewsPct: calcDelta(current.views, previous.views),
      visitorsPct: calcDelta(current.visitors, previous.visitors),
      bounceRatePct: current.bounceRate - previous.bounceRate,
    },
  };
}
