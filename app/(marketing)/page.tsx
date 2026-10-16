import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/auth";
import { HeroGlobe } from "@/components/landing/HeroGlobe";
import { DemoTeaserSection } from "@/components/landing/DemoTeaserSection";

export const metadata = {
  title: "Spidy · Privacy-First Web Analytics",
  description:
    "Self-hosted, cookieless, privacy-respecting web analytics with visually striking interactive charts. No cookies, zero IP logging, no cookie banners needed.",
  openGraph: {
    title: "Spidy · Privacy-First Web Analytics",
    description:
      "Cookieless web analytics with stunning interactive visualizations. Zero IP tracking, 100% GDPR compliant.",
    type: "website",
    url: "https://spidy.dev",
  },
};

export const instant = false;

export default async function LandingPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const isLoggedIn = Boolean(sessionCookie && sessionCookie.length === 64);

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Nav */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
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

          <nav className="hidden md:flex items-center gap-6 text-xs font-mono text-zinc-400">
            <Link href="/demo" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Live Demo
            </Link>
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#privacy" className="hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How it works
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs font-mono px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                Go to dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs font-mono text-zinc-300 hover:text-white px-3 py-1.5 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs font-mono px-4 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-28">
        {/* 2. Hero */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-800/60 bg-cyan-950/40 text-cyan-300 text-xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Cookieless · Zero IP Logging · &lt;1 KB Script
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              Privacy-first analytics with <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">striking visualizations</span>.
            </h1>

            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-xl">
              No cookies. No IP addresses stored. No consent banners needed. Deeply insightful metrics presented through high-frame-rate interactive charts and real-time globes.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs sm:text-sm font-mono px-6 py-3 rounded-xl transition-all shadow-[0_0_24px_rgba(6,182,212,0.25)] hover:scale-[1.02]"
                >
                  Go to dashboard →
                </Link>
              ) : (
                <Link
                  href="/register"
                  className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs sm:text-sm font-mono px-6 py-3 rounded-xl transition-all shadow-[0_0_24px_rgba(6,182,212,0.25)] hover:scale-[1.02]"
                >
                  Get started free →
                </Link>
              )}

              <Link
                href="/demo"
                className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-200 text-xs sm:text-sm font-mono px-5 py-3 rounded-xl transition-all flex items-center gap-2"
              >
                <span>See live demo</span>
                <span className="text-cyan-400">→</span>
              </Link>
            </div>

            <div className="pt-4 flex items-center gap-6 text-[11px] font-mono text-zinc-500">
              <span>✓ 100% GDPR / CCPA compliant</span>
              <span>✓ 0 third-party trackers</span>
              <span>✓ DNT honored</span>
            </div>
          </div>

          {/* Interactive Globe Beside Hero */}
          <div className="w-full flex justify-center items-center">
            <HeroGlobe />
          </div>
        </section>

        {/* 3. Demo Teaser & Features (Option B) */}
        <section>
          <DemoTeaserSection />
        </section>

        {/* 4. Privacy Section */}
        <section id="privacy" className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
              Radical Privacy
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Built to protect your visitors, not surveil them.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 font-mono">
              Every privacy claim is backed by our open, verifiable codebase.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-6 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400 font-mono text-sm">
                #
              </div>
              <h3 className="text-sm font-bold text-white font-mono">Daily Rotating Salt</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Raw IPs are never stored. Visitors are identified using a daily-salted SHA-256 hash that rotates every midnight, preventing cross-day tracking.
              </p>
            </div>

            <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-6 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800/60 flex items-center justify-center text-indigo-400 font-mono text-sm">
                Ø
              </div>
              <h3 className="text-sm font-bold text-white font-mono">Zero Visitor Cookies</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Tracked website visitors never receive cookies or localStorage tokens. No intrusive cookie banners needed anywhere on your site.
              </p>
            </div>

            <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-6 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800/60 flex items-center justify-center text-emerald-400 font-mono text-sm">
                /
              </div>
              <h3 className="text-sm font-bold text-white font-mono">Clean URLs & Referrers</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Referrers are stored as domain hostnames only. All URL query strings and fragments are stripped to prevent PII leakage.
              </p>
            </div>

            <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-6 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-800/60 flex items-center justify-center text-amber-400 font-mono text-sm">
                90d
              </div>
              <h3 className="text-sm font-bold text-white font-mono">90-Day Raw Retention</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Raw pageview rows are automatically purged after 90 days. Aggregated statistical summaries keep long-term insights without bloat.
              </p>
            </div>
          </div>
        </section>

        {/* 5. How It Works */}
        <section id="how-it-works" className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
              Integration in Seconds
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Up and running in three simple steps.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 font-mono">
              Zero dependencies, zero build steps, zero headaches.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-6 space-y-3">
              <span className="text-xs font-mono text-cyan-400">Step 1</span>
              <h3 className="text-base font-bold text-white">Add your domain</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Register your website domain in the dashboard. Each site receives a unique, secure public site ID.
              </p>
            </div>

            <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-6 space-y-3">
              <span className="text-xs font-mono text-cyan-400">Step 2</span>
              <h3 className="text-base font-bold text-white">Paste one tag (&lt;1 KB)</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Add our featherweight tracker to your HTML header or template:
              </p>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 font-mono text-[11px] text-cyan-300 break-all select-all">
                &lt;script defer src=&quot;https://spidy.dev/a.js&quot; data-site=&quot;your_site_id&quot;&gt;&lt;/script&gt;
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-6 space-y-3">
              <span className="text-xs font-mono text-cyan-400">Step 3</span>
              <h3 className="text-base font-bold text-white">Watch live events arrive</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Real-time pageviews, global markers, and journey flows populate your live dashboard within seconds.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-zinc-800 rounded-3xl p-8 sm:p-12 text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready for analytics you actually enjoy looking at?
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto font-mono">
            Get started in under two minutes. No credit card required.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={isLoggedIn ? "/dashboard" : "/register"}
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs sm:text-sm font-mono px-8 py-3.5 rounded-xl transition-all shadow-[0_0_28px_rgba(6,182,212,0.3)] hover:scale-105 inline-block cursor-pointer"
            >
              {isLoggedIn ? "Open Dashboard →" : "Start Tracking Now →"}
            </Link>
            <Link
              href="/demo"
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs sm:text-sm font-mono px-6 py-3.5 rounded-xl transition-all"
            >
              See Live Demo
            </Link>
          </div>
        </section>
      </main>

      {/* 6. Footer */}
      <footer className="border-t border-zinc-900 py-10 bg-black mt-20 text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-zinc-400">
            <span className="w-5 h-5 rounded-md bg-cyan-950 border border-cyan-800/80 flex items-center justify-center text-cyan-400 text-xs">
              ⚡
            </span>
            <span>Spidy Analytics · Cookieless Web Analytics</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/demo" className="text-cyan-400 hover:text-cyan-300 transition-colors">
              Live Demo
            </Link>
            <Link href="/privacy" className="hover:text-zinc-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/login" className="hover:text-zinc-300 transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="hover:text-zinc-300 transition-colors">
              Register
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-300 transition-colors"
            >
              Source
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
