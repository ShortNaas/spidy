import React, { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { SESSION_COOKIE_NAME, getSessionUser } from "@/lib/auth";
import { sql } from "@/lib/db";

export const instant = false;

export default async function DashboardOverviewPage(props: {
  searchParams: Promise<{ siteId?: string }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const user = await getSessionUser(token);

  if (!user) {
    redirect("/login");
  }

  const userSites = (await sql`
    SELECT id FROM sites WHERE user_id = ${user.id}::uuid ORDER BY created_at ASC;
  `) as Array<{ id: string }>;

  if (!userSites || userSites.length === 0) {
    redirect("/dashboard/sites/new");
  }

  const searchParams = await props.searchParams;
  let siteId = searchParams.siteId;

  // Verify siteId is owned by user, otherwise fallback to first site
  if (!siteId || !userSites.some((s) => s.id === siteId)) {
    siteId = userSites[0].id;
  }

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
