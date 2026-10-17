"use client";

import React, { useMemo, useState } from "react";
import { tokens } from "@/lib/theme";

export interface BarDataPoint {
  label: string;
  value: number;
}

export interface BarChartProps {
  data: BarDataPoint[];
  height?: number;
  className?: string;
  title?: string;
  subtitle?: string;
  embedded?: boolean;
}

/**
 * Spidy v3 Bar Chart:
 * - Pill-ended bars (full-radius tops)
 * - Hatched ember normally, solid ember for active/peak bar
 * - Label bubble above the active bar
 * - Gridlines at 50% border
 */
export function BarChart({
  data = [],
  height = 200,
  className = "",
  title,
  subtitle,
  embedded = false,
}: BarChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const { maxVal, peakIdx } = useMemo(() => {
    let max = 1;
    let pIdx = 0;
    data.forEach((d, idx) => {
      if (d.value > max) {
        max = d.value;
        pIdx = idx;
      }
    });
    return { maxVal: max, peakIdx: pIdx };
  }, [data]);

  const activeIdx = hoveredIdx !== null ? hoveredIdx : peakIdx;
  const paddingX = 16;
  const paddingBottom = 28;
  const paddingTop = 28;
  const chartHeight = height - paddingTop - paddingBottom;
  const svgWidth = 400;

  const barCount = Math.max(1, data.length);
  const totalBarSpace = svgWidth - paddingX * 2;
  const barSlot = totalBarSpace / barCount;
  const barWidth = Math.min(24, barSlot * 0.6);

  return (
    <div
      className={
        embedded
          ? `relative flex flex-col w-full ${className}`
          : `relative flex flex-col bg-surface border border-border rounded-3xl p-6 sheen overflow-hidden ${className}`
      }
      role="region"
      aria-label={title || "Bar chart telemetry"}
    >
      <div className={`flex items-center ${embedded ? "justify-end" : "justify-between"} gap-3 mb-4`}>
        {!embedded && (title || subtitle) && (
          <div>
            {title && <span className="font-sans text-[13px] font-medium text-white">{title}</span>}
            {subtitle && <p className="font-mono text-[11px] text-muted">{subtitle}</p>}
          </div>
        )}
          <div className="flex items-center gap-2 text-[10px] text-muted font-mono">
            <span className="flex items-center gap-1.5">
              <svg width="10" height="10" className="rounded-xs overflow-hidden">
                <rect width="10" height="10" fill="url(#bar-legend-hatch)" />
              </svg>
              <span>Normal</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block" />
              <span>Peak</span>
            </span>
          </div>
        </div>

      {/* Accessible summary */}
      <div className="sr-only">
        Bar chart with {data.length} bars. Peak value: {maxVal} at {data[peakIdx]?.label}.
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${height}`}
          className="w-full h-auto"
          role="img"
          aria-label="Bar distribution chart"
        >
          <defs>
            <pattern
              id="barchart-hatch"
              width="6"
              height="6"
              patternTransform="rotate(-45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <rect width="6" height="6" fill={tokens.colors.raised} />
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="6"
                stroke={tokens.colors.accent}
                strokeWidth="1.5"
                strokeOpacity="0.75"
              />
            </pattern>
            <pattern
              id="bar-legend-hatch"
              width="6"
              height="6"
              patternTransform="rotate(-45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <rect width="10" height="10" fill={tokens.colors.raised} />
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="10"
                stroke={tokens.colors.accent}
                strokeWidth="1.5"
                strokeOpacity="0.75"
              />
            </pattern>
          </defs>

          {/* Gridlines at 50% border */}
          {[0, 0.5, 1].map((pct) => {
            const y = paddingTop + chartHeight * (1 - pct);
            return (
              <line
                key={pct}
                x1={paddingX}
                y1={y}
                x2={svgWidth - paddingX}
                y2={y}
                stroke={tokens.colors.borderHalf}
                strokeDasharray="3 3"
                strokeWidth="1"
              />
            );
          })}

          {/* Bars */}
          {data.map((d, idx) => {
            const barH = Math.max(6, (d.value / maxVal) * chartHeight);
            const x = paddingX + idx * barSlot + (barSlot - barWidth) / 2;
            const y = paddingTop + chartHeight - barH;
            const isActive = idx === activeIdx;

            return (
              <g
                key={d.label}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Pill-ended bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  rx={barWidth / 2}
                  ry={barWidth / 2}
                  fill={isActive ? tokens.colors.accent : "url(#barchart-hatch)"}
                  stroke={isActive ? tokens.colors.accentBright : tokens.colors.border}
                  strokeWidth={isActive ? 1.5 : 0.5}
                  className="transition-all duration-200"
                />

                {/* Label bubble above the active bar */}
                {isActive && (
                  <g transform={`translate(${x + barWidth / 2}, ${y - 8})`}>
                    <rect
                      x="-18"
                      y="-18"
                      width="36"
                      height="16"
                      rx="8"
                      fill={tokens.colors.raised}
                      stroke={tokens.colors.accent}
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="-7"
                      textAnchor="middle"
                      fontSize="9"
                      fontFamily="var(--font-mono, monospace)"
                      fill={tokens.colors.text}
                      fontWeight="500"
                    >
                      {d.value}
                    </text>
                  </g>
                )}

                {/* X axis label */}
                <text
                  x={x + barWidth / 2}
                  y={height - 8}
                  textAnchor="middle"
                  fontSize="10"
                  fontFamily="var(--font-mono, monospace)"
                  fill={isActive ? tokens.colors.text : tokens.colors.muted}
                  className="transition-colors"
                >
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {hoveredIdx !== null && (
        <div className="mt-2 text-center">
          <span className="font-mono text-[11px] text-muted">
            {data[hoveredIdx].label}:{" "}
            <span className="text-white font-medium">{data[hoveredIdx].value.toLocaleString()} views</span>
          </span>
        </div>
      )}
    </div>
  );
}

export default BarChart;
