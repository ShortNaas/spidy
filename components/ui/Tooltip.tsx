import React from "react";

export interface TooltipProps {
  label: string;
  value: string | number;
  subtext?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Spidy v3 Shared Tooltip:
 * bg-raised border border-border-hover rounded-xl px-3 py-2, mono 12px values.
 */
export function Tooltip({
  label,
  value,
  subtext,
  className = "",
  style,
}: TooltipProps) {
  return (
    <div
      style={style}
      className={`pointer-events-none z-50 bg-raised border border-border-hover rounded-xl px-3 py-2 shadow-2xl transition-all duration-150 backdrop-blur-md ${className}`}
    >
      <div className="font-sans text-[11px] text-muted leading-tight mb-1">{label}</div>
      <div className="font-mono text-[12px] font-medium text-white tabular-nums leading-tight">
        {value}
      </div>
      {subtext && (
        <div className="font-mono text-[10px] text-faint mt-1 leading-tight">
          {subtext}
        </div>
      )}
    </div>
  );
}
