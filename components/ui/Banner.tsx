import React from "react";
import { Button } from "./Button";

export interface BannerProps {
  text?: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

/**
 * Spidy v3 Demo Banner:
 * A slim pill-shaped bar (36px) below the top bar: ring-dot,
 * text "You are viewing demo data", an accent pill "Create your own".
 * It is the single accent element on /demo.
 */
export function Banner({
  text = "You are viewing demo data",
  actionText = "Create your own",
  actionHref = "/register",
  onAction,
  className = "",
}: BannerProps) {
  return (
    <div
      className={`h-9 px-4 rounded-full bg-surface border border-border flex items-center justify-between gap-3 text-[13px] font-sans select-none ${className}`}
    >
      <div className="flex items-center gap-2 text-white">
        <span className="w-2 h-2 rounded-full border border-white/70 shrink-0" aria-hidden="true" />
        <span>{text}</span>
      </div>

      <div>
        {actionHref ? (
          <Button
            variant="accent"
            size="sm"
            href={actionHref}
            className="!py-1 !px-3 !text-[12px]"
          >
            {actionText}
          </Button>
        ) : (
          <Button
            variant="accent"
            size="sm"
            onClick={onAction}
            className="!py-1 !px-3 !text-[12px]"
          >
            {actionText}
          </Button>
        )}
      </div>
    </div>
  );
}
