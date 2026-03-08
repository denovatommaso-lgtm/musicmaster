"use client";

import Link from "next/link";
import { useState } from "react";

const modes = [
  {
    icon: "🎯",
    title: "Classic",
    description: "Quick-fire rounds with mixed tracks and rising pressure.",
  },
  {
    icon: "🕺",
    title: "By Decade",
    description: "Lock into an era and prove your catalog memory.",
  },
  {
    icon: "🔥",
    title: "By Genre",
    description: "Pick your lane and chase a perfect streak.",
  },
  {
    icon: "🎤",
    title: "Multiplayer",
    description: "Battle friends live and race for the top spot.",
  },
];

export function PlayModes() {
  const [toast, setToast] = useState<string | null>(null);

  function handleClick(mode: string) {
    setToast(`${mode} is coming soon.`);
    window.setTimeout(() => {
      setToast((current) => (current?.startsWith(mode) ? null : current));
    }, 2200);
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {modes.map((mode) => {
          const content = (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-2xl">
                {mode.icon}
              </div>
              <h2 className="mt-4 text-xl font-black text-white">{mode.title}</h2>
              <p className="mt-2 text-sm leading-6 text-white/60">
                {mode.description}
              </p>
            </>
          );

          if (mode.title === "Classic") {
            return (
              <Link
                key={mode.title}
                href="/dashboard/play/classic"
                className="rounded-[1.75rem] border border-white/10 bg-card p-5 text-left shadow-[0_18px_60px_rgba(0,0,0,0.3)] transition hover:border-primary/50 hover:bg-card2"
              >
                {content}
              </Link>
            );
          }

          return (
            <button
              key={mode.title}
              type="button"
              onClick={() => handleClick(mode.title)}
              className="rounded-[1.75rem] border border-white/10 bg-card p-5 text-left shadow-[0_18px_60px_rgba(0,0,0,0.3)] transition hover:border-primary/50 hover:bg-card2"
            >
              {content}
            </button>
          );
        })}
      </div>

      {toast ? (
        <div className="fixed left-1/2 top-6 z-50 -translate-x-1/2 rounded-full border border-primary/30 bg-card px-4 py-2 text-sm font-semibold text-primary shadow-[0_14px_40px_rgba(0,0,0,0.35)]">
          {toast}
        </div>
      ) : null}
    </>
  );
}
