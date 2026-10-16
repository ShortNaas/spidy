"use client";

import React from "react";
import dynamic from "next/dynamic";
import demoData from "@/lib/demo-data.json";

const GlobeLive = dynamic(
  () => import("@/components/viz/GlobeLive").then((m) => m.GlobeLive),
  {
    ssr: false,
    loading: () => (
      <div className="w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] rounded-full bg-cyan-950/20 border border-zinc-800 animate-pulse mx-auto" />
    ),
  }
);

export function HeroGlobe() {
  return (
    <div className="relative w-full max-w-[420px] aspect-square mx-auto flex items-center justify-center">
      <div className="absolute inset-0 bg-radial from-cyan-500/10 via-transparent to-transparent pointer-events-none" />
      <GlobeLive markers={demoData.markers} />
    </div>
  );
}
