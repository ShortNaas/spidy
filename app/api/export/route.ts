import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, getSessionUser } from "@/lib/auth";
import { getKpis, getTopPages } from "@/lib/queries";
import { uploadObject, getPresignedUrl } from "@/lib/storage";

export async function GET(request: NextRequest): Promise<NextResponse> {
  // 1. Authenticate user session
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = await getSessionUser(sessionCookie);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const siteId = request.nextUrl.searchParams.get("siteId") || "spidy-demo";
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

    // 3. Upload export report to Neon Object Storage
    const key = `reports/${siteId}/${now.toISOString().slice(0, 10)}-${Date.now()}.json`;
    await uploadObject(key, JSON.stringify(exportData, null, 2), "application/json");

    // 4. Generate presigned URL for download
    const downloadUrl = await getPresignedUrl(key, 3600);

    return NextResponse.json({
      success: true,
      key,
      downloadUrl,
      size: JSON.stringify(exportData).length,
    });
  } catch (err) {
    console.error("Export error:", err);
    return NextResponse.json({ error: "Failed to generate export" }, { status: 500 });
  }
}
