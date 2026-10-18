import { describe, it, expect } from "vitest";
import { hashToken, generateRawToken } from "@/lib/auth";

describe("Auth Token Hashing & Generation", () => {
  it("computes exact byte-for-byte lowercase SHA-256 hex for fixed inputs", () => {
    // Known SHA-256 test vectors:
    // "hello world" -> b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9
    expect(hashToken("hello world")).toBe(
      "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9"
    );

    // Empty string "" -> e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
    expect(hashToken("")).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    );

    // Fixed 64-char hex session token
    const sampleToken = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
    const result = hashToken(sampleToken);
    expect(result).toBe("a8ae6e6ee929abea3afcfc5258c8ccd6f85273e0d4626d26c7279f3250f77c8e");
  });

  it("returns synchronously and produces a 64-character hex string", () => {
    const res = hashToken("test-token");
    expect(typeof res).toBe("string");
    expect(res).toHaveLength(64);
    expect(/^[0-9a-f]{64}$/.test(res)).toBe(true);
  });

  it("generateRawToken produces 32-byte (64 hex characters) random string", () => {
    const raw = generateRawToken();
    expect(typeof raw).toBe("string");
    expect(raw).toHaveLength(64);
    expect(/^[0-9a-f]{64}$/.test(raw)).toBe(true);
  });
});
