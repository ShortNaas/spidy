import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
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

const statsQuerySchema = z.object({
  siteId: z.string().min(1, "siteId is required"),
  from: z.string().optional(),
  to: z.string().optional(),
  interval: z.enum(["hour", "day"]).optional(),
  limit: z.coerce.number().positive().max(100).optional(),
});

import { SESSION_COOKIE_NAME, getSessionUser } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ metric: string }> }
): Promise<NextResponse> {
  const { metric } = await context.params;

  // 1. Authenticate session user
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = await getSessionUser(token);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());

  const parseResult = statsQuerySchema.safeParse(searchParams);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", details: parseResult.error.format() },
      { status: 400 }
    );
  }

  const { siteId, interval, limit } = parseResult.data;

  // 2. Enforce site ownership: return 404 if user does not own site
  const ownSites = (await sql`
    SELECT id FROM sites WHERE id = ${siteId} AND user_id = ${user.id}::uuid;
  `) as Array<{ id: string }>;

  if (!ownSites || ownSites.length === 0) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  // Default date range: last 7 days
  const now = new Date();
  const defaultFrom = new Date(now.getTime() - 7 * 86400000);

  const fromDate = parseResult.data.from ? new Date(parseResult.data.from) : defaultFrom;
  const toDate = parseResult.data.to ? new Date(parseResult.data.to) : now;

  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    return NextResponse.json(
      { error: "Invalid date format. Please supply ISO date strings." },
      { status: 400 }
    );
  }

  try {
    switch (metric) {
      case "timeseries": {
        const data = await getTimeseries(siteId, fromDate, toDate, interval || "day");
        return NextResponse.json(data);
      }
      case "pages": {
        const data = await getTopPages(siteId, fromDate, toDate, limit || 10);
        return NextResponse.json(data);
      }
      case "referrers": {
        const data = await getTopReferrers(siteId, fromDate, toDate, limit || 10);
        return NextResponse.json(data);
      }
      case "countries": {
        const data = await getTopCountries(siteId, fromDate, toDate, limit || 15);
        return NextResponse.json(data);
      }
      case "devices": {
        const data = await getDevices(siteId, fromDate, toDate);
        return NextResponse.json(data);
      }
      case "browsers": {
        const data = await getBrowsers(siteId, fromDate, toDate);
        return NextResponse.json(data);
      }
      case "hour-weekday": {
        const data = await getHourWeekdayMatrix(siteId, fromDate, toDate);
        return NextResponse.json(data);
      }
      case "flows": {
        const data = await getSankeyFlows(siteId, fromDate, toDate, limit || 20);
        return NextResponse.json(data);
      }
      case "stream": {
        const data = await getPageStream(siteId, fromDate, toDate, 8);
        return NextResponse.json(data);
      }
      case "kpis": {
        const data = await getKpis(siteId, fromDate, toDate);
        return NextResponse.json(data);
      }
      case "live": {
        const data = await getLiveEvents(siteId, 30);
        return NextResponse.json(data);
      }
      case "all": {
        const [
          timeseries,
          pages,
          referrers,
          countries,
          devices,
          browsers,
          hourWeekday,
          flows,
          stream,
          kpis,
          live,
        ] = await Promise.all([
          getTimeseries(siteId, fromDate, toDate, interval || "day"),
          getTopPages(siteId, fromDate, toDate, 8),
          getTopReferrers(siteId, fromDate, toDate, 8),
          getTopCountries(siteId, fromDate, toDate, 10),
          getDevices(siteId, fromDate, toDate),
          getBrowsers(siteId, fromDate, toDate),
          getHourWeekdayMatrix(siteId, fromDate, toDate),
          getSankeyFlows(siteId, fromDate, toDate, 15),
          getPageStream(siteId, fromDate, toDate, 8),
          getKpis(siteId, fromDate, toDate),
          getLiveEvents(siteId, 30),
        ]);

        return NextResponse.json({
          timeseries,
          pages,
          referrers,
          countries,
          devices,
          browsers,
          hourWeekday,
          flows,
          stream,
          kpis,
          live,
        });
      }
      default:
        return NextResponse.json(
          {
            error: `Unknown metric '${metric}'. Valid metrics: timeseries, pages, referrers, countries, devices, browsers, hour-weekday, flows, stream, kpis, live, all.`,
          },
          { status: 404 }
        );
    }
  } catch (err) {
    console.error(`Error querying metric '${metric}':`, err);
    return NextResponse.json({ error: "Failed to retrieve stats" }, { status: 500 });
  }
}
