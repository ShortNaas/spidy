import { NextRequest, NextResponse } from "next/server";
import { isBot } from "@/lib/bots";
import { getVisitorHash } from "@/lib/hash";
import {
  cleanPath,
  cleanReferrer,
  collectPayloadSchema,
  parseUserAgent,
} from "@/lib/validate";
import { sql } from "@/lib/db";

// In-memory site lookup cache (60s TTL)
interface CachedSite {
  id: string;
  domain: string;
  cachedAt: number;
}

const siteCache = new Map<string, CachedSite | null>();
const SITE_CACHE_TTL_MS = 60 * 1000; // 60s

export function resetSiteCacheForTesting(): void {
  siteCache.clear();
}

export async function getCachedSite(siteId: string): Promise<CachedSite | null> {
  const now = Date.now();
  const hit = siteCache.get(siteId);
  if (hit !== undefined && (hit === null || now - hit.cachedAt < SITE_CACHE_TTL_MS)) {
    return hit;
  }

  const rows = (await sql`
    SELECT id, domain FROM sites WHERE id = ${siteId};
  `) as Array<{ id: string; domain: string }>;

  if (!rows || rows.length === 0) {
    siteCache.set(siteId, null);
    return null;
  }

  const site: CachedSite = {
    id: rows[0].id,
    domain: rows[0].domain.toLowerCase().trim(),
    cachedAt: now,
  };
  siteCache.set(siteId, site);
  return site;
}

export function isOriginAllowedForSite(origin: string | null, siteDomain: string): boolean {
  if (!origin) return true;
  try {
    const host = new URL(origin.includes("://") ? origin : `https://${origin}`).hostname.toLowerCase();
    const domain = siteDomain.toLowerCase().trim();
    return (
      host === domain ||
      host.endsWith("." + domain) ||
      (process.env.NODE_ENV !== "production" && (host === "localhost" || host === "127.0.0.1"))
    );
  } catch {
    return false;
  }
}

// In-memory rate limiting map: visitorHash -> { count, resetAt }
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // 60 events per minute per visitor

function isRateLimited(visitor: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(visitor);

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
  const allowOrigin = origin || "*";

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

  // 2. User-Agent and Bot detection
  const userAgent = request.headers.get("user-agent") || "";
  if (isBot(userAgent)) {
    // Silently acknowledge bots with 204 without recording event
    return new NextResponse(null, { status: 204, headers: corsHeaders });
  }

  // 3. Validate payload with strict input size limit (max 16 KB)
  let payload;
  try {
    const rawText = await request.text();
    if (rawText.length > 16384) {
      return new NextResponse("Payload Too Large", { status: 413, headers: corsHeaders });
    }
    payload = collectPayloadSchema.parse(JSON.parse(rawText));
  } catch (err) {
    return new NextResponse(`Bad Request: ${(err as Error).message}`, {
      status: 400,
      headers: corsHeaders,
    });
  }

  // 4. Look up site and verify request origin against site domain
  const site = await getCachedSite(payload.site_id);
  if (!site) {
    return new NextResponse("Unknown site_id", {
      status: 400,
      headers: corsHeaders,
    });
  }

  const requestOrigin = origin || request.headers.get("referer");
  if (requestOrigin && !isOriginAllowedForSite(requestOrigin, site.domain)) {
    return new NextResponse("Forbidden: Origin not allowed for this site", {
      status: 403,
      headers: corsHeaders,
    });
  }

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
