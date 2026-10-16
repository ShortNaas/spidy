"use client";

import React, { useMemo } from "react";

export interface PulseLiveProps {
  activeVisitors?: number;
  totalViews?: number;
  perMinute?: Array<{ minute: string; count: number }>;
  loading?: boolean;
  className?: string;
  width?: number;
  height?: number;
}

export function PulseLive({
  activeVisitors = 0,
  totalViews = 0,
  perMinute = [],
  loading = false,
  className = "",
  width = 320,
  height = 80,
}: PulseLiveProps) {
  // Normalize 30 minutes of data points
  const points = useMemo(() => {
    // Fill to 30 points if fewer
    const rawCounts = perMinute.map((p) => p.count);
    const dataPoints = rawCounts.length >= 30 ? rawCounts.slice(-30) : [...Array(30 - rawCounts.length).fill(0), ...rawCounts];
    const max = Math.max(...dataPoints, 5);

    const padX = 4;
    const padY = 8;
    const innerW = width - padX * 2;
    const innerH = height - padY * 2;
    const step = innerW / Math.max(1, dataPoints.length - 1);

    const coords = dataPoints.map((val, idx) => {
      const x = padX + idx * step;
      const y = height - padY - (val / max) * innerH;
      return { x, y, val };
    });

    const pathD = coords.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, "");

    const areaD = coords.length
      ? `${pathD} L ${coords[coords.length - 1].x} ${height} L ${coords[0].x} ${height} Z`
      : "";

    return { coords, pathD, areaD, currentMax: max };
  }, [perMinute, width, height]);

  if (loading) {
    return (
      <div
        className={`flex flex-col justify-between bg-zinc-950 rounded-xl border border-zinc-800/80 p-4 min-h-[140px] animate-pulse ${className}`}
        aria-busy="true"
      >
        <div className="flex items-center justify-between">
          <div className="h-4 w-28 bg-zinc-800 rounded" />
          <div className="h-6 w-12 bg-zinc-800 rounded" />
        </div>
        <div className="w-full h-12 bg-zinc-900 rounded mt-4" />
      </div>
    );
  }

  return (
    <div
      className={`relative flex flex-col justify-between bg-zinc-950 rounded-xl border border-zinc-800/80 p-4 overflow-hidden ${className}`}
    >
      <div className="flex items-start justify-between z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-xs font-semibold text-zinc-300">Active Now</span>
          </div>
          <div className="text-3xl font-bold font-mono tabular-nums text-white tracking-tight">
            {activeVisitors.toLocaleString()}
          </div>
          <div className="text-[11px] font-mono text-zinc-500 mt-0.5">
            visitors in last 5 min
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs font-medium text-zinc-400">Past 30 min</div>
          <div className="text-xl font-semibold font-mono tabular-nums text-cyan-400">
            {totalViews.toLocaleString()}
          </div>
          <div className="text-[11px] font-mono text-zinc-500">total views</div>
        </div>
      </div>

      {/* Per-minute sparkline */}
      <div className="mt-3 w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-16 overflow-visible"
          role="img"
          aria-label="Sparkline showing minute-by-minute views for the past 30 minutes"
        >
          <defs>
            <linearGradient id="pulseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          {points.areaD && (
            <path d={points.areaD} fill="url(#pulseGradient)" />
          )}

          {/* Stroke path */}
          {points.pathD && (
            <path
              d={points.pathD}
              fill="none"
              stroke="#10b981"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Current minute pulsing dot */}
          {points.coords.length > 0 && (
            <circle
              cx={points.coords[points.coords.length - 1].x}
              cy={points.coords[points.coords.length - 1].y}
              r={3.5}
              fill="#34d399"
              className="animate-pulse"
            />
          )}
        </svg>

        <div className="flex justify-between items-center text-[10px] font-mono text-zinc-600 mt-1">
          <span>30m ago</span>
          <span>15m ago</span>
          <span>Just now</span>
        </div>
      </div>
    </div>
  );
}

export default PulseLive;
