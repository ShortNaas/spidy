import React, { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { SESSION_COOKIE_NAME, getSessionUser } from "@/lib/auth";
import { sql } from "@/lib/db";

export const instant = false;

export default async function SiteDashboardPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const user = await getSessionUser(token);

  if (!user) {
    redirect("/login");
  }

  // Verify site ownership
  const owned = (await sql`
    SELECT id FROM sites WHERE id = ${id} AND user_id = ${user.id}::uuid;
  `) as Array<{ id: string }>;

  if (!owned || owned.length === 0) {
    notFound();
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 rounded-full border-2 border-live border-t-transparent animate-spin" />
        </div>
      }
    >
      <DashboardClient siteId={id} />
    </Suspense>
  );
}
