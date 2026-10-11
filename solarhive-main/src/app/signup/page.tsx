"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function SignupPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }

    await refresh();
    router.push("/");
  };

  return (
    <div className="mx-10 mt-16 mb-16 flex justify-center">
      <div className="w-full max-w-sm rounded-2xl bg-black/5 p-8">
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-gold" />
          <h1 className="text-lg font-semibold">Create Account</h1>
        </div>
        <p className="mt-1 text-sm text-black/50">Join Solar Hive.</p>

        {error && (
          <p className="mt-4 rounded-md bg-red-500/10 px-4 py-2 text-sm text-red-600">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-semibold tracking-wide text-black/60 uppercase">
              Full Name
            </label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-md border border-black/10 bg-black/5 px-4 py-3 text-sm placeholder:text-black/30 focus:border-gold focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold tracking-wide text-black/60 uppercase">
              Email
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-md border border-black/10 bg-black/5 px-4 py-3 text-sm placeholder:text-black/30 focus:border-gold focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold tracking-wide text-black/60 uppercase">
              Password
            </label>
            <input
              required
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-md border border-black/10 bg-black/5 px-4 py-3 text-sm placeholder:text-black/30 focus:border-gold focus:outline-none"
            />
            <p className="mt-1 text-xs text-black/40">At least 8 characters.</p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-gold px-6 py-3 text-sm font-semibold text-black transition hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Creating account…" : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-black/50">
          Already have an account?{" "}
          <Link href="/login" className="text-gold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
