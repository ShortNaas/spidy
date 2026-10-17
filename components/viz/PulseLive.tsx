"use client";

import React, { useMemo, useState } from "react";
import { Tooltip } from "@/components/ui/Tooltip";
import { Skeleton } from "@/components/ui/Skeleton";
import { tokens } from "@/lib/theme";

export interface PulseLiveProps {
  activeVisitors?: number;
  totalViews?: number;
  perMinute?: Array<{ minute: string; count: number }>;
  loading?: boolean;
  className?: string;
  width?: number;
  height?: number;
  embedded?: boolean;
}

export function PulseLive({
  activeVisitors = 0,
  totalViews = 0,
  perMinute = [],
  loading = false,
  className = "",
  width = 320,
  height = 80,
  embedded = false,
}: PulseLiveProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Normalize 30 minutes of data points
  const points = useMemo(() => {
    const rawCounts = perMinute.map((p) => p.count);
    const dataPoints =
      rawCounts.length >= 30
        ? rawCounts.slice(-30)
        : [...Array(30 - rawCounts.length).fill(0), ...rawCounts];
    const max = Math.max(...dataPoints, 5);

    const padX = 6;
    const padY = 8;
    const innerW = width - padX * 2;
    const innerH = height - padY * 2;
    const step = innerW / Math.max(1, dataPoints.length - 1);

    const coords = dataPoints.map((val, idx) => {
      const x = padX + idx * step;
      const y = height - padY - (val / max) * innerH;
      const minuteLabel = perMinute[idx]?.minute ? `${perMinute[idx].minute}m ago` : `${30 - idx}m ago`;
      return { x, y, val, minuteLabel };
    });

    const pathD = coords.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, "");

    return { coords, pathD, currentMax: max };
  }, [perMinute, width, height]);

  if (loading) {
    return (
      <div
        className={`flex flex-col justify-between min-h-[160px] ${
          embedded ? "w-full" : "bg-surface border border-border rounded-3xl p-6 sheen"
        } ${className}`}
        aria-busy="true"
        aria-label="Loading live pulse"
      >
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-6 w-16" />
        </div>
        <Skeleton className="w-full h-16 mt-4" />
      </div>
    );
  }

  const activePoint = hoveredIndex !== null ? points.coords[hoveredIndex] : null;
  const lastPoint = points.coords[points.coords.length - 1];

  return (
    <div
      className={
        embedded
          ? `relative flex flex-col justify-between w-full ${className}`
          : `relative flex flex-col justify-between bg-surface border border-border rounded-3xl p-6 sheen overflow-hidden ${className}`
      }
      role="region"
      aria-label="Real-time live telemetry pulse"
    >
      <div className="flex items-start justify-between z-10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-live" />
            </span>
            <span className="font-sans text-[13px] font-medium text-white">Active Now</span>
          </div>
          <div className="text-[36px] font-mono font-medium tabular-nums text-white tracking-tight leading-none">
            {activeVisitors.toLocaleString()}
          </div>
          <div className="text-[11px] font-mono text-faint mt-1.5">visitors in last 5 min</div>
        </div>

        <div className="text-right">
          <div className="font-sans text-[12px] text-muted">Past 30 min</div>
          <div className="text-xl font-mono font-semibold tabular-nums text-live mt-0.5">
            {totalViews.toLocaleString()}
          </div>
          <div className="text-[11px] font-mono text-faint mt-1">total views</div>
        </div>
      </div>

      {/* Accessible summary */}
      <div className="sr-only">
        Active visitors now: {activeVisitors}. Total views in past 30 minutes: {totalViews}.
      </div>

      {/* Per-minute 1.5px live cyan sparkline */}
      <div className="relative mt-4 w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-16 overflow-visible"
          role="img"
          aria-label="Sparkline showing minute-by-minute views for the past 30 minutes"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {/* Subtle baseline */}
          <line
            x1="0"
            y1={height - 2}
            x2={width}
            y2={height - 2}
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth="1"
          />

          {/* Stroke path: 1.5px live cyan */}
          {points.pathD && (
            <path
              d={points.pathD}
              fill="none"
              stroke={tokens.colors.live}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Hover hit targets */}
          {points.coords.map((pt, idx) => (
            <circle
              key={idx}
              cx={pt.x}
              cy={pt.y}
              r={8}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIndex(idx)}
            />
          ))}

          {/* End marker: ring-dot (hollow circle with live cyan border) */}
          {lastPoint && hoveredIndex === null && (
            <g>
              <circle
                cx={lastPoint.x}
                cy={lastPoint.y}
                r={4}
                fill={tokens.colors.surface}
                stroke={tokens.colors.live}
                strokeWidth={1.5}
              />
              <circle cx={lastPoint.x} cy={lastPoint.y} r={1.5} fill={tokens.colors.live} />
            </g>
          )}

          {/* Active hover marker */}
          {activePoint && (
            <g>
              <line
                x1={activePoint.x}
                y1={0}
                x2={activePoint.x}
                y2={height}
                stroke={tokens.colors.borderHover}
                strokeDasharray="2 2"
                strokeWidth={1}
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r={4.5}
                fill={tokens.colors.surface}
                stroke={tokens.colors.live}
                strokeWidth={2}
              />
              <circle cx={activePoint.x} cy={activePoint.y} r={2} fill={tokens.colors.text} />
            </g>
          )}
        </svg>

        {/* Hover Tooltip */}
        {activePoint && (
          <div
            className="absolute -top-12 transform -translate-x-1/2 pointer-events-none"
            style={{ left: `${(activePoint.x / width) * 100}%` }}
          >
            <Tooltip
              label={activePoint.minuteLabel}
              value={`${activePoint.val} views`}
            />
          </div>
        )}

        <div className="flex justify-between items-center text-[10px] font-mono text-faint mt-1.5">
          <span>30m ago</span>
          <span>15m ago</span>
          <span>Just now</span>
        </div>
      </div>
    </div>
  );
}

export default PulseLive;
