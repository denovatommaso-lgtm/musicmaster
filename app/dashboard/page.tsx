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

  const gamesPlayed = profileStats?.games_played ?? 0;
  const wins = profileStats?.wins ?? 0;
  const currentStreak = profileStats?.current_streak ?? 0;
  const winRate =
    gamesPlayed > 0 ? `${Math.round((wins / gamesPlayed) * 100)}%` : "0%";
  const stats = [
    {
      label: "Games Played",
      value: gamesPlayed.toString(),
      icon: "🎮",
      accent: "bg-primary",
    },
    {
      label: "Win Rate",
      value: winRate,
      icon: "🏆",
      accent: "bg-yellow",
    },
    {
      label: "Current Streak",
      value: currentStreak.toString(),
      icon: "🔥",
      accent: "bg-green",
    },
  ];

  return (
    <main className="space-y-5">
      <section className="rounded-[2rem] border border-white/10 bg-card p-6 shadow-[0_20px_70px_rgba(0,0,0,0.32)] sm:p-7">
        <h1 className="text-4xl font-black tracking-tight text-primary sm:text-5xl">
          MusicMaster
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
          What&apos;s your score today?
        </p>
      </section>

      <section className="grid grid-cols-3 gap-2 text-center sm:gap-4">
        {stats.map((item) => (
          <div key={item.label} className="flex flex-col items-center px-1 py-2">
            <div className={`mb-4 h-1.5 w-10 rounded-full ${item.accent}`} />
            <div className="text-2xl sm:text-3xl">{item.icon}</div>
            <p className="mt-3 text-2xl font-black text-white sm:text-4xl">
              {item.value}
            </p>
            <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.22em] text-white/45 sm:text-xs">
              {item.label}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-[1.85rem] border border-primary/20 bg-[linear-gradient(145deg,rgba(255,77,141,0.24),rgba(28,31,39,0.96),rgba(28,31,39,1))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.34)]">
        <div className="absolute" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/80">
            Jump In
          </p>
          <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
            Ready for a quick round?
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-white/65">
            Start immediately with a fresh mix of tracks and race the clock.
          </p>
        </div>
        <Link
          href="/dashboard/play"
          className="mt-6 flex min-h-15 w-full items-center justify-center rounded-[1.35rem] bg-[linear-gradient(135deg,#FF4D8D,#ff6ba1)] px-6 text-base font-black text-white shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_20px_45px_rgba(255,77,141,0.35)] transition hover:scale-[1.01] hover:brightness-110"
        >
          Quick Play
        </Link>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            className="rounded-[1.35rem] border border-white/10 bg-card px-4 py-4 text-left transition hover:border-primary/30 hover:bg-card2"
          >
            <p className="text-base font-black text-white">Create Room</p>
            <p className="mt-1 text-sm text-white/55">Host friends instantly.</p>
          </button>
          <button
            type="button"
            className="rounded-[1.35rem] border border-white/10 bg-card px-4 py-4 text-left transition hover:border-primary/30 hover:bg-card2"
          >
            <p className="text-base font-black text-white">Join Room</p>
            <p className="mt-1 text-sm text-white/55">Enter a room code.</p>
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
