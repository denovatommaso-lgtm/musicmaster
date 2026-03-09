"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type Song = {
  id: string;
  title: string;
  artist: string;
  preview_url: string | null;
  correct_year: number;
  option_years: number[];
  album_art: string | null;
};

type Props = {
  rounds: number;
  era: string;
};

const PREVIEW_DURATION = 30;

function scoreGuess(guess: number, correctYear: number) {
  const diff = Math.abs(guess - correctYear);

  if (diff === 0) return 5;
  if (diff <= 2) return 3;
  if (diff <= 5) return 1;
  return 0;
}

export function ClassicGameClient({ rounds, era }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stopTimeoutRef = useRef<number | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [lastPoints, setLastPoints] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadSongs() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/game/classic?rounds=${rounds}&era=${era}`);
        const result = (await response.json()) as { songs?: Song[]; error?: string };

        if (!response.ok || !result.songs) {
          throw new Error(result.error ?? "Failed to load songs.");
        }

        if (isMounted) {
          setSongs(result.songs);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error ? loadError.message : "Failed to load game.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSongs();

    return () => {
      isMounted = false;
    };
  }, [era, rounds]);

  useEffect(() => {
    if (!songs.length) {
      return;
    }

    if (currentIndex >= songs.length) {
      return;
    }

    const previewUrl = songs[currentIndex]?.preview_url;

    if (!previewUrl) {
      setCurrentIndex((current) => current + 1);
      return;
    }

    const audio = new Audio(previewUrl);
    audioRef.current = audio;

    const syncProgress = () => {
      const seconds = Math.min(audio.currentTime, PREVIEW_DURATION);
      setProgress((seconds / PREVIEW_DURATION) * 100);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(100);
    };

    audio.addEventListener("timeupdate", syncProgress);
    audio.addEventListener("ended", handleEnded);

    setSelectedYear(null);
    setIsAnswered(false);
    setLastPoints(null);
    setIsPlaying(false);
    setProgress(0);

    return () => {
      if (stopTimeoutRef.current) {
        window.clearTimeout(stopTimeoutRef.current);
      }
      audio.pause();
      audio.currentTime = 0;
      audio.removeEventListener("timeupdate", syncProgress);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentIndex, songs]);

  const song = songs[currentIndex];
  const isComplete = useMemo(
    () => songs.length > 0 && currentIndex >= songs.length,
    [currentIndex, songs.length],
  );

  async function handlePlay() {
    const audio = audioRef.current;

    if (!audio || isAnswered) {
      return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    audio.currentTime = 0;
    setProgress(0);

    try {
      await audio.play();
      setIsPlaying(true);
      stopTimeoutRef.current = window.setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
        setIsPlaying(false);
      }, PREVIEW_DURATION * 1000);
    } catch {
      setError("Preview could not be played on this device.");
    }
  }

  function handleSubmit() {
    if (selectedYear === null || !song) {
      return;
    }

    const earned = scoreGuess(selectedYear, song.correct_year);
    setScore((current) => current + earned);
    setLastPoints(earned);
    setIsAnswered(true);
    setIsPlaying(false);
    audioRef.current?.pause();
  }

  function handleNextRound() {
    setCurrentIndex((current) => current + 1);
  }

  if (isLoading) {
    return (
      <main className="space-y-6">
        <div className="rounded-[2rem] border border-white/10 bg-card p-6 text-white/70">
          Loading classic mode...
        </div>
      </main>
    );
  }

  if (error && !songs.length) {
    return (
      <main className="space-y-6">
        <Link
          href="/dashboard/play/classic"
          className="inline-flex items-center gap-2 text-sm font-semibold text-white/60 transition hover:text-white"
        >
          <span aria-hidden="true">←</span>
          Back
        </Link>
        <div className="rounded-[2rem] border border-primary/20 bg-card p-6 text-[#ffd0e1]">
          {error}
        </div>
      </main>
    );
  }

  if (isComplete) {
    return (
      <main className="space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-card p-6 text-center shadow-[0_20px_70px_rgba(0,0,0,0.32)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">
            Final Score
          </p>
          <h1 className="mt-3 text-4xl font-black text-white sm:text-5xl">
            {score} pts
          </h1>
          <p className="mt-3 text-sm text-white/60">
            You finished {rounds} rounds of Classic Mode.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link
              href={`/dashboard/play/classic/game?rounds=${rounds}&era=${era}`}
              className="flex min-h-14 items-center justify-center rounded-[1.25rem] bg-[linear-gradient(135deg,#FF4D8D,#ff6ba1)] px-6 text-base font-black text-white shadow-[0_18px_45px_rgba(255,77,141,0.28)]"
            >
              Play Again
            </Link>
            <Link
              href="/dashboard"
              className="flex min-h-14 items-center justify-center rounded-[1.25rem] border border-white/10 bg-card2 px-6 text-base font-bold text-white"
            >
              Back to Home
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (!song) {
    return null;
  }

  return (
    <main className="space-y-6">
      <section className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">
            Round {currentIndex + 1} of {songs.length}
          </p>
          <h1 className="mt-2 text-3xl font-black text-white">Classic Mode</h1>
        </div>
        <div className="rounded-full border border-white/10 bg-card px-4 py-2 text-sm font-bold text-white">
          Score {score}
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-card p-6 shadow-[0_20px_70px_rgba(0,0,0,0.32)]">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/45">
          Now Guessing
        </p>
        <div className="mt-4 flex items-start gap-4">
          <div className="h-24 w-24 overflow-hidden rounded-[1.25rem] border border-white/10 bg-card2">
            {song.album_art ? (
              <img
                src={song.album_art}
                alt={`${song.title} album art`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl">
                🎵
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h2 className="text-2xl font-black text-white">{song.title}</h2>
            <p className="mt-1 text-sm text-white/55">{song.artist}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.25em] text-primary/70">
              Era {era === "mix" ? "Mix" : era}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-card2 p-5">
          <button
            type="button"
            onClick={handlePlay}
            className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[linear-gradient(135deg,#FF4D8D,#ff6ba1)] text-white shadow-[0_18px_45px_rgba(255,77,141,0.3)] transition hover:scale-[1.02]"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-9 w-9"
              fill="currentColor"
            >
              <path d="M8 6v12l10-6-10-6Z" />
            </svg>
          </button>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#FF4D8D,#FFD36A)] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="mt-3 text-center text-sm text-white/60">
            {isPlaying ? "Playing..." : "Tap to play"}
          </p>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-card p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/80">
          Pick the release year
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {song.option_years.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setSelectedYear(option)}
              disabled={isAnswered}
              className={`rounded-[1.25rem] border px-4 py-4 text-center text-lg font-black transition ${
                selectedYear === option
                  ? "border-primary bg-primary text-white"
                  : "border-white/10 bg-card2 text-white/80 hover:border-primary/30"
              } ${isAnswered ? "opacity-80" : ""}`}
            >
              {option}
            </button>
          ))}
        </div>

        {!isAnswered ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={selectedYear === null}
            className="mt-5 flex min-h-14 w-full items-center justify-center rounded-[1.25rem] bg-[linear-gradient(135deg,#FF4D8D,#ff6ba1)] px-6 text-base font-black text-white shadow-[0_18px_45px_rgba(255,77,141,0.28)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Submit Guess
          </button>
        ) : (
          <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-card2 p-5">
            <p className="text-sm uppercase tracking-[0.25em] text-white/45">
              Answer Revealed
            </p>
            <p className="mt-3 text-2xl font-black text-white">
              {song.correct_year}
            </p>
            <p className="mt-2 text-sm text-white/60">
              {lastPoints} pts earned
              {lastPoints === 5
                ? " for an exact match."
                : lastPoints === 3
                  ? " for landing within 2 years."
                  : lastPoints === 1
                    ? " for landing within 5 years."
                    : " this round."}
            </p>

            <button
              type="button"
              onClick={handleNextRound}
              className="mt-5 flex min-h-14 w-full items-center justify-center rounded-[1.25rem] bg-primary px-6 text-base font-black text-white"
            >
              {currentIndex + 1 === songs.length ? "See Results" : "Next Round"}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
