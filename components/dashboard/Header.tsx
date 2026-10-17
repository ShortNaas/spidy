"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Wordmark } from "@/components/ui/Wordmark";
import { Tabs } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Search, Settings, LogOut, Code, Plus, ChevronDown, X } from "lucide-react";

export interface HeaderProps {
  currentSiteId?: string;
  sites?: Array<{ id: string; domain: string }>;
  isDemo?: boolean;
}

const DATE_PRESETS = [
  { id: "24h", label: "24h" },
  { id: "7d", label: "7d" },
  { id: "30d", label: "30d" },
  { id: "12mo", label: "12mo" },
];

export function Header({ currentSiteId = "", sites = [], isDemo = false }: HeaderProps) {
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

  // Dismiss embed modal with Escape key
  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && showEmbedModal) {
        setShowEmbedModal(false);
      }
    }
    if (showEmbedModal) {
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }
  }, [showEmbedModal]);

  return (
    <header className="border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-40 transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between gap-4">
        {/* Left: Wordmark & Site Switcher */}
        <div className="flex items-center gap-4 min-w-0">
          <Wordmark href={isDemo ? "/demo" : "/dashboard"} />

          {isDemo ? (
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full bg-raised border border-border text-[12px] font-mono text-muted">
              demo.spidy.dev
            </span>
          ) : (
            sites.length > 0 && (
              <div className="relative hidden sm:block">
                <select
                  value={currentSiteId}
                  onChange={(e) => handleSiteChange(e.target.value)}
                  className="bg-raised border border-border hover:border-border-hover rounded-full px-3.5 py-1.5 text-[12px] font-mono text-white outline-none cursor-pointer appearance-none pr-8 transition-colors duration-150"
                  aria-label="Select active site"
                >
                  {sites.map((s) => (
                    <option key={s.id} value={s.id} className="bg-surface text-white">
                      {s.domain}
                    </option>
                  ))}
                  <option value="new" className="bg-surface text-accent">
                    + Add site...
                  </option>
                </select>
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                  <ChevronDown className="w-3.5 h-3.5" />
                </span>
              </div>
            )
          )}
        </div>

        {/* Center: Range Presets Tabs (Floating Pill Group) */}
        <div className="flex justify-center">
          <Tabs
            tabs={DATE_PRESETS}
            activeTab={currentRange}
            onChange={(val) => updateQuery("range", val)}
          />
        </div>

        {/* Right: 40px Circle Buttons (Search, Embed, Settings, Avatar/Logout) */}
        <div className="flex items-center gap-2">
          <Button variant="icon" title="Search telemetry" aria-label="Search telemetry">
            <Search size={16} />
          </Button>

          {!isDemo && currentSiteId && (
            <Button
              variant="icon"
              onClick={() => setShowEmbedModal(true)}
              title="Embed Tracker"
              aria-label="Embed tracker script"
            >
              <Code size={16} />
            </Button>
          )}

          {!isDemo && (
            <>
              <Link href="/dashboard/sites/new" title="Add New Site" className="hidden md:inline-flex">
                <Button variant="icon" aria-label="Add new site">
                  <Plus size={16} />
                </Button>
              </Link>

              <Link href="/dashboard/settings" title="Account Settings" className="hidden md:inline-flex">
                <Button variant="icon" aria-label="Settings">
                  <Settings size={16} />
                </Button>
              </Link>

              <Button
                variant="icon"
                onClick={handleLogout}
                title="Log out"
                aria-label="Log out"
              >
                <LogOut size={16} />
              </Button>
            </>
          )}

          {isDemo && (
            <Link href="/register">
              <Button variant="primary" size="sm">
                Get started
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Active filters pill bar */}
      {(currentCountry || currentPath || currentReferrer) && (
        <div className="bg-raised/40 border-t border-border px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-2 text-[12px] font-sans">
          <span className="text-muted">Active Filters:</span>
          {currentCountry && (
            <Chip variant="live" onRemove={() => updateQuery("country", null)}>
              Country: {currentCountry}
            </Chip>
          )}
          {currentPath && (
            <Chip variant="accent" onRemove={() => updateQuery("path", null)}>
              Path: {currentPath}
            </Chip>
          )}
          {currentReferrer && (
            <Chip variant="positive" onRemove={() => updateQuery("referrer", null)}>
              Referrer: {currentReferrer}
            </Chip>
          )}
        </div>
      )}

      {/* Embed script modal */}
      {showEmbedModal && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowEmbedModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/80 backdrop-blur-sm"
        >
          <div className="bg-surface border border-border rounded-3xl p-6 max-w-lg w-full space-y-4 sheen relative z-10 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-medium text-white">Embed Analytics Tracker</h3>
              <button
                type="button"
                onClick={() => setShowEmbedModal(false)}
                className="w-8 h-8 rounded-full bg-raised border border-border text-muted hover:text-white flex items-center justify-center cursor-pointer transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-live"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[13px] text-muted leading-relaxed font-sans">
              Add this lightweight script tag (&lt;1 KB) to your website&apos;s &lt;head&gt; or &lt;body&gt;. Zero cookies, no device fingerprints, raw IPs never logged.
            </p>

            <div className="bg-subtle border border-border rounded-xl p-3 font-mono text-[12px] text-white break-all select-all">
              {embedSnippet}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowEmbedModal(false)}>
                Done
              </Button>
              <Button variant="primary" onClick={copySnippet}>
                {copied ? "Copied to Clipboard!" : "Copy Snippet"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
