"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import { KpiStrip } from "@/components/viz/KpiStrip";
import { GlobeLive, type GlobeMarker } from "@/components/viz/GlobeLive";
import { PulseLive } from "@/components/viz/PulseLive";
import { WorldChoropleth } from "@/components/viz/WorldChoropleth";
import { PageStream } from "@/components/viz/PageStream";
import { FlowSankey } from "@/components/viz/FlowSankey";
import { CalendarHeatmap, type CalendarDayData } from "@/components/viz/CalendarHeatmap";
import { HourWeekdayHeatmap } from "@/components/viz/HourWeekdayHeatmap";
import type {
  ItemCount,
  KpiResult,
  LiveStats,
  SankeyData,
  StreamDataPoint,
  HourWeekdayCell,
} from "@/lib/queries";
import {
  Globe,
  Activity,
  MapPin,
  BarChart2,
  GitFork,
  Calendar,
  Clock,
  Laptop,
  FileText,
  Link2,
} from "lucide-react";

export interface DashboardGridProps {
  kpis?: KpiResult;
  globeMarkers?: GlobeMarker[];
  live?: LiveStats;
  devices?: ItemCount[];
  countries?: ItemCount[];
  pages?: ItemCount[];
  referrers?: ItemCount[];
  stream?: StreamDataPoint[];
  flows?: SankeyData;
  calendarData?: CalendarDayData[];
  hourWeekdayData?: HourWeekdayCell[];
  loading?: boolean;
}

