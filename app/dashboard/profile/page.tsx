import { redirect } from "next/navigation";
import { LogoutButton } from "../_components/logout-button";
import { createSupabaseServerClient } from "@/src/lib/supabase-server";

export default async function DashboardProfilePage() {
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
      .select("games_played, wins, best_streak")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const username =
    profile?.username || user.user_metadata.username || user.email?.split("@")[0] || "Player";
  const email = profile?.email || user.email || "No email";
  const initials = username.slice(0, 2).toUpperCase();
  const gamesPlayed = profileStats?.games_played ?? 0;
  const wins = profileStats?.wins ?? 0;
  const bestStreak = profileStats?.best_streak ?? 0;

  return (
    <main className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-card p-6 shadow-[0_20px_70px_rgba(0,0,0,0.32)] sm:p-8">
        <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:gap-5 sm:text-left">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-3xl font-black text-white shadow-[0_0_40px_rgba(255,77,141,0.35)]">
            {initials}
          </div>
          <div className="mt-4 sm:mt-0">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">
              Profile
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white">
              {username}
            </h1>
            <p className="mt-2 text-sm text-white/60">{email}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Games Played", value: gamesPlayed.toString() },
          { label: "Wins", value: wins.toString() },
          { label: "Best Streak", value: bestStreak.toString() },
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

      <section className="rounded-[1.75rem] border border-white/10 bg-card p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/80">
          Settings
        </p>
        <div className="mt-5 rounded-[1.5rem] border border-white/8 bg-card2 px-4 py-4">
          <p className="text-lg font-black text-white">Account</p>
          <p className="mt-2 text-sm text-white/60">
            Sign out on this device when you&apos;re done playing.
          </p>
          <div className="mt-5">
            <LogoutButton />
          </div>
        </div>
      </section>
    </main>
  );
}
