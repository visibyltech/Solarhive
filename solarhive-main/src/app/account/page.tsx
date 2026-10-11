"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AccountPage() {
  const { user, loading } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return <div className="mx-10 mt-16 mb-16 text-center text-sm text-black/50">Loading…</div>;
  }

  if (!user) {
    return (
      <div className="mx-10 mt-16 mb-16 rounded-3xl bg-black/5 py-16 text-center">
        <h1 className="text-xl font-semibold">Sign in required</h1>
        <p className="mt-2 text-sm text-black/60">Sign in to manage your account.</p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-md bg-gold px-6 py-3 text-sm font-semibold text-black transition hover:bg-gold/90"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("New passwords don't match");
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }

    setSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="mx-10 mt-16 mb-16 flex justify-center">
      <div className="w-full max-w-sm rounded-2xl bg-black/5 p-8">
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-gold" />
          <h1 className="text-lg font-semibold">My Account</h1>
        </div>
        <p className="mt-1 text-sm text-black/50">Signed in as {user.email}</p>

        <h2 className="mt-6 text-sm font-semibold tracking-wide text-black/70 uppercase">
          Change Password
        </h2>

        {error && (
          <p className="mt-4 rounded-md bg-red-500/10 px-4 py-2 text-sm text-red-600">{error}</p>
        )}
        {success && (
          <p className="mt-4 rounded-md bg-green-500/10 px-4 py-2 text-sm text-green-600">
            Password updated successfully.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold tracking-wide text-black/60 uppercase">
              Current Password
            </label>
            <input
              required
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-2 w-full rounded-md border border-black/10 bg-black/5 px-4 py-3 text-sm placeholder:text-black/30 focus:border-gold focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold tracking-wide text-black/60 uppercase">
              New Password
            </label>
            <input
              required
              type="password"
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-2 w-full rounded-md border border-black/10 bg-black/5 px-4 py-3 text-sm placeholder:text-black/30 focus:border-gold focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold tracking-wide text-black/60 uppercase">
              Confirm New Password
            </label>
            <input
              required
              type="password"
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-2 w-full rounded-md border border-black/10 bg-black/5 px-4 py-3 text-sm placeholder:text-black/30 focus:border-gold focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-gold px-6 py-3 text-sm font-semibold text-black transition hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Updating…" : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
