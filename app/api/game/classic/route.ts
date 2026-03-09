import { NextResponse } from "next/server";
import { getTracksByEra } from "@/src/lib/spotify";

type ClassicSong = {
  id: string;
  title: string;
  artist: string;
  preview_url: string | null;
  correct_year: number;
  option_years: number[];
  album_art: string | null;
};

function shuffle<T>(items: T[]) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

function clampYear(year: number) {
  return Math.min(2024, Math.max(1960, year));
}

function buildOptionYears(correctYear: number) {
  const years = new Set<number>([correctYear]);
  const offsets = shuffle([-12, -9, -7, -5, -4, -3, 3, 4, 5, 7, 9, 12]);

  for (const offset of offsets) {
    if (years.size === 4) {
      break;
    }

    years.add(clampYear(correctYear + offset));
  }

  while (years.size < 4) {
    years.add(1960 + Math.floor(Math.random() * 65));
  }

  return shuffle([...years]);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedRounds = Number(searchParams.get("rounds") ?? 5);
  const requestedEra = searchParams.get("era") ?? "mix";
  const rounds = [5, 10, 20].includes(requestedRounds) ? requestedRounds : 5;
  const era = ["60s", "70s", "80s", "90s", "2000s", "2010s", "2020s", "mix"].includes(
    requestedEra,
  )
    ? requestedEra
    : "mix";
  try {
    console.log("[classic api] request", { rounds, era });
    const normalizedEra = era as
      | "60s"
      | "70s"
      | "80s"
      | "90s"
      | "2000s"
      | "2010s"
      | "2020s"
      | "mix";
    const fetchTargets = [
      Math.max(rounds * 3, 12),
      Math.max(rounds * 5, 20),
      Math.max(rounds * 7, 30),
    ];
    const playableById = new Map<string, ClassicSong>();

    for (const target of fetchTargets) {
      const spotifyTracks = await getTracksByEra(normalizedEra, target);
      const validPreviewTracks = spotifyTracks.filter((track) => {
        const previewUrl =
          typeof track.preview_url === "string" ? track.preview_url.trim() : "";
        return previewUrl.length > 0;
      });

      console.log("[classic api] spotify candidate batch", {
        requested: target,
        fetched: spotifyTracks.length,
        withPreview: validPreviewTracks.length,
        withoutPreview: spotifyTracks.length - validPreviewTracks.length,
      });

      for (const track of validPreviewTracks) {
        if (playableById.has(track.id)) {
          continue;
        }

        playableById.set(track.id, {
          id: track.id,
          title: track.title,
          artist: track.artist,
          preview_url: track.preview_url.trim(),
          correct_year: track.correct_year,
          option_years: buildOptionYears(track.correct_year),
          album_art: track.album_art,
        });
      }

      console.log("[classic api] accumulated playable tracks", {
        uniquePlayable: playableById.size,
        requestedRounds: rounds,
      });

      if (playableById.size >= rounds) {
        break;
      }
    }

    const songs = shuffle([...playableById.values()]).slice(0, rounds);

    if (songs.length < rounds) {
      console.error("[classic api] not enough playable spotify tracks", {
        requestedRounds: rounds,
        playableSongs: songs.length,
        era,
      });

      return NextResponse.json(
        {
          error:
            "Not enough playable Spotify previews were found for this Classic Mode game. Please try a different era or try again.",
        },
        { status: 503 },
      );
    }

    console.log("[classic api] returning spotify songs", {
      count: songs.length,
      requestedRounds: rounds,
      era,
      firstSong: songs[0]?.title ?? null,
    });

    return NextResponse.json({ songs });
  } catch (error) {
    console.error("[classic api] spotify request failed", {
      message: error instanceof Error ? error.message : "unknown error",
    });

    return NextResponse.json(
      {
        error:
          "Classic Mode could not load enough playable Spotify previews right now. Please try again in a moment.",
      },
      { status: 503 },
    );
  }
}
