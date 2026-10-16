"use client";

import React, { useState } from "react";
import { GlobeLive } from "@/components/viz/GlobeLive";
import { FlowSankey } from "@/components/viz/FlowSankey";
import { CalendarHeatmap } from "@/components/viz/CalendarHeatmap";
import { HourWeekdayHeatmap } from "@/components/viz/HourWeekdayHeatmap";
import { PageStream } from "@/components/viz/PageStream";
import { PulseLive } from "@/components/viz/PulseLive";
import { WorldChoropleth } from "@/components/viz/WorldChoropleth";
import { KpiStrip } from "@/components/viz/KpiStrip";

// Seeded sample dataset for offline gallery and screenshot testing
const MOCK_KPIS = {
  current: { views: 48520, visitors: 19430, bounceRate: 38, topCountry: "United States" },
  previous: { views: 41200, visitors: 16800, bounceRate: 42, topCountry: "United States" },
  deltas: { viewsPct: 18, visitorsPct: 16, bounceRatePct: -4 },
};

const MOCK_PULSE = {
  activeVisitors: 34,
  totalViews: 412,
  perMinute: [
    { minute: "01", count: 8 }, { minute: "02", count: 12 }, { minute: "03", count: 15 },
    { minute: "04", count: 9 }, { minute: "05", count: 14 }, { minute: "06", count: 20 },
    { minute: "07", count: 18 }, { minute: "08", count: 11 }, { minute: "09", count: 16 },
    { minute: "10", count: 22 }, { minute: "11", count: 19 }, { minute: "12", count: 13 },
    { minute: "13", count: 17 }, { minute: "14", count: 25 }, { minute: "15", count: 21 },
    { minute: "16", count: 14 }, { minute: "17", count: 18 }, { minute: "18", count: 12 },
    { minute: "19", count: 15 }, { minute: "20", count: 19 }, { minute: "21", count: 23 },
    { minute: "22", count: 16 }, { minute: "23", count: 20 }, { minute: "24", count: 24 },
    { minute: "25", count: 17 }, { minute: "26", count: 22 }, { minute: "27", count: 28 },
    { minute: "28", count: 19 }, { minute: "29", count: 25 }, { minute: "30", count: 31 },
  ],
};

const MOCK_MARKERS = [
  { lat: 40.71, lon: -74.0, city: "New York", country: "US" },
  { lat: 37.77, lon: -122.41, city: "San Francisco", country: "US" },
  { lat: 51.5, lon: -0.12, city: "London", country: "GB" },
  { lat: 52.52, lon: 13.4, city: "Berlin", country: "DE" },
  { lat: 48.85, lon: 2.35, city: "Paris", country: "FR" },
  { lat: 35.68, lon: 139.69, city: "Tokyo", country: "JP" },
  { lat: -33.86, lon: 151.2, city: "Sydney", country: "AU" },
  { lat: 12.97, lon: 77.59, city: "Bangalore", country: "IN" },
  { lat: 1.35, lon: 103.81, city: "Singapore", country: "SG" },
  { lat: 43.65, lon: -79.38, city: "Toronto", country: "CA" },
];

const MOCK_COUNTRIES = [
  { name: "US", views: 24500, visitors: 9800 },
  { name: "GB", views: 6800, visitors: 2700 },
  { name: "DE", views: 5200, visitors: 2100 },
  { name: "FR", views: 3900, visitors: 1600 },
  { name: "JP", views: 3100, visitors: 1300 },
  { name: "CA", views: 2800, visitors: 1100 },
  { name: "AU", views: 2100, visitors: 850 },
  { name: "IN", views: 1900, visitors: 760 },
  { name: "NL", views: 1600, visitors: 650 },
  { name: "SE", views: 1200, visitors: 500 },
];

const MOCK_FLOWS = {
  nodes: [
    { name: "google.com", category: "referrer" as const },
    { name: "github.com", category: "referrer" as const },
    { name: "Direct", category: "referrer" as const },
    { name: "x.com", category: "referrer" as const },
    { name: "/", category: "landing" as const },
    { name: "/docs", category: "landing" as const },
    { name: "/pricing", category: "landing" as const },
    { name: "/pricing", category: "next" as const },
    { name: "/docs/quickstart", category: "next" as const },
    { name: "(Exit)", category: "next" as const },
  ],
  links: [
    { source: 0, target: 4, value: 120 },
    { source: 1, target: 5, value: 85 },
    { source: 2, target: 4, value: 70 },
    { source: 3, target: 4, value: 45 },
    { source: 4, target: 7, value: 95 },
    { source: 4, target: 9, value: 140 },
    { source: 5, target: 8, value: 65 },
    { source: 5, target: 9, value: 20 },
  ],
};

const ANCHOR_TS = Date.parse("2026-10-15T00:00:00Z");

