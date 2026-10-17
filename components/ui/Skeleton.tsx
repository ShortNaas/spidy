import React from "react";

export interface SkeletonProps {
  className?: string;
}

/**
 * Spidy v3 Skeleton: Raised background with a slow 1.6s sheen sweep.
 */
export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`relative overflow-hidden bg-raised rounded-xl before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.6s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent ${className}`}
      aria-hidden="true"
    />
  );
}
