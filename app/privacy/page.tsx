import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Wordmark } from "@/components/ui/Wordmark";
import { Tag } from "@/components/ui/Tag";

export const metadata: Metadata = {
  title: "Privacy Policy · Spidy Analytics",
  description:
    "How Spidy handles analytics without cookies, without storing IP addresses, and with total respect for visitor privacy.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-canvas text-text flex flex-col font-sans selection:bg-accent/20 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <Wordmark href="/" />
          <nav className="flex items-center gap-3">
            <Link
              href="/demo"
              className="text-[13px] font-sans text-muted hover:text-white px-3 py-1.5 rounded-full transition-colors duration-150"
            >
              Demo
            </Link>
            <Link
              href="/login"
              className="text-[13px] font-sans text-muted hover:text-white px-3 py-1.5 rounded-full transition-colors duration-150"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-[13px] font-sans bg-white text-canvas hover:bg-white/90 font-medium px-4 py-2 rounded-full transition-colors duration-150"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="space-y-4 mb-12 pb-8 border-b border-border">
          <Tag>Privacy-first architecture</Tag>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            Privacy principles <span className="text-muted font-normal">and architecture</span>
          </h1>
          <p className="text-[14px] text-muted leading-relaxed">
            Spidy is built strictly from the ground up to respect digital privacy, complying with GDPR, CCPA, and PECR without needing cookie banners or personal consent prompts.
          </p>
        </div>

        <div className="space-y-12 text-[14px] text-muted leading-relaxed">
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[12px] text-accent font-semibold">01.</span>
              <h2 className="text-[16px] font-medium text-white font-sans">
                Cookieless by Design
              </h2>
            </div>
            <p>
              Visitors to websites tracked by Spidy are never assigned cookies, localStorage tokens, or device fingerprints. The lightweight tracker script (<span className="font-mono text-text text-[12px]">&lt;1 KB</span>) transmits standard HTTP pageview telemetry without storing any persistent state on the client device.
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[12px] text-accent font-semibold">02.</span>
              <h2 className="text-[16px] font-medium text-white font-sans">
                Zero Raw IP Storage
              </h2>
            </div>
            <p>
              Raw IP addresses are never written to any database, persistent disk, or logs. When an event arrives at the collector endpoint, Spidy generates an anonymized visitor identifier using a cryptographically salted one-way hash:
            </p>
            <pre className="bg-raised border border-border rounded-xl p-3.5 font-mono text-xs text-text overflow-x-auto select-all">
              sha256(SALT + utcDate + ip + userAgent).slice(0, 16)
            </pre>
            <p className="text-[13px] text-muted">
              Because the salt and the date rotate continuously at UTC midnight, it is mathematically impossible to track a visitor across different days or different websites.
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[12px] text-accent font-semibold">03.</span>
              <h2 className="text-[16px] font-medium text-white font-sans">
                Referrer Hostname Only & Clean Paths
              </h2>
            </div>
            <p>
              External referrers are sanitized to include only the domain name (for example, <code className="text-text font-mono text-[12px] bg-raised px-1.5 py-0.5 rounded">github.com</code> or <code className="text-text font-mono text-[12px] bg-raised px-1.5 py-0.5 rounded">news.ycombinator.com</code>). All URL query parameters and URL fragments are stripped before storage to prevent accidental exposure of PII (personal identifiable information) such as authentication tokens or email parameters.
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[12px] text-accent font-semibold">04.</span>
              <h2 className="text-[16px] font-medium text-white font-sans">
                Do Not Track (DNT) Respected
              </h2>
            </div>
            <p>
              Spidy strictly honors the browser&apos;s Do Not Track setting. When <code className="text-text font-mono text-[12px] bg-raised px-1.5 py-0.5 rounded">navigator.doNotTrack === &apos;1&apos;</code> or <code className="text-text font-mono text-[12px] bg-raised px-1.5 py-0.5 rounded">window.doNotTrack === &apos;1&apos;</code>, the tracker script exits immediately and transmits zero telemetry.
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[12px] text-accent font-semibold">05.</span>
              <h2 className="text-[16px] font-medium text-white font-sans">
                Strict 90-Day Raw Data Retention
              </h2>
            </div>
            <p>
              Raw pageview events are automatically purged after 90 days by nightly database rollup cron tasks. Only aggregated, privacy-preserving daily statistics (<code className="text-text font-mono text-[12px] bg-raised px-1.5 py-0.5 rounded">daily_stats</code>) are retained for long-term trend analysis.
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[12px] text-accent font-semibold">06.</span>
              <h2 className="text-[16px] font-medium text-white font-sans">
                Account Security & Cookies
              </h2>
            </div>
            <p>
              The only cookie set anywhere in the application is the secure, HTTP-only, SameSite session cookie (<code className="text-text font-mono text-[12px] bg-raised px-1.5 py-0.5 rounded">spidy_session</code>) granted exclusively to registered account administrators when logging into the Spidy dashboard. Tracked website visitors never receive this or any other cookie.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-border py-8 text-center text-xs text-muted font-sans">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Wordmark href="/" className="text-[14px]" />
            <span className="text-faint">·</span>
            <span>Cookieless, privacy-first web analytics</span>
          </div>
          <div className="flex items-center gap-4 text-[13px]">
            <Link href="/" className="hover:text-white transition-colors duration-150">
              Home
            </Link>
            <Link href="/demo" className="hover:text-white transition-colors duration-150">
              Demo
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors duration-150">
              Privacy
            </Link>
            <Link href="/login" className="hover:text-white transition-colors duration-150">
              Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
