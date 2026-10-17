"use client";

import React from "react";
import demoData from "@/lib/demo-data.json";
import { CalendarHeatmap } from "@/components/viz/CalendarHeatmap";
import { BarChart } from "@/components/viz/BarChart";

const SHOWCASE_BARS = [
  { label: "00h", value: 140 },
  { label: "04h", value: 85 },
  { label: "08h", value: 340 },
  { label: "12h", value: 780 },
  { label: "16h", value: 650 },
  { label: "20h", value: 420 },
];

/**
 * Spidy v3 One Showcase Frame:
 * A single large 32px-radius frame with the ember heatmap and one hatched bar chart on lib/demo-data.json,
 * a heading and one muted line. Nothing else visual.
 */
export function ShowcaseFrame() {
  return (
    <div className="rounded-4xl bg-surface border border-border p-6 sm:p-10 sheen overflow-hidden">
      <div className="mb-8">
        <h3 className="font-sans font-semibold text-[24px] sm:text-[32px] text-white tracking-tight">
          Observed in ember. <span className="text-muted font-normal">Daily activity without surveillance.</span>
        </h3>
        <p className="font-sans text-[14px] text-muted mt-2 max-w-xl">
          Continuous 365-day intensity and diurnal rhythm calculated strictly from anonymous daily salted hashes.
        </p>
      </div>

      <div className="space-y-8">
        {/* Ember Calendar Heatmap */}
        <div>
          <CalendarHeatmap data={demoData.calendar} embedded />
        </div>

        {/* Hatched Ember Bar Distribution */}
        <div className="pt-2 border-t border-border/40">
          <BarChart
            data={SHOWCASE_BARS}
            height={180}
            embedded
          />
        </div>
      </div>
    </div>
  );
}

export default ShowcaseFrame;
