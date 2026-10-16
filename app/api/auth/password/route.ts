import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "@/lib/db";
import {
  SESSION_COOKIE_NAME,
  getSessionUser,
  hashPassword,
  verifyPassword,
  hashToken,
} from "@/lib/auth";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(10, "New password must be at least 10 characters")
    .max(128, "New password must be at most 128 characters"),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = await getSessionUser(token);

  if (!user || !token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }

  const { currentPassword, newPassword } = parsed.data;

  // Retrieve current user hash
  const userRows = (await sql`
    SELECT password_hash FROM users WHERE id = ${user.id}::uuid;
  `) as Array<{ password_hash: string }>;

  if (!userRows || userRows.length === 0) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const isValid = await verifyPassword(currentPassword, userRows[0].password_hash);
  if (!isValid) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
  }

  // Hash new password and update user
  const newHash = await hashPassword(newPassword);
  await sql`
    UPDATE users
    SET password_hash = ${newHash}
    WHERE id = ${user.id}::uuid;
  `;

  // Invalidate all OTHER sessions for this user
  const currentTokenHash = await hashToken(token);
  await sql`
    DELETE FROM sessions
    WHERE user_id = ${user.id}::uuid
      AND token_hash != ${currentTokenHash};
  `;

  return NextResponse.json({ ok: true, message: "Password updated successfully" });
}
