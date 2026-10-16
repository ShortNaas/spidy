"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Invalid password");
        setLoading(false);
        return;
      }

      router.push(nextUrl);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-6 shadow-2xl space-y-4"
    >
      {error && (
        <div
          data-testid="login-error"
          className="bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs px-3 py-2 rounded-lg font-mono"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="block text-xs font-medium text-zinc-300 font-mono"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoFocus
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••••••"
          className="w-full bg-zinc-900 border border-zinc-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none transition-all font-mono"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs tracking-wide uppercase py-2.5 rounded-lg transition-colors disabled:opacity-50 font-mono mt-2 cursor-pointer"
      >
        {loading ? "Authenticating..." : "Unlock Dashboard"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col justify-center items-center p-6 selection:bg-cyan-500/20 selection:text-cyan-300">
      <div className="w-full max-w-sm">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-950/60 border border-cyan-800/60 text-cyan-400 mb-3 shadow-[0_0_24px_rgba(6,182,212,0.15)]">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Spidy Analytics</h1>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Enter dashboard password to unlock metrics
          </p>
        </div>

        <Suspense fallback={<div className="h-44 bg-zinc-950 border border-zinc-800/80 rounded-2xl animate-pulse" />}>
          <LoginForm />
        </Suspense>

        <div className="mt-6 text-center text-[11px] text-zinc-600 font-mono">
          Cookieless · Privacy-First · Zero Fingerprinting
        </div>
      </div>
    </div>
  );
}
