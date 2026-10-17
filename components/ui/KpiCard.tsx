import React from "react";

export interface KpiCardProps {
  label: string;
  value: string | number;
  deltaPct?: number | null;
  isPositiveGood?: boolean;
  isLiveValue?: boolean;
  subtext?: string;
  sparklineData?: number[];
  className?: string;
}

/**
 * Spidy v3 KPI Card:
 * Label (muted 13px), value (Poppins 300, 40px; live values in mono),
 * delta pill (mint or rose tinted background at 15%, text in same hue),
 * optional 28px white sparkline with ring-dot end marker.
 */
export function KpiCard({
  label,
  value,
  deltaPct,
  isPositiveGood = true,
  isLiveValue = false,
  subtext,
  sparklineData,
  className = "",
}: KpiCardProps) {
  // Delta pill calculation
  let deltaNode: React.ReactNode = null;
  if (deltaPct !== undefined && deltaPct !== null) {
    const isGood = isPositiveGood ? deltaPct >= 0 : deltaPct <= 0;
    const sign = deltaPct > 0 ? "+" : "";
    const isZero = deltaPct === 0;

    let deltaBg = "bg-white/5 border-border text-muted";
    if (!isZero) {
      if (isGood) {
        deltaBg = "bg-positive/15 border-positive/30 text-positive";
      } else {
        deltaBg = "bg-danger/15 border-danger/30 text-danger";
      }
    }

    deltaNode = (
      <span
        className={`inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full border text-[11px] font-mono tabular-nums font-medium ${deltaBg}`}
      >
        <span>{sign}{deltaPct}%</span>
      </span>
    );
  }

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
        {deltaNode}
      </div>

      <div className="relative z-10 flex items-baseline justify-between gap-3 mt-1">
        <div
          className={`text-[40px] leading-none text-white tracking-tight ${
            isLiveValue ? "font-mono font-medium tabular-nums" : "font-sans font-light"
          }`}
        >
          {value}
        </div>
        {sparklineSvg}
      </div>

      {subtext && (
        <div className="relative z-10 mt-3 pt-2 font-mono text-[11px] text-faint">
          {subtext}
        </div>
      )}
    </div>
  );
}
