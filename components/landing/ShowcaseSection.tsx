"use client";

import React from "react";
import dynamic from "next/dynamic";
import demoData from "@/lib/demo-data.json";
import type { SankeyData, ItemCount } from "@/lib/queries";

const FlowSankey = dynamic(
  () => import("@/components/viz/FlowSankey").then((m) => m.FlowSankey),
  {
    ssr: false,
    loading: () => <div className="h-[360px] bg-zinc-950 border border-zinc-800 rounded-2xl animate-pulse" />,
  }
);

const CalendarHeatmap = dynamic(
  () => import("@/components/viz/CalendarHeatmap").then((m) => m.CalendarHeatmap),
  {
    ssr: false,
    loading: () => <div className="h-[180px] bg-zinc-950 border border-zinc-800 rounded-2xl animate-pulse" />,
  }
);

const HourWeekdayHeatmap = dynamic(
  () => import("@/components/viz/HourWeekdayHeatmap").then((m) => m.HourWeekdayHeatmap),
  {
    ssr: false,
    loading: () => <div className="h-[220px] bg-zinc-950 border border-zinc-800 rounded-2xl animate-pulse" />,
  }
);

const PageStream = dynamic(
  () => import("@/components/viz/PageStream").then((m) => m.PageStream),
  {
    ssr: false,
    loading: () => <div className="h-[280px] bg-zinc-950 border border-zinc-800 rounded-2xl animate-pulse" />,
  }
);

const WorldChoropleth = dynamic(
  () => import("@/components/viz/WorldChoropleth").then((m) => m.WorldChoropleth),
  {
    ssr: false,
    loading: () => <div className="h-[380px] bg-zinc-950 border border-zinc-800 rounded-2xl animate-pulse" />,
  }
);

const sankeyData = demoData.sankey as unknown as SankeyData;
const countryData: ItemCount[] = demoData.countries.map((c) => ({
  name: c.item,
  views: c.views,
  visitors: c.visitors,
}));

export function ShowcaseSection() {
  return (
    <div id="showcase" className="space-y-16">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
          Visualization Showcase
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Data that tells a story, not just a spreadsheet.
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 font-mono">
          Interactive, responsive visual components designed for clarity, instant comprehension, and zero eye-fatigue.
        </p>
      </div>

      {/* 1. Page Stream */}
      <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-6 shadow-2xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <h3 className="text-sm font-semibold text-white font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            Page Traffic Streamgraph
          </h3>
          <span className="text-xs text-zinc-500 font-mono">Continuous silhouette stream</span>
        </div>
        <p className="text-xs text-zinc-400">
          Trace organic shifts in traffic distribution across your top routes over 30 days.
        </p>
        <div className="pt-2">
          <PageStream data={demoData.pageStream} />
        </div>
      </div>

      {/* 2. Flow Sankey */}
      <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-6 shadow-2xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <h3 className="text-sm font-semibold text-white font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            Visitor Journey & Drop-off Flow
          </h3>
          <span className="text-xs text-zinc-500 font-mono">Referrer → Landing → Next</span>
        </div>
        <p className="text-xs text-zinc-400">
          Uncover the true navigation paths of your visitors without intrusive event cookies.
        </p>
        <div className="pt-2 flex justify-center">
          <FlowSankey data={sankeyData} />
        </div>
      </div>

      {/* 3. World Choropleth */}
      <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-6 shadow-2xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <h3 className="text-sm font-semibold text-white font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Global Reach Choropleth
          </h3>
          <span className="text-xs text-zinc-500 font-mono">Natural Earth projection</span>
        </div>
        <p className="text-xs text-zinc-400">
          Privacy-preserving geo-distribution derived securely from edge HTTP headers without storing raw IPs.
        </p>
        <div className="pt-2 flex justify-center">
          <WorldChoropleth data={countryData} />
        </div>
      </div>

      {/* 4 & 5 Grid: Calendar Heatmap + Hour Weekday Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calendar Heatmap */}
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-6 shadow-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              Annual Activity
            </h3>
            <span className="text-xs text-zinc-500 font-mono">365-day density</span>
          </div>
          <p className="text-xs text-zinc-400">
            Year-round pageview intensity highlighting seasonal spikes and weekend rhythms.
          </p>
          <div className="pt-2">
            <CalendarHeatmap data={demoData.calendar} />
          </div>
        </div>

        {/* Hour Weekday Heatmap */}
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-6 shadow-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Hourly Traffic Rhythm
            </h3>
            <span className="text-xs text-zinc-500 font-mono">7 × 24 UTC grid</span>
          </div>
          <p className="text-xs text-zinc-400">
            Pinpoint peak operating hours to optimize deployment schedules and announcements.
          </p>
          <div className="pt-2">
            <HourWeekdayHeatmap data={demoData.hourWeekday} />
          </div>
        </div>
      </div>
    </div>
  );
}
