"use client";

import React from "react";
import dynamic from "next/dynamic";
import demoData from "@/lib/demo-data.json";

const GlobeLive = dynamic(
  () => import("@/components/viz/GlobeLive").then((m) => m.GlobeLive),
  {
    ssr: false,
    loading: () => (
      <div className="w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] rounded-full border border-border/60 bg-raised/50 animate-pulse mx-auto" />
    ),
  }
);

/**
 * Spidy v3 Landing Hero Globe:
 * Static-seeded 3D globe rendered in a 32px-radius frame with .sheen.
 */
export function HeroGlobe() {
  return (
    <div className="relative w-full max-w-[440px] aspect-square mx-auto flex items-center justify-center rounded-4xl bg-surface border border-border p-4 sheen overflow-hidden shadow-[0_0_24px_rgba(34,211,238,0.12)]">
      <GlobeLive markers={demoData.markers} embedded />
    </div>
  );
}
