"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardGrid } from "./DashboardGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { AlertCircle, RefreshCw } from "lucide-react";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const range = searchParams.get("range") || "7d";

  const [stats, setStats] = useState<AllStatsResponse | null>(null);
  const [live, setLive] = useState<LiveStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const [retryCount, setRetryCount] = useState(0);

  // Fetch all stats when siteId, range, or retryCount changes
  useEffect(() => {
    let isMounted = true;
    const url = `/api/stats/all?siteId=${encodeURIComponent(siteId)}&from=${fromDate.toISOString()}&to=${toDate.toISOString()}&interval=${interval}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Telemetry service returned status ${res.status}`);
        }
        return res.json();
      })
      .then((data: AllStatsResponse) => {
        if (!isMounted) return;
        setStats(data);
        if (data.live) setLive(data.live);
        setError(null);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        console.error("Dashboard stats fetch error:", err);
        setError(err instanceof Error ? err.message : "Failed to load telemetry stats");
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [siteId, fromDate, toDate, interval, retryCount]);

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

  const isEmpty =
    !loading &&
    !error &&
    stats &&
    stats.kpis?.current?.views === 0 &&
    stats.kpis?.current?.visitors === 0 &&
    (!stats.pages || stats.pages.length === 0);

  return (
    <div className="space-y-6">
      {error && (
        <div
          role="alert"
          className="bg-danger/10 border border-danger/30 text-danger rounded-2xl p-4 flex items-center justify-between gap-4 font-sans text-[13px]"
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setLoading(true);
              setError(null);
              setRetryCount((c) => c + 1);
            }}
            className="text-danger hover:text-white hover:bg-danger/20 shrink-0 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </Button>
        </div>
      )}

      {isEmpty ? (
        <EmptyState
          title="No Telemetry Detected"
          message="No visitor events have been collected for this site in the selected time window."
          actionLabel="View 30-day window"
          onAction={() => router.push("?range=30d")}
        />
      ) : (
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
      )}
    </div>
  );
}