const MOCK_CALENDAR = Array.from({ length: 365 }, (_, i) => {
  const d = new Date(ANCHOR_TS - (364 - i) * 86400000);
  const dow = d.getUTCDay();
  const base = dow === 0 || dow === 6 ? 40 : 120;
  const count = Math.floor(base + Math.random() * 80);
  return { date: d.toISOString().slice(0, 10), views: count };
});

const MOCK_HOUR_WEEKDAY: Array<{ weekday: number; hour: number; views: number }> = [];
for (let w = 0; w < 7; w++) {
  for (let h = 0; h < 24; h++) {
    const isPeak = h >= 13 && h <= 19;
    const isWeekend = w === 0 || w === 6;
    const views = Math.floor((isPeak ? 80 : 20) * (isWeekend ? 0.6 : 1.2) + Math.random() * 25);
    MOCK_HOUR_WEEKDAY.push({ weekday: w, hour: h, views });
  }
}

const MOCK_STREAM: Array<{ date: string; path: string; views: number }> = [];
const PATH_NAMES = ["/", "/docs", "/pricing", "/features", "/blog", "/about", "/changelog", "/privacy"];
for (let d = 14; d >= 0; d--) {
  const dateStr = new Date(ANCHOR_TS - d * 86400000).toISOString().slice(0, 10);
  for (let p = 0; p < PATH_NAMES.length; p++) {
    const views = Math.floor(100 / (p + 1) + Math.random() * 30);
    MOCK_STREAM.push({ date: dateStr, path: PATH_NAMES[p], views });
  }
}

export default function VizGalleryPage() {
  const [loadingToggle, setLoadingToggle] = useState(false);

  return (
    <div className="min-h-screen bg-black text-zinc-100 p-6 md:p-10 font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50">
              Agent 5
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Spidy Visualization Gallery
            </h1>
          </div>
          <p className="text-xs text-zinc-400">
            Interactive suite of 8 privacy-first analytics visual components
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setLoadingToggle(!loadingToggle)}
            className="text-xs font-mono px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition-colors"
          >
            Toggle Skeleton Loading: {loadingToggle ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* 1. KPI Strip */}
        <section id="viz-kpi-strip" className="space-y-2">
          <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-500">
            1. KPI Strip (Framer Motion + Perceptual Deltas)
          </h2>
          <KpiStrip data={MOCK_KPIS} loading={loadingToggle} />
        </section>

        {/* 2 & 3. Globe + Realtime Pulse Live */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div id="viz-globe-live" className="lg:col-span-2 space-y-2">
            <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-500">
              2. Globe Live (Cobe 3D WebGL Canvas)
            </h2>
            <GlobeLive markers={MOCK_MARKERS} loading={loadingToggle} />
          </div>

          <div id="viz-pulse-live" className="space-y-2">
            <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-500">
              3. Pulse Live (Active Ticker + 30-Min Sparkline)
            </h2>
            <PulseLive
              activeVisitors={MOCK_PULSE.activeVisitors}
              totalViews={MOCK_PULSE.totalViews}
              perMinute={MOCK_PULSE.perMinute}
              loading={loadingToggle}
            />
          </div>
        </section>

        {/* 4. World Choropleth */}
        <section id="viz-world-choropleth" className="space-y-2">
          <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-500">
            4. World Choropleth (D3-Geo Natural Earth Projection)
          </h2>
          <WorldChoropleth data={MOCK_COUNTRIES} loading={loadingToggle} />
        </section>

        {/* 5. Flow Sankey */}
        <section id="viz-flow-sankey" className="space-y-2">
          <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-500">
            5. Flow Sankey (D3-Sankey Path Highlighting)
          </h2>
          <FlowSankey data={MOCK_FLOWS} loading={loadingToggle} />
        </section>

        {/* 6. Page Stream */}
        <section id="viz-page-stream" className="space-y-2">
          <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-500">
            6. Page Stream (D3-Shape Silhouette Streamgraph)
          </h2>
          <PageStream data={MOCK_STREAM} loading={loadingToggle} />
        </section>

        {/* 7 & 8. Heatmaps (Calendar + Hour Weekday) */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div id="viz-calendar-heatmap" className="space-y-2">
            <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-500">
              7. Calendar Heatmap (12-Month GitHub Style)
            </h2>
            <CalendarHeatmap data={MOCK_CALENDAR} loading={loadingToggle} />
          </div>

          <div id="viz-hour-weekday" className="space-y-2">
            <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-500">
              8. Hour-Weekday Heatmap (7x24 Seasonality Grid)
            </h2>
            <HourWeekdayHeatmap data={MOCK_HOUR_WEEKDAY} loading={loadingToggle} />
          </div>
        </section>
      </div>
    </div>
  );
}
