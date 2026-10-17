import React from "react";
import { DeltaBadge } from "./DeltaBadge";

export interface KpiCardProps {
  label: string;
  value: string | number;
  deltaPct?: number | null;
  invertDelta?: boolean;
  isPositiveGood?: boolean; // legacy prop compatibility: if false, invert is true
  isLiveValue?: boolean;
  subtext?: string;
  sparklineData?: number[];
  className?: string;
}

/**
 * Spidy v3 KPI Card:
 * Label (muted 13px), value (Poppins 300, 40px; live values in mono),
 * delta pill via shared DeltaBadge,
 * optional 28px white sparkline with ring-dot end marker.
 */
export function KpiCard({
  label,
  value,
  deltaPct,
  invertDelta,
  isPositiveGood = true,
  isLiveValue = false,
  subtext,
  sparklineData,
  className = "",
}: KpiCardProps) {
  // Determine if delta should be inverted (lower is better, e.g. bounce rate)
  const invert = invertDelta ?? !isPositiveGood;

  // Mini sparkline (28px high) with ring-dot end marker
  let sparklineSvg: React.ReactNode = null;
  if (sparklineData && sparklineData.length > 1) {
    const min = Math.min(...sparklineData);
    const max = Math.max(...sparklineData);
    const range = max - min || 1;
    const width = 80;
    const height = 24;

    const points = sparklineData.map((d, i) => {
      const x = (i / (sparklineData.length - 1)) * (width - 8) + 4;
      const y = height - 4 - ((d - min) / range) * (height - 8);
      return { x, y };
    });

    const pathD = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(" ");

    const lastPoint = points[points.length - 1];

    sparklineSvg = (
      <svg width={width} height={height} className="overflow-visible" aria-hidden="true">
        <path
          d={pathD}
          fill="none"
          stroke="rgba(255, 255, 255, 0.8)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Ring-dot end marker: hollow circle with filled center */}
        <circle cx={lastPoint.x} cy={lastPoint.y} r="3" fill="var(--color-surface)" stroke="var(--color-text)" strokeWidth="1.5" />
      </svg>
    );
  }

  return (
    <div
      className={`bg-surface border border-border hover:border-border-hover rounded-3xl p-6 sheen transition-colors duration-150 flex flex-col justify-between ${className}`}
    >
      <div className="relative z-10 flex items-center justify-between gap-2 mb-3">
        <span className="font-sans text-[13px] text-muted font-normal leading-none">{label}</span>
        {deltaPct !== undefined && <DeltaBadge value={deltaPct} invert={invert} />}
      </div>

      <div className="relative z-10 flex items-baseline justify-between gap-4">
        <span
          className={`text-white tracking-tight ${
            isLiveValue
              ? "font-mono font-medium text-[28px] tabular-nums"
              : "font-sans font-light text-[40px] leading-none"
          }`}
        >
          {value}
        </span>
        {sparklineSvg}
      </div>

      {subtext && (
        <span className="relative z-10 font-mono text-[11px] text-faint mt-3 block leading-tight">
          {subtext}
        </span>
      )}
    </div>
  );
}

export default KpiCard;
