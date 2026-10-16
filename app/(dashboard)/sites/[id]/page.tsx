import React, { Suspense } from "react";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const instant = false;

export default async function SiteDashboardPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
        </div>
      }
    >
      <DashboardClient siteId={id} />
    </Suspense>
  );
}
