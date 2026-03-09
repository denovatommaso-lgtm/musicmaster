import { NextResponse } from "next/server";

type EraKey =
  | "60s"
  | "70s"
  | "80s"
  | "90s"
  | "2000s"
  | "2010s"
  | "2020s"
  | "mix";

type SpotifyTokenResponse = {
  access_token: string;
  expires_in: number;
};

type SpotifySearchResponse = {
  tracks?: {
    items: SpotifyTrackItem[];
  };
};

type SpotifyTrackItem = {
  id: string;
  name: string;
  uri: string;
  preview_url: string | null;
  external_urls?: {
    spotify?: string;
  };
  album: {
    release_date: string;
    images: Array<{ url: string }>;
  };
  artists: Array<{ name: string }>;
};

type ClassicSong = {
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

type ParsedSpotifyTrack = Omit<ClassicSong, "option_years" | "playback_mode">;

const ERA_QUERY_MAP: Record<Exclude<EraKey, "mix">, string> = {
  "60s": "year:1960-1969",
  "70s": "year:1970-1979",
  "80s": "year:1980-1989",
  "90s": "year:1990-1999",
  "2000s": "year:2000-2009",
  "2010s": "year:2010-2019",
  "2020s": "year:2020-2024",
};

let cachedToken: { value: string; expiresAt: number } | null = null;

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

async function getAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Spotify credentials are missing.");
  }

  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.value;
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Spotify token request failed with ${response.status}.`);
  }

  const data = (await response.json()) as SpotifyTokenResponse;
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };

  return data.access_token;
}

function parseTrack(item: SpotifyTrackItem): ParsedSpotifyTrack | null {
  const releaseYear = Number(item.album.release_date.slice(0, 4));
  const spotifyUrl = item.external_urls?.spotify?.trim() ?? "";
  const previewUrl = item.preview_url?.trim() ?? "";

  if (Number.isNaN(releaseYear)) {
    return null;
  }

  if (!previewUrl && !spotifyUrl) {
    return null;
  }

  return {
    id: item.id,
    title: item.name,
    artist: item.artists.map((artist) => artist.name).join(", "),
    preview_url: previewUrl || null,
    correct_year: releaseYear,
    album_art: item.album.images[0]?.url ?? null,
    spotify_url: spotifyUrl || null,
    spotify_uri: item.uri?.trim() || null,
  };
}

async function spotifySearch(query: string, limit: number) {
  const token = await getAccessToken();
  const url = new URL("https://api.spotify.com/v1/search");
  url.searchParams.set("q", query);
  url.searchParams.set("type", "track");
  url.searchParams.set("market", "US");
  url.searchParams.set("limit", String(limit));

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Spotify search failed with ${response.status}.`);
  }

  const data = (await response.json()) as SpotifySearchResponse;
  const items = data.tracks?.items ?? [];

  return items
    .map((item) => parseTrack(item))
    .filter((track): track is ParsedSpotifyTrack => track !== null);
}

async function getTracksByEra(era: EraKey, limit: number) {
  if (era === "mix") {
    const eras = Object.keys(ERA_QUERY_MAP) as Array<Exclude<EraKey, "mix">>;
    const perEra = Math.max(4, Math.ceil(limit / eras.length));
    const trackGroups = await Promise.all(
      eras.map((eraKey) => spotifySearch(ERA_QUERY_MAP[eraKey], perEra)),
    );

    return shuffle(trackGroups.flat());
  }

  return spotifySearch(ERA_QUERY_MAP[era], limit);
}

function buildClassicSong(
  track: ParsedSpotifyTrack,
  playbackMode: "preview" | "spotify_link",
): ClassicSong {
  return {
    ...track,
    playback_mode: playbackMode,
    option_years: buildOptionYears(track.correct_year),
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedRounds = Number(searchParams.get("rounds") ?? 5);
  const requestedEra = searchParams.get("era") ?? "mix";
  const rounds = [5, 10, 20].includes(requestedRounds) ? requestedRounds : 5;
  const era = ["60s", "70s", "80s", "90s", "2000s", "2010s", "2020s", "mix"].includes(
    requestedEra,
  )
    ? (requestedEra as EraKey)
    : "mix";

  try {
    const fetchTargets = [
      Math.max(rounds * 3, 15),
      Math.max(rounds * 5, 25),
      Math.max(rounds * 7, 40),
    ];
    const candidatesById = new Map<string, ParsedSpotifyTrack>();

    console.log("[classic api] request", { rounds, era });

    for (const target of fetchTargets) {
      const fetchedTracks = await getTracksByEra(era, target);

      for (const track of fetchedTracks) {
        if (!candidatesById.has(track.id)) {
          candidatesById.set(track.id, track);
        }
      }

      const uniqueCandidates = [...candidatesById.values()];
      const previewCapable = uniqueCandidates.filter((track) => track.preview_url);
      const fallbackOnly = uniqueCandidates.filter(
        (track) => !track.preview_url && track.spotify_url,
      );

      console.log("[classic api] spotify candidate batch", {
        requested: target,
        fetched: fetchedTracks.length,
        totalCandidates: uniqueCandidates.length,
        previewCapable: previewCapable.length,
        fallbackOnly: fallbackOnly.length,
      });

      if (previewCapable.length + fallbackOnly.length >= rounds) {
        break;
      }
    }

    const allCandidates = shuffle([...candidatesById.values()]);
    const previewTracks = allCandidates.filter((track) => track.preview_url);
    const fallbackTracks = allCandidates.filter(
      (track) => !track.preview_url && track.spotify_url,
    );

    const songs = [
      ...previewTracks.map((track) => buildClassicSong(track, "preview")),
      ...fallbackTracks.map((track) => buildClassicSong(track, "spotify_link")),
    ].slice(0, rounds);

    console.log("[classic api] final selection", {
      totalCandidatesFetched: allCandidates.length,
      previewCapable: previewTracks.length,
      fallbackOnly: fallbackTracks.length,
      returnedSongs: songs.length,
      returnedPreviewSongs: songs.filter((song) => song.playback_mode === "preview").length,
      returnedFallbackSongs: songs.filter((song) => song.playback_mode === "spotify_link").length,
    });

    if (songs.length === 0) {
      return NextResponse.json(
        {
          error:
            "Classic Mode could not load any usable Spotify tracks right now. Please try again in a moment.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json({ songs });
  } catch (error) {
    console.error("[classic api] spotify request failed", {
      message: error instanceof Error ? error.message : "unknown error",
    });

    return NextResponse.json(
      {
        error:
          "Classic Mode could not load any usable Spotify tracks right now. Please try again in a moment.",
      },
      { status: 503 },
    );
  }
}
