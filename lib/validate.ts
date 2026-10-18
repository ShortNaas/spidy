import { z } from "zod";

/**
 * Event collection payload schema.
 */
export const collectPayloadSchema = z.object({
  site_id: z.string().min(1, "site_id is required").max(128),
  path: z.string().min(1, "path is required").max(2048),
  referrer: z.string().max(253).optional().nullable(),
  session: z.string().max(64).optional().nullable(),
});

/**
 * Strips query strings, URL fragments, and normalizes paths.
 * Hard constraint 3: Query strings and URL fragments are stripped.
 */
export function cleanPath(rawPath: string): string {
  if (!rawPath) return "/";

  // Remove fragment and query
  let path = rawPath.split("#")[0].split("?")[0].trim();

  // Ensure starts with /
  if (!path.startsWith("/")) {
    path = "/" + path;
  }

  // Remove trailing slash if not root
  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1);
  }

  return path || "/";
}

/**
 * Sanitizes referrer to hostname only.
 * Hard constraint 3: Referrer is stored as hostname only.
 */
export function cleanReferrer(rawReferrer?: string | null): string {
  if (!rawReferrer || typeof rawReferrer !== "string") {
    return "";
  }

  const trimmed = rawReferrer.trim();
  if (!trimmed) return "";

  try {
    // If it looks like a URL with protocol
    if (trimmed.includes("://")) {
      return new URL(trimmed).hostname.toLowerCase();
    }
    // Attempt parse by adding https://
    return new URL(`https://${trimmed}`).hostname.toLowerCase();
  } catch {
    // If invalid URL, strip non-hostname characters
    return trimmed.split("/")[0].split("?")[0].split(":")[0].toLowerCase();
  }
}

export interface ParsedUserAgent {
  device: "desktop" | "mobile" | "tablet";
  browser: "Chrome" | "Safari" | "Firefox" | "Edge" | "Opera" | "Other";
  os: "macOS" | "Windows" | "iOS" | "Android" | "Linux" | "Chrome OS" | "Other";
}

/**
 * Parses user agent string to device, browser, and os.
 */
export function parseUserAgent(uaString: string): ParsedUserAgent {
  const ua = uaString || "";

  // 1. Device detection
  let device: ParsedUserAgent["device"] = "desktop";
  if (/(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|silk)/i.test(ua)) {
    device = "tablet";
  } else if (
    /(mobi|ipod|iphone|android|blackberry|fennec|iemobile|opera mobi|opera mini)/i.test(ua)
  ) {
    device = "mobile";
  }

  // 2. OS detection
  let os: ParsedUserAgent["os"] = "Other";
  if (/iphone|ipad|ipod/i.test(ua)) {
    os = "iOS";
  } else if (/android/i.test(ua)) {
    os = "Android";
  } else if (/macintosh|mac os x/i.test(ua)) {
    os = "macOS";
  } else if (/windows nt/i.test(ua)) {
    os = "Windows";
  } else if (/cros/i.test(ua)) {
    os = "Chrome OS";
  } else if (/linux/i.test(ua)) {
    os = "Linux";
  }

  // 3. Browser detection (order matters)
  let browser: ParsedUserAgent["browser"] = "Other";
  if (/edg([ea]|ios)?\//i.test(ua)) {
    browser = "Edge";
  } else if (/opr\/|opera/i.test(ua)) {
    browser = "Opera";
  } else if (/firefox|fxios/i.test(ua)) {
    browser = "Firefox";
  } else if (/chrome|crios/i.test(ua)) {
    browser = "Chrome";
  } else if (/safari/i.test(ua) && !/chrome|crios|android/i.test(ua)) {
    browser = "Safari";
  }

  return { device, browser, os };
}
