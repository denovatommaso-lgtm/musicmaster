"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { supabase } from "@/src/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    const redirectTo =
      typeof window === "undefined"
        ? undefined
        : `${window.location.origin}/login`;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      redirectTo ? { redirectTo } : undefined,
    );

    if (resetError) {
      setError(resetError.message);
      setIsLoading(false);
      return;
    }

    setSuccess("Reset link sent. Check your inbox for the recovery email.");
    setIsLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0E0F11] px-4 py-10 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,211,106,0.14),_transparent_22%),radial-gradient(circle_at_80%_20%,_rgba(255,77,141,0.16),_transparent_22%),radial-gradient(circle_at_bottom,_rgba(124,242,177,0.12),_transparent_26%)]" />
      <section className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-[#1C1F27]/95 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)] backdrop-blur sm:p-8">
        <div className="absolute bottom-0 right-0 h-32 w-32 rounded-full bg-[#FFD36A]/15 blur-3xl" />
        <div className="relative">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#FF4D8D] via-[#d946ef] to-[#7CF2B1] text-lg font-black shadow-[0_0_30px_rgba(255,77,141,0.35)]">
              ♫
            </span>
            <div>
              <p className="text-xl font-black uppercase tracking-[0.2em]">
                MusicMaster
              </p>
              <p className="text-xs uppercase tracking-[0.35em] text-white/45">
                Password Recovery
              </p>
            </div>
          </Link>

          <div className="mt-8">
            <h1 className="text-3xl font-black tracking-tight">
              Forgot Password
            </h1>
            <p className="mt-2 text-sm leading-6 text-white/60">
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-white/70">
                Email
              </span>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#232632] px-4 py-3 text-white outline-none transition focus:border-[#FF4D8D] focus:ring-2 focus:ring-[#FF4D8D]/30"
                placeholder="you@example.com"
                required
              />
            </label>

            {error ? (
              <p className="rounded-2xl border border-[#FF4D8D]/30 bg-[#FF4D8D]/10 px-4 py-3 text-sm text-[#ffd0e1]">
                {error}
              </p>
            ) : null}

            {success ? (
              <p className="rounded-2xl border border-[#7CF2B1]/30 bg-[#7CF2B1]/10 px-4 py-3 text-sm text-[#c8ffe1]">
                {success}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="flex min-h-13 w-full items-center justify-center rounded-2xl bg-[#FF4D8D] px-4 py-3 text-base font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-white/60">
            <Link
              href="/login"
              className="font-semibold text-[#FFD36A] transition hover:text-white"
            >
              Back to login
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
