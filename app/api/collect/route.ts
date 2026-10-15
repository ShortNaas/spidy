import { NextRequest, NextResponse } from "next/server";
import { isBot } from "@/lib/bots";
import { getVisitorHash } from "@/lib/hash";
import {
  cleanPath,
  cleanReferrer,
  collectPayloadSchema,
  isOriginAllowed,
  parseUserAgent,
} from "@/lib/validate";
import { sql } from "@/lib/db";

// In-memory rate limiting map: visitorHash -> { count, resetAt }
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // 60 events per minute per visitor

function isRateLimited(visitor: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(visitor);

  // Periodic cleanup if map grows
  if (rateLimitMap.size > 10000) {
    for (const [k, v] of rateLimitMap.entries()) {
      if (v.resetAt < now) {
        rateLimitMap.delete(k);
      }
    }
  }

  if (!record || record.resetAt < now) {
    rateLimitMap.set(visitor, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  record.count++;
  return record.count > MAX_REQUESTS_PER_WINDOW;
}

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowed = isOriginAllowed(origin);
  const allowOrigin = allowed && origin ? origin : "*";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  const origin = request.headers.get("origin");
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const origin = request.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  // 1. Honor Do Not Track
  if (request.headers.get("dnt") === "1") {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
  }

  // 2. Validate Origin if ALLOWED_ORIGINS is configured
  if (origin && !isOriginAllowed(origin)) {
    return new NextResponse("Forbidden: Origin not allowed", {
      status: 403,
      headers: corsHeaders,
    });
  }

  // 3. User-Agent and Bot detection
  const userAgent = request.headers.get("user-agent") || "";
  if (isBot(userAgent)) {
    // Silently acknowledge bots with 204 without recording event
    return new NextResponse(null, { status: 204, headers: corsHeaders });
  }

  // 4. Validate payload
  let jsonBody: unknown;
  try {
    jsonBody = await request.json();
  } catch {
    return new NextResponse("Bad Request: Invalid JSON body", {
      status: 400,
      headers: corsHeaders,
    });
  }

  const parsed = collectPayloadSchema.safeParse(jsonBody);
  if (!parsed.success) {
    return new NextResponse(`Bad Request: ${parsed.error.message}`, {
      status: 400,
      headers: corsHeaders,
    });
  }

  const payload = parsed.data;

  // 5. Extract IP ephemeral address for daily salted hashing ONLY (never stored)
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor
    ? forwardedFor.split(",")[0].trim()
    : request.headers.get("x-real-ip") || "127.0.0.1";

  const visitor = getVisitorHash(ip, userAgent);

  // 6. Basic rate limit per visitor hash
  if (isRateLimited(visitor)) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: corsHeaders,
    });
  }

  // 7. Parse UA and normalize path / referrer
  const { device, browser, os } = parseUserAgent(userAgent);
  const path = cleanPath(payload.path);
  const referrer = cleanReferrer(payload.referrer);

  // 8. Geo headers from Vercel
  const country = request.headers.get("x-vercel-ip-country") || null;
  const city = request.headers.get("x-vercel-ip-city") || null;
  const latHeader = request.headers.get("x-vercel-ip-latitude");
  const lonHeader = request.headers.get("x-vercel-ip-longitude");
  const lat = latHeader ? parseFloat(latHeader) || null : null;
  const lon = lonHeader ? parseFloat(lonHeader) || null : null;

  // 9. Insert into database
  try {
    await sql`
      INSERT INTO events (
        ts, site_id, path, referrer, country, city, lat, lon, device, browser, os, visitor, session
      ) VALUES (
        now(),
        ${payload.site_id},
        ${path},
        ${referrer || null},
        ${country},
        ${city},
        ${lat},
        ${lon},
        ${device},
        ${browser},
        ${os},
        ${visitor},
        ${payload.session || null}
      );
    `;
  } catch (err) {
    console.error("Database insert error in /api/collect:", err);
    return new NextResponse("Internal Server Error", {
      status: 500,
      headers: corsHeaders,
    });
  }

  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}
