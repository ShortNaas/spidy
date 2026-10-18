import { describe, it, expect } from "vitest";
import { hashKey } from "@/lib/rate-limit";

describe("Rate Limiter Key Hashing", () => {
  it("computes exact byte-for-byte SHA-256 slice(0, 32) for IP and email inputs", () => {
    // Test vector for IP 127.0.0.1
    expect(hashKey("127.0.0.1")).toBe("12ca17b49af2289436f303e0166030a2");

    // Test vector for email user@example.com
    expect(hashKey("user@example.com")).toBe("b4c9a289323b21a01c3e940f150eb9b8");
  });

  it("returns synchronously and produces exactly 32 lowercase hex characters", () => {
    const hash = hashKey("some-client-ip-or-id");
    expect(typeof hash).toBe("string");
    expect(hash).toHaveLength(32);
    expect(/^[0-9a-f]{32}$/.test(hash)).toBe(true);
    expect(hash).not.toContain("some-client-ip-or-id");
  });
});
