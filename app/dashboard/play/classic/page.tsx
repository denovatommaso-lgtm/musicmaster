"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BackButton } from "@/src/components/ui/BackButton";

const roundOptions = [5, 10, 20];
const eraOptions = ["mix", "60s", "70s", "80s", "90s", "2000s", "2010s", "2020s"];

export default function ClassicModeSetupPage() {
  const router = useRouter();
  const [era, setEra] = useState("mix");
  const [rounds, setRounds] = useState(10);
  const selectedEraRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    selectedEraRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, []);

  return (
    <main className="space-y-6">
      <BackButton />

      <section>
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
          Classic Mode
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
          Listen to a 30-second preview and guess the release year.
        </p>
      </section>

      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/45">
          Select Era
        </p>
        <div className="scrollbar-hide mt-5 flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 scroll-smooth">
          {eraOptions.map((option) => {
            const label = option === "mix" ? "Mix" : option;
            const isSelected = era === option;

            return (
              <button
                key={option}
                type="button"
                onClick={() => setEra(option)}
                ref={isSelected ? selectedEraRef : null}
                className={`min-h-12 min-w-24 snap-center rounded-full px-4 py-3 text-center text-sm font-bold transition ${
                  isSelected
                    ? "bg-primary text-white shadow-[0_10px_30px_rgba(255,77,141,0.35)]"
                    : "bg-card text-white/55 hover:bg-card2 hover:text-white/80"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.35em] text-white/45">
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
          onClick={() =>
            router.push(`/dashboard/play/classic/game?rounds=${rounds}&era=${era}`)
          }
          className="mt-6 flex min-h-15 w-full items-center justify-center rounded-[1.35rem] bg-[linear-gradient(135deg,#FF4D8D,#ff6ba1)] px-6 text-base font-black text-white shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_20px_45px_rgba(255,77,141,0.35)] transition hover:scale-[1.01] hover:brightness-110"
        >
          Start Game
        </button>
      </section>
    </main>
  );
}
