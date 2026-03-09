import "server-only";

type SpotifyTokenResponse = {
  access_token: string;
  token_type: string;
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
  preview_url: string | null;
  album: {
    release_date: string;
    images: Array<{ url: string }>;
  };
  artists: Array<{ name: string }>;
};

type EraKey =
  | "60s"
  | "70s"
  | "80s"
  | "90s"
  | "2000s"
  | "2010s"
  | "2020s"
  | "mix";

export type SpotifyTrack = {
  id: string;
  title: string;
  artist: string;
  preview_url: string;
  correct_year: number;
  album_art: string | null;
};

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

async function getAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const tokenUrl = "https://accounts.spotify.com/api/token";

  console.log("[spotify] env check", {
    clientIdPrefix: clientId?.slice(0, 4) ?? null,
    clientSecretPrefix: clientSecret?.slice(0, 4) ?? null,
  });

  if (!clientId || !clientSecret) {
    throw new Error("Spotify credentials are missing.");
  }

  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.value;
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  console.log("[spotify] token request config", {
    url: tokenUrl,
    authHeaderPrefix: `Basic ${basicAuth.slice(0, 12)}`,
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  console.log("[spotify] token response status", response.status);

  if (!response.ok) {
    const body = await response.text();
    console.log("[spotify] token response body", body);
    throw new Error(`Spotify token request failed with ${response.status}.`);
  }

  const data = (await response.json()) as SpotifyTokenResponse;
  console.log("[spotify] token response body", data);
  console.log("[spotify] token fetch succeeded", {
    status: response.status,
    tokenPrefix: data.access_token.slice(0, 12),
    expiresIn: data.expires_in,
  });
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };

  return data.access_token;
}

function parseTrack(item: SpotifyTrackItem): SpotifyTrack | null {
  if (!item.preview_url) {
    return null;
  }

  const releaseYear = Number(item.album.release_date.slice(0, 4));

  if (Number.isNaN(releaseYear)) {
    return null;
  }

  return {
    id: item.id,
    title: item.name,
    artist: item.artists.map((artist) => artist.name).join(", "),
    preview_url: item.preview_url,
    correct_year: releaseYear,
    album_art: item.album.images[0]?.url ?? null,
  };
}

async function spotifySearch(query: string, limit: number) {
  const token = await getAccessToken();
  const url = new URL("https://api.spotify.com/v1/search");
  url.searchParams.set("q", query);
  url.searchParams.set("type", "track");
  url.searchParams.set("market", "US");
  url.searchParams.set("limit", String(limit));
  console.log("[spotify] search request", {
    query,
    limit,
    url: url.toString(),
  });

  const searchResponse = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  console.log("[spotify] search response status", searchResponse.status);

  if (!searchResponse.ok) {
    const body = await searchResponse.text();
    console.log("[spotify] search failed", {
      query,
      status: searchResponse.status,
      body,
    });
    throw new Error(`Spotify search failed with ${searchResponse.status}.`);
  }

  const data = (await searchResponse.json()) as SpotifySearchResponse;
  console.log(
    "[spotify] search response body",
    JSON.stringify(data).slice(0, 500),
  );
  const rawItems = data.tracks?.items ?? [];
  console.log("[spotify] raw search response", {
    query,
    limit,
    totalItems: rawItems.length,
    previewableItems: rawItems.filter((item) => item.preview_url !== null).length,
    sample: rawItems.slice(0, 3).map((item) => ({
      id: item.id,
      name: item.name,
      preview_url: item.preview_url,
      release_date: item.album.release_date,
    })),
  });

  return rawItems
    .map((item) => parseTrack(item))
    .filter((track): track is SpotifyTrack => track !== null);
}

export async function searchTracks(query: string, limit = 10) {
  return spotifySearch(query, Math.max(limit * 3, limit));
}

export async function getTracksByEra(era: EraKey, limit = 10) {
  if (era === "mix") {
    const eras = Object.keys(ERA_QUERY_MAP) as Array<Exclude<EraKey, "mix">>;
    const perEra = Math.max(2, Math.ceil(limit / eras.length));
    const tracks = await Promise.all(
      eras.map((eraKey) => spotifySearch(ERA_QUERY_MAP[eraKey], perEra)),
    );

    return shuffle(tracks.flat()).slice(0, limit);
  }

  return spotifySearch(ERA_QUERY_MAP[era], Math.max(limit * 3, limit));
}

function shuffle<T>(items: T[]) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}
