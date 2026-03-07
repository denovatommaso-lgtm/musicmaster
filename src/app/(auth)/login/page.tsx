"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/src/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword(
        {
          email,
          password,
        },
      );

      console.log("MusicMaster login result", {
        userId: data.user?.id,
        hasSession: Boolean(data.session),
        error: signInError?.message ?? null,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      if (!data.session) {
        setError("Login succeeded, but no active session was created.");
        return;
      }

      const destination = searchParams.get("next") || "/dashboard";
      router.replace(destination);
      router.refresh();
    } catch (unknownError) {
      const message =
        unknownError instanceof Error
          ? unknownError.message
          : "Something went wrong while logging in.";
      console.error("MusicMaster login failed", unknownError);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0E0F11] px-4 py-10 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,77,141,0.18),_transparent_28%),radial-gradient(circle_at_85%_15%,_rgba(124,242,177,0.12),_transparent_22%),radial-gradient(circle_at_bottom,_rgba(255,211,106,0.1),_transparent_28%)]" />
      <section className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-[#1C1F27]/95 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)] backdrop-blur sm:p-8">
        <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-[#FF4D8D]/20 blur-3xl" />
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
                Welcome Back
              </p>
            </div>
          </Link>

          <div className="mt-8">
            <h1 className="text-3xl font-black tracking-tight">Log In</h1>
            <p className="mt-2 text-sm leading-6 text-white/60">
              Drop back into the game and pick up your streak.
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

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-white/70">
                Password
              </span>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#232632] px-4 py-3 text-white outline-none transition focus:border-[#FF4D8D] focus:ring-2 focus:ring-[#FF4D8D]/30"
                placeholder="Enter your password"
                required
              />
            </label>

            {error ? (
              <p className="rounded-2xl border border-[#FF4D8D]/30 bg-[#FF4D8D]/10 px-4 py-3 text-sm text-[#ffd0e1]">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="flex min-h-13 w-full items-center justify-center rounded-2xl bg-[#FF4D8D] px-4 py-3 text-base font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-5 flex items-center justify-between gap-4 text-sm">
            <Link
              href="/forgot-password"
              className="font-medium text-[#FFD36A] transition hover:text-white"
            >
              Forgot password?
            </Link>
            <p className="text-right text-white/60">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-semibold text-[#7CF2B1] transition hover:text-white"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
