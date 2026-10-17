import React from "react";
import { tokens } from "@/lib/theme";

export interface DonutChartProps {
  value: number; // percentage 0 - 100
  totalLabel?: string;
  label?: string;
  subtext?: string;
  size?: number;
  strokeWidth?: number;
  color?: "ember" | "white" | "mint";
  className?: string;
}

/**
 * Spidy v3 Donut Chart:
 * Gray track subtle, white or ember arc with rounded caps, centered Poppins 300 KPI.
 */
export function DonutChart({
  value = 72,
  totalLabel,
  label = "Ratio",
  subtext,
  size = 140,
  strokeWidth = 10,
  color = "ember",
  className = "",
}: DonutChartProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  let strokeColor: string = tokens.colors.accent;
  if (color === "white") strokeColor = tokens.colors.text;
  if (color === "mint") strokeColor = tokens.colors.positive;

  return (
    <div
      className={`relative flex flex-col items-center justify-center bg-surface border border-border rounded-3xl p-6 sheen ${className}`}
      role="region"
      aria-label={`${label}: ${clamped}%`}
    >
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
          {/* Track: subtle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={tokens.colors.subtle}
            strokeWidth={strokeWidth}
          />
          {/* Arc with rounded caps */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>

        {/* Centered value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-sans font-light text-[32px] leading-none text-white tracking-tight">
            {totalLabel || `${clamped}%`}
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

export default DonutChart;
