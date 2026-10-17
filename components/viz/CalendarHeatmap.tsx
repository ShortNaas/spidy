"use client";

import React, { useMemo, useState } from "react";
import { Tooltip } from "@/components/ui/Tooltip";
import { Skeleton } from "@/components/ui/Skeleton";

export interface CalendarDayData {
  date: string; // YYYY-MM-DD
  views: number;
}

export interface CalendarHeatmapProps {
  data?: CalendarDayData[];
  loading?: boolean;
  className?: string;
  embedded?: boolean;
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function CalendarHeatmap({
  data = [],
  loading = false,
  className = "",
  embedded = false,
}: CalendarHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<{
    date: string;
    views: number;
    x: number;
    y: number;
  } | null>(null);

  // Generate 52 weeks (approx 365 days) ending today
  const { weeks, monthLabels, maxViews } = useMemo(() => {
    const dataMap = new Map<string, number>();
    let max = 1;
    for (const d of data) {
      dataMap.set(d.date.slice(0, 10), d.views);
      if (d.views > max) max = d.views;
    }

    // Anchor end date to the last data item or fixed date for deterministic rendering
    const anchorDateStr = data.length > 0 ? data[data.length - 1].date : "2026-10-15";
    const today = new Date(anchorDateStr);
    today.setUTCHours(0, 0, 0, 0);

    const dayOfWeek = today.getUTCDay(); // 0 is Sun
    const endDate = new Date(today.getTime() + (6 - dayOfWeek) * 86400000);

    // 52 weeks = 364 days
    const totalDays = 52 * 7;
    const startDate = new Date(endDate.getTime() - (totalDays - 1) * 86400000);

    const weeksArray: Array<Array<{ date: string; views: number; dayOfWeek: number }>> = [];
    const monthsArray: Array<{ label: string; weekIndex: number }> = [];

    let currentWeek: Array<{ date: string; views: number; dayOfWeek: number }> = [];
    let lastMonth = -1;

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startDate.getTime() + i * 86400000);
      const dateStr = d.toISOString().slice(0, 10);
      const views = dataMap.get(dateStr) || 0;
      const dow = d.getUTCDay(); // 0 Sun ... 6 Sat

      currentWeek.push({
        date: dateStr,
        views,
        dayOfWeek: dow,
      });

      if (currentWeek.length === 7) {
        const weekIndex = weeksArray.length;
        const currentMonth = d.getUTCMonth();
        if (currentMonth !== lastMonth) {
          monthsArray.push({ label: MONTH_NAMES[currentMonth], weekIndex });
          lastMonth = currentMonth;
        }
        weeksArray.push(currentWeek);
        currentWeek = [];
      }
    }

    return { weeks: weeksArray, monthLabels: monthsArray, maxViews: max };
  }, [data]);

  // Ember volume ramp: empty (#161616), hatched light (35%), hatched dense (75%), solid mid (#c4472a), solid full (#fb5c34)
  function getCellFill(views: number): string {
    if (views === 0) return "#161616";
    const ratio = views / maxViews;
    if (ratio < 0.25) return "url(#cal-hatch-35)";
    if (ratio < 0.5) return "url(#cal-hatch-75)";
    if (ratio < 0.8) return "#c4472a";
    return "#fb5c34";
  }

  if (loading) {
    return (
      <div
        className={`flex flex-col items-center justify-center min-h-[220px] ${
          embedded ? "w-full" : "bg-surface border border-border rounded-3xl p-6 sheen"
        } ${className}`}
        aria-busy="true"
        aria-label="Loading calendar heatmap"
      >
        <Skeleton className="w-full h-28 rounded-xl" />
        <span className="text-xs text-muted font-mono mt-4">
          Loading 12-month calendar activity...
        </span>
      </div>
    );
  }

  const cellSize = 12;
  const cellGap = 3;
  const totalViews = data.reduce((sum, d) => sum + d.views, 0);

  return (
    <div
      className={
        embedded
          ? `relative flex flex-col w-full ${className}`
          : `relative flex flex-col bg-surface border border-border rounded-3xl p-6 sheen overflow-hidden ${className}`
      }
      role="region"
      aria-label="Annual 12-month activity heatmap"
    >
      <div className={`flex flex-wrap items-center ${embedded ? "justify-end" : "justify-between"} gap-3 mb-4`}>
        {!embedded && (
          <div className="flex items-center gap-2">
            <span className="font-sans text-[13px] font-medium text-white">12-Month Activity</span>
            <span className="font-mono text-[11px] tabular-nums text-muted">
              {totalViews.toLocaleString()} total pageviews
            </span>
          </div>
        )}

        {/* 4-Swatch Legend per DESIGN.md */}
        <div className="flex items-center gap-2 text-[10px] text-muted font-mono">
          <span>Less</span>
          <span className="w-3 h-3 rounded-[3px] overflow-hidden inline-block" title="Hatched Light (35%)">
            <svg width="12" height="12">
              <rect width="12" height="12" fill="url(#cal-hatch-35)" />
            </svg>
          </span>
          <span className="w-3 h-3 rounded-[3px] overflow-hidden inline-block" title="Hatched Dense (75%)">
            <svg width="12" height="12">
              <rect width="12" height="12" fill="url(#cal-hatch-75)" />
            </svg>
          </span>
          <span className="w-3 h-3 rounded-[3px] bg-[#c4472a]" title="Solid Mid" />
          <span className="w-3 h-3 rounded-[3px] bg-accent" title="Solid Full" />
          <span>More</span>
        </div>
      </div>

      {/* Accessible summary */}
      <div className="sr-only">
        12-month calendar heatmap showing daily activity. Total views: {totalViews.toLocaleString()}. Peak daily views: {maxViews.toLocaleString()}.
      </div>

      <div className="w-full overflow-x-auto pb-1">
        <svg
          viewBox={`0 0 ${weeks.length * (cellSize + cellGap) + 36} ${7 * (cellSize + cellGap) + 24}`}
          className="min-w-[720px] w-full h-auto select-none"
          role="img"
          aria-label="Calendar heatmap showing daily pageview intensity across 12 months"
        >
          <defs>
            <pattern
              id="cal-hatch-35"
              width="6"
              height="6"
              patternTransform="rotate(-45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <rect width="6" height="6" fill="#161616" />
              <line x1="0" y1="0" x2="0" y2="6" stroke="#fb5c34" strokeWidth="1.5" strokeOpacity="0.35" />
            </pattern>
            <pattern
              id="cal-hatch-75"
              width="6"
              height="6"
              patternTransform="rotate(-45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <rect width="6" height="6" fill="#161616" />
              <line x1="0" y1="0" x2="0" y2="6" stroke="#fb5c34" strokeWidth="1.5" strokeOpacity="0.75" />
            </pattern>
          </defs>

          {/* Month labels */}
          <g transform="translate(30, 12)">
            {monthLabels.map((m, idx) => (
              <text
                key={`m-${idx}`}
                x={m.weekIndex * (cellSize + cellGap)}
                y={0}
                fontSize={9}
                fontFamily="var(--font-mono, monospace)"
                fill="#8d8d8d"
              >
                {m.label}
              </text>
            ))}
          </g>

          {/* Weekday labels */}
          <g transform="translate(0, 24)">
            <text
              x={0}
              y={1 * (cellSize + cellGap) + 9}
              fontSize={8}
              fontFamily="var(--font-mono, monospace)"
              fill="#5f5f5f"
            >
              Mon
            </text>
            <text
              x={0}
              y={3 * (cellSize + cellGap) + 9}
              fontSize={8}
              fontFamily="var(--font-mono, monospace)"
              fill="#5f5f5f"
            >
              Wed
            </text>
            <text
              x={0}
              y={5 * (cellSize + cellGap) + 9}
              fontSize={8}
              fontFamily="var(--font-mono, monospace)"
              fill="#5f5f5f"
            >
              Fri
            </text>
          </g>

          {/* 6px-radius cells in Ember volume ramp */}
          <g transform="translate(30, 20)">
            {weeks.map((week, wIdx) => (
              <g key={`w-${wIdx}`} transform={`translate(${wIdx * (cellSize + cellGap)}, 0)`}>
                {week.map((day) => {
                  const y = day.dayOfWeek * (cellSize + cellGap);
                  const isHovered = hoveredDay?.date === day.date;
                  return (
                    <rect
                      key={day.date}
                      x={0}
                      y={y}
                      width={cellSize}
                      height={cellSize}
                      rx={6}
                      ry={6}
                      fill={getCellFill(day.views)}
                      stroke={
                        isHovered
                          ? "#ffffff"
                          : day.views === 0
                            ? "rgba(255, 255, 255, 0.05)"
                            : "none"
                      }
                      strokeWidth={isHovered ? 1.5 : 0.5}
                      className="transition-colors cursor-pointer"
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredDay({
                          date: day.date,
                          views: day.views,
                          x: rect.left + rect.width / 2,
                          y: rect.top,
                        });
                      }}
                      onMouseLeave={() => setHoveredDay(null)}
                    >
                      <title>{`${day.date}: ${day.views.toLocaleString()} views`}</title>
                    </rect>
                  );
                })}
              </g>
            ))}
          </g>
        </svg>
      </div>

      {/* Shared Tooltip */}
      {hoveredDay && (
        <div
          className="fixed pointer-events-none z-50 -translate-x-1/2 -translate-y-full mb-3"
          style={{ left: hoveredDay.x, top: hoveredDay.y }}
        >
          <Tooltip
            label={hoveredDay.date}
            value={`${hoveredDay.views.toLocaleString()} views`}
          />
        </div>
      )}
    </div>
  );
}

export default CalendarHeatmap;
