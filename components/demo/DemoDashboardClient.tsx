"use client";

import React, { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/dashboard/Header";
import { Banner } from "@/components/ui/Banner";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import demoData from "@/lib/demo-data.json";
import type { SankeyData, ItemCount, StreamDataPoint, HourWeekdayCell } from "@/lib/queries";
import type { GlobeMarker } from "@/components/viz/GlobeLive";
import type { CalendarDayData } from "@/components/viz/CalendarHeatmap";

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
  const searchParams = useSearchParams();
  const range = searchParams.get("range") || "7d";

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
      deltas: { viewsPct: 18, visitorsPct: -8.4, bounceRatePct: -4 },
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

  const devices = useMemo<ItemCount[]>(
    () =>
      DEMO_DEVICES.map((d) => ({
        name: d.name,
        views: Math.round(d.views * m),
        visitors: Math.round(d.views * m * 0.65),
      })),
    [m]
  );

  const globeMarkers = useMemo<GlobeMarker[]>(
    () => (demoData.markers as unknown as GlobeMarker[]) || [],
    []
  );

  const liveStats = useMemo(
    () => ({
      activeVisitors5Min: 34,
      totalViews30Min: Math.round(580 * Math.min(m, 1)),
      perMinute: DEMO_PULSE_MINUTES,
      recentMarkers: demoData.markers,
    }),
    [m]
  );

  const streamData = useMemo<StreamDataPoint[]>(
    () => (demoData.pageStream as unknown as StreamDataPoint[]) || [],
    []
  );

  const calendarData = useMemo<CalendarDayData[]>(
    () => (demoData.calendar as unknown as CalendarDayData[]) || [],
    []
  );

  const hourWeekdayData = useMemo<HourWeekdayCell[]>(
    () => (demoData.hourWeekday as unknown as HourWeekdayCell[]) || [],
    []
  );

  return (
    <div className="min-h-screen bg-canvas text-text flex flex-col font-sans">
      {/* Shared Header Shell */}
      <Header isDemo={true} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Step 4 Demo Banner: The single solid accent element on /demo */}
        <Banner
          text="You are viewing demo data"
          actionText="Create your own"
          actionHref="/register"
        />

        {/* Shared Cockpit Grid */}
        <DashboardGrid
          kpis={kpis}
          globeMarkers={globeMarkers}
          live={liveStats}
          devices={devices}
          countries={countries}
          pages={pages}
          referrers={referrers}
          stream={streamData}
          flows={sankeyData}
          calendarData={calendarData}
          hourWeekdayData={hourWeekdayData}
          loading={false}
        />
      </main>

      <footer className="border-t border-border py-6 text-center text-[12px] text-muted font-sans">
        Spidy · Self-Hosted Privacy Analytics · Cookieless & No IP Storage
      </footer>
    </div>
  );
}
