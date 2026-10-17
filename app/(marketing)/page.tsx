import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/auth";
import { Wordmark } from "@/components/ui/Wordmark";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { HeroGlobe } from "@/components/landing/HeroGlobe";
import { ShowcaseFrame } from "@/components/landing/ShowcaseFrame";

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
    <div className="relative min-h-screen bg-canvas text-white overflow-x-hidden selection:bg-accent/20 selection:text-accent-bright">
      {/* 1. Nav: Wordmark left, pill links center, auth right */}
      <header className="sticky top-0 z-40 w-full px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <nav
          className="max-w-6xl mx-auto h-[60px] px-5 sm:px-6 rounded-full bg-surface/80 border border-border backdrop-blur-md flex items-center justify-between"
          aria-label="Main Navigation"
        >
          <div className="flex items-center gap-6">
            <Wordmark href="/" />
            <div className="hidden sm:flex items-center gap-1">
              <Link
                href="/demo"
                className="px-3 py-1 rounded-full text-[13px] font-sans font-medium text-muted hover:text-white hover:bg-white/5 transition-colors duration-150"
              >
                Demo
              </Link>
              <Link
                href="/privacy"
                className="px-3 py-1 rounded-full text-[13px] font-sans font-medium text-muted hover:text-white hover:bg-white/5 transition-colors duration-150"
              >
                Privacy
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button variant="primary" size="sm">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    Get started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Main Container: Airy, 144px+ between sections */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-32 space-y-36">
        {/* 2. Hero: Tag, Two-Tone Headline, 1 Accent Button, Globe right/below */}
        <section className="relative">
          {/* Subtle dotgrid fade & single light beam */}
          <div className="absolute -top-24 -left-20 w-[600px] h-[500px] dotgrid opacity-40 pointer-events-none" aria-hidden="true" />
          <div className="beam -top-20 left-1/3 w-[500px] h-[320px] pointer-events-none" aria-hidden="true" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            <div className="lg:col-span-7 space-y-6 text-left">
              <div>
                <Tag>Privacy-first analytics</Tag>
              </div>

              {/* Two-Tone Headline */}
              <h1 className="font-sans font-semibold text-[44px] sm:text-[60px] lg:text-[68px] leading-[1.08] tracking-tight">
                <span className="text-white block">Clean web telemetry.</span>
                <span className="text-muted block font-normal">Without surveillance.</span>
              </h1>

              {/* One Muted Sentence */}
              <p className="font-sans text-[15px] sm:text-[17px] text-muted max-w-xl leading-relaxed">
                No cookies, no IP addresses stored, and no consent banners needed. Fast, cookieless telemetry designed for site owners who respect their visitors.
              </p>

              {/* Action Buttons: Accent is the ONE hot thing on the page */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <Link href="/demo">
                  <Button
                    variant="accent"
                    size="lg"
                    className="shadow-[0_0_28px_rgba(251,92,52,0.28)]"
                  >
                    Open live demo
                  </Button>
                </Link>

                <Link href={isLoggedIn ? "/dashboard" : "/register"}>
                  <Button variant="secondary" size="lg">
                    {isLoggedIn ? "Open dashboard" : "Get started"}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Globe in 32px-radius frame with .sheen */}
            <div className="lg:col-span-5 flex justify-center">
              <HeroGlobe />
            </div>
          </div>
        </section>

        {/* 3. One Showcase Frame: 32px radius with ember heatmap & hatched bar chart */}
        <section>
          <ShowcaseFrame />
        </section>

        {/* 4. How It Works: Connected steps with thin lines and dot nodes (NEXORA style) */}
        <section className="space-y-12">
          <div className="space-y-3 text-left">
            <Tag>How it works</Tag>
            <h2 className="font-sans font-semibold text-[32px] sm:text-[40px] text-white tracking-tight">
              Integration in seconds. <span className="text-muted font-normal">No build steps or bloat.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Step 1 */}
            <div className="relative bg-surface border border-border rounded-3xl p-6 sheen flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-raised border border-border text-white text-[11px] font-mono flex items-center justify-center font-medium">
                    01
                  </span>
                  <span className="font-mono text-[11px] text-muted">Register site</span>
                </div>
                <h3 className="font-sans font-medium text-[16px] text-white">
                  Add your domain
                </h3>
                <p className="font-sans text-[13px] text-muted leading-relaxed">
                  Register your website domain in the dashboard to receive your unique, permanent public site identifier.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative bg-surface border border-border rounded-3xl p-6 sheen flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-raised border border-border text-white text-[11px] font-mono flex items-center justify-center font-medium">
                    02
                  </span>
                  <span className="font-mono text-[11px] text-muted">Embed snippet</span>
                </div>
                <h3 className="font-sans font-medium text-[16px] text-white">
                  Paste the 845-byte tag
                </h3>
                <div className="bg-raised border border-border rounded-xl p-3 font-mono text-[11px] text-white/90 break-all select-all">
                  &lt;script defer src=&quot;https://spidy.dev/a.js&quot; data-site=&quot;your_site_id&quot;&gt;&lt;/script&gt;
                </div>
                <div className="font-mono text-[11px] text-muted">
                  845 bytes · 0 dependencies · 0 cookies
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative bg-surface border border-border rounded-3xl p-6 sheen flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-raised border border-border text-white text-[11px] font-mono flex items-center justify-center font-medium">
                    03
                  </span>
                  <span className="font-mono text-[11px] text-muted">Observe telemetry</span>
                </div>
                <h3 className="font-sans font-medium text-[16px] text-white">
                  Watch live events arrive
                </h3>
                <p className="font-sans text-[13px] text-muted leading-relaxed">
                  Real-time pageviews, planetary telemetry, and user flows populate your dashboard within seconds.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Privacy: 4 Small Cards with one plain sentence each */}
        <section className="space-y-12">
          <div className="space-y-3 text-left">
            <Tag>Privacy</Tag>
            <h2 className="font-sans font-semibold text-[32px] sm:text-[40px] text-white tracking-tight">
              Architectural guarantee. <span className="text-muted font-normal">Backed by code, not policy.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-surface border border-border rounded-3xl p-6 sheen space-y-3">
              <span className="font-mono text-[12px] text-white font-medium block">
                Daily Salted Hash
              </span>
              <p className="font-sans text-[13px] text-muted leading-relaxed">
                Raw IP addresses are never stored; daily salted SHA-256 hashes rotate at UTC midnight to make cross-day visitor linkage mathematically impossible.
              </p>
            </div>

            <div className="bg-surface border border-border rounded-3xl p-6 sheen space-y-3">
              <span className="font-mono text-[12px] text-white font-medium block">
                No Visitor Cookies
              </span>
              <p className="font-sans text-[13px] text-muted leading-relaxed">
                Tracked website visitors never receive cookies or localStorage tokens; zero cookie consent banners needed anywhere on your site.
              </p>
            </div>

            <div className="bg-surface border border-border rounded-3xl p-6 sheen space-y-3">
              <span className="font-mono text-[12px] text-white font-medium block">
                Referrer Hostname Only
              </span>
              <p className="font-sans text-[13px] text-muted leading-relaxed">
                All URL query strings and hash fragments are stripped before storage to prevent accidental personal data leakage.
              </p>
            </div>

            <div className="bg-surface border border-border rounded-3xl p-6 sheen space-y-3">
              <span className="font-mono text-[12px] text-white font-medium block">
                Do Not Track Honored
              </span>
              <p className="font-sans text-[13px] text-muted leading-relaxed">
                Honors navigator.doNotTrack with zero network requests; raw event logs are automatically pruned after 90 days.
              </p>
            </div>
          </div>
        </section>

        {/* 6. Closing: Large Two-Tone Line, The Two Buttons Again */}
        <section className="py-12 text-left space-y-8">
          <h2 className="font-sans font-semibold text-[36px] sm:text-[48px] text-white tracking-tight leading-tight max-w-3xl">
            <span className="block">Analytics you actually enjoy looking at.</span>
            <span className="text-muted block font-normal">Built for owners who respect their visitors.</span>
          </h2>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/demo">
              <Button variant="accent" size="lg">
                Open live demo
              </Button>
            </Link>
            <Link href={isLoggedIn ? "/dashboard" : "/register"}>
              <Button variant="secondary" size="lg">
                {isLoggedIn ? "Open dashboard" : "Get started"}
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* 7. Footer: Wordmark, /privacy, source link */}
      <footer className="border-t border-border py-12 bg-canvas text-xs text-muted font-sans">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Wordmark href="/" />
            <span className="text-faint font-mono text-[11px]">· Cookieless Web Analytics</span>
          </div>

          <div className="flex items-center gap-6 font-mono text-[12px]">
            <Link href="/demo" className="text-muted hover:text-white transition-colors duration-150">
              Demo
            </Link>
            <Link href="/privacy" className="text-muted hover:text-white transition-colors duration-150">
              Privacy
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-white transition-colors duration-150"
            >
              Source
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
