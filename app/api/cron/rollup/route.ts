import { NextRequest, NextResponse } from "next/server";
import { performRollup } from "@/lib/rollup";

function checkCronAuth(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return false;
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return false;
  }

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return false;
  }

  const token = match[1];
  if (token.length !== cronSecret.length) {
    return false;
  }

  let mismatch = 0;
  for (let i = 0; i < token.length; i++) {
    mismatch |= token.charCodeAt(i) ^ cronSecret.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!checkCronAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const targetDate = request.nextUrl.searchParams.get("date") || undefined;
    const result = await performRollup(targetDate);
    return NextResponse.json({ success: true, ...result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  return GET(request);
}
