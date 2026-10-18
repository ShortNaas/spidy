import React from "react";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

export interface DeltaBadgeProps {
  value: number | null | undefined;
  invert?: boolean;
  isPreviousZero?: boolean;
  className?: string;
}

/**
 * Spidy v3 Shared DeltaBadge:
 * Percentage change indicator with strict color, sign, and accessible metadata.
 *
 * Logic:
 * - value > 0: positive style (or negative if inverted), up arrow, text "+12.4%"
 * - value < 0: negative style (or positive if inverted), down arrow, text "−12.4%" (U+2212 real minus)
 * - value === 0: neutral style (muted text, Raised bg), flat dash icon, text "0%"
 * - value === null / invalid / previous zero: neutral style, "New" if previous was 0, otherwise "–"
 * - invert: true for bounce-style metrics where lower is better
 * - Formats with Intl.NumberFormat: 1 decimal under 100%, 0 decimals at 100% or above
 */
export function DeltaBadge({
  value,
  invert = false,
  isPreviousZero = false,
  className = "",
}: DeltaBadgeProps) {
  // Handle null, undefined, NaN, Infinity, or previous was zero
  if (value === null || value === undefined || !Number.isFinite(value) || isPreviousZero) {
    const displayText = isPreviousZero ? "New" : "\u2013";
    const ariaLabel = isPreviousZero ? "New metric" : "No previous data";

    return (
      <span
        role="status"
        aria-label={ariaLabel}
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full border border-border bg-raised text-muted text-[12px] font-mono tabular-nums font-medium ${className}`}
      >
        {displayText}
      </span>
    );
  }

  // Exact zero
  if (value === 0) {
    return (
      <span
        role="status"
        aria-label="0 percent change versus previous period"
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-border bg-raised text-muted text-[12px] font-mono tabular-nums font-medium ${className}`}
      >
        <Minus className="w-3 h-3 shrink-0" aria-hidden="true" />
        <span>0%</span>
      </span>
    );
  }

  const isPositiveChange = value > 0;
  const absValue = Math.abs(value);
  const maxFractionDigits = absValue < 100 ? 1 : 0;

  const formattedValue = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: maxFractionDigits,
    minimumFractionDigits: 0,
  }).format(absValue);

  // Sign: + for positive, real minus sign (U+2212) for negative
  const sign = isPositiveChange ? "+" : "\u2212";
  const displayText = `${sign}${formattedValue}%`;

  // Real direction of change for arrow and aria-label
  const ArrowIcon = isPositiveChange ? ArrowUp : ArrowDown;
  const directionWord = isPositiveChange ? "Up" : "Down";
  const ariaLabel = `${directionWord} ${formattedValue} percent versus previous period`;

  // Tone color flips when invert is true (e.g. bounce rate decrease is positive)
  const isGood = invert ? !isPositiveChange : isPositiveChange;
  const badgeStyle = isGood
    ? "bg-positive/15 border-positive/30 text-positive"
    : "bg-negative/15 border-negative/30 text-negative";

  return (
    <span
      role="status"
      aria-label={ariaLabel}
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[12px] font-mono tabular-nums font-medium ${badgeStyle} ${className}`}
    >
      <ArrowIcon className="w-3 h-3 shrink-0" aria-hidden="true" />
      <span>{displayText}</span>
    </span>
  );
}

export default DeltaBadge;
