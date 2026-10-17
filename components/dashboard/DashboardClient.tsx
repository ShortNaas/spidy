"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardGrid } from "./DashboardGrid";
import type { GlobeMarker } from "@/components/viz/GlobeLive";
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
    <DashboardGrid
      kpis={stats?.kpis}
      globeMarkers={globeMarkers}
      live={live || undefined}
      devices={stats?.devices}
      countries={stats?.countries}
      pages={stats?.pages}
      referrers={stats?.referrers}
      stream={stats?.stream}
      flows={stats?.flows}
      calendarData={calendarData}
      hourWeekdayData={stats?.hourWeekday}
      loading={loading}
    />
  );
}
