import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/src/lib/supabase-server";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: profileStats }] = await Promise.all([
    supabase
      .from("profiles")
      .select("username, email")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("profile_stats")
      .select("games_played, wins, current_streak")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const username =
    profile?.username || user.user_metadata.username || user.email?.split("@")[0];
  const gamesPlayed = profileStats?.games_played ?? 0;
  const wins = profileStats?.wins ?? 0;
  const currentStreak = profileStats?.current_streak ?? 0;
  const winRate =
    gamesPlayed > 0 ? `${Math.round((wins / gamesPlayed) * 100)}%` : "0%";

  return (
    <main className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-card p-6 shadow-[0_20px_70px_rgba(0,0,0,0.32)] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">
          Home
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
          Welcome back, {username || "Player"}!
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
          Warm up your ears, queue the next challenge, and keep your streak alive.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Games Played", value: gamesPlayed.toString() },
          { label: "Win Rate", value: winRate },
          { label: "Current Streak", value: currentStreak.toString() },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-[1.5rem] border border-white/10 bg-card p-5"
          >
            <p className="text-sm text-white/55">{item.label}</p>
            <p className="mt-3 text-3xl font-black text-white">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[1.75rem] border border-primary/20 bg-[linear-gradient(135deg,rgba(255,77,141,0.18),rgba(28,31,39,0.95),rgba(28,31,39,1))] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.3)]">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/80">
            Jump In
          </p>
          <h2 className="mt-3 text-2xl font-black text-white">Ready for a quick round?</h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-white/65">
            Start immediately with a fresh mix of tracks and race the clock.
          </p>
          <Link
            href="/dashboard/play"
            className="mt-6 inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-primary px-6 text-base font-bold text-white transition hover:bg-primary/90 sm:w-auto"
          >
            Quick Play
          </Link>
        </div>

        <div className="grid gap-4">
          <button
            type="button"
            className="rounded-[1.5rem] border border-white/10 bg-card px-5 py-5 text-left transition hover:bg-card2"
          >
            <p className="text-lg font-black text-white">Create Room</p>
            <p className="mt-2 text-sm text-white/60">
              Host a private lobby and invite friends.
            </p>
          </button>
          <button
            type="button"
            className="rounded-[1.5rem] border border-white/10 bg-card px-5 py-5 text-left transition hover:bg-card2"
          >
            <p className="text-lg font-black text-white">Join Room</p>
            <p className="mt-2 text-sm text-white/60">
              Enter a code and jump straight into the session.
            </p>
          </button>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-white/10 bg-card p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/80">
              Recent Games
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">Your latest sessions</h2>
          </div>
        </div>
        <div className="mt-5 rounded-[1.5rem] border border-dashed border-white/10 bg-card2/50 px-5 py-10 text-center">
          <p className="text-lg font-semibold text-white">No games yet</p>
          <p className="mt-2 text-sm text-white/55">
            Your recent matches will appear here after you start playing.
          </p>
        </div>
      </section>
    </main>
  );
}
