"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function getSafeNextUrl(rawNext: string | null, fallback = "/dashboard"): string {
  if (!rawNext) return fallback;
  if (rawNext.startsWith("/") && !rawNext.startsWith("//") && !rawNext.includes("\\")) {
    return rawNext;
  }
  return fallback;
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = getSafeNextUrl(searchParams.get("next"));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Invalid email or password");
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
        <label htmlFor="email" className="block text-xs font-medium text-zinc-300 font-mono">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          autoFocus
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@example.com"
          className="w-full bg-zinc-900 border border-zinc-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none transition-all font-mono"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-xs font-medium text-zinc-300 font-mono">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
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
        {loading ? "Authenticating..." : "Sign In"}
      </button>

      <div className="pt-2 text-center text-xs text-zinc-400 font-mono">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-cyan-400 hover:text-cyan-300 underline font-medium">
          Create account
        </Link>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col justify-center items-center p-6 selection:bg-cyan-500/20 selection:text-cyan-300">
      <div className="w-full max-w-sm">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-950/60 border border-cyan-800/60 text-cyan-400 mb-3 shadow-[0_0_24px_rgba(6,182,212,0.15)] hover:scale-105 transition-transform">
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
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-white">Spidy Analytics</h1>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Sign in to access your analytics dashboard
          </p>
        </div>

        <Suspense
          fallback={
            <div className="h-56 bg-zinc-950 border border-zinc-800/80 rounded-2xl animate-pulse" />
          }
        >
          <LoginForm />
        </Suspense>

        <div className="mt-6 text-center text-[11px] text-zinc-600 font-mono">
          Cookieless · Privacy-First · Zero Fingerprinting
        </div>
      </div>
    </div>
  );
}
