import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "@/lib/db";
import { SESSION_COOKIE_NAME, getSessionUser } from "@/lib/auth";

const createSiteSchema = z.object({
  domain: z.string().min(1, "Domain is required").max(253),
});

function normalizeDomain(rawDomain: string): string {
  let domain = rawDomain.trim().toLowerCase();
  // Strip protocol
  domain = domain.replace(/^https?:\/\//i, "");
  // Strip path or port
  domain = domain.split("/")[0].split(":")[0];
  // Strip leading/trailing dots or spaces
  domain = domain.replace(/^\.+|\.+$/g, "");
  return domain;
}

function generateSiteId(): string {
  const bytes = new Uint8Array(5);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = await getSessionUser(token);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sites = (await sql`
    SELECT id, domain, created_at
    FROM sites
    WHERE user_id = ${user.id}::uuid
    ORDER BY created_at DESC;
  `) as Array<{ id: string; domain: string; created_at: string }>;

  return NextResponse.json({ sites });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = await getSessionUser(token);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Cap sites per user (max 10)
  const countRes = (await sql`
    SELECT count(*)::int as count
    FROM sites
    WHERE user_id = ${user.id}::uuid;
  `) as Array<{ count: number }>;

  if ((countRes[0]?.count || 0) >= 10) {
    return NextResponse.json(
      { error: "Maximum site limit of 10 reached" },
      { status: 400 }
    );
  }

  // 2. Parse and validate input
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = createSiteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid domain" },
      { status: 400 }
    );
  }

  const domain = normalizeDomain(parsed.data.domain);
  if (!domain || domain.length < 3 || !domain.includes(".")) {
    return NextResponse.json(
      { error: "Please enter a valid domain (e.g. example.com)" },
      { status: 400 }
    );
  }

  // 3. Check domain uniqueness
  const existing = (await sql`
    SELECT id FROM sites WHERE domain = ${domain};
  `) as Array<{ id: string }>;

  if (existing.length > 0) {
    return NextResponse.json(
      { error: "A site with this domain already exists" },
      { status: 400 }
    );
  }

  // 4. Create site with public site_id
  const siteId = generateSiteId();

  try {
    const rows = (await sql`
      INSERT INTO sites (id, domain, user_id)
      VALUES (${siteId}, ${domain}, ${user.id}::uuid)
      RETURNING id, domain, created_at;
    `) as Array<{ id: string; domain: string; created_at: string }>;

    return NextResponse.json({ site: rows[0] }, { status: 201 });
  } catch (err) {
    console.error("Failed to create site:", err);
    return NextResponse.json({ error: "Failed to create site" }, { status: 500 });
  }
}
