"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, KeyRound, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

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
    <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6 space-y-8 font-sans">
      <div>
        <Link
          href="/dashboard"
          className="text-[13px] font-sans text-muted hover:text-white transition-colors duration-150 inline-flex items-center gap-1.5 mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform duration-150 group-hover:-translate-x-0.5" />
          <span>Back to dashboard</span>
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Account Settings</h1>
        <p className="text-[13px] text-muted mt-1">
          Manage your account credentials and security preferences.
        </p>
      </div>

      {/* Change Password Card */}
      <Card
        icon={<KeyRound className="w-5 h-5 text-muted" />}
        title="Change password"
        subtitle="Updating your password will sign out other active sessions"
      >
        <form onSubmit={handlePasswordChange} className="space-y-4 mt-2">
          {pwError && (
            <div
              className="bg-danger/10 border border-danger/30 text-danger text-[12px] px-3.5 py-2.5 rounded-xl font-mono leading-relaxed"
              role="alert"
            >
              {pwError}
            </div>
          )}

          {pwSuccess && (
            <div
              className="bg-positive/10 border border-positive/30 text-positive text-[12px] px-3.5 py-2.5 rounded-xl font-mono leading-relaxed"
              role="status"
            >
              {pwSuccess}
            </div>
          )}

          <Input
            id="current-pw"
            label="Current password"
            type="password"
            autoComplete="current-password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="new-pw"
              label="New password"
              type="password"
              autoComplete="new-password"
              required
              minLength={10}
              hint="Minimum 10 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <Input
              id="confirm-pw"
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              required
              minLength={10}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={pwLoading}
            className="cursor-pointer"
          >
            {pwLoading ? "Updating..." : "Update password"}
          </Button>
        </form>
      </Card>

      {/* Danger Zone: Delete Account */}
      <Card
        className="border-danger/30"
        icon={<AlertTriangle className="w-5 h-5 text-danger" />}
        title="Delete account"
        subtitle="Permanently remove your account, sites, and analytics events"
      >
        <form onSubmit={handleDeleteAccount} className="space-y-4 mt-2">
          <p className="text-[13px] text-muted leading-relaxed">
            Permanently delete your account, your registered sites, all tracking sessions, and all collected analytics events. This action cannot be undone.
          </p>

          {delError && (
            <div
              className="bg-danger/10 border border-danger/30 text-danger text-[12px] px-3.5 py-2.5 rounded-xl font-mono leading-relaxed"
              role="alert"
            >
              {delError}
            </div>
          )}

          <Input
            id="confirm-email"
            label="Type your email address to confirm deletion"
            type="email"
            required
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            placeholder="user@example.com"
          />

          <Button
            type="submit"
            variant="danger"
            disabled={delLoading}
            className="cursor-pointer"
          >
            {delLoading ? "Deleting account..." : "Permanently delete account"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
