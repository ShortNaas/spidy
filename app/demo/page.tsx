import React from "react";
import type { Metadata } from "next";
import { DemoDashboardClient } from "@/components/demo/DemoDashboardClient";

export const metadata: Metadata = {
  title: "Live Interactive Demo · Spidy Analytics",
  description:
    "Explore every visualization at full scale on real components with interactive sample telemetry. Cookieless, zero-IP web analytics.",
};

export default function DemoPage() {
  return <DemoDashboardClient />;
}
