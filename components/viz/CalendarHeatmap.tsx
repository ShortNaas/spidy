"use client";

import React, { useMemo, useState } from "react";

export interface CalendarDayData {
  date: string; // YYYY-MM-DD
  views: number;
}

export interface CalendarHeatmapProps {
  data?: CalendarDayData[];
  loading?: boolean;
  className?: string;
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function CalendarHeatmap({
  data = [],
  loading = false,
  className = "",
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

    // End on the Saturday of the current week (or Sunday)
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

  // Viridis / cyan perceptual 5-step color scale
  function getColor(views: number): string {
    if (views === 0) return "#18181b"; // zinc-900
    const ratio = views / maxViews;
    if (ratio < 0.2) return "#083344"; // deep cyan
    if (ratio < 0.45) return "#0e7490"; // cyan-700
    if (ratio < 0.75) return "#06b6d4"; // cyan-500
    return "#22d3ee"; // cyan-400 bright
  }

  if (loading) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-zinc-950 rounded-xl border border-zinc-800/80 p-6 min-h-[200px] animate-pulse ${className}`}
        aria-busy="true"
      >
        <div className="w-full h-24 bg-zinc-900 rounded" />
        <span className="text-xs text-zinc-500 font-mono mt-4">Loading 12-month calendar activity...</span>
      </div>
    );
  }

  const cellSize = 11;
  const cellGap = 3;

  return (
    <div
      className={`relative flex flex-col bg-zinc-950 rounded-xl border border-zinc-800/80 p-4 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-200">12-Month Daily Activity</span>
          <span className="text-[11px] font-mono tabular-nums text-zinc-500">
            {data.reduce((sum, d) => sum + d.views, 0).toLocaleString()} total pageviews
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
          <span>Less</span>
          <span className="w-2.5 h-2.5 rounded-xs bg-[#18181b] border border-zinc-800" />
          <span className="w-2.5 h-2.5 rounded-xs bg-[#083344]" />
          <span className="w-2.5 h-2.5 rounded-xs bg-[#0e7490]" />
          <span className="w-2.5 h-2.5 rounded-xs bg-[#06b6d4]" />
          <span className="w-2.5 h-2.5 rounded-xs bg-[#22d3ee]" />
          <span>More</span>
        </div>
      </div>

      <div className="w-full overflow-x-auto pb-1">
        <svg
          viewBox={`0 0 ${weeks.length * (cellSize + cellGap) + 36} ${7 * (cellSize + cellGap) + 24}`}
          className="min-w-[700px] w-full h-auto select-none"
          role="img"
          aria-label="Calendar heatmap showing daily pageview intensity across 12 months"
        >
          {/* Month labels */}
          <g transform="translate(30, 12)">
            {monthLabels.map((m, idx) => (
              <text
                key={`m-${idx}`}
                x={m.weekIndex * (cellSize + cellGap)}
                y={0}
                fontSize={9}
                fontFamily="monospace"
                fill="#71717a"
              >
                {m.label}
              </text>
            ))}
          </g>

          {/* Weekday labels */}
          <g transform="translate(0, 24)">
            <text x={0} y={1 * (cellSize + cellGap) + 9} fontSize={8} fontFamily="monospace" fill="#71717a">
              Mon
            </text>
            <text x={0} y={3 * (cellSize + cellGap) + 9} fontSize={8} fontFamily="monospace" fill="#71717a">
              Wed
            </text>
            <text x={0} y={5 * (cellSize + cellGap) + 9} fontSize={8} fontFamily="monospace" fill="#71717a">
              Fri
            </text>
          </g>

          {/* Cells */}
          <g transform="translate(30, 20)">
            {weeks.map((week, wIdx) => (
              <g key={`w-${wIdx}`} transform={`translate(${wIdx * (cellSize + cellGap)}, 0)`}>
                {week.map((day) => {
                  const y = day.dayOfWeek * (cellSize + cellGap);
                  return (
                    <rect
                      key={day.date}
                      x={0}
                      y={y}
                      width={cellSize}
                      height={cellSize}
                      rx={2}
                      fill={getColor(day.views)}
                      className="transition-colors hover:stroke hover:stroke-cyan-300 hover:stroke-[1.5px] cursor-pointer"
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

      {/* Floating tooltip */}
      {hoveredDay && (
        <div
          className="fixed pointer-events-none z-50 bg-zinc-900 text-zinc-100 border border-zinc-700/80 px-2.5 py-1.5 rounded shadow-xl text-xs font-mono -translate-x-1/2 -translate-y-full mb-2"
          style={{ left: hoveredDay.x, top: hoveredDay.y }}
        >
          <div className="font-semibold">{hoveredDay.views.toLocaleString()} views</div>
          <div className="text-[10px] text-zinc-400">{hoveredDay.date}</div>
        </div>
      )}
    </div>
  );
}

export default CalendarHeatmap;
