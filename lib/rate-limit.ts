import crypto from "node:crypto";
import { sql } from "@/lib/db";

export function hashKey(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex").slice(0, 32);
}

/**
 * DB-backed rate limiter using auth_attempts table.
 * Constraint: auth_attempts.key uses a hash of IP or email, never raw values.
 */
export async function checkRateLimit(
  keyPrefix: "reg:" | "login:",
  identifier: string,
  maxAttempts: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
  const hashedIdentifier = hashKey(identifier);
  const key = `${keyPrefix}${hashedIdentifier}`;
  const windowStart = new Date(Date.now() - windowSeconds * 1000).toISOString();

  // 1. Count attempts in the active window
  const rows = (await sql`
    SELECT count(*)::int as count
    FROM auth_attempts
    WHERE key = ${key}
      AND ts >= ${windowStart}::timestamptz;
  `) as Array<{ count: number }>;

  const currentCount = rows[0]?.count || 0;

  if (currentCount >= maxAttempts) {
    return { allowed: false, remaining: 0 };
  }

  // 2. Record new attempt
  await sql`
    INSERT INTO auth_attempts (key, ts)
    VALUES (${key}, now());
  `;

  return { allowed: true, remaining: maxAttempts - currentCount - 1 };
}
