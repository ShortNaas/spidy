"use client";

import React from "react";
import { motion } from "framer-motion";
import type { KpiResult } from "@/lib/queries";

export interface KpiStripProps {
  data?: KpiResult;
  loading?: boolean;
  className?: string;
}

export function KpiStrip({ data, loading = false, className = "" }: KpiStripProps) {
  if (loading || !data) {
    return (
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}
        aria-busy="true"
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex flex-col justify-between bg-zinc-950 rounded-xl border border-zinc-800/80 p-5 h-32 animate-pulse"
          >
            <div className="h-4 w-24 bg-zinc-800 rounded" />
            <div className="h-8 w-32 bg-zinc-800 rounded" />
            <div className="h-3 w-20 bg-zinc-900 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const { current, deltas } = data;

  const cards = [
    {
      title: "Total Pageviews",
      value: current.views.toLocaleString(),
      deltaPct: deltas.viewsPct,
      isPositiveGood: true,
      subtext: "vs previous period",
    },
    {
      title: "Unique Visitors",
      value: current.visitors.toLocaleString(),
      deltaPct: deltas.visitorsPct,
      isPositiveGood: true,
      subtext: "salted daily hashes",
    },
    {
      title: "Bounce Proxy",
      value: `${current.bounceRate}%`,
      deltaPct: deltas.bounceRatePct,
      isPositiveGood: false, // lower bounce rate is good
      subtext: "single-page sessions",
    },
    {
      title: "Top Country",
      value: current.topCountry || "—",
      deltaPct: null,
      isPositiveGood: true,
      subtext: "highest visitor origin",
    },
  ];

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}
      role="region"
      aria-label="Key Performance Indicators"
    >
      {cards.map((card, idx) => {
        let badgeColor = "text-zinc-400 bg-zinc-900 border-zinc-800";
        let sign = "";

        if (card.deltaPct !== null) {
          const isGood =
            card.isPositiveGood ? card.deltaPct >= 0 : card.deltaPct <= 0;
          sign = card.deltaPct > 0 ? "+" : "";

          if (card.deltaPct === 0) {
            badgeColor = "text-zinc-400 bg-zinc-900 border-zinc-800";
          } else if (isGood) {
            badgeColor = "text-emerald-400 bg-emerald-950/40 border-emerald-800/40";
          } else {
            badgeColor = "text-rose-400 bg-rose-950/40 border-rose-800/40";
          }
        }

        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.08 }}
            className="flex flex-col justify-between bg-zinc-950 rounded-xl border border-zinc-800/80 p-5 shadow-xs hover:border-zinc-700/80 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">{card.title}</span>
              {card.deltaPct !== null && (
                <span
                  className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-full border tabular-nums ${badgeColor}`}
                >
                  {sign}
                  {card.deltaPct}%
                </span>
              )}
            </div>

            <div className="my-2">
              <div className="text-3xl font-bold font-mono tabular-nums text-white tracking-tight">
                {card.value}
              </div>
            </div>

            <div className="text-[11px] font-mono text-zinc-500">{card.subtext}</div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default KpiStrip;