export function DashboardGrid({
  kpis,
  globeMarkers = [],
  live,
  devices = [],
  countries = [],
  pages = [],
  referrers = [],
  stream = [],
  flows,
  calendarData = [],
  hourWeekdayData = [],
  loading = false,
}: DashboardGridProps) {
  const maxCountryViews = countries.length > 0 ? Math.max(...countries.map((c) => c.views)) : 1;
  const maxPageViews = pages.length > 0 ? Math.max(...pages.map((p) => p.views)) : 1;
  const maxReferrerViews = referrers.length > 0 ? Math.max(...referrers.map((r) => r.views)) : 1;

  return (
    <div className="space-y-6">
      {/* 1. Top KPI Horizon Strip (4 columns) */}
      <section>
        <KpiStrip data={kpis} loading={loading} />
      </section>

      {/* 2 & 3. 3D Globe Telemetry (2 cols) + Live Pulse Sparkline & Devices (1 col) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card
            title="Global Telemetry"
            subtitle="Real-time planetary coordinate activity"
            icon={<Globe size={18} />}
          >
            <div className="flex items-center justify-center p-2">
              <GlobeLive markers={globeMarkers} loading={loading && !live} />
            </div>
          </Card>
        </div>

        <div className="space-y-6 flex flex-col justify-between">
          <Card
            title="Live Telemetry"
            subtitle="30-minute realtime pulse"
            icon={<Activity size={18} />}
          >
            <PulseLive
              activeVisitors={live?.activeVisitors5Min || 0}
              totalViews={live?.totalViews30Min || 0}
              perMinute={live?.perMinute || []}
              loading={loading && !live}
            />
          </Card>

          <Card
            title="Device & Platform"
            subtitle="Visitor hardware distribution"
            icon={<Laptop size={18} />}
          >
            <div className="space-y-3 pt-1">
              {devices.slice(0, 3).map((d) => (
                <div key={d.name} className="flex justify-between items-center text-[13px] font-sans">
                  <span className="text-muted capitalize">{d.name}</span>
                  <span className="text-white font-mono tabular-nums">{d.views.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* 4 & 5. Geographic Choropleth (2 cols) + Top Countries Table (1 col) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card
            title="Geographic Density"
            subtitle="Natural Earth choropleth projection"
            icon={<MapPin size={18} />}
          >
            <WorldChoropleth data={countries} loading={loading} />
          </Card>
        </div>

        <div>
          <Card
            title="Top Countries"
            subtitle="Highest visitor origin volume"
            icon={<MapPin size={18} />}
          >
            <Table
              columns={[
                {
                  key: "name",
                  header: "Country",
                  render: (c: ItemCount) => <span className="font-medium text-white">{c.name}</span>,
                },
                {
                  key: "visitors",
                  header: "Visitors",
                  isNumeric: true,
                  render: (c: ItemCount) => (
                    <span className="text-muted">{c.visitors.toLocaleString()}</span>
                  ),
                },
                {
                  key: "views",
                  header: "Views",
                  isNumeric: true,
                  render: (c: ItemCount) => (
                    <span className="text-white font-semibold">{c.views.toLocaleString()}</span>
                  ),
                },
              ]}
              data={countries.slice(0, 6)}
              keyExtractor={(c) => c.name}
              showShareBar={true}
              getShareValue={(c) => c.views / maxCountryViews}
            />
          </Card>
        </div>
      </section>

      {/* 6. Page Streamgraph (2 cols) + Top Pages Table (1 col) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card
            title="Page Trajectory"
            subtitle="Categorical streamgraph of top 8 paths over time"
            icon={<BarChart2 size={18} />}
          >
            <PageStream data={stream} loading={loading} />
          </Card>
        </div>

        <div>
          <Card
            title="Top Pages"
            subtitle="Most visited route destinations"
            icon={<FileText size={18} />}
          >
            <Table
              columns={[
                {
                  key: "name",
                  header: "Path",
                  render: (p: ItemCount) => (
                    <span className="font-mono text-[12px] text-white truncate max-w-[170px] inline-block" title={p.name}>
                      {p.name}
                    </span>
                  ),
                },
                {
                  key: "views",
                  header: "Views",
                  isNumeric: true,
                  render: (p: ItemCount) => (
                    <span className="text-accent-bright font-semibold">{p.views.toLocaleString()}</span>
                  ),
                },
              ]}
              data={pages.slice(0, 6)}
              keyExtractor={(p) => p.name}
              showShareBar={true}
              getShareValue={(p) => p.views / maxPageViews}
            />
          </Card>
        </div>
      </section>

      {/* 7. Flow Sankey (2 cols) + Top Referrers Table (1 col) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card
            title="User Journey Transitions"
            subtitle="Referrer → Landing Page → Subsequent Page flows"
            icon={<GitFork size={18} />}
          >
            <FlowSankey data={flows} loading={loading} />
          </Card>
        </div>

        <div>
          <Card
            title="Top Referrers"
            subtitle="Incoming traffic hostnames"
            icon={<Link2 size={18} />}
          >
            <Table
              columns={[
                {
                  key: "name",
                  header: "Referrer",
                  render: (r: ItemCount) => (
                    <span className="font-mono text-[12px] text-white truncate max-w-[170px] inline-block" title={r.name}>
                      {r.name}
                    </span>
                  ),
                },
                {
                  key: "views",
                  header: "Views",
                  isNumeric: true,
                  render: (r: ItemCount) => (
                    <span className="text-positive font-semibold">{r.views.toLocaleString()}</span>
                  ),
                },
              ]}
              data={referrers.slice(0, 6)}
              keyExtractor={(r) => r.name}
              showShareBar={true}
              getShareValue={(r) => r.views / maxReferrerViews}
            />
          </Card>
        </div>
      </section>

      {/* 8. Annual Activity (2 cols) + Diurnal Matrix (1 col) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card
            title="Annual Observation"
            subtitle="365-day seasonal activity matrix"
            icon={<Calendar size={18} />}
          >
            <CalendarHeatmap data={calendarData} loading={loading} />
          </Card>
        </div>

        <div>
          <Card
            title="Diurnal Rhythm"
            subtitle="Peak hours across days of the week"
            icon={<Clock size={18} />}
          >
            <HourWeekdayHeatmap data={hourWeekdayData} loading={loading} />
          </Card>
        </div>
      </section>
    </div>
  );
}
