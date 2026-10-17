"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Globe } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { EmbedSnippetModal } from "@/components/dashboard/EmbedSnippetModal";

export default function NewSitePage() {
  const router = useRouter();
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Once site is created
  const [createdSite, setCreatedSite] = useState<{ id: string; domain: string } | null>(null);
  const [hasReceivedEvent, setHasReceivedEvent] = useState(false);
  const [showSnippetModal, setShowSnippetModal] = useState(false);
  const showSnippetBtnRef = useRef<HTMLButtonElement>(null);
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
      setShowSnippetModal(true);
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

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6 font-sans">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="text-[13px] font-sans text-muted hover:text-white transition-colors duration-150 inline-flex items-center gap-1.5 mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform duration-150 group-hover:-translate-x-0.5" />
          <span>Back to dashboard</span>
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Add New Site</h1>
        <p className="text-[13px] text-muted mt-1">
          Register a domain to start tracking cookieless, privacy-friendly analytics.
        </p>
      </div>

      {!createdSite ? (
        <Card
          icon={<Globe className="w-5 h-5 text-muted" />}
          title="Domain configuration"
          subtitle="Enter your website domain"
        >
          <form onSubmit={handleCreateSite} className="space-y-5 mt-2">
            {error && (
              <div
                className="bg-danger/10 border border-danger/30 text-danger text-[12px] px-3.5 py-2.5 rounded-xl font-mono leading-relaxed"
                role="alert"
              >
                {error}
              </div>
            )}

            <Input
              id="domain"
              name="domain"
              label="Domain name"
              type="text"
              required
              autoFocus
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              hint="Enter your website domain without protocol or path (e.g. myblog.com or app.myorg.io)."
            />

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="cursor-pointer"
            >
              {loading ? "Adding site..." : "Add site"}
            </Button>
          </form>
        </Card>
      ) : (
        <Card
          icon={<Globe className="w-5 h-5 text-white" />}
          title={createdSite.domain}
          subtitle={`ID: ${createdSite.id}`}
        >
          <div className="space-y-6 mt-2">
            {/* Live Verification Indicator */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-muted font-semibold">
                  Connection Status
                </span>
              </div>

              <div
                data-testid="live-status-indicator"
                className={`p-4 rounded-2xl border transition-colors duration-150 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  hasReceivedEvent
                    ? "bg-positive/10 border-positive/30 text-white"
                    : "bg-raised border-border text-text"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  {hasReceivedEvent ? (
                    <span className="w-3 h-3 rounded-full bg-positive shrink-0" />
                  ) : (
                    <span className="relative flex h-3 w-3 shrink-0">
                      <span className="animate-live-pulse absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-white shadow-[0_0_12px_rgba(255,255,255,0.6)]" />
                    </span>
                  )}
                  <div>
                    <p className="text-[13px] font-medium font-sans">
                      {hasReceivedEvent
                        ? "First pageview received!"
                        : "Waiting for first pageview..."}
                    </p>
                    <p className="text-[12px] text-muted font-sans mt-0.5">
                      {hasReceivedEvent
                        ? "Your site is actively sending privacy-first analytics."
                        : "Load your website in a browser or trigger a pageview to confirm."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <Button
                    ref={showSnippetBtnRef}
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSnippetModal(true)}
                  >
                    Show snippet
                  </Button>

                  {hasReceivedEvent && (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => router.push(`/dashboard/sites/${createdSite.id}`)}
                    >
                      View dashboard →
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Footer action */}
            <div className="pt-2 flex items-center justify-between border-t border-border">
              <Link
                href={`/dashboard/sites/${createdSite.id}`}
                className="text-[13px] font-sans text-muted hover:text-white transition-colors duration-150"
              >
                Skip to dashboard →
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Embed script modal */}
      {createdSite && (
        <EmbedSnippetModal
          isOpen={showSnippetModal}
          onClose={() => setShowSnippetModal(false)}
          siteId={createdSite.id}
          triggerRef={showSnippetBtnRef}
        />
      )}
    </div>
  );
}
