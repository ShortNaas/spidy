export const SESSION_COOKIE_NAME = "spidy_session";
export const SESSION_MAX_AGE_SECONDS = 7 * 86400; // 7 days

const enc = new TextEncoder();

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * Constant-time comparison of two byte arrays to prevent timing attacks.
 */
function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

async function getHmacKey(): Promise<CryptoKey> {
  const password = process.env.DASHBOARD_PASSWORD || "spidy";
  const salt = process.env.SALT || "default-dev-salt";
  const secretBytes = enc.encode(`${password}:${salt}`);
  return crypto.subtle.importKey(
    "raw",
    secretBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Constant-time comparison of entered password against DASHBOARD_PASSWORD.
 */
export async function verifyPassword(inputPassword: string): Promise<boolean> {
  const expectedPassword = process.env.DASHBOARD_PASSWORD || "";
  if (!expectedPassword) {
    if (process.env.NODE_ENV === "production") return false;
    return inputPassword === "spidy";
  }

  const inputHash = await crypto.subtle.digest("SHA-256", enc.encode(inputPassword));
  const expectedHash = await crypto.subtle.digest("SHA-256", enc.encode(expectedPassword));

  return constantTimeEqual(new Uint8Array(inputHash), new Uint8Array(expectedHash));
}

/**
 * Creates signed session token: timestamp.signature using Web Crypto API.
 */
export async function createSessionToken(): Promise<string> {
  const key = await getHmacKey();
  const timestamp = Date.now().toString();
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(timestamp));
  return `${timestamp}.${bufferToHex(signatureBuffer)}`;
}

/**
 * Verifies signed session token in constant time. Compatible with Edge Runtime.
 */
export async function verifySessionToken(token: string | null | undefined): Promise<boolean> {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return false;
  }

  const [timestampStr, providedSigHex] = token.split(".");
  const timestamp = parseInt(timestampStr, 10);

  if (isNaN(timestamp)) return false;

  // Verify expiration (7 days)
  if (Date.now() - timestamp > SESSION_MAX_AGE_SECONDS * 1000) {
    return false;
  }

  if (providedSigHex.length !== 64) {
    return false;
  }

  const key = await getHmacKey();
  const expectedSigBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(timestampStr));
  const expectedSigHex = bufferToHex(expectedSigBuffer);

  return constantTimeEqual(hexToBuffer(providedSigHex), hexToBuffer(expectedSigHex));
}
