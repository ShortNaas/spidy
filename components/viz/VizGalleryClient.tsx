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
import { BarChart } from "@/components/viz/BarChart";
import { RadialGauge } from "@/components/viz/RadialGauge";
import { DonutChart } from "@/components/viz/DonutChart";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";

// Seeded sample dataset for offline gallery and screenshot testing
const MOCK_KPIS = {
  current: { views: 48520, visitors: 19430, bounceRate: 38, topCountry: "United States" },
  previous: { views: 41200, visitors: 16800, bounceRate: 42, topCountry: "United States" },
  deltas: { viewsPct: 18, visitorsPct: -8.4, bounceRatePct: -4 },
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

const MOCK_BARS = [
  { label: "00h", value: 140 },
  { label: "04h", value: 85 },
  { label: "08h", value: 340 },
  { label: "12h", value: 780 },
  { label: "16h", value: 650 },
  { label: "20h", value: 420 },
];

export function VizGalleryClient() {
  const [loadingToggle, setLoadingToggle] = useState(false);

  return (
    <div className="min-h-screen bg-canvas text-white p-6 md:p-10 font-sans selection:bg-accent/20 selection:text-accent-bright">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Tag>Design System Preview</Tag>
            <h1 className="text-2xl font-semibold tracking-tight text-white font-sans">
              Spidy Visualization Gallery
            </h1>
          </div>
          <p className="text-xs text-muted font-sans">
            Suite of privacy-first analytics visual components in the Ember Ramp &amp; NEXORA dark theme.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => setLoadingToggle(!loadingToggle)}
          >
            Toggle Skeleton Loading: {loadingToggle ? "ON" : "OFF"}
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-10">
        {/* 1. KPI Strip */}
        <section id="viz-kpi-strip" className="space-y-3">
          <h2 className="font-mono text-xs uppercase tracking-wider text-muted">
            1. KPI Strip (40px Poppins 300 &amp; Delta Badges)
          </h2>
          <KpiStrip data={MOCK_KPIS} loading={loadingToggle} />
        </section>

        {/* 2 & 3. Globe + Realtime Pulse Live */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div id="viz-globe-live" className="lg:col-span-2 space-y-3">
            <h2 className="font-mono text-xs uppercase tracking-wider text-muted">
              2. Globe Live (Pure Gray Landmass &amp; Live White Blips)
            </h2>
            <GlobeLive markers={MOCK_MARKERS} loading={loadingToggle} />
          </div>

          <div id="viz-pulse-live" className="space-y-3">
            <h2 className="font-mono text-xs uppercase tracking-wider text-muted">
              3. Pulse Live (1.5px White Stroke &amp; Ring-Dot End Marker)
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
        <section id="viz-world-choropleth" className="space-y-3">
          <h2 className="font-mono text-xs uppercase tracking-wider text-muted">
            4. World Choropleth (Natural Earth Projection &amp; Ember Hatch Ramp)
          </h2>
          <WorldChoropleth data={MOCK_COUNTRIES} loading={loadingToggle} />
        </section>

        {/* 5. Flow Sankey */}
        <section id="viz-flow-sankey" className="space-y-3">
          <h2 className="font-mono text-xs uppercase tracking-wider text-muted">
            5. Flow Sankey (3px Left Edge &amp; 30% Link Opacity)
          </h2>
          <FlowSankey data={MOCK_FLOWS} loading={loadingToggle} />
        </section>

        {/* 6. Page Stream */}
        <section id="viz-page-stream" className="space-y-3">
          <h2 className="font-mono text-xs uppercase tracking-wider text-muted">
            6. Page Stream (Categorical Palette &amp; Hatch Beyond Series 4)
          </h2>
          <PageStream data={MOCK_STREAM} loading={loadingToggle} />
        </section>

        {/* 7 & 8. Heatmaps (Calendar + Hour Weekday) */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div id="viz-calendar-heatmap" className="space-y-3">
            <h2 className="font-mono text-xs uppercase tracking-wider text-muted">
              7. Calendar Heatmap (6px Radius Squircle Cells &amp; 4 Swatches)
            </h2>
            <CalendarHeatmap data={MOCK_CALENDAR} loading={loadingToggle} />
          </div>

          <div id="viz-hour-weekday" className="space-y-3">
            <h2 className="font-mono text-xs uppercase tracking-wider text-muted">
              8. Hour-Weekday Heatmap (7x24 Ember Matrix)
            </h2>
            <HourWeekdayHeatmap data={MOCK_HOUR_WEEKDAY} loading={loadingToggle} />
          </div>
        </section>

        {/* 9. Extra Primitives: Bar Chart, Radial Gauge, Donut Chart */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h2 className="font-mono text-xs uppercase tracking-wider text-muted">
              9. Bar Chart (Hatched Ember &amp; Peak Pill)
            </h2>
            <BarChart
              data={MOCK_BARS}
              title="Traffic Distribution"
              subtitle="Hourly visitor density"
            />
          </div>

          <div className="space-y-3">
            <h2 className="font-mono text-xs uppercase tracking-wider text-muted">
              10. Radial Gauge (Segmented Arc)
            </h2>
            <RadialGauge
              value={78}
              label="Bandwidth"
              subtext="Real-time ingestion rate"
            />
          </div>

          <div className="space-y-3">
            <h2 className="font-mono text-xs uppercase tracking-wider text-muted">
              11. Donut Chart (Track &amp; Rounded Cap Arc)
            </h2>
            <DonutChart
              value={64}
              label="Desktop Share"
              subtext="Platform proportion"
              color="ember"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

export default VizGalleryClient;
