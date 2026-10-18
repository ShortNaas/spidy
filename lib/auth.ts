import { sql } from "@/lib/db";

export const SESSION_COOKIE_NAME = "spidy_session";
export const SESSION_MAX_AGE_SECONDS = 30 * 86400; // 30 days

export const SESSION_COOKIE_OPTIONS = {
  name: SESSION_COOKIE_NAME,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
};
import crypto from "node:crypto";

/**
 * Computes SHA-256 hash of a string (used for session tokens and attempt tracking).
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Generates a cryptographically secure random 32-byte hex token.
 */
export function generateRawToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Hashes a password with argon2id.
 * Dynamically imports @node-rs/argon2 so it never bundles into Edge Runtime.
 */
export async function hashPassword(password: string): Promise<string> {
  const argon2 = await import("@node-rs/argon2");
  return argon2.hash(password, {
    algorithm: 2, // Argon2id
  });
}

/**
 * Verifies a password against an argon2id hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    const argon2 = await import("@node-rs/argon2");
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

/**
 * Dummy password verification for constant-time mitigation of timing attacks on nonexistent users.
 */
const DUMMY_HASH =
  "$argon2id$v=19$m=19456,t=2,p=1$ZHVtbXlzYWx0MTIzNDU2$K8d2Zz5h4b7L1m8x0V3q9A";

export async function dummyPasswordVerify(): Promise<void> {
  try {
    const argon2 = await import("@node-rs/argon2");
    await argon2.verify(DUMMY_HASH, "wrong-password-for-dummy-timing");
  } catch {}
}

/**
 * Creates a new session in the database for the given user ID.
 * Returns the raw token to set in the user's cookie.
 */
export async function createSession(userId: string): Promise<string> {
  const rawToken = generateRawToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000).toISOString();

  await sql`
    INSERT INTO sessions (token_hash, user_id, expires_at)
    VALUES (${tokenHash}, ${userId}::uuid, ${expiresAt}::timestamptz);
  `;

  return rawToken;
}

export interface SessionUser {
  id: string;
  email: string;
}

/**
 * Retrieves the authenticated user from a raw session token.
 * Returns null if token is missing, invalid, or expired.
 */
export async function getSessionUser(
  token: string | null | undefined
): Promise<SessionUser | null> {
  if (!token || typeof token !== "string" || token.trim().length === 0) {
    return null;
  }

  const tokenHash = hashToken(token.trim());

  const rows = (await sql`
    SELECT users.id, users.email
    FROM sessions
    JOIN users ON sessions.user_id = users.id
    WHERE sessions.token_hash = ${tokenHash}
      AND sessions.expires_at > now();
  `) as Array<{ id: string; email: string }>;

  if (!rows || rows.length === 0) {
    return null;
  }

  return {
    id: rows[0].id,
    email: rows[0].email,
  };
}

/**
 * Invalidates and deletes a session by raw token.
 */
export async function destroySession(token: string | null | undefined): Promise<void> {
  if (!token || typeof token !== "string" || token.trim().length === 0) {
    return;
  }

  const tokenHash = hashToken(token.trim());
  await sql`
    DELETE FROM sessions
    WHERE token_hash = ${tokenHash};
  `;
}
