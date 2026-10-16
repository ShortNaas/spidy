"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewSitePage() {
  const router = useRouter();
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Once site is created
  const [createdSite, setCreatedSite] = useState<{ id: string; domain: string } | null>(null);
  const [hasReceivedEvent, setHasReceivedEvent] = useState(false);
  const [copied, setCopied] = useState(false);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  async function handleCreateSite(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Failed to create site");
        setLoading(false);
        return;
      }

      setCreatedSite({ id: data.site.id, domain: data.site.domain });
      setLoading(false);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  // Poll for first pageview when createdSite is set
  useEffect(() => {
    if (!createdSite || hasReceivedEvent) return;

    let active = true;

    async function checkFirstEvent() {
      try {
        const res = await fetch(`/api/live?siteId=${createdSite?.id}`);
        if (!res.ok) return;
        const data = await res.json();
        if (
          data.totalViews30Min > 0 ||
          data.activeVisitors5Min > 0 ||
          (Array.isArray(data.recentMarkers) && data.recentMarkers.length > 0) ||
          data.recentCount > 0 ||
          (Array.isArray(data.events) && data.events.length > 0)
        ) {
          if (active) {
            setHasReceivedEvent(true);
          }
        }
      } catch {
        // Ignore polling errors
      }
    }

    // Check immediately, then poll every 2.5s
    checkFirstEvent();
    const interval = setInterval(checkFirstEvent, 2500);
    pollTimerRef.current = interval;

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [createdSite, hasReceivedEvent]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const embedSnippet = createdSite
    ? `<script defer src="${origin}/a.js" data-site="${createdSite.id}"></script>`
    : "";

  function copySnippet() {
    if (!embedSnippet) return;
    navigator.clipboard.writeText(embedSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors inline-flex items-center gap-1 mb-4"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-white">Add New Site</h1>
        <p className="text-xs text-zinc-400 font-mono mt-1">
          Register a domain to start tracking cookieless, privacy-friendly analytics.
        </p>
      </div>

      {!createdSite ? (
        <form
          onSubmit={handleCreateSite}
          className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4"
        >
          {error && (
            <div
              className="bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs px-3 py-2 rounded-lg font-mono"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="domain" className="block text-xs font-mono text-zinc-300">
              Domain Name
            </label>
            <input
              id="domain"
              name="domain"
              type="text"
              required
              autoFocus
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              className="w-full bg-zinc-900 border border-zinc-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none transition-all font-mono"
            />
            <p className="text-[11px] text-zinc-500 font-mono">
              Enter your website domain without protocol or path (e.g. myblog.com or app.myorg.io).
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs tracking-wide uppercase px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50 font-mono cursor-pointer"
          >
            {loading ? "Adding Site..." : "Add Site"}
          </button>
        </form>
      ) : (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div>
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
                Site Added
              </span>
              <h2 className="text-lg font-bold text-white font-mono">{createdSite.domain}</h2>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-zinc-900 border border-zinc-700 text-zinc-300">
              ID: {createdSite.id}
            </span>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-zinc-300 font-mono uppercase tracking-wider">
              1. Add Tracking Script
            </h3>
            <p className="text-xs text-zinc-400">
              Paste this lightweight (&lt;1 KB), cookieless snippet into your HTML header or before &lt;/body&gt;:
            </p>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 font-mono text-xs text-cyan-300 break-all select-all flex items-center justify-between gap-4">
              <code data-testid="embed-snippet">{embedSnippet}</code>
              <button
                type="button"
                onClick={copySnippet}
                className="shrink-0 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs px-3 py-1.5 rounded font-mono transition-colors"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-semibold text-zinc-300 font-mono uppercase tracking-wider">
              2. Verify Connection
            </h3>

            <div
              data-testid="live-status-indicator"
              className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                hasReceivedEvent
                  ? "bg-emerald-950/30 border-emerald-800/60 text-emerald-300"
                  : "bg-zinc-900/60 border-zinc-800 text-zinc-300"
              }`}
            >
              <div className="flex items-center gap-3">
                {hasReceivedEvent ? (
                  <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
                ) : (
                  <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping opacity-75" />
                )}
                <div>
                  <p className="text-xs font-medium font-mono">
                    {hasReceivedEvent
                      ? "First pageview received!"
                      : "Waiting for first pageview..."}
                  </p>
                  <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                    {hasReceivedEvent
                      ? "Your site is actively sending privacy-first analytics."
                      : "Load your website in a browser or trigger an event to confirm."}
                  </p>
                </div>
              </div>

              {hasReceivedEvent && (
                <button
                  type="button"
                  onClick={() => router.push(`/dashboard/sites/${createdSite.id}`)}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs px-4 py-2 rounded-lg font-mono transition-colors shrink-0 cursor-pointer"
                >
                  View Dashboard →
                </button>
              )}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-zinc-800/80">
            <Link
              href={`/dashboard/sites/${createdSite.id}`}
              className="text-xs font-mono text-zinc-400 hover:text-white transition-colors"
            >
              Skip to dashboard →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
