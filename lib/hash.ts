import crypto from "node:crypto";

/**
 * Computes a privacy-preserving, daily-rotating visitor identifier.
 * Formula: sha256(SALT + utcDate + ip + ua).slice(0, 16)
 *
 * Hard constraints:
 * - Raw IP is never returned, stored, or logged.
 * - Hash rotates daily so visitor activity cannot be tracked across days.
 */
export function getVisitorHash(
  ip: string,
  userAgent: string,
  date: Date = new Date(),
  customSalt?: string
): string {
  const salt = customSalt ?? process.env.SALT;
  if (!salt) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SALT environment variable is not defined");
    }
  }

  const activeSalt = salt || "default-development-salt-do-not-use-in-production";
  const utcDate = date.toISOString().slice(0, 10); // YYYY-MM-DD in UTC

  const hash = crypto
    .createHash("sha256")
    .update(`${activeSalt}${utcDate}${ip}${userAgent}`)
    .digest("hex");

  return hash.slice(0, 16);
}
