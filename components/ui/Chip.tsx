import React from "react";

export interface ChipProps {
  children: React.ReactNode;
  variant?: "neutral" | "live" | "accent" | "positive" | "danger";
  size?: "sm" | "md";
  dot?: boolean;
  onRemove?: () => void;
  className?: string;
}

export function Chip({
  children,
  variant = "neutral",
  size = "md",
  dot = false,
  onRemove,
  className = "",
}: ChipProps) {
  let styleClasses = "bg-raised border border-border text-white";
  let dotColor = "bg-muted";

  if (variant === "live") {
    styleClasses = "bg-live-deep/60 border-live/40 text-live";
    dotColor = "bg-live shadow-[0_0_8px_#22d3ee]";
  } else if (variant === "accent") {
    styleClasses = "bg-accent-deep/50 border-accent/40 text-accent-bright";
    dotColor = "bg-accent";
  } else if (variant === "positive") {
    styleClasses = "bg-positive/15 border-positive/30 text-positive";
    dotColor = "bg-positive";
  } else if (variant === "danger") {
    styleClasses = "bg-danger/15 border-danger/30 text-danger";
    dotColor = "bg-danger";
  }

  const padClass = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-[12px]";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-mono font-medium select-none ${styleClasses} ${padClass} ${className}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0`} aria-hidden="true" />
      )}
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 hover:text-white cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Remove filter"
        >
          ×
        </button>
      )}
    </span>
  );
}
