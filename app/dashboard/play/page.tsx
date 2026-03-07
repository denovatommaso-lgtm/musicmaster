import { PlayModes } from "../_components/play-modes";

export default function DashboardPlayPage() {
  return (
    <main className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-card p-6 shadow-[0_20px_70px_rgba(0,0,0,0.32)] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">
          Play
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
          Pick your mode
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
          Choose how you want to play tonight. Solo practice, themed rounds, or
          multiplayer chaos.
        </p>
      </section>

      <PlayModes />
    </main>
  );
}
