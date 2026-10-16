import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  SESSION_COOKIE_NAME,
  hashPassword,
  verifyPassword,
  dummyPasswordVerify,
  generateRawToken,
  hashToken,
  createSession,
  getSessionUser,
  destroySession,
} from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { setDbClient, type QueryExecutor } from "@/lib/db";
import { POST as registerHandler } from "@/app/api/auth/register/route";
import { POST as loginHandler } from "@/app/api/auth/login/route";
import { POST as logoutHandler } from "@/app/api/auth/logout/route";
import { NextRequest } from "next/server";

describe("Accounts & Authentication (Agent 9)", () => {
  const originalEnv = process.env;

  // In-memory test store
  const usersTable: Array<{ id: string; email: string; password_hash: string }> = [];
  const sessionsTable: Array<{ token_hash: string; user_id: string; expires_at: Date }> = [];
  const authAttemptsTable: Array<{ key: string; ts: Date }> = [];

  beforeEach(() => {
    process.env = { ...originalEnv };
    usersTable.length = 0;
    sessionsTable.length = 0;
    authAttemptsTable.length = 0;

    const mockDb: QueryExecutor = ((
      stringsOrQuery: TemplateStringsArray | string,
      ...values: unknown[]
    ) => {
      const sqlText =
        typeof stringsOrQuery === "string" ? stringsOrQuery : stringsOrQuery.join("?");

      // 1. auth_attempts count
      if (sqlText.includes("FROM auth_attempts") && sqlText.includes("count(*)")) {
        const key = values[0] as string;
        const windowStart = new Date(values[1] as string);
        const count = authAttemptsTable.filter(
          (a) => a.key === key && a.ts >= windowStart
        ).length;
        return Promise.resolve([{ count }]);
      }

      // 2. auth_attempts insert
      if (sqlText.includes("INSERT INTO auth_attempts")) {
        const key = values[0] as string;
        authAttemptsTable.push({ key, ts: new Date() });
        return Promise.resolve([]);
      }

      // 3. users lookup by email
      if (sqlText.includes("FROM users") && sqlText.includes("email =")) {
        const email = (values[0] as string).toLowerCase();
        const found = usersTable.filter((u) => u.email === email);
        return Promise.resolve(found);
      }

      // 4. users insert
      if (sqlText.includes("INSERT INTO users")) {
        const email = (values[0] as string).toLowerCase();
        const passwordHash = values[1] as string;
        const id = `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const user = { id, email, password_hash: passwordHash };
        usersTable.push(user);
        return Promise.resolve([{ id: user.id, email: user.email }]);
      }

      // 5. sessions insert
      if (sqlText.includes("INSERT INTO sessions")) {
        const tokenHash = values[0] as string;
        const userId = values[1] as string;
        const expiresAt = new Date(values[2] as string);
        sessionsTable.push({ token_hash: tokenHash, user_id: userId, expires_at: expiresAt });
        return Promise.resolve([]);
      }

      // 6. sessions lookup with user join
      if (sqlText.includes("FROM sessions") && sqlText.includes("JOIN users")) {
        const tokenHash = values[0] as string;
        const session = sessionsTable.find(
          (s) => s.token_hash === tokenHash && s.expires_at > new Date()
        );
        if (!session) return Promise.resolve([]);
        const user = usersTable.find((u) => u.id === session.user_id);
        if (!user) return Promise.resolve([]);
        return Promise.resolve([{ id: user.id, email: user.email }]);
      }

      // 7. raw sessions query by token_hash
      if (sqlText.includes("FROM sessions WHERE token_hash =")) {
        const tokenHash = values[0] as string;
        const found = sessionsTable.filter((s) => s.token_hash === tokenHash);
        return Promise.resolve(found);
      }

      // 8. sessions delete
      if (sqlText.includes("DELETE FROM sessions")) {
        const tokenHash = values[0] as string;
        const idx = sessionsTable.findIndex((s) => s.token_hash === tokenHash);
        if (idx !== -1) {
          sessionsTable.splice(idx, 1);
        }
        return Promise.resolve([]);
      }

      return Promise.resolve([]);
    }) as QueryExecutor;

    setDbClient(mockDb);
  });

  afterEach(() => {
    process.env = originalEnv;
    setDbClient(null);
  });

  it("exports correct session cookie name", () => {
    expect(SESSION_COOKIE_NAME).toBe("spidy_session");
  });

  it("hashes password with argon2id and verifies correctly", async () => {
    const password = "correct-horse-battery-staple-10";
    const hash = await hashPassword(password);

    expect(hash).toMatch(/^\$argon2id\$/);
    expect(await verifyPassword(password, hash)).toBe(true);
    expect(await verifyPassword("wrong-password-attempt", hash)).toBe(false);
  });

  it("runs dummyPasswordVerify without throwing", async () => {
    await expect(dummyPasswordVerify()).resolves.not.toThrow();
  });

  it("generates 32-byte (64 hex characters) raw session tokens", () => {
    const token1 = generateRawToken();
    const token2 = generateRawToken();

    expect(token1).toHaveLength(64);
    expect(token2).toHaveLength(64);
    expect(token1).not.toBe(token2);
  });

  it("hashes raw tokens using SHA-256 for secure storage", async () => {
    const rawToken = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
    const hash = await hashToken(rawToken);

    expect(hash).toHaveLength(64);
    expect(hash).not.toBe(rawToken);
  });

  it("enforces DB-backed rate limiting using hashed keys", async () => {
    const testId = `test-ip-${Date.now()}`;
    const limit = 3;
    const windowSec = 60;

    const r1 = await checkRateLimit("reg:", testId, limit, windowSec);
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(2);

    const r2 = await checkRateLimit("reg:", testId, limit, windowSec);
    expect(r2.allowed).toBe(true);
    expect(r2.remaining).toBe(1);

    const r3 = await checkRateLimit("reg:", testId, limit, windowSec);
    expect(r3.allowed).toBe(true);
    expect(r3.remaining).toBe(0);

    const r4 = await checkRateLimit("reg:", testId, limit, windowSec);
    expect(r4.allowed).toBe(false);
    expect(r4.remaining).toBe(0);

    // Verify raw testId is never stored in auth_attempts
    expect(authAttemptsTable.some((a) => a.key.includes(testId))).toBe(false);
  });

  it("manages session lifecycle (create, getSessionUser, destroySession)", async () => {
    const testEmail = `test-user-${Date.now()}@example.com`;
    const pwdHash = await hashPassword("super-secret-password-123");
    usersTable.push({ id: "user-test-1", email: testEmail, password_hash: pwdHash });

    // 1. Create session
    const rawToken = await createSession("user-test-1");
    expect(rawToken).toHaveLength(64);

    // Verify token is stored as SHA-256 hash in DB, not raw
    const tokenHash = await hashToken(rawToken);
    expect(sessionsTable.some((s) => s.token_hash === tokenHash)).toBe(true);
    expect(sessionsTable.some((s) => s.token_hash === rawToken)).toBe(false);

    // 2. Retrieve session user
    const sessionUser = await getSessionUser(rawToken);
    expect(sessionUser).not.toBeNull();
    expect(sessionUser?.email).toBe(testEmail);
    expect(sessionUser?.id).toBe("user-test-1");

    // 3. Destroy session
    await destroySession(rawToken);
    const destroyedUser = await getSessionUser(rawToken);
    expect(destroyedUser).toBeNull();
  });

  it("POST /api/auth/register validates payload and rejects short password", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "invalid-email", password: "short" }),
    });

    const res = await registerHandler(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("POST /api/auth/register creates user and sets session cookie", async () => {
    const email = `new-user-${Date.now()}@example.com`;
    const password = "valid-password-at-least-10";

    const req = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const res = await registerHandler(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.user.email).toBe(email);
    expect(res.cookies.get(SESSION_COOKIE_NAME)).toBeDefined();
  });

  it("POST /api/auth/login validates credentials and returns 401 for bad password", async () => {
    const testEmail = "login-test@example.com";
    const password = "my-secure-password-12345";
    const pwdHash = await hashPassword(password);
    usersTable.push({ id: "user-login-1", email: testEmail, password_hash: pwdHash });

    // Wrong password attempt
    const reqBad = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: "incorrect-password" }),
    });

    const resBad = await loginHandler(reqBad);
    expect(resBad.status).toBe(401);
    const dataBad = await resBad.json();
    expect(dataBad.error).toBe("Invalid credentials");

    // Correct password attempt
    const reqGood = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password }),
    });

    const resGood = await loginHandler(reqGood);
    expect(resGood.status).toBe(200);
    const dataGood = await resGood.json();
    expect(dataGood.ok).toBe(true);
    expect(resGood.cookies.get(SESSION_COOKIE_NAME)).toBeDefined();
  });

  it("POST /api/auth/logout clears session cookie", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/logout", {
      method: "POST",
      headers: {
        Cookie: `${SESSION_COOKIE_NAME}=some-test-token-12345`,
      },
    });

    const res = await logoutHandler(req);
    expect(res.status).toBe(200);
    const cookie = res.cookies.get(SESSION_COOKIE_NAME);
    expect(cookie?.value).toBe("");
    expect(cookie?.maxAge).toBe(0);
  });
});
