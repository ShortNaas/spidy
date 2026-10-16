import React from "react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy · Spidy Analytics",
  description:
    "How Spidy handles analytics without cookies, without storing IP addresses, and with total respect for visitor privacy.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Top Navbar */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white font-bold tracking-tight">
            <span className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </span>
            <span className="text-base tracking-tight">Spidy</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-xs font-mono text-zinc-400 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-xs font-mono bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="space-y-4 mb-10 pb-8 border-b border-zinc-800">
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
            Privacy First Architecture
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Privacy Statement & Principles
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed font-mono">
            Spidy is built strictly from the ground up to respect digital privacy, comply with GDPR, CCPA, and PECR without needing obnoxious cookie banners.
          </p>
        </div>

        <div className="space-y-10 text-sm text-zinc-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
              <span className="text-cyan-400">01.</span> Cookieless by Design
            </h2>
            <p>
              Visitors to websites tracked by Spidy are never assigned cookies, localStorage tokens, or device fingerprints. The lightweight tracker script (<span className="font-mono text-zinc-200">&lt;1 KB</span>) transmits standard HTTP pageview telemetry without storing any persistent state on the client device.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
              <span className="text-cyan-400">02.</span> Zero Raw IP Storage
            </h2>
            <p>
              Raw IP addresses are never written to any database, persistent disk, or logs. When an event arrives at the collector endpoint, Spidy generates an anonymized visitor identifier using a cryptographically salted one-way hash:
            </p>
            <pre className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 font-mono text-xs text-cyan-300 overflow-x-auto">
              sha256(SALT + utcDate + ip + userAgent).slice(0, 16)
            </pre>
            <p className="text-xs text-zinc-400">
              Because the salt and the date rotate continuously, it is mathematically impossible to track a visitor across different days or different websites.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
              <span className="text-cyan-400">03.</span> Referrer Hostname Only & Clean Paths
            </h2>
            <p>
              External referrers are sanitized to include only the domain name (e.g., <code className="text-zinc-200 font-mono">github.com</code> or <code className="text-zinc-200 font-mono">news.ycombinator.com</code>). All URL query parameters and URL fragments are stripped before storage to prevent accidental exposure of PII (personal identifiable information) such as authentication tokens or email parameters.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
              <span className="text-cyan-400">04.</span> Do Not Track (DNT) Respected
            </h2>
            <p>
              Spidy strictly honors the browser&apos;s Do Not Track setting. When <code className="text-zinc-200 font-mono">navigator.doNotTrack === &apos;1&apos;</code> or <code className="text-zinc-200 font-mono">window.doNotTrack === &apos;1&apos;</code>, the tracker script exits immediately and transmits zero telemetry.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
              <span className="text-cyan-400">05.</span> Strict 90-Day Raw Data Retention
            </h2>
            <p>
              Raw pageview events are automatically purged after 90 days by nightly database rollup cron tasks. Only aggregated, privacy-preserving daily statistics (<code className="text-zinc-200 font-mono">daily_stats</code>) are retained for long-term trend analysis.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
              <span className="text-cyan-400">06.</span> Account Security & Cookies
            </h2>
            <p>
              The only cookie set anywhere in the application is the secure, HTTP-only, SameSite session cookie (<code className="text-zinc-200 font-mono">spidy_session</code>) granted exclusively to registered account administrators when logging into the Spidy dashboard. Tracked website visitors never receive this or any other cookie.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-zinc-900 py-8 text-center text-xs text-zinc-600 font-mono">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>Spidy Analytics · Cookieless · Zero Fingerprinting</span>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-zinc-400 transition-colors">
              Home
            </Link>
            <Link href="/privacy" className="hover:text-zinc-400 transition-colors">
              Privacy
            </Link>
            <Link href="/login" className="hover:text-zinc-400 transition-colors">
              Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
