"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const roundOptions = [5, 10, 20];

export default function ClassicModeSetupPage() {
  const router = useRouter();
  const [rounds, setRounds] = useState(10);

  return (
    <main className="space-y-6">
      <Link
        href="/dashboard/play"
        className="inline-flex items-center gap-2 text-sm font-semibold text-white/60 transition hover:text-white"
      >
        <span aria-hidden="true">←</span>
        Back
      </Link>

      <section className="rounded-[2rem] border border-white/10 bg-card p-6 shadow-[0_20px_70px_rgba(0,0,0,0.32)] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">
          Classic Mode
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
          Classic Mode
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
          Listen to a 30-second preview and guess the release year.
        </p>
      </section>

      <section className="rounded-[1.85rem] border border-white/10 bg-card p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/45">
          Select Rounds
        </p>
        <div className="mt-5 grid grid-cols-3 gap-3">
          {roundOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setRounds(option)}
              className={`rounded-[1.35rem] border px-4 py-4 text-center text-lg font-black transition ${
                rounds === option
                  ? "border-primary bg-primary text-white shadow-[0_18px_45px_rgba(255,77,141,0.28)]"
                  : "border-white/10 bg-card2 text-white/80 hover:border-primary/30"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => router.push(`/dashboard/play/classic/game?rounds=${rounds}`)}
          className="mt-6 flex min-h-15 w-full items-center justify-center rounded-[1.35rem] bg-[linear-gradient(135deg,#FF4D8D,#ff6ba1)] px-6 text-base font-black text-white shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_20px_45px_rgba(255,77,141,0.35)] transition hover:scale-[1.01] hover:brightness-110"
        >
          Start Game
        </button>
      </section>
    </main>
  );
}
