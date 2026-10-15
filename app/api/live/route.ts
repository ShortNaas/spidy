import { NextRequest, NextResponse } from "next/server";
import { getLiveEvents } from "@/lib/queries";

export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get("siteId");

  if (!siteId) {
    return NextResponse.json({ error: "siteId parameter is required" }, { status: 400 });
  }

  const wantsSse =
    searchParams.get("sse") === "true" ||
    request.headers.get("accept")?.includes("text/event-stream");

  if (!wantsSse) {
    const stats = await getLiveEvents(siteId, 30);
    return NextResponse.json(stats);
  }

  // SSE streaming response
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      async function sendUpdate() {
        try {
          const stats = await getLiveEvents(siteId!, 30);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(stats)}\n\n`)
          );
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
