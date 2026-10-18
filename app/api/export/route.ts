import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, getSessionUser } from "@/lib/auth";
import { getKpis, getTopPages } from "@/lib/queries";
import { sql } from "@/lib/db";

export async function GET(request: NextRequest): Promise<Response> {
  // 1. Authenticate user session
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = await getSessionUser(sessionCookie);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const siteId = request.nextUrl.searchParams.get("siteId") || "spidy-demo";

  // Site scoping: verify user owns the site
  const ownSites = (await sql`
    SELECT id FROM sites WHERE id = ${siteId} AND user_id = ${user.id}::uuid;
  `) as Array<{ id: string }>;

  if (!ownSites || ownSites.length === 0) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  const now = new Date();
  const from = new Date(now.getTime() - 30 * 86400000);

  try {
    // 2. Fetch stats to export
    const [kpis, pages] = await Promise.all([
      getKpis(siteId, from, now),
      getTopPages(siteId, from, now, 50),
    ]);

    const exportData = {
      siteId,
      exportedAt: now.toISOString(),
      range: { from: from.toISOString(), to: now.toISOString() },
      kpis,
      topPages: pages,
    };

    const dateStr = now.toISOString().slice(0, 10);
    const filename = `${siteId}-export-${dateStr}.json`;

    return new Response(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("Export error:", err);
    return NextResponse.json({ error: "Failed to generate export" }, { status: 500 });
  }
}
