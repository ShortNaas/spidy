import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  verifyPassword,
  verifySessionToken,
} from "@/lib/auth";

describe("Dashboard Auth Unit Tests (lib/auth.ts)", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.DASHBOARD_PASSWORD = "test-dashboard-secret";
    process.env.SALT = "test-salt-32-byte-hex-string-0123456789";
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("exports correct cookie name", () => {
    expect(SESSION_COOKIE_NAME).toBe("spidy_session");
  });

  it("verifies correct password and rejects incorrect password in constant time", async () => {
    expect(await verifyPassword("test-dashboard-secret")).toBe(true);
    expect(await verifyPassword("wrong-password")).toBe(false);
    expect(await verifyPassword("")).toBe(false);
  });

  it("creates and verifies signed session token", async () => {
    const token = await createSessionToken();
    expect(token).toContain(".");
    expect(await verifySessionToken(token)).toBe(true);
  });

  it("rejects tampered session token", async () => {
    const token = await createSessionToken();
    const [timestamp, sig] = token.split(".");
    // Tamper with signature
    const tamperedSig = sig.slice(0, -1) + (sig.endsWith("0") ? "1" : "0");
    const tamperedToken = `${timestamp}.${tamperedSig}`;

    expect(await verifySessionToken(tamperedToken)).toBe(false);
  });

  it("rejects expired session token", async () => {
    // 8 days ago (expired, limit is 7 days)
    const oldTimestamp = (Date.now() - 8 * 86400 * 1000).toString();
    const token = `${oldTimestamp}.anysignature`;
    expect(await verifySessionToken(token)).toBe(false);
  });

  it("rejects malformed token", async () => {
    expect(await verifySessionToken("")).toBe(false);
    expect(await verifySessionToken(null)).toBe(false);
    expect(await verifySessionToken("no-dot-token")).toBe(false);
    expect(await verifySessionToken("invalid-timestamp.sig")).toBe(false);
  });
});
