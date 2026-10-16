import React, { Suspense } from "react";
import { Header } from "@/components/dashboard/Header";
import { sql } from "@/lib/db";

async function getSitesList(): Promise<Array<{ id: string; domain: string }>> {
  try {
    const rows = (await sql`
      SELECT id, domain FROM sites ORDER BY created_at ASC;
    `) as Array<{ id: string; domain: string }>;

    if (rows && rows.length > 0) {
      return rows;
    }
  } catch {
    // If database is not populated or offline
  }

  return [{ id: "spidy-demo", domain: "spidy.dev" }];
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sites = await getSitesList();
  const defaultSiteId = sites[0]?.id || "spidy-demo";

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      <Suspense fallback={<div className="h-16 border-b border-zinc-800 bg-zinc-950" />}>
        <Header currentSiteId={defaultSiteId} sites={sites} />
      </Suspense>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="border-t border-zinc-900 py-6 text-center text-xs text-zinc-600 font-mono">
        Spidy · Cookieless Web Analytics · Zero Fingerprinting
      </footer>
    </div>
  );
}
