import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "@/lib/db";
import {
  verifyPassword,
  dummyPasswordVerify,
  createSession,
  SESSION_COOKIE_OPTIONS,
} from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

const loginSchema = z.object({
  email: z.string().email("Invalid email format").max(255),
  password: z.string().min(1, "Password is required").max(128),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Parse JSON payload
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const password = parsed.data.password;

  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";

  // 2. Rate limit: 10 attempts per 15 minutes per IP hash and per email hash
  const [ipLimit, emailLimit] = await Promise.all([
    checkRateLimit("login:", clientIp, 10, 900),
    checkRateLimit("login:", email, 10, 900),
  ]);

  if (!ipLimit.allowed || !emailLimit.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429 }
    );
  }

  try {
    // 3. Query user by email
    const rows = (await sql`
      SELECT id, email, password_hash
      FROM users
      WHERE email = ${email};
    `) as Array<{ id: string; email: string; password_hash: string }>;

    if (!rows || rows.length === 0) {
      // Execute dummy argon2 verification to prevent timing attack enumeration
      await dummyPasswordVerify();
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const user = rows[0];

    // 4. Verify password with argon2id
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // 5. Create new session and set cookie
    const rawToken = await createSession(user.id);
    const response = NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email },
    });

    response.cookies.set({
      ...SESSION_COOKIE_OPTIONS,
      value: rawToken,
    });

    return response;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Authentication failed. Please try again." }, { status: 500 });
  }
}
