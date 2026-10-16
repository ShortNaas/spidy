"use client";

import React, { useMemo, useState } from "react";
import type { HourWeekdayCell } from "@/lib/queries";

export interface HourWeekdayHeatmapProps {
  data?: HourWeekdayCell[];
  loading?: boolean;
  className?: string;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function HourWeekdayHeatmap({
  data = [],
  loading = false,
  className = "",
}: HourWeekdayHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<{
    weekday: number;
    hour: number;
    views: number;
    x: number;
    y: number;
  } | null>(null);

  const { grid, maxViews } = useMemo(() => {
    // 7 rows x 24 columns
    const matrix: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
    let max = 1;

    for (const cell of data) {
      if (cell.weekday >= 0 && cell.weekday < 7 && cell.hour >= 0 && cell.hour < 24) {
        matrix[cell.weekday][cell.hour] = cell.views;
        if (cell.views > max) max = cell.views;
      }
    }

    return { grid: matrix, maxViews: max };
  }, [data]);

  function getCellColor(views: number): string {
    if (views === 0) return "#18181b"; // zinc-900
    const ratio = views / maxViews;
    // Sequential purple-indigo to cyan scale
    if (ratio < 0.2) return "#1e1b4b"; // deep indigo
    if (ratio < 0.45) return "#3730a3"; // indigo-800
    if (ratio < 0.7) return "#4f46e5"; // indigo-600
    if (ratio < 0.9) return "#06b6d4"; // cyan-500
    return "#38bdf8"; // sky-400
  }

  if (loading) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-zinc-950 rounded-xl border border-zinc-800/80 p-6 min-h-[220px] animate-pulse ${className}`}
        aria-busy="true"
      >
        <div className="w-full h-32 bg-zinc-900 rounded" />
        <span className="text-xs text-zinc-500 font-mono mt-4">Computing hourly seasonality matrix...</span>
      </div>
    );
  }

  return (
    <div
      className={`relative flex flex-col bg-zinc-950 rounded-xl border border-zinc-800/80 p-4 ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-200">Hourly Traffic Matrix</span>
          <span className="text-[11px] font-mono tabular-nums text-zinc-500">
            7 Days × 24 Hours (UTC)
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
          <span>Low</span>
          <span className="w-2.5 h-2.5 rounded-xs bg-[#18181b] border border-zinc-800" />
          <span className="w-2.5 h-2.5 rounded-xs bg-[#1e1b4b]" />
          <span className="w-2.5 h-2.5 rounded-xs bg-[#3730a3]" />
          <span className="w-2.5 h-2.5 rounded-xs bg-[#4f46e5]" />
          <span className="w-2.5 h-2.5 rounded-xs bg-[#06b6d4]" />
          <span className="w-2.5 h-2.5 rounded-xs bg-[#38bdf8]" />
          <span>Peak</span>
        </div>
      </div>

      <div className="w-full overflow-x-auto pb-1">
        <div className="min-w-[620px]">
          {/* Hour column labels */}
          <div className="flex pl-10 mb-1">
            {HOURS.map((h) => (
              <div
                key={h}
                className="flex-1 text-center text-[9px] font-mono text-zinc-500 select-none"
              >
                {h % 3 === 0 ? `${h.toString().padStart(2, "0")}` : "·"}
              </div>
            ))}
          </div>

          {/* 7 Days Grid */}
          <div className="flex flex-col gap-1">
            {WEEKDAYS.map((dayName, dayIndex) => (
              <div key={dayName} className="flex items-center gap-1">
                <span className="w-9 text-[10px] font-mono text-zinc-500 select-none text-right pr-1">
                  {dayName}
                </span>

                <div className="flex-1 flex gap-1">
                  {HOURS.map((hour) => {
                    const views = grid[dayIndex][hour];
                    return (
                      <div
                        key={hour}
                        style={{ backgroundColor: getCellColor(views) }}
                        className="h-5 flex-1 rounded-xs transition-transform hover:scale-110 hover:ring-1 hover:ring-white cursor-pointer"
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
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {hoveredCell && (
        <div
          className="fixed pointer-events-none z-50 bg-zinc-900 text-zinc-100 border border-zinc-700/80 px-2.5 py-1.5 rounded shadow-xl text-xs font-mono -translate-x-1/2 -translate-y-full mb-2"
          style={{ left: hoveredCell.x, top: hoveredCell.y }}
        >
          <div className="font-semibold text-cyan-400">
            {hoveredCell.views.toLocaleString()} views
          </div>
          <div className="text-[10px] text-zinc-400">
            {WEEKDAYS[hoveredCell.weekday]} {hoveredCell.hour.toString().padStart(2, "0")}:00 -{" "}
            {((hoveredCell.hour + 1) % 24).toString().padStart(2, "0")}:00 UTC
          </div>
        </div>
      )}
    </div>
  );
}

export default HourWeekdayHeatmap;
