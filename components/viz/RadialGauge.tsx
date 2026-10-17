"use client";

import React from "react";

export interface RadialGaugeProps {
  value: number; // percentage (0-100) or ratio
  label?: string;
  subtext?: string;
  size?: number;
  className?: string;
}

/**
 * Spidy v3 Segmented Radial Arc Gauge:
 * Segmented arc with rounded segments (Dribbble reference style) filled in ember,
 * remaining segments hatched; value centered in Poppins 300.
 */
export function RadialGauge({
  value = 65,
  label = "System Capacity",
  subtext = "Active workload",
  size = 180,
  className = "",
}: RadialGaugeProps) {
  const totalSegments = 16;
  const clampedValue = Math.min(100, Math.max(0, value));
  const activeSegments = Math.round((clampedValue / 100) * totalSegments);

  const radius = size * 0.38;
  const strokeWidth = size * 0.08;
  const center = size / 2;

  // 240 degree arc from 150 deg to 390 deg (-210 to 30)
  const startAngle = 150;
  const sweepAngle = 240;
  const segmentGap = 4; // degrees
  const segmentSweep = (sweepAngle - (totalSegments - 1) * segmentGap) / totalSegments;

  const segments = Array.from({ length: totalSegments }, (_, i) => {
    const segStart = startAngle + i * (segmentSweep + segmentGap);
    const segEnd = segStart + segmentSweep;

    const radStart = (segStart * Math.PI) / 180;
    const radEnd = (segEnd * Math.PI) / 180;

    const x1 = center + radius * Math.cos(radStart);
    const y1 = center + radius * Math.sin(radStart);
    const x2 = center + radius * Math.cos(radEnd);
    const y2 = center + radius * Math.sin(radEnd);

    const isFilled = i < activeSegments;
    return {
      d: `M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`,
      isFilled,
      idx: i,
    };
  });

  return (
    <div
      className={`relative flex flex-col items-center justify-center bg-surface border border-border rounded-3xl p-6 sheen ${className}`}
      role="region"
      aria-label={`${label}: ${clampedValue}%`}
    >
      <div className="sr-only">
        Radial gauge showing {label}: {clampedValue} percent.
      </div>

      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
          <defs>
            <pattern
              id="gauge-hatch-pattern"
              width="4"
              height="4"
              patternTransform="rotate(-45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <line x1="0" y1="0" x2="0" y2="4" stroke="#fb5c34" strokeWidth="1" strokeOpacity="0.4" />
            </pattern>
          </defs>

          {segments.map((s) => (
            <path
              key={s.idx}
              d={s.d}
              fill="none"
              stroke={s.isFilled ? "#fb5c34" : "rgba(255, 255, 255, 0.1)"}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              className="transition-colors duration-200"
            />
          ))}
        </svg>

        {/* Centered value in Poppins 300 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-sans font-light text-[36px] leading-none text-white tracking-tight">
            {clampedValue}%
          </span>
          {label && (
            <span className="font-sans text-[11px] text-muted mt-1 leading-none">
              {label}
            </span>
          )}
        </div>
      </div>

      {subtext && (
        <span className="font-mono text-[11px] text-faint mt-2">{subtext}</span>
      )}
    </div>
  );
}

export default RadialGauge;
