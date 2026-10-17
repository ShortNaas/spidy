import React, { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Header } from "@/components/dashboard/Header";
import { sql } from "@/lib/db";
import { SESSION_COOKIE_NAME, getSessionUser } from "@/lib/auth";

async function getUserSites(userId: string): Promise<Array<{ id: string; domain: string }>> {
  try {
    const rows = (await sql`
      SELECT id, domain FROM sites WHERE user_id = ${userId}::uuid ORDER BY created_at ASC;
    `) as Array<{ id: string; domain: string }>;

    return rows || [];
  } catch {
    return [];
  }
}

export const instant = false;

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const user = await getSessionUser(token);

  if (!user) {
    redirect("/login");
  }

  const sites = await getUserSites(user.id);
  const defaultSiteId = sites[0]?.id || "";

  return (
    <div className="min-h-screen bg-canvas text-text flex flex-col font-sans">
      <Suspense fallback={<div className="h-[72px] border-b border-border bg-surface/80" />}>
        <Header currentSiteId={defaultSiteId} sites={sites} />
      </Suspense>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
      <footer className="border-t border-border py-6 text-center text-[12px] text-muted font-sans">
        Spidy · Self-Hosted Privacy Analytics · Cookieless & No IP Storage
      </footer>
    </div>
  );
}
