import React from "react";
import { Button } from "./Button";

export interface EmptyStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

/**
 * Spidy v3 Empty State: dot-grid backdrop, a muted sentence, a ghost pill "Change range".
 */
export function EmptyState({
  title = "No Telemetry Detected",
  message = "No visitor traffic matches the selected filters for this time window.",
  actionLabel = "Change range",
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-border bg-surface p-10 flex flex-col items-center justify-center text-center ${className}`}
    >
      <div className="absolute inset-0 dotgrid opacity-40 pointer-events-none" />

      <div className="relative z-10 max-w-sm space-y-2">
        <h4 className="font-sans font-medium text-[16px] text-white">{title}</h4>
        <p className="font-sans text-[13px] text-muted leading-relaxed">{message}</p>
        {(onAction || onSecondaryAction) && (
          <div className="pt-3 flex flex-wrap items-center justify-center gap-2">
            {onAction && (
              <Button variant="ghost" size="sm" onClick={onAction}>
                {actionLabel}
              </Button>
            )}
            {onSecondaryAction && secondaryActionLabel && (
              <Button variant="ghost" size="sm" onClick={onSecondaryAction}>
                {secondaryActionLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
