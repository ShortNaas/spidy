/**
 * Bot detection utility.
 * Rejects web crawlers, monitoring probes, automated testing tools, and CLI fetchers.
 */

const BOT_PATTERNS = [
  /bot\b/i,
  /crawler/i,
  /spider/i,
  /googlebot/i,
  /bingbot/i,
  /yandex/i,
  /baiduspider/i,
  /duckduckbot/i,
  /slurp/i,
  /facebot|facebookexternalhit/i,
  /twitterbot/i,
  /linkedinbot/i,
  /embedly/i,
  /quora link preview/i,
  /showyoubot/i,
  /outbrain/i,
  /pinterest/i,
  /slackbot/i,
  /discordbot/i,
  /telegrambot/i,
  /applebot/i,
  /semrushbot/i,
  /ahrefsbot/i,
  /dotbot/i,
  /mj12bot/i,
  /bytespider/i,
  /petalsearch/i,
  /screaming frog/i,
  /uptimerobot/i,
  /pingdom/i,
  /headlesschrome/i,
  /phantomjs/i,
  /puppeteer/i,
  /selenium/i,
  /webdriver/i,
  /cypress/i,
  /playwright/i,
  /wget/i,
  /curl\//i,
  /python-requests/i,
  /go-http-client/i,
  /apache-httpclient/i,
  /node-fetch/i,
  /axios/i,
];

export function isBot(userAgent: string | null | undefined): boolean {
  if (!userAgent || typeof userAgent !== "string" || userAgent.trim().length === 0) {
    return true;
  }

  const trimmed = userAgent.trim();

  // Test against known bot token list
  for (const pattern of BOT_PATTERNS) {
    if (pattern.test(trimmed)) {
      return true;
    }
  }

  return false;
}
