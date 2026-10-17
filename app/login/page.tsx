"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Wordmark } from "@/components/ui/Wordmark";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

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
    <div className="bg-surface border border-border hover:border-border-hover rounded-4xl p-8 sheen shadow-2xl transition-colors duration-150">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div
            data-testid="login-error"
            className="bg-danger/10 border border-danger/30 text-danger text-[12px] px-3.5 py-2.5 rounded-xl font-mono leading-relaxed"
            role="alert"
          >
            {error}
          </div>
        )}

        <Input
          label="Email address"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          autoFocus
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@example.com"
        />

        <Input
          label="Password"
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••••••"
        />

        <Button
          type="submit"
          variant="primary"
          disabled={loading}
          className="w-full mt-2 cursor-pointer"
        >
          {loading ? "Authenticating..." : "Sign in"}
        </Button>

        <div className="pt-2 text-center text-[13px] text-muted font-sans">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-white hover:text-accent transition-colors underline font-medium"
          >
            Create account
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-canvas text-text flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans selection:bg-accent/20 selection:text-white">
      {/* Background dot-grid and subtle light beam */}
      <div className="absolute inset-0 dotgrid opacity-60 pointer-events-none" aria-hidden="true" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[520px] h-[380px] beam pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-[420px]">
        {/* Brand header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <Wordmark href="/" className="mb-3 text-[22px]" />
          <h1 className="font-sans font-medium text-[20px] text-white">Sign In</h1>
          <p className="font-sans text-[13px] text-muted mt-1">
            Access your cookieless analytics cockpit
          </p>
        </div>

        <Suspense
          fallback={
            <div className="h-64 bg-surface border border-border rounded-4xl animate-pulse" />
          }
        >
          <LoginForm />
        </Suspense>

        <div className="mt-8 text-center text-[12px] text-faint font-mono">
          Cookieless · Privacy-First · Zero Fingerprinting
        </div>
      </div>
    </div>
  );
}
