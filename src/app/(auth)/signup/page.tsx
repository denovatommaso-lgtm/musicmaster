"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsLoading(false);
      return;
    }

    const user = data.user;

    if (!user) {
      setError("Signup succeeded, but no user was returned.");
      setIsLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email ?? email,
      username,
    });

    if (profileError) {
      setError(profileError.message);
      setIsLoading(false);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0E0F11] px-4 py-10 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,77,141,0.18),_transparent_28%),radial-gradient(circle_at_90%_18%,_rgba(124,242,177,0.12),_transparent_24%),radial-gradient(circle_at_bottom,_rgba(255,211,106,0.12),_transparent_30%)]" />
      <section className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/10 bg-[#1C1F27]/95 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)] backdrop-blur sm:p-8">
        <div className="absolute left-0 top-0 h-40 w-40 rounded-full bg-[#7CF2B1]/15 blur-3xl" />
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
                Create Account
              </p>
            </div>
          </Link>

          <div className="mt-8">
            <h1 className="text-3xl font-black tracking-tight">Sign Up</h1>
            <p className="mt-2 text-sm leading-6 text-white/60">
              Claim your username, build your streak, and start climbing.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-white/70">
                Username
              </span>
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#232632] px-4 py-3 text-white outline-none transition focus:border-[#FF4D8D] focus:ring-2 focus:ring-[#FF4D8D]/30"
                placeholder="pick a username"
                minLength={3}
                required
              />
            </label>

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
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#232632] px-4 py-3 text-white outline-none transition focus:border-[#FF4D8D] focus:ring-2 focus:ring-[#FF4D8D]/30"
                placeholder="Create a password"
                minLength={6}
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-white/70">
                Confirm Password
              </span>
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#232632] px-4 py-3 text-white outline-none transition focus:border-[#FF4D8D] focus:ring-2 focus:ring-[#FF4D8D]/30"
                placeholder="Re-enter your password"
                minLength={6}
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
              {isLoading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-white/60">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#7CF2B1] transition hover:text-white"
            >
              Login
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
