import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
  destroySession,
} from "@/lib/auth";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    try {
      await destroySession(token);
    } catch (err) {
      console.error("Logout session deletion error:", err);
    }
  }

  const response = NextResponse.json({ ok: true });

  // Clear session cookie
  response.cookies.set({
    ...SESSION_COOKIE_OPTIONS,
    value: "",
    maxAge: 0,
  });

  return response;
}
