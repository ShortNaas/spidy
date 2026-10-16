"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { GlobeLive, type GlobeMarker } from "@/components/viz/GlobeLive";
import { FlowSankey } from "@/components/viz/FlowSankey";
import { CalendarHeatmap } from "@/components/viz/CalendarHeatmap";
import { HourWeekdayHeatmap } from "@/components/viz/HourWeekdayHeatmap";
import { PageStream } from "@/components/viz/PageStream";
import { PulseLive } from "@/components/viz/PulseLive";
import { WorldChoropleth } from "@/components/viz/WorldChoropleth";
import { KpiStrip } from "@/components/viz/KpiStrip";
import type {
  ItemCount,
  KpiResult,
  LiveStats,
  SankeyData,
  StreamDataPoint,
  HourWeekdayCell,
  TimeseriesPoint,
} from "@/lib/queries";

export interface DashboardClientProps {
  siteId: string;
}

interface AllStatsResponse {
  timeseries: TimeseriesPoint[];
  pages: ItemCount[];
  referrers: ItemCount[];
  countries: ItemCount[];
  devices: ItemCount[];
  browsers: ItemCount[];
  hourWeekday: HourWeekdayCell[];
  flows: SankeyData;
  stream: StreamDataPoint[];
  kpis: KpiResult;
  live: LiveStats;
}

export function DashboardClient({ siteId }: DashboardClientProps) {
  const searchParams = useSearchParams();
  const range = searchParams.get("range") || "7d";

  const [stats, setStats] = useState<AllStatsResponse | null>(null);
  const [live, setLive] = useState<LiveStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Compute date range from preset
  const { fromDate, toDate, interval } = useMemo(() => {
    const now = new Date();
    let days = 7;
    let intv: "hour" | "day" = "day";

    if (range === "24h") {
      days = 1;
      intv = "hour";
    } else if (range === "30d") {
      days = 30;
      intv = "day";
    } else if (range === "12mo") {
      days = 365;
      intv = "day";
    }

    const from = new Date(now.getTime() - days * 86400000);
    return { fromDate: from, toDate: now, interval: intv };
  }, [range]);

  // Fetch all stats when siteId or range changes
  useEffect(() => {
    let isMounted = true;

    const url = `/api/stats/all?siteId=${encodeURIComponent(siteId)}&from=${fromDate.toISOString()}&to=${toDate.toISOString()}&interval=${interval}`;

    fetch(url)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: AllStatsResponse | null) => {
        if (!isMounted) return;
        if (data) {
          setStats(data);
          if (data.live) setLive(data.live);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Dashboard stats fetch error:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [siteId, fromDate, toDate, interval]);

  // Realtime live stats polling (every 5 seconds)
  useEffect(() => {
    let isMounted = true;

    function pollLive() {
      fetch(`/api/live?siteId=${encodeURIComponent(siteId)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data: LiveStats | null) => {
          if (isMounted && data) {
            setLive(data);
          }
        })
        .catch(() => {});
    }

    const timer = setInterval(pollLive, 5000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [siteId]);

  // Transform live markers for Globe
  const globeMarkers: GlobeMarker[] = useMemo(() => {
    if (!live?.recentMarkers) return [];
    return live.recentMarkers.map((m) => ({
      lat: m.lat,
      lon: m.lon,
      country: m.country,
      city: m.city,
      path: m.path,
      ts: m.ts,
    }));
  }, [live]);

  // Calendar heatmap data formatting
  const calendarData = useMemo(() => {
    if (!stats?.timeseries) return [];
    return stats.timeseries.map((pt) => ({
      date: pt.ts.slice(0, 10),
      views: pt.views,
    }));
  }, [stats]);

  return (
    <div className="space-y-6">
      {/* 1. KPI Strip */}
      <section>
        <KpiStrip data={stats?.kpis} loading={loading} />
      </section>

      {/* 2 & 3. 3D Globe + Live Pulse sparkline */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GlobeLive markers={globeMarkers} loading={loading && !live} />
        </div>

        <div>
          <PulseLive
            activeVisitors={live?.activeVisitors5Min || 0}
            totalViews={live?.totalViews30Min || 0}
            perMinute={live?.perMinute || []}
            loading={loading && !live}
          />

          {/* Quick Device Breakdown summary below pulse */}
          <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 mt-4">
            <div className="text-xs font-semibold text-zinc-300 mb-2">Device & Platform</div>
            <div className="space-y-2">
              {stats?.devices.slice(0, 3).map((d) => (
                <div key={d.name} className="flex justify-between items-center text-xs font-mono">
                  <span className="text-zinc-400 capitalize">{d.name}</span>
                  <span className="text-zinc-200 tabular-nums">{d.views.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4 & 5. World Choropleth + Top Countries Table */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WorldChoropleth data={stats?.countries || []} loading={loading} />
        </div>

        <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-zinc-200 mb-3">Top Countries</div>
            <div className="space-y-2.5">
              {stats?.countries.slice(0, 6).map((c, i) => (
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

      {/* 6. Page Streamgraph & Top Pages Table */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PageStream data={stats?.stream || []} loading={loading} />
        </div>

        <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-zinc-200 mb-3">Top Pages</div>
            <div className="space-y-2.5">
              {stats?.pages.slice(0, 6).map((p, i) => (
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

      {/* 7. Flow Sankey & Top Referrers */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FlowSankey data={stats?.flows} loading={loading} />
        </div>

        <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-zinc-200 mb-3">Top Referrers</div>
            <div className="space-y-2.5">
              {stats?.referrers.slice(0, 6).map((r, i) => (
                <div key={r.name} className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 truncate max-w-[170px]">
                    <span className="text-zinc-600 text-[10px] w-3">{i + 1}</span>
                    <span className="text-zinc-300 truncate" title={r.name}>
                      {r.name}
                    </span>
                  </div>
                  <div className="text-emerald-400 tabular-nums text-right">
                    {r.views.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 8. Heatmaps: 12-Month Calendar & 7x24 Hour Weekday Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <CalendarHeatmap data={calendarData} loading={loading} />
        </div>
        <div>
          <HourWeekdayHeatmap data={stats?.hourWeekday || []} loading={loading} />
        </div>
      </section>
    </div>
  );
}
