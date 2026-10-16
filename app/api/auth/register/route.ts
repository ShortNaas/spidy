import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "@/lib/db";
import { hashPassword, createSession, SESSION_COOKIE_OPTIONS } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

const registerSchema = z.object({
  email: z.string().email("Invalid email format").max(255),
  password: z
    .string()
    .min(10, "Password must be at least 10 characters")
    .max(128, "Password must be at most 128 characters"),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Check registration feature flag
  if (process.env.ALLOW_REGISTRATION === "false") {
    return NextResponse.json({ error: "Registration is currently closed" }, { status: 404 });
  }

  // 2. Rate limit 5 attempts per hour per IP hash
  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";

  const rateCheck = await checkRateLimit("reg:", clientIp, 5, 3600);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "Too many registration attempts. Please try again later." },
      { status: 429 }
    );
  }

  // 3. Validate body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message || "Invalid input";
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const password = parsed.data.password;

  try {
    // 4. Check for duplicate email (generic error to avoid email enumeration)
    const existing = (await sql`
      SELECT id FROM users WHERE email = ${email};
    `) as Array<{ id: string }>;

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: "Unable to complete registration. Please check your credentials or log in." },
        { status: 400 }
      );
    }

    // 5. Hash password with argon2id and insert user
    const passwordHash = await hashPassword(password);
    const userRows = (await sql`
      INSERT INTO users (email, password_hash)
      VALUES (${email}, ${passwordHash})
      RETURNING id, email;
    `) as Array<{ id: string; email: string }>;

    const user = userRows[0];
    if (!user) {
      throw new Error("Failed to insert user record");
    }

    // 6. Create session and set cookie
    const rawToken = await createSession(user.id);
    const response = NextResponse.json(
      {
        ok: true,
        user: { id: user.id, email: user.email },
      },
      { status: 201 }
    );

    response.cookies.set({
      ...SESSION_COOKIE_OPTIONS,
      value: rawToken,
    });

    return response;
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
