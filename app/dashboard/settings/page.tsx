"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SettingsPage() {
  const router = useRouter();

  // Change password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);
  const [pwLoading, setPwLoading] = useState(false);

  // Delete account state
  const [confirmEmail, setConfirmEmail] = useState("");
  const [delError, setDelError] = useState<string | null>(null);
  const [delLoading, setDelLoading] = useState(false);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(null);

    if (newPassword.length < 10) {
      setPwError("New password must be at least 10 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match");
      return;
    }

    setPwLoading(true);

    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setPwError(data.error || "Failed to update password");
        setPwLoading(false);
        return;
      }

      setPwSuccess("Password updated successfully. Other active sessions were signed out.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPwLoading(false);
    } catch {
      setPwError("Network error. Please try again.");
      setPwLoading(false);
    }
  }

  async function handleDeleteAccount(e: React.FormEvent) {
    e.preventDefault();
    setDelError(null);

    if (!confirmEmail.trim()) {
      setDelError("Please enter your email to confirm deletion");
      return;
    }

    setDelLoading(true);

    try {
      const res = await fetch("/api/auth/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmEmail }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setDelError(data.error || "Failed to delete account");
        setDelLoading(false);
        return;
      }

      // Successfully deleted, redirect to home/register
      router.push("/register");
      router.refresh();
    } catch {
      setDelError("Network error. Please try again.");
      setDelLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-8">
      <div>
        <Link
          href="/dashboard"
          className="text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors inline-flex items-center gap-1 mb-4"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-white">Account Settings</h1>
        <p className="text-xs text-zinc-400 font-mono mt-1">
          Manage your account credentials and security preferences.
        </p>
      </div>

      {/* Change Password Card */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
          Change Password
        </h2>
        <p className="text-xs text-zinc-400">
          Updating your password will automatically sign out all other active sessions across your devices.
        </p>

        {pwError && (
          <div
            className="bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs px-3 py-2 rounded-lg font-mono"
            role="alert"
          >
            {pwError}
          </div>
        )}

        {pwSuccess && (
          <div
            className="bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs px-3 py-2 rounded-lg font-mono"
            role="status"
          >
            {pwSuccess}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="current-pw" className="block text-xs font-mono text-zinc-300">
              Current Password
            </label>
            <input
              id="current-pw"
              type="password"
              autoComplete="current-password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none transition-all font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="new-pw" className="block text-xs font-mono text-zinc-300">
                New Password <span className="text-[10px] text-zinc-500">(min 10)</span>
              </label>
              <input
                id="new-pw"
                type="password"
                autoComplete="new-password"
                required
                minLength={10}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none transition-all font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirm-pw" className="block text-xs font-mono text-zinc-300">
                Confirm New Password
              </label>
              <input
                id="confirm-pw"
                type="password"
                autoComplete="new-password"
                required
                minLength={10}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none transition-all font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={pwLoading}
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs tracking-wide uppercase px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50 font-mono cursor-pointer"
          >
            {pwLoading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>

      {/* Danger Zone: Delete Account */}
      <div className="bg-rose-950/10 border border-rose-900/40 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-semibold text-rose-400 font-mono uppercase tracking-wider">
          Danger Zone: Delete Account
        </h2>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Permanently delete your account, your registered sites, all tracking sessions, and all collected analytics events. This action cannot be undone.
        </p>

        {delError && (
          <div
            className="bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs px-3 py-2 rounded-lg font-mono"
            role="alert"
          >
            {delError}
          </div>
        )}

        <form onSubmit={handleDeleteAccount} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="confirm-email" className="block text-xs font-mono text-zinc-300">
              Type your email address to confirm deletion
            </label>
            <input
              id="confirm-email"
              type="email"
              required
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full bg-zinc-900 border border-rose-900/50 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none transition-all font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={delLoading}
            className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs tracking-wide uppercase px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50 font-mono cursor-pointer"
          >
            {delLoading ? "Deleting Account..." : "Permanently Delete Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
