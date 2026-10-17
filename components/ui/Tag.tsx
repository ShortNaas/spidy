import React from "react";

export interface TagProps {
  children: React.ReactNode;
  className?: string;
  dotColor?: string;
}

/**
 * Spidy v3 Section Tag: full pill on Raised with hairline border and 8px ring-dot (hollow circle).
 */
export function Tag({ children, className = "", dotColor = "border-white/70" }: TagProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-raised border border-border text-[13px] font-medium text-white select-none ${className}`}
    >
      <span
        className={`w-2 h-2 rounded-full border ${dotColor} shrink-0`}
        aria-hidden="true"
      />
      <span>{children}</span>
    </span>
  );
}
