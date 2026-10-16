"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export interface HeaderProps {
  currentSiteId: string;
  sites: Array<{ id: string; domain: string }>;
}

const DATE_PRESETS = [
  { label: "24h", value: "24h" },
  { label: "7d", value: "7d" },
  { label: "30d", value: "30d" },
  { label: "12mo", value: "12mo" },
];

export function Header({ currentSiteId, sites }: HeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentRange = searchParams.get("range") || "7d";
  const currentCountry = searchParams.get("country");
  const currentPath = searchParams.get("path");
  const currentReferrer = searchParams.get("referrer");

  function updateQuery(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`?${params.toString()}`);
  }

  function handleSiteChange(siteId: string) {
    if (siteId === "new") {
      router.push("/dashboard/sites/new");
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    router.push(`/dashboard/sites/${siteId}?${params.toString()}`);
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore network errors on logout
    }
    router.push("/login");
    router.refresh();
  }

  const embedSnippet = `<script defer src="${
    typeof window !== "undefined" ? window.location.origin : ""
  }/a.js" data-site="${currentSiteId}"></script>`;

  function copySnippet() {
    navigator.clipboard.writeText(embedSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand and Site switcher */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-white font-bold tracking-tight">
            <span className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </span>
            <span className="text-base tracking-tight hidden sm:inline">Spidy</span>
          </Link>

          {/* Site switcher */}
          <div className="relative">
            <select
              value={currentSiteId}
              onChange={(e) => handleSiteChange(e.target.value)}
              className="bg-zinc-900 border border-zinc-700/80 hover:border-zinc-600 rounded-lg px-2.5 py-1.5 text-xs font-mono text-zinc-200 outline-none cursor-pointer"
            >
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.domain} ({s.id})
                </option>
              ))}
              <option value="new">+ Add site...</option>
            </select>
          </div>
        </div>

        {/* Center: Date Range Presets */}
        <div className="flex items-center bg-zinc-900/90 border border-zinc-800 rounded-lg p-0.5">
          {DATE_PRESETS.map((p) => {
            const isActive = currentRange === p.value;
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => updateQuery("range", p.value)}
                className={`text-xs font-mono px-3 py-1 rounded-md transition-all cursor-pointer ${
                  isActive
                    ? "bg-zinc-800 text-cyan-400 font-semibold shadow-xs"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Right: Embed snippet, gallery, settings, logout */}
        <div className="flex items-center gap-2">
          {currentSiteId && (
            <button
              type="button"
              onClick={() => setShowEmbedModal(true)}
              className="text-xs font-mono px-2.5 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-zinc-300 transition-colors hidden md:inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>&lt;/&gt;</span>
              <span>Embed</span>
            </button>
          )}

          <Link
            href="/dashboard/sites/new"
            className="text-xs font-mono px-2.5 py-1.5 rounded-lg border border-cyan-800/60 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/40 transition-colors hidden sm:inline-flex items-center gap-1"
          >
            + Site
          </Link>

          <Link
            href="/dashboard/settings"
            className="text-xs font-mono px-2.5 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-zinc-300 transition-colors"
          >
            Settings
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            title="Log out"
            className="text-xs font-mono px-2.5 py-1.5 rounded-lg text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Active filters pill bar */}
      {(currentCountry || currentPath || currentReferrer) && (
        <div className="bg-zinc-900/60 border-t border-zinc-800/50 px-4 sm:px-6 lg:px-8 py-1.5 flex items-center gap-2 text-xs font-mono">
          <span className="text-zinc-500">Filters:</span>
          {currentCountry && (
            <span className="inline-flex items-center gap-1 bg-cyan-950/60 text-cyan-400 border border-cyan-800/50 px-2 py-0.5 rounded-md">
              Country: {currentCountry}
              <button
                type="button"
                onClick={() => updateQuery("country", null)}
                className="hover:text-white cursor-pointer"
              >
                ×
              </button>
            </span>
          )}
          {currentPath && (
            <span className="inline-flex items-center gap-1 bg-indigo-950/60 text-indigo-400 border border-indigo-800/50 px-2 py-0.5 rounded-md">
              Path: {currentPath}
              <button
                type="button"
                onClick={() => updateQuery("path", null)}
                className="hover:text-white cursor-pointer"
              >
                ×
              </button>
            </span>
          )}
          {currentReferrer && (
            <span className="inline-flex items-center gap-1 bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 px-2 py-0.5 rounded-md">
              Referrer: {currentReferrer}
              <button
                type="button"
                onClick={() => updateQuery("referrer", null)}
                className="hover:text-white cursor-pointer"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}

      {/* Embed snippet modal */}
      {showEmbedModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Embed Tracker Snippet</h3>
              <button
                type="button"
                onClick={() => setShowEmbedModal(false)}
                className="text-zinc-400 hover:text-white text-lg font-mono cursor-pointer"
              >
                ×
              </button>
            </div>
            <p className="text-xs text-zinc-400">
              Add this lightweight (&lt;1 KB), cookieless tag to your website header or before
              &lt;/body&gt;:
            </p>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 font-mono text-xs text-cyan-300 break-all select-all">
              {embedSnippet}
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={copySnippet}
                className="bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-semibold px-4 py-2 rounded-lg font-mono transition-colors cursor-pointer"
              >
                {copied ? "Copied!" : "Copy Snippet"}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
