"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { BackButton } from "@/src/components/ui/BackButton";

type Song = {
  id: string;
  title: string;
  artist: string;
  preview_url: string | null;
  correct_year: number;
  option_years: number[];
  album_art: string | null;
  spotify_url: string | null;
  spotify_uri: string | null;
  playback_mode: "preview" | "spotify_link";
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
  const spotifyAutoOpenedRoundsRef = useRef<Set<string>>(new Set());
  const audioListenersRef = useRef<{
    timeupdate?: () => void;
    ended?: () => void;
    error?: () => void;
  }>({});
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
  const [playbackError, setPlaybackError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadSongs() {
      setIsLoading(true);
      setError("");
      setSongs([]);
      spotifyAutoOpenedRoundsRef.current = new Set();
      setCurrentIndex(0);
      setScore(0);
      setSelectedYear(null);
      setIsAnswered(false);
      setLastPoints(null);

      try {
        const response = await fetch(`/api/game/classic?rounds=${rounds}&era=${era}`);
        const result = (await response.json()) as { songs?: Song[]; error?: string };

        if (!response.ok || !result.songs) {
          throw new Error(result.error ?? "Failed to load songs.");
        }

        if (isMounted) {
          console.log("Classic mode API result", {
            rounds,
            era,
            count: result.songs.length,
            firstSong: result.songs[0]?.title ?? null,
            previewSongs:
              result.songs.filter((song) => song.playback_mode === "preview").length,
            spotifyLinkSongs:
              result.songs.filter((song) => song.playback_mode === "spotify_link")
                .length,
          });
          setSongs(result.songs);

          if (result.songs.length === 0) {
            setError("No usable songs were returned for this game.");
          }
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
    setSelectedYear(null);
    setIsAnswered(false);
    setLastPoints(null);
    setIsPlaying(false);
    setProgress(0);
    setPlaybackError("");

    return () => {
      destroyAudio();
    };
  }, [currentIndex, songs]);

  const song = songs[currentIndex];
  const roundKey = song ? `${currentIndex}:${song.id}` : null;
  const hasPreview = Boolean(song?.preview_url?.trim());
  const hasSpotifyLink = Boolean(song?.spotify_url?.trim());
  const isPreviewMode = song?.playback_mode === "preview";
  const isComplete = useMemo(
    () => songs.length > 0 && currentIndex >= songs.length,
    [currentIndex, songs.length],
  );

  useEffect(() => {
    if (!song) {
      return;
    }

    console.log("Classic mode current song", {
      title: song.title,
      previewUrl: song.preview_url,
      spotifyUrl: song.spotify_url,
      spotifyUri: song.spotify_uri,
      playbackMode: song.playback_mode,
      autoOpenAttempted: roundKey
        ? spotifyAutoOpenedRoundsRef.current.has(roundKey)
        : false,
      round: currentIndex + 1,
    });
  }, [currentIndex, roundKey, song]);

  function destroyAudio() {
    const audio = audioRef.current;
    const listeners = audioListenersRef.current;

    if (audio) {
      audio.pause();
      audio.currentTime = 0;

      if (listeners.timeupdate) {
        audio.removeEventListener("timeupdate", listeners.timeupdate);
      }

      if (listeners.ended) {
        audio.removeEventListener("ended", listeners.ended);
      }

      if (listeners.error) {
        audio.removeEventListener("error", listeners.error);
      }
    }

    audioRef.current = null;
    audioListenersRef.current = {};
  }

  async function handlePlay() {
    const previewUrl = song?.preview_url ?? null;

    if (!song || isAnswered || song.playback_mode !== "preview") {
      return;
    }

    if (isPlaying && audioRef.current) {
      console.log("Classic mode audio pause requested", {
        title: song.title,
        previewUrl,
      });
      audioRef.current.pause();
      setIsPlaying(false);
      setPlaybackError("");
      return;
    }

    console.log("Classic mode audio attempt", {
      title: song.title,
      previewUrl,
    });

    if (!previewUrl?.trim()) {
      console.error("Classic mode preview missing", {
        title: song.title,
        id: song.id,
        previewUrl,
      });
      setPlaybackError("Preview unavailable for this track.");
      return;
    }

    destroyAudio();
    setProgress(0);
    setPlaybackError("");

    try {
      const audio = new Audio(previewUrl);
      audio.volume = 1;
      audio.preload = "none";
      console.log("Classic mode audio created", {
        title: song.title,
        src: audio.src,
      });

      const syncProgress = () => {
        const seconds = Math.min(audio.currentTime, PREVIEW_DURATION);
        setProgress((seconds / PREVIEW_DURATION) * 100);
      };

      const handleEnded = () => {
        console.log("Classic mode audio ended", {
          title: song.title,
          previewUrl,
        });
        setIsPlaying(false);
        setProgress(100);
      };

      const handleError = () => {
        console.error("Classic mode audio element error", {
          title: song.title,
          src: audio.src,
          previewUrl,
          networkState: audio.networkState,
          readyState: audio.readyState,
          errorCode: audio.error?.code ?? null,
        });
        setIsPlaying(false);
        setPlaybackError("Preview could not be played on this device.");
      };

      audio.addEventListener("timeupdate", syncProgress);
      audio.addEventListener("ended", handleEnded);
      audio.addEventListener("error", handleError);
      audioRef.current = audio;
      audioListenersRef.current = {
        timeupdate: syncProgress,
        ended: handleEnded,
        error: handleError,
      };

      console.log("Classic mode audio play() start", {
        title: song.title,
        previewUrl,
      });
      await audio.play();
      console.log("Classic mode audio play resolved", {
        title: song.title,
        previewUrl,
      });
      setIsPlaying(true);
    } catch (playError) {
      console.error("Classic mode audio play failed", {
        title: song.title,
        previewUrl,
        error: playError,
      });
      setIsPlaying(false);
      setPlaybackError("Preview could not be played on this device.");
      destroyAudio();
    }
  }

  function openSpotifyLink(source: "auto" | "manual") {
    if (!song || isAnswered || song.playback_mode !== "spotify_link") {
      return false;
    }

    console.log("Classic mode spotify link open", {
      title: song.title,
      roundIndex: currentIndex,
      spotifyUrl: song.spotify_url,
      spotifyUri: song.spotify_uri,
      source,
    });

    const spotifyUri = song.spotify_uri?.trim() ?? "";
    const spotifyUrl = song.spotify_url?.trim() ?? "";

    if (!spotifyUri && !spotifyUrl) {
      console.error("Classic mode spotify link missing", {
        title: song.title,
        roundIndex: currentIndex,
        spotifyUrl,
        spotifyUri,
        source,
      });
      setPlaybackError("Spotify link unavailable for this track.");
      return false;
    }

    setPlaybackError("");

    try {
      let openedWindow: Window | null = null;

      if (spotifyUri) {
        openedWindow = window.open(spotifyUri, "_blank", "noopener,noreferrer");
      }

      if (!openedWindow && spotifyUrl) {
        openedWindow = window.open(spotifyUrl, "_blank", "noopener,noreferrer");
      }

      console.log("Classic mode spotify link open result", {
        title: song.title,
        roundIndex: currentIndex,
        spotifyUrl,
        spotifyUri,
        source,
        openedWindow: Boolean(openedWindow),
      });

      if (!openedWindow) {
        setPlaybackError("Spotify may have been blocked. Use the button below to try again.");
        return false;
      }

      return true;
    } catch (spotifyOpenError) {
      console.error("Classic mode spotify link open failed", {
        title: song.title,
        roundIndex: currentIndex,
        spotifyUrl,
        spotifyUri,
        source,
        error: spotifyOpenError,
      });
      setPlaybackError("Spotify could not be opened automatically. Try again below.");
      return false;
    }
  }

  function handleOpenSpotify() {
    console.log("Classic mode spotify fallback button used", {
      roundIndex: currentIndex,
      playbackMode: song?.playback_mode ?? null,
      spotifyUrl: song?.spotify_url ?? null,
      spotifyUri: song?.spotify_uri ?? null,
    });
    openSpotifyLink("manual");
  }

  useEffect(() => {
    if (!song || song.playback_mode !== "spotify_link" || !roundKey) {
      return;
    }

    if (spotifyAutoOpenedRoundsRef.current.has(roundKey)) {
      return;
    }

    spotifyAutoOpenedRoundsRef.current.add(roundKey);
    console.log("Classic mode spotify auto-open attempt", {
      roundIndex: currentIndex,
      playbackMode: song.playback_mode,
      spotifyUrl: song.spotify_url,
      spotifyUri: song.spotify_uri,
      autoOpenAttempted: true,
    });
    openSpotifyLink("auto");
  }, [currentIndex, roundKey, song]);

  function handleSubmit() {
    if (selectedYear === null || !song) {
      return;
    }

    const earned = scoreGuess(selectedYear, song.correct_year);
    setScore((current) => current + earned);
    setLastPoints(earned);
    setIsAnswered(true);
    setIsPlaying(false);
    destroyAudio();
  }

  function handleNextRound() {
    setPlaybackError("");
    setCurrentIndex((current) => current + 1);
  }

  function getOptionState(option: number) {
    if (!isAnswered || !song) {
      return selectedYear === option
        ? "border-primary bg-primary text-white"
        : "border-white/10 bg-card2 text-white/80 hover:border-primary/30";
    }

    if (option === song.correct_year) {
      return "border-transparent bg-green text-[#0E0F11]";
    }

    if (selectedYear === option && option !== song.correct_year) {
      return "border-transparent bg-[#FF4444] text-[#0E0F11]";
    }

    return "border-white/5 bg-card2 text-white/35";
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
        <BackButton />
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

        <div className="mt-5 rounded-[1.25rem] border border-white/10 bg-card2 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary/80">
            {isPreviewMode ? "Preview available" : "Listen on Spotify"}
          </p>

          {isPreviewMode ? (
            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={handlePlay}
                disabled={!hasPreview || isAnswered}
                aria-label={isPlaying ? "Pause preview" : "Play preview"}
                aria-pressed={isPlaying}
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white shadow-[0_10px_25px_rgba(255,77,141,0.25)] transition ${
                  !hasPreview || isAnswered
                    ? "cursor-not-allowed bg-white/10 text-white/35 shadow-none"
                    : "bg-[linear-gradient(135deg,#FF4D8D,#ff6ba1)] hover:scale-[1.02]"
                }`}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="currentColor"
                >
                  {isPlaying ? (
                    <path d="M7 6h3v12H7zm7 0h3v12h-3z" />
                  ) : (
                    <path d="M8 6v12l10-6-10-6Z" />
                  )}
                </svg>
              </button>

              <div className="min-w-0 flex-1">
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#FF4D8D,#FFD36A)] transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-white/60">
                  {!hasPreview
                    ? "Preview unavailable"
                    : isPlaying
                      ? "Playing preview..."
                      : "Tap to play"}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-3">
              <div className="rounded-[1rem] border border-white/10 bg-background/30 px-3 py-3">
                <p className="text-sm font-semibold text-white">Opening Spotify...</p>
                <p className="mt-1 text-xs text-white/60">
                  Return to the game after listening and submit your guess.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenSpotify}
                disabled={!hasSpotifyLink || isAnswered}
                className={`mt-3 flex min-h-12 w-full items-center justify-center rounded-[1rem] px-4 text-sm font-black text-white transition ${
                  !hasSpotifyLink || isAnswered
                    ? "cursor-not-allowed bg-white/10 text-white/35"
                    : "bg-[linear-gradient(135deg,#FF4D8D,#ff6ba1)] shadow-[0_18px_45px_rgba(255,77,141,0.28)]"
                }`}
              >
                Open in Spotify again
              </button>
            </div>
          )}

          {playbackError ? (
            <div className="mt-3 rounded-2xl border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-medium text-[#ffd0e1]">
              {playbackError}
            </div>
          ) : null}
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
              className={`min-h-18 w-full rounded-[1.25rem] border px-4 py-4 text-center text-lg font-black transition ${getOptionState(
                option,
              )}`}
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
          <>
            <p
              className={`mt-4 text-center text-sm ${
                selectedYear === song.correct_year ? "text-green" : "text-white/60"
              }`}
            >
              {selectedYear === song.correct_year
                ? `✓ Correct! +${lastPoints ?? 0} points`
                : `✗ Wrong — correct was ${song.correct_year}, +${lastPoints ?? 0} points`}
            </p>

            <button
              type="button"
              onClick={handleNextRound}
              className="mt-4 flex min-h-14 w-full items-center justify-center rounded-[1.25rem] bg-primary px-6 text-base font-black text-white"
            >
              {currentIndex + 1 === songs.length ? "See Results" : "Next Round"}
            </button>
          </>
        )}
      </section>
    </main>
  );
}
