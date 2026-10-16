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
  ],
};

const MOCK_MARKERS = [
  { lat: 37.7749, lon: -122.4194, country: "United States", city: "San Francisco" },
  { lat: 40.7128, lon: -74.006, country: "United States", city: "New York" },
  { lat: 51.5074, lon: -0.1278, country: "United Kingdom", city: "London" },
  { lat: 52.52, lon: 13.405, country: "Germany", city: "Berlin" },
  { lat: 35.6762, lon: 139.6503, country: "Japan", city: "Tokyo" },
  { lat: -33.8688, lon: 151.2093, country: "Australia", city: "Sydney" },
  { lat: 48.8566, lon: 2.3522, country: "France", city: "Paris" },
  { lat: 1.3521, lon: 103.8198, country: "Singapore", city: "Singapore" },
  { lat: 19.076, lon: 72.8777, country: "India", city: "Mumbai" },
  { lat: -23.5505, lon: -46.6333, country: "Brazil", city: "Sao Paulo" },
];

const MOCK_COUNTRIES = [
  { name: "US", views: 24500, visitors: 9800 },
  { name: "GB", views: 8200, visitors: 3400 },
  { name: "DE", views: 6100, visitors: 2500 },
  { name: "FR", views: 3900, visitors: 1600 },
  { name: "JP", views: 3100, visitors: 1300 },
  { name: "CA", views: 2700, visitors: 1100 },
];

const MOCK_FLOWS = {
  nodes: [
    { name: "google.com", category: "referrer" as const },
    { name: "github.com", category: "referrer" as const },
    { name: "direct", category: "referrer" as const },
    { name: "x.com", category: "referrer" as const },
    { name: "/", category: "landing" as const },
    { name: "/docs", category: "landing" as const },
    { name: "/blog", category: "landing" as const },
    { name: "/pricing", category: "next" as const },
    { name: "/signup", category: "next" as const },
    { name: "/exit", category: "next" as const },
  ],
  links: [
    { source: 0, target: 4, value: 520 },
    { source: 1, target: 4, value: 410 },
    { source: 1, target: 5, value: 320 },
    { source: 2, target: 4, value: 680 },
    { source: 3, target: 6, value: 190 },
    { source: 4, target: 7, value: 610 },
    { source: 4, target: 8, value: 430 },
    { source: 4, target: 9, value: 570 },
    { source: 5, target: 8, value: 210 },
    { source: 6, target: 9, value: 140 },
  ],
};

const MOCK_STREAM = [
  { date: "2026-03-01", path: "/", views: 120 },
  { date: "2026-03-01", path: "/docs", views: 80 },
  { date: "2026-03-01", path: "/pricing", views: 40 },
  { date: "2026-03-02", path: "/", views: 140 },
  { date: "2026-03-02", path: "/docs", views: 95 },
  { date: "2026-03-02", path: "/pricing", views: 55 },
  { date: "2026-03-03", path: "/", views: 190 },
  { date: "2026-03-03", path: "/docs", views: 110 },
  { date: "2026-03-03", path: "/pricing", views: 70 },
  { date: "2026-03-04", path: "/", views: 240 },
  { date: "2026-03-04", path: "/docs", views: 150 },
  { date: "2026-03-04", path: "/pricing", views: 85 },
  { date: "2026-03-05", path: "/", views: 210 },
  { date: "2026-03-05", path: "/docs", views: 130 },
  { date: "2026-03-05", path: "/pricing", views: 90 },
  { date: "2026-03-06", path: "/", views: 180 },
  { date: "2026-03-06", path: "/docs", views: 115 },
  { date: "2026-03-06", path: "/pricing", views: 65 },
  { date: "2026-03-07", path: "/", views: 260 },
  { date: "2026-03-07", path: "/docs", views: 170 },
  { date: "2026-03-07", path: "/pricing", views: 110 },
];

const MOCK_CALENDAR = Array.from({ length: 365 }, (_, i) => {
  const d = new Date(Date.now() - (364 - i) * 86400000);
  const dow = d.getDay();
  const isWeekend = dow === 0 || dow === 6;
  const base = isWeekend ? 30 : 120;
  const views = Math.floor(base * (0.6 + Math.random() * 0.8));
  return {
    date: d.toISOString().slice(0, 10),
    views,
  };
});

const MOCK_HOUR_WEEKDAY = Array.from({ length: 7 * 24 }, (_, i) => {
  const weekday = Math.floor(i / 24);
  const hour = i % 24;
  const isWorkHour = hour >= 9 && hour <= 18;
  const isWeekend = weekday === 0 || weekday === 6;
  let views = isWorkHour ? (isWeekend ? 35 : 120) : 15;
  views = Math.floor(views * (0.8 + Math.random() * 0.4));
  return { weekday, hour, views };
});

export function VizGalleryClient() {
  const [loadingToggle, setLoadingToggle] = useState(false);

  return (
    <div className="min-h-screen bg-black text-zinc-100 p-6 md:p-10 font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50">
              Dev Only
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Spidy Visualization Gallery
            </h1>
          </div>
          <p className="text-xs text-zinc-400">
            Interactive suite of 8 privacy-first analytics visual components (development preview)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setLoadingToggle(!loadingToggle)}
            className="text-xs font-mono px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition-colors cursor-pointer"
          >
            Toggle Skeleton Loading: {loadingToggle ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* 1. KPI Strip */}
        <section id="viz-kpi-strip" className="space-y-2">
          <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-500">
            1. KPI Strip
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
