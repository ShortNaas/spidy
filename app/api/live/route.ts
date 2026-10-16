import { NextRequest, NextResponse } from "next/server";
import { getLiveEvents } from "@/lib/queries";
import { SESSION_COOKIE_NAME, getSessionUser } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function GET(request: NextRequest): Promise<Response> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = await getSessionUser(token);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get("siteId");

  if (!siteId) {
    return NextResponse.json({ error: "siteId parameter is required" }, { status: 400 });
  }

  const ownSites = (await sql`
    SELECT id FROM sites WHERE id = ${siteId} AND user_id = ${user.id}::uuid;
  `) as Array<{ id: string }>;

  if (!ownSites || ownSites.length === 0) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  const wantsSse =
    searchParams.get("sse") === "true" ||
    request.headers.get("accept")?.includes("text/event-stream");

  if (!wantsSse) {
    const stats = await getLiveEvents(siteId, 30);
    return NextResponse.json({
      ...stats,
      recentCount: stats.totalViews30Min,
    });
  }

  // SSE streaming response
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      async function sendUpdate() {
        try {
          const stats = await getLiveEvents(siteId!, 30);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(stats)}\n\n`));
        } catch {
          // ignore stream query errors
        }
      }

      // Initial push
      await sendUpdate();

      // Poll every 5 seconds for SSE stream
      const interval = setInterval(async () => {
        try {
          await sendUpdate();
        } catch {
          clearInterval(interval);
          controller.close();
        }
      }, 5000);

      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
