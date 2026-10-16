/**
 * Bot detection utility.
 * Rejects web crawlers, monitoring probes, automated testing tools, and CLI fetchers.
 */

const BOT_REGEX =
  /bot\b|crawler|spider|yandex|duckduckbot|slurp|facebookexternalhit|embedly|quora link preview|outbrain|pinterest|petalsearch|screaming frog|pingdom|headlesschrome|phantomjs|puppeteer|selenium|webdriver|cypress|playwright|wget|curl\/|python-requests|go-http-client|apache-httpclient|node-fetch|axios/i;

export function isBot(userAgent: string | null | undefined): boolean {
  if (!userAgent || typeof userAgent !== "string" || userAgent.trim().length === 0) {
    return true;
  }
  return BOT_REGEX.test(userAgent.trim());
}
