"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { GlobeLive } from "@/components/viz/GlobeLive";
import { FlowSankey } from "@/components/viz/FlowSankey";
import { CalendarHeatmap } from "@/components/viz/CalendarHeatmap";
import { HourWeekdayHeatmap } from "@/components/viz/HourWeekdayHeatmap";
import { PageStream } from "@/components/viz/PageStream";
import { PulseLive } from "@/components/viz/PulseLive";
import { WorldChoropleth } from "@/components/viz/WorldChoropleth";
import { KpiStrip } from "@/components/viz/KpiStrip";
import demoData from "@/lib/demo-data.json";
import type { SankeyData, ItemCount } from "@/lib/queries";

const DATE_PRESETS = [
  { label: "24h", value: "24h", multiplier: 0.15 },
  { label: "7d", value: "7d", multiplier: 1 },
  { label: "30d", value: "30d", multiplier: 3.8 },
  { label: "12mo", value: "12mo", multiplier: 36.5 },
];

const sankeyData = demoData.sankey as unknown as SankeyData;
const baseCountries: ItemCount[] = demoData.countries.map((c) => ({
  name: c.item,
  views: c.views,
  visitors: c.visitors,
}));

const DEMO_PAGES = [
  { name: "/", views: 18420, visitors: 11200 },
  { name: "/docs", views: 9800, visitors: 6100 },
  { name: "/pricing", views: 6400, visitors: 4200 },
  { name: "/blog/privacy", views: 5100, visitors: 3300 },
  { name: "/features", views: 4200, visitors: 2800 },
  { name: "/docs/quickstart", views: 3600, visitors: 2400 },
];

const DEMO_REFERRERS = [
  { name: "github.com", views: 12400, visitors: 8200 },
  { name: "news.ycombinator.com", views: 9800, visitors: 6400 },
  { name: "google.com", views: 8100, visitors: 5300 },
  { name: "x.com", views: 5200, visitors: 3500 },
  { name: "direct", views: 11900, visitors: 7800 },
  { name: "reddit.com", views: 2400, visitors: 1600 },
];

const DEMO_DEVICES = [
  { name: "desktop", views: 32400 },
  { name: "mobile", views: 14800 },
  { name: "tablet", views: 2600 },
];

const DEMO_PULSE_MINUTES = [
  { minute: "01", count: 8 },
  { minute: "02", count: 12 },
  { minute: "03", count: 15 },
  { minute: "04", count: 9 },
  { minute: "05", count: 14 },
  { minute: "06", count: 20 },
  { minute: "07", count: 18 },
  { minute: "08", count: 11 },
  { minute: "09", count: 16 },
  { minute: "10", count: 22 },
  { minute: "11", count: 19 },
  { minute: "12", count: 13 },
  { minute: "13", count: 17 },
  { minute: "14", count: 25 },
  { minute: "15", count: 21 },
  { minute: "16", count: 14 },
  { minute: "17", count: 18 },
  { minute: "18", count: 12 },
  { minute: "19", count: 15 },
  { minute: "20", count: 19 },
  { minute: "21", count: 23 },
  { minute: "22", count: 16 },
  { minute: "23", count: 20 },
  { minute: "24", count: 24 },
  { minute: "25", count: 17 },
  { minute: "26", count: 22 },
  { minute: "27", count: 28 },
  { minute: "28", count: 31 },
  { minute: "29", count: 26 },
  { minute: "30", count: 34 },
];

