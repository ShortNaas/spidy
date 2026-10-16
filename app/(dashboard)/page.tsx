import React, { Suspense } from "react";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const instant = false;

export default async function DashboardOverviewPage(props: {
  searchParams: Promise<{ siteId?: string }>;
}) {
  const searchParams = await props.searchParams;
  const siteId = searchParams.siteId || "spidy-demo";

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
        </div>
      }
    >
      <DashboardClient siteId={siteId} />
    </Suspense>
  );
}
