import Link from "next/link";

export default function Home() {
  const notes = [
    { symbol: "♪", classes: "left-[8%] top-[14%] text-primary/70" },
    { symbol: "♫", classes: "right-[12%] top-[20%] text-yellow/70" },
    { symbol: "♬", classes: "left-[14%] bottom-[24%] text-green/60" },
    { symbol: "♩", classes: "right-[20%] bottom-[18%] text-white/45" },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,77,141,0.18),_transparent_30%),radial-gradient(circle_at_80%_20%,_rgba(255,211,106,0.14),_transparent_24%),radial-gradient(circle_at_bottom,_rgba(124,242,177,0.12),_transparent_35%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,_rgba(14,15,17,0.2),_rgba(14,15,17,0.88)_45%,_rgba(14,15,17,1))]" />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-16 h-56 w-56 animate-pulse rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-[-12%] top-1/3 h-72 w-72 animate-pulse rounded-full bg-yellow/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 animate-pulse rounded-full bg-green/15 blur-3xl" />
        {notes.map((note) => (
          <div
            key={`${note.symbol}-${note.classes}`}
            className={`absolute text-3xl font-black drop-shadow-[0_0_30px_currentColor] motion-safe:animate-bounce sm:text-5xl ${note.classes}`}
          >
            {note.symbol}
          </div>
        ))}
      </div>

      <section className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 pb-10 pt-6 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-card/80 px-4 py-2 backdrop-blur">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg shadow-[0_0_30px_rgba(255,77,141,0.45)]">
              ♫
            </div>
            <div>
              <p className="text-lg font-black tracking-[0.18em] text-white uppercase">
                MusicMaster
              </p>
              <p className="text-[10px] uppercase tracking-[0.35em] text-yellow/70">
                Guess. Compete. Repeat.
              </p>
            </div>
          </div>
        </header>

        <div className="flex flex-1 items-center py-12 sm:py-16">
          <div className="grid w-full gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                Party Mode Ready
              </div>
              <h1 className="text-5xl font-black leading-[0.9] tracking-tight text-white sm:text-6xl lg:text-8xl">
                MusicMaster
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-white/70 sm:text-xl">
                How well do you know your music? Jump into fast, addictive
                rounds, recognize songs in seconds, and prove you own the aux.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#play"
                  className="inline-flex min-h-14 items-center justify-center rounded-full bg-primary px-8 text-base font-bold text-white shadow-[0_12px_40px_rgba(255,77,141,0.35)] transition-transform duration-200 hover:scale-[1.02] hover:bg-primary/90"
                >
                  Play Now
                </a>
                <Link
                  href="/login"
                  className="inline-flex min-h-14 items-center justify-center rounded-full border border-white/15 bg-card px-8 text-base font-semibold text-white backdrop-blur transition-colors duration-200 hover:bg-card2"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex min-h-14 items-center justify-center rounded-full border border-green/30 bg-green/10 px-8 text-base font-semibold text-green transition-colors duration-200 hover:bg-green/20"
                >
                  Sign Up
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 rounded-[2rem] bg-[linear-gradient(135deg,rgba(255,77,141,0.2),rgba(255,211,106,0.12),rgba(124,242,177,0.18))] blur-2xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-card p-5 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-6">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/45">
                  <span>Live Challenge</span>
                  <span>Round 07</span>
                </div>

                <div className="mt-6 rounded-[1.5rem] bg-card2 p-5 ring-1 ring-white/8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/50">Now Playing</p>
                      <p className="mt-1 text-2xl font-bold text-white">
                        Mystery Track
                      </p>
                    </div>
                    <div className="rounded-full bg-green/15 px-3 py-1 text-sm font-semibold text-green">
                      +240 pts
                    </div>
                  </div>

                  <div className="mt-6 flex items-end gap-2">
                    {[40, 70, 52, 88, 62, 95, 58, 76, 48, 84, 66, 92].map(
                      (height, index) => (
                        <div
                          key={height + index}
                          className="flex-1 animate-pulse rounded-full bg-[linear-gradient(to_top,#FF4D8D,#FFD36A,#7CF2B1)]"
                          style={{ height: `${height}px` }}
                        />
                      ),
                    )}
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-white/45">
                        Players
                      </p>
                      <p className="mt-2 text-2xl font-black text-white">12</p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-white/45">
                        Streak
                      </p>
                      <p className="mt-2 text-2xl font-black text-white">9</p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-white/45">
                        Genre
                      </p>
                      <p className="mt-2 text-2xl font-black text-white">
                        Pop
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between rounded-[1.25rem] border border-white/8 bg-card2 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Weekend Tournament
                    </p>
                    <p className="text-sm text-white/50">
                      Beat your friends and climb the leaderboard.
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.3em] text-yellow/60">
                      Prize Pool
                    </p>
                    <p className="text-lg font-black text-yellow">Bragging Rights</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
