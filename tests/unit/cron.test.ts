import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { checkCronAuth, GET, POST } from "@/app/api/cron/rollup/route";

describe("Cron Authentication & Rollup Route", () => {
  const originalSecret = process.env.CRON_SECRET;

  beforeEach(() => {
    process.env.CRON_SECRET = "super-secret-cron-token-12345";
  });

  afterEach(() => {
    process.env.CRON_SECRET = originalSecret;
  });

  it("authenticates successfully with the correct secret", () => {
    const req = new NextRequest("http://127.0.0.1:3000/api/cron/rollup", {
      headers: {
        authorization: "Bearer super-secret-cron-token-12345",
      },
    });
    expect(checkCronAuth(req)).toBe(true);
  });

  it("returns 401 on wrong secret of the same length", async () => {
    const wrongSameLength = "wrong-secret-cron-token-12345";
    expect(wrongSameLength.length).toBe(process.env.CRON_SECRET!.length);

    const req = new NextRequest("http://127.0.0.1:3000/api/cron/rollup", {
      headers: {
        authorization: `Bearer ${wrongSameLength}`,
      },
    });
    expect(checkCronAuth(req)).toBe(false);

    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns 401 (not 500) on wrong secret of a different length", async () => {
    const wrongDiffLength = "short";
    expect(wrongDiffLength.length).not.toBe(process.env.CRON_SECRET!.length);

    const req = new NextRequest("http://127.0.0.1:3000/api/cron/rollup", {
      headers: {
        authorization: `Bearer ${wrongDiffLength}`,
      },
    });
    // Must return false without throwing
    expect(checkCronAuth(req)).toBe(false);

    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns 401 on missing authorization header", async () => {
    const req = new NextRequest("http://127.0.0.1:3000/api/cron/rollup");
    expect(checkCronAuth(req)).toBe(false);

    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns 401 when CRON_SECRET is unset, even if request sends empty or any token", async () => {
    delete process.env.CRON_SECRET;

    const req1 = new NextRequest("http://127.0.0.1:3000/api/cron/rollup", {
      headers: { authorization: "Bearer " },
    });
    expect(checkCronAuth(req1)).toBe(false);

    const res1 = await GET(req1);
    expect(res1.status).toBe(401);

    const req2 = new NextRequest("http://127.0.0.1:3000/api/cron/rollup", {
      headers: { authorization: "Bearer token" },
    });
    expect(checkCronAuth(req2)).toBe(false);

    const res2 = await GET(req2);
    expect(res2.status).toBe(401);
  });

  it("returns 401 when CRON_SECRET is empty string", async () => {
    process.env.CRON_SECRET = "";

    const req = new NextRequest("http://127.0.0.1:3000/api/cron/rollup", {
      headers: { authorization: "Bearer " },
    });
    expect(checkCronAuth(req)).toBe(false);

    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("exports POST identically to GET", () => {
    expect(POST).toBe(GET);
  });
});