export function DemoDashboardClient() {
  const [range, setRange] = useState("7d");

  const currentPreset = useMemo(
    () => DATE_PRESETS.find((p) => p.value === range) || DATE_PRESETS[1],
    [range]
  );
  const m = currentPreset.multiplier;

  const kpis = useMemo(
    () => ({
      current: {
        views: Math.round(48520 * m),
        visitors: Math.round(19430 * m),
        bounceRate: 36,
        topCountry: "United States",
      },
      previous: {
        views: Math.round(41200 * m),
        visitors: Math.round(16800 * m),
        bounceRate: 40,
        topCountry: "United States",
      },
      deltas: { viewsPct: 18, visitorsPct: 16, bounceRatePct: -4 },
    }),
    [m]
  );

  const countries = useMemo(
    () =>
      baseCountries.map((c) => ({
        ...c,
        views: Math.round(c.views * m),
        visitors: Math.round(c.visitors * m),
      })),
    [m]
  );

  const pages = useMemo(
    () =>
      DEMO_PAGES.map((p) => ({
        ...p,
        views: Math.round(p.views * m),
        visitors: Math.round(p.visitors * m),
      })),
    [m]
  );

  const referrers = useMemo(
    () =>
      DEMO_REFERRERS.map((r) => ({
        ...r,
        views: Math.round(r.views * m),
        visitors: Math.round(r.visitors * m),
      })),
    [m]
  );

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-cyan-950/80 via-zinc-900 to-indigo-950/80 border-b border-cyan-800/40 px-4 py-2 text-center text-xs font-mono text-zinc-300 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 mx-auto sm:mx-0">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>
            <strong>Interactive Live Demo:</strong> Viewing sample analytics for{" "}
            <span className="text-cyan-400 font-semibold">spidy.dev</span> (zero cookies, zero IP tracking).
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/register"
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs px-3 py-1 rounded-md transition-colors"
          >
            Track your own site →
          </Link>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand & Demo site badge */}
          <div className="flex items-center gap-4">
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
              <span className="text-base tracking-tight hidden sm:inline">Spidy</span>
            </Link>

            <span className="bg-zinc-900 border border-zinc-700/80 text-zinc-200 text-xs font-mono px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <span className="text-zinc-500">Site:</span>
              <span className="text-white font-semibold">spidy.dev</span>
              <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800/60 px-1 rounded uppercase">
                demo
              </span>
            </span>
          </div>

          {/* Range presets */}
          <div className="flex items-center bg-zinc-900/90 border border-zinc-800 rounded-lg p-0.5">
            {DATE_PRESETS.map((p) => {
              const isActive = range === p.value;
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setRange(p.value)}
                  className={`text-xs font-mono px-3 py-1 rounded-md transition-all cursor-pointer ${
                    isActive
                      ? "bg-zinc-800 text-cyan-400 font-semibold shadow-xs"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Auth Actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-xs font-mono text-zinc-300 hover:text-white px-3 py-1.5 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs font-mono px-4 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* 1. KPI Strip */}
        <section id="viz-kpi-strip">
          <KpiStrip data={kpis} />
        </section>

        {/* 2 & 3. 3D Globe + Pulse Live */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div id="viz-globe-live" className="lg:col-span-2">
            <GlobeLive markers={demoData.markers} />
          </div>

          <div id="viz-pulse-live" className="space-y-4">
            <PulseLive
              activeVisitors={38}
              totalViews={492}
              perMinute={DEMO_PULSE_MINUTES}
            />

            {/* Device breakdown */}
            <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4">
              <div className="text-xs font-semibold text-zinc-300 mb-2">Device & Platform</div>
              <div className="space-y-2">
                {DEMO_DEVICES.map((d) => (
                  <div key={d.name} className="flex justify-between items-center text-xs font-mono">
                    <span className="text-zinc-400 capitalize">{d.name}</span>
                    <span className="text-zinc-200 tabular-nums">
                      {Math.round(d.views * m).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 4. World Choropleth + Top Countries */}
        <section id="viz-world-choropleth" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <WorldChoropleth data={countries} />
          </div>

          <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-zinc-200 mb-3">Top Countries</div>
              <div className="space-y-2.5">
                {countries.slice(0, 6).map((c, i) => (
                  <div key={c.name} className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-600 text-[10px] w-3">{i + 1}</span>
                      <span className="text-zinc-300">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-400 tabular-nums">
                        {c.visitors.toLocaleString()} <span className="text-zinc-600">vis</span>
                      </span>
                      <span className="text-cyan-400 tabular-nums w-12 text-right">
                        {c.views.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 5. Page Stream + Top Pages */}
        <section id="viz-page-stream" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PageStream data={demoData.pageStream} />
          </div>

          <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-zinc-200 mb-3">Top Pages</div>
              <div className="space-y-2.5">
                {pages.map((p, i) => (
                  <div key={p.name} className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2 truncate max-w-[170px]">
                      <span className="text-zinc-600 text-[10px] w-3">{i + 1}</span>
                      <span className="text-zinc-300 truncate" title={p.name}>
                        {p.name}
                      </span>
                    </div>
                    <div className="text-cyan-400 tabular-nums text-right">
                      {p.views.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 6. Flow Sankey + Top Referrers */}
        <section id="viz-flow-sankey" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <FlowSankey data={sankeyData} />
          </div>

          <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-zinc-200 mb-3">Top Referrers</div>
              <div className="space-y-2.5">
                {referrers.map((r, i) => (
                  <div key={r.name} className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2 truncate max-w-[170px]">
                      <span className="text-zinc-600 text-[10px] w-3">{i + 1}</span>
                      <span className="text-zinc-300 truncate" title={r.name}>
                        {r.name}
                      </span>
                    </div>
                    <div className="text-cyan-400 tabular-nums text-right">
                      {r.views.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 7 & 8. Heatmaps (Calendar + Hour Weekday) */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div id="viz-calendar-heatmap" className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4">
            <div className="text-xs font-semibold text-zinc-200 mb-3">Annual Activity (365 Days)</div>
            <CalendarHeatmap data={demoData.calendar} />
          </div>

          <div id="viz-hour-weekday" className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4">
            <div className="text-xs font-semibold text-zinc-200 mb-3">Hourly Traffic Rhythm (7 × 24 UTC)</div>
            <HourWeekdayHeatmap data={demoData.hourWeekday} />
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-900 py-8 text-center text-xs text-zinc-600 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>Spidy Analytics · Cookieless · Zero Fingerprinting</span>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-zinc-400 transition-colors">
              Home
            </Link>
            <Link href="/privacy" className="hover:text-zinc-400 transition-colors">
              Privacy
            </Link>
            <Link href="/register" className="text-cyan-400 hover:text-cyan-300 transition-colors">
              Create Free Account →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
