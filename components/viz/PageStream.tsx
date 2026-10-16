"use client";

import React, { useMemo, useState } from "react";
import { stack, stackOffsetSilhouette, stackOrderNone, area, curveBasis } from "d3-shape";
import { scaleLinear, scalePoint } from "d3-scale";
import type { StreamDataPoint } from "@/lib/queries";

export interface PageStreamProps {
  data?: StreamDataPoint[];
  loading?: boolean;
  className?: string;
  width?: number;
  height?: number;
}

const PALETTE = [
  "#06b6d4", // cyan
  "#6366f1", // indigo
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ec4899", // pink
  "#8b5cf6", // violet
  "#14b8a6", // teal
  "#3b82f6", // blue
];

export function PageStream({
  data = [],
  loading = false,
  className = "",
  width = 680,
  height = 280,
}: PageStreamProps) {
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  const { paths, dates, series, xScale, areaGenerator } = useMemo(() => {
    if (!data.length) {
      return { paths: [], dates: [], series: [], xScale: null, areaGenerator: null };
    }

    // Unique paths and dates
    const pathSet = new Set<string>();
    const dateSet = new Set<string>();
    const valueMap = new Map<string, number>();

    for (const d of data) {
      pathSet.add(d.path);
      dateSet.add(d.date);
      valueMap.set(`${d.date}|${d.path}`, d.views);
    }

    const uniquePaths = Array.from(pathSet).slice(0, 8);
    const uniqueDates = Array.from(dateSet).sort();

    if (uniqueDates.length < 2 || uniquePaths.length === 0) {
      return {
        paths: uniquePaths,
        dates: uniqueDates,
        series: [],
        xScale: null,
        areaGenerator: null,
      };
    }

    // Transform to tabular rows for d3.stack: Array<{ date, [path]: views }>
    const rows: Array<Record<string, number | string>> = uniqueDates.map((date) => {
      const row: Record<string, number | string> = { date };
      for (const p of uniquePaths) {
        row[p] = valueMap.get(`${date}|${p}`) || 0;
      }
      return row;
    });

    const stackGenerator = stack<Record<string, number | string>>()
      .keys(uniquePaths)
      .offset(stackOffsetSilhouette)
      .order(stackOrderNone);

    const stacked = stackGenerator(rows);

    let yMin = 0;
    let yMax = 0;
    for (const layer of stacked) {
      for (const pt of layer) {
        if (pt[0] < yMin) yMin = pt[0];
        if (pt[1] > yMax) yMax = pt[1];
      }
    }

    const margin = { top: 20, right: 20, bottom: 30, left: 20 };
    const w = width - margin.left - margin.right;

    const x = scalePoint()
      .domain(uniqueDates)
      .range([margin.left, margin.left + w]);

    const y = scaleLinear()
      .domain([yMin, yMax || 1])
      .range([height - margin.bottom, margin.top]);

    const aGen = area<[number, number] & { data: Record<string, number | string> }>()
      .x((d) => x(d.data.date as string) || 0)
      .y0((d) => y(d[0]))
      .y1((d) => y(d[1]))
      .curve(curveBasis);

    return {
      paths: uniquePaths,
      dates: uniqueDates,
      series: stacked,
      xScale: x,
      areaGenerator: aGen,
    };
  }, [data, width, height]);

  if (loading) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-zinc-950 rounded-xl border border-zinc-800/80 p-6 min-h-[280px] animate-pulse ${className}`}
        aria-busy="true"
      >
        <div className="w-full h-40 bg-zinc-900 rounded" />
        <span className="text-xs text-zinc-500 font-mono mt-4">
          Generating page traffic streamgraph...
        </span>
      </div>
    );
  }

  if (!series.length || !areaGenerator) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-zinc-950 rounded-xl border border-zinc-800/80 p-8 min-h-[280px] text-center ${className}`}
      >
        <span className="text-zinc-400 text-sm font-medium mb-1">Page Traffic Stream</span>
        <span className="text-zinc-600 text-xs">
          Insufficient multi-day data for streamgraph visualization.
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative flex flex-col bg-zinc-950 rounded-xl border border-zinc-800/80 p-4 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-200">Page Traffic Dynamics</span>
          <span className="text-[11px] font-mono text-zinc-500">Top 8 Pages Stream</span>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
          {paths.map((p, idx) => {
            const color = PALETTE[idx % PALETTE.length];
            const isHovered = hoveredPath === p;
            return (
              <button
                key={p}
                type="button"
                className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded transition-all ${
                  isHovered ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
                }`}
                onMouseEnter={() => setHoveredPath(p)}
                onMouseLeave={() => setHoveredPath(null)}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span>{p === "/" ? "Home (/)" : p}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[540px]"
          role="img"
          aria-label="Streamgraph showing relative pageview trends over time for top pages"
        >
          {series.map((layer, idx) => {
            const pathName = paths[idx];
            const color = PALETTE[idx % PALETTE.length];
            const isHighlighted = hoveredPath === null || hoveredPath === pathName;
            const pathD =
              areaGenerator(
                layer as unknown as Array<
                  [number, number] & { data: Record<string, number | string> }
                >
              ) || "";

            return (
              <path
                key={pathName}
                d={pathD}
                fill={color}
                fillOpacity={isHighlighted ? 0.75 : 0.15}
                stroke={color}
                strokeWidth={isHighlighted ? 1.5 : 0.5}
                strokeOpacity={isHighlighted ? 1 : 0.2}
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredPath(pathName)}
                onMouseLeave={() => setHoveredPath(null)}
              >
                <title>{`${pathName}`}</title>
              </path>
            );
          })}

          {/* Date Axis labels */}
          {xScale && dates.length > 0 && (
            <g transform={`translate(0, ${height - 10})`}>
              {dates
                .filter(
                  (_, i) => i === 0 || i === Math.floor(dates.length / 2) || i === dates.length - 1
                )
                .map((date) => (
                  <text
                    key={date}
                    x={xScale(date)}
                    y={0}
                    textAnchor="middle"
                    fontSize={10}
                    fontFamily="monospace"
                    fill="#71717a"
                  >
                    {date.slice(5)}
                  </text>
                ))}
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}

export default PageStream;
