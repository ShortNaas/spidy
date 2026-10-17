"use client";

import React, { useMemo, useState } from "react";
import { stack, stackOffsetSilhouette, stackOrderNone, area, curveBasis } from "d3-shape";
import { scaleLinear, scalePoint } from "d3-scale";
import type { StreamDataPoint } from "@/lib/queries";
import { categorical, CATEGORICAL_PALETTE } from "@/lib/theme";
import { Tooltip } from "@/components/ui/Tooltip";
import { Skeleton } from "@/components/ui/Skeleton";

export interface PageStreamProps {
  data?: StreamDataPoint[];
  loading?: boolean;
  className?: string;
  width?: number;
  height?: number;
  embedded?: boolean;
}

export function PageStream({
  data = [],
  loading = false,
  className = "",
  width = 680,
  height = 280,
  embedded = false,
}: PageStreamProps) {
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const [tooltipInfo, setTooltipInfo] = useState<{
    label: string;
    value: string;
    x: number;
    y: number;
  } | null>(null);

  const { paths, dates, series, xScale, areaGenerator } = useMemo(() => {
    if (!data.length) {
      return { paths: [], dates: [], series: [], xScale: null, areaGenerator: null };
    }

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
        className={`flex flex-col items-center justify-center bg-surface border border-border rounded-3xl p-6 min-h-[280px] sheen ${className}`}
        aria-busy="true"
        aria-label="Loading page trajectory streamgraph"
      >
        <Skeleton className="w-full h-44 rounded-2xl" />
        <span className="text-xs text-muted font-mono mt-4">
          Generating page traffic streamgraph...
        </span>
      </div>
    );
  }

  if (!series.length || !areaGenerator) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-surface border border-border rounded-3xl p-8 min-h-[280px] text-center sheen ${className}`}
      >
        <span className="text-white text-sm font-medium mb-1">Page Traffic Stream</span>
        <span className="text-muted text-xs">
          Insufficient multi-day data for streamgraph visualization.
        </span>
      </div>
    );
  }

  const palette = categorical(paths.length);

  return (
    <div
      className={
        embedded
          ? `relative flex flex-col w-full ${className}`
          : `relative flex flex-col bg-surface border border-border rounded-3xl p-6 sheen overflow-hidden ${className}`
      }
      role="region"
      aria-label="Page traffic streamgraph over time"
    >
      <div className={`flex flex-wrap items-center ${embedded ? "justify-end" : "justify-between"} gap-3 mb-3`}>
        {!embedded && (
          <div className="flex items-center gap-2">
            <span className="font-sans text-[13px] font-medium text-white">Page Trajectory</span>
            <span className="font-mono text-[11px] text-muted">Top 8 Pages Stream</span>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
          {paths.map((p, idx) => {
            const item = palette[idx % palette.length] || CATEGORICAL_PALETTE[idx % 8];
            const isHovered = hoveredPath === p;
            return (
              <button
                key={p}
                type="button"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                  isHovered
                    ? "bg-white text-[#050505] border-white font-medium"
                    : "bg-raised border-border text-muted hover:text-white hover:border-border-hover"
                }`}
                onMouseEnter={() => setHoveredPath(p)}
                onMouseLeave={() => setHoveredPath(null)}
              >
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{
                    backgroundColor: item.color,
                    border: item.hatch ? "1px dashed rgba(255,255,255,0.4)" : "none",
                  }}
                />
                <span>{p === "/" ? "Home (/)" : p}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Accessible summary */}
      <div className="sr-only">
        Streamgraph showing relative pageview trends over time for {paths.length} top paths: {paths.join(", ")}.
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[540px]"
          role="img"
          aria-label="Streamgraph showing relative pageview trends over time for top pages"
        >
          <defs>
            {palette.map((cat, idx) =>
              cat.hatch ? (
                <pattern
                  key={`pattern-${idx}`}
                  id={`stream-hatch-${idx}`}
                  width="6"
                  height="6"
                  patternTransform="rotate(-45 0 0)"
                  patternUnits="userSpaceOnUse"
                >
                  <rect width="6" height="6" fill="#161616" />
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="6"
                    stroke={cat.color}
                    strokeWidth="1.5"
                  />
                </pattern>
              ) : null
            )}
          </defs>

          {series.map((layer, idx) => {
            const pathName = paths[idx];
            const item = palette[idx % palette.length] || CATEGORICAL_PALETTE[idx % 8];
            const isHighlighted = hoveredPath === null || hoveredPath === pathName;
            const pathD =
              areaGenerator(
                layer as unknown as Array<
                  [number, number] & { data: Record<string, number | string> }
                >
              ) || "";

            const fillValue = item.hatch ? `url(#stream-hatch-${idx})` : item.color;

            return (
              <path
                key={pathName}
                d={pathD}
                fill={fillValue}
                fillOpacity={isHighlighted ? (item.hatch ? 1 : 0.85) : 0.15}
                stroke={item.color}
                strokeWidth={isHighlighted ? 1.5 : 0.5}
                strokeOpacity={isHighlighted ? 1 : 0.2}
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={(e) => {
                  setHoveredPath(pathName);
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltipInfo({
                    label: pathName,
                    value: "Active Stream Route",
                    x: rect.left + rect.width / 2,
                    y: rect.top + 30,
                  });
                }}
                onMouseLeave={() => {
                  setHoveredPath(null);
                  setTooltipInfo(null);
                }}
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
                    fontFamily="var(--font-mono, monospace)"
                    fill="#8d8d8d"
                  >
                    {date.slice(5)}
                  </text>
                ))}
            </g>
          )}
        </svg>
      </div>

      {/* Shared Tooltip */}
      {tooltipInfo && (
        <div
          className="fixed pointer-events-none z-50 -translate-x-1/2 -translate-y-full mb-3"
          style={{ left: tooltipInfo.x, top: tooltipInfo.y }}
        >
          <Tooltip label={tooltipInfo.label} value={tooltipInfo.value} />
        </div>
      )}
    </div>
  );
}

export default PageStream;
