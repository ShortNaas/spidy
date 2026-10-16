import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "@/lib/db";
import { SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS, getSessionUser } from "@/lib/auth";

const deleteAccountSchema = z.object({
  confirmEmail: z.string().min(1, "Email confirmation is required"),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = await getSessionUser(token);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = deleteAccountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }

  if (parsed.data.confirmEmail.trim().toLowerCase() !== user.email.toLowerCase()) {
    return NextResponse.json(
      { error: "Confirmation email does not match your account email" },
      { status: 400 }
    );
  }

  // 1. Delete events and daily_stats for all sites owned by this user
  await sql`
    DELETE FROM events
    WHERE site_id IN (SELECT id FROM sites WHERE user_id = ${user.id}::uuid);
  `;

  await sql`
    DELETE FROM daily_stats
    WHERE site_id IN (SELECT id FROM sites WHERE user_id = ${user.id}::uuid);
  `;

  // 2. Delete user (cascades to sites and sessions)
  await sql`
    DELETE FROM users
    WHERE id = ${user.id}::uuid;
  `;

  // 3. Clear session cookie
  const response = NextResponse.json({ ok: true, message: "Account deleted successfully" });
  response.cookies.set({
    ...SESSION_COOKIE_OPTIONS,
    value: "",
    maxAge: 0,
  });

  return response;
}
