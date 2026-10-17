"use client";

import React, { useMemo, useState } from "react";
import type { HourWeekdayCell } from "@/lib/queries";
import { Tooltip } from "@/components/ui/Tooltip";
import { Skeleton } from "@/components/ui/Skeleton";

export interface HourWeekdayHeatmapProps {
  data?: HourWeekdayCell[];
  loading?: boolean;
  className?: string;
  embedded?: boolean;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function HourWeekdayHeatmap({
  data = [],
  loading = false,
  className = "",
  embedded = false,
}: HourWeekdayHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<{
    weekday: number;
    hour: number;
    views: number;
    x: number;
    y: number;
  } | null>(null);

  const { grid, maxViews, totalViews } = useMemo(() => {
    // 7 rows x 24 columns
    const matrix: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
    let max = 1;
    let sum = 0;

    for (const cell of data) {
      if (cell.weekday >= 0 && cell.weekday < 7 && cell.hour >= 0 && cell.hour < 24) {
        matrix[cell.weekday][cell.hour] = cell.views;
        sum += cell.views;
        if (cell.views > max) max = cell.views;
      }
    }

    return { grid: matrix, maxViews: max, totalViews: sum };
  }, [data]);

  // Ember volume ramp:
  // Step 0: empty (#161616)
  // Step 1: hatched light (35%)
  // Step 2: hatched dense (75%)
  // Step 3: solid mid (#c4472a)
  // Step 4: solid full (#fb5c34)
  // Peak: #ff7a57
  function renderCellContent(views: number) {
    if (views === 0) {
      return <div className="w-full h-full bg-raised border border-white/5 rounded-[6px]" />;
    }
    const ratio = views / maxViews;
    if (ratio < 0.25) {
      return (
        <div className="w-full h-full bg-raised rounded-[6px] relative overflow-hidden border border-white/5">
          <div className="absolute inset-0 hatch-accent opacity-35" />
        </div>
      );
    }
    if (ratio < 0.5) {
      return (
        <div className="w-full h-full bg-raised rounded-[6px] relative overflow-hidden border border-white/5">
          <div className="absolute inset-0 hatch-accent opacity-75" />
        </div>
      );
    }
    if (ratio < 0.8) {
      return <div className="w-full h-full bg-[#c4472a] rounded-[6px]" />;
    }
    if (ratio < 0.95) {
      return <div className="w-full h-full bg-accent rounded-[6px]" />;
    }
    return <div className="w-full h-full bg-accent-bright rounded-[6px]" />;
  }

  if (loading) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-surface border border-border rounded-3xl p-6 min-h-[240px] sheen ${className}`}
        aria-busy="true"
        aria-label="Loading hour weekday heatmap"
      >
        <Skeleton className="w-full h-36 rounded-2xl" />
        <span className="text-xs text-muted font-mono mt-4">
          Computing hourly seasonality matrix...
        </span>
      </div>
    );
  }

  return (
    <div
      className={
        embedded
          ? `relative flex flex-col w-full ${className}`
          : `relative flex flex-col bg-surface border border-border rounded-3xl p-6 sheen overflow-hidden ${className}`
      }
      role="region"
      aria-label="Hourly traffic seasonality matrix"
    >
      <div className={`flex flex-wrap items-center ${embedded ? "justify-end" : "justify-between"} gap-3 mb-4`}>
        {!embedded && (
          <div className="flex items-center gap-2">
            <span className="font-sans text-[13px] font-medium text-white">Hourly Seasonality</span>
            <span className="font-mono text-[11px] tabular-nums text-muted">
              7 Days × 24 Hours (UTC)
            </span>
          </div>
        )}

        {/* 4-Swatch Legend */}
        <div className="flex items-center gap-2 text-[10px] text-muted font-mono">
          <span>Low</span>
          <div className="w-3 h-3 rounded-[3px] bg-raised relative overflow-hidden border border-white/10" title="Hatched Light (35%)">
            <div className="absolute inset-0 hatch-accent opacity-35" />
          </div>
          <div className="w-3 h-3 rounded-[3px] bg-raised relative overflow-hidden border border-white/10" title="Hatched Dense (75%)">
            <div className="absolute inset-0 hatch-accent opacity-75" />
          </div>
          <span className="w-3 h-3 rounded-[3px] bg-[#c4472a]" title="Solid Mid" />
          <span className="w-3 h-3 rounded-[3px] bg-accent" title="Solid Full" />
          <span>Peak</span>
        </div>
      </div>

      {/* Accessible summary */}
      <div className="sr-only">
        Hourly traffic heatmap showing traffic across all 7 weekdays and 24 hours. Total recorded views: {totalViews.toLocaleString()}. Peak hourly views: {maxViews.toLocaleString()}.
      </div>

      <div className="w-full overflow-x-auto pb-1">
        <div className="min-w-[600px]">
          {/* Hour column labels */}
          <div className="flex pl-10 mb-1.5">
            {HOURS.map((h) => (
              <div
                key={h}
                className="flex-1 text-center text-[9px] font-mono text-faint select-none"
              >
                {h % 3 === 0 ? `${h.toString().padStart(2, "0")}` : "·"}
              </div>
            ))}
          </div>

          {/* 7 Days Grid with 6px rounded cells */}
          <div className="flex flex-col gap-1.5">
            {WEEKDAYS.map((dayName, dayIndex) => (
              <div key={dayName} className="flex items-center gap-1.5">
                <span className="w-9 text-[10px] font-mono text-muted select-none text-right pr-1">
                  {dayName}
                </span>

                <div className="flex-1 flex gap-1.5">
                  {HOURS.map((hour) => {
                    const views = grid[dayIndex][hour];
                    return (
                      <div
                        key={hour}
                        className="h-6 flex-1 rounded-[6px] transition-transform hover:scale-110 hover:ring-1 hover:ring-white cursor-pointer relative"
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredCell({
                            weekday: dayIndex,
                            hour,
                            views,
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                          });
                        }}
                        onMouseLeave={() => setHoveredCell(null)}
                      >
                        {renderCellContent(views)}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Shared Tooltip */}
      {hoveredCell && (
        <div
          className="fixed pointer-events-none z-50 -translate-x-1/2 -translate-y-full mb-3"
          style={{ left: hoveredCell.x, top: hoveredCell.y }}
        >
          <Tooltip
            label={`${WEEKDAYS[hoveredCell.weekday]} ${hoveredCell.hour.toString().padStart(2, "0")}:00 UTC`}
            value={`${hoveredCell.views.toLocaleString()} views`}
          />
        </div>
      )}
    </div>
  );
}

export default HourWeekdayHeatmap;
