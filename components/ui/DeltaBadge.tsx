import React from "react";

export interface DeltaBadgeProps {
  value: number;
  isPositiveGood?: boolean;
  className?: string;
}

export function DeltaBadge({
  value,
  isPositiveGood = true,
  className = "",
}: DeltaBadgeProps) {
  const isGood = isPositiveGood ? value >= 0 : value <= 0;
  const isZero = value === 0;
  const sign = value > 0 ? "+" : "";

  let badgeStyle = "bg-white/5 border-border text-muted";
  if (!isZero) {
    if (isGood) {
      badgeStyle = "bg-positive/15 border-positive/30 text-positive";
    } else {
      badgeStyle = "bg-danger/15 border-danger/30 text-danger";
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[11px] font-mono tabular-nums font-medium ${badgeStyle} ${className}`}
    >
      {sign}{value}%
    </span>
  );
}
