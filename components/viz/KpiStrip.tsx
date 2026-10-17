"use client";

import React from "react";
import type { KpiResult } from "@/lib/queries";
import { KpiCard } from "@/components/ui/KpiCard";
import { Skeleton } from "@/components/ui/Skeleton";

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
        aria-label="Loading key performance indicators"
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex flex-col justify-between bg-surface border border-border rounded-3xl p-6 h-36"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
            <Skeleton className="h-10 w-36 my-2" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>
    );
  }

  const { current, deltas } = data;

  const cards = [
    {
      label: "Total Pageviews",
      value: current.views.toLocaleString(),
      deltaPct: deltas.viewsPct,
      isPositiveGood: true,
      subtext: "vs previous period",
      isLiveValue: false,
    },
    {
      label: "Unique Visitors",
      value: current.visitors.toLocaleString(),
      deltaPct: deltas.visitorsPct,
      isPositiveGood: true,
      subtext: "salted daily hashes",
      isLiveValue: false,
    },
    {
      label: "Bounce Proxy",
      value: `${current.bounceRate}%`,
      deltaPct: deltas.bounceRatePct,
      isPositiveGood: false, // lower bounce rate is good
      subtext: "single-page sessions",
      isLiveValue: false,
    },
    {
      label: "Top Country",
      value: current.topCountry || "—",
      deltaPct: null,
      isPositiveGood: true,
      subtext: "highest visitor origin",
      isLiveValue: false,
    },
  ];

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}
      role="region"
      aria-label="Key Performance Indicators"
    >
      {cards.map((card) => (
        <KpiCard
          key={card.label}
          label={card.label}
          value={card.value}
          deltaPct={card.deltaPct}
          isPositiveGood={card.isPositiveGood}
          subtext={card.subtext}
          isLiveValue={card.isLiveValue}
        />
      ))}
    </div>
  );
}

export default KpiStrip;
