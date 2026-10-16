import React from "react";
import Link from "next/link";

export function DemoTeaserSection() {
  return (
    <div id="features" className="space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
          The Dashboard Experience
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Data that tells a story, not just a spreadsheet.
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 font-mono">
          Interactive, high-frame-rate visual components designed for clarity, instant comprehension, and zero eye-fatigue.
        </p>
      </div>

      {/* Interactive Teaser Banner */}
      <div className="relative overflow-hidden bg-gradient-to-b from-zinc-900/90 via-zinc-950 to-black border border-zinc-800 rounded-3xl p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-800/60 bg-cyan-950/40 text-cyan-300 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Full-scale Real Components · No Sign-up Required
          </div>

          <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Explore every visualization at full scale.
          </h3>

          <p className="text-sm text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            See the interactive rotating 3D globe, journey drop-off Sankey diagrams, Natural Earth world choropleth, page streamgraphs, and 365-day heatmaps populated with live synthetic telemetry.
          </p>

          {/* Feature Grid Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-4">
              <span className="text-cyan-400 font-mono text-xs block mb-1">01. 3D Globe</span>
              <p className="text-xs text-zinc-300 font-medium">Real-time pulsing geo beacons</p>
            </div>
            <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-4">
              <span className="text-indigo-400 font-mono text-xs block mb-1">02. Flow Sankey</span>
              <p className="text-xs text-zinc-300 font-medium">Referrer to landing navigation</p>
            </div>
            <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-4">
              <span className="text-emerald-400 font-mono text-xs block mb-1">03. Choropleth</span>
              <p className="text-xs text-zinc-300 font-medium">Global reach density map</p>
            </div>
            <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-4">
              <span className="text-amber-400 font-mono text-xs block mb-1">04. Heatmaps</span>
              <p className="text-xs text-zinc-300 font-medium">7x24 and 365-day seasonality</p>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/demo"
              className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs sm:text-sm font-mono px-8 py-3.5 rounded-xl transition-all shadow-[0_0_28px_rgba(6,182,212,0.3)] hover:scale-105 inline-block cursor-pointer text-center"
            >
              Open Interactive Demo Dashboard →
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs sm:text-sm font-mono px-6 py-3.5 rounded-xl transition-all text-center"
            >
              Start Tracking Your Own Site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
