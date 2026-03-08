import { NextResponse } from "next/server";

type MockSong = {
  id: string;
  title: string;
  artist: string;
  correct_year: number;
};

const SONGS: MockSong[] = [
  { id: "1", title: "Billie Jean", artist: "Michael Jackson", correct_year: 1983 },
  { id: "2", title: "Like a Prayer", artist: "Madonna", correct_year: 1989 },
  { id: "3", title: "Smells Like Teen Spirit", artist: "Nirvana", correct_year: 1991 },
  { id: "4", title: "Wonderwall", artist: "Oasis", correct_year: 1995 },
  { id: "5", title: "Hey Ya!", artist: "Outkast", correct_year: 2003 },
  { id: "6", title: "Rolling in the Deep", artist: "Adele", correct_year: 2010 },
  { id: "7", title: "Blinding Lights", artist: "The Weeknd", correct_year: 2019 },
  { id: "8", title: "Levitating", artist: "Dua Lipa", correct_year: 2020 },
  { id: "9", title: "Take on Me", artist: "a-ha", correct_year: 1985 },
  { id: "10", title: "Poker Face", artist: "Lady Gaga", correct_year: 2008 },
  { id: "11", title: "Umbrella", artist: "Rihanna", correct_year: 2007 },
  { id: "12", title: "I Wanna Dance with Somebody", artist: "Whitney Houston", correct_year: 1987 },
  { id: "13", title: "Shape of You", artist: "Ed Sheeran", correct_year: 2017 },
  { id: "14", title: "Teenage Dream", artist: "Katy Perry", correct_year: 2010 },
  { id: "15", title: "Get Lucky", artist: "Daft Punk", correct_year: 2013 },
  { id: "16", title: "Toxic", artist: "Britney Spears", correct_year: 2003 },
  { id: "17", title: "Since U Been Gone", artist: "Kelly Clarkson", correct_year: 2004 },
  { id: "18", title: "Mr. Brightside", artist: "The Killers", correct_year: 2004 },
  { id: "19", title: "No Scrubs", artist: "TLC", correct_year: 1999 },
  { id: "20", title: "Dreams", artist: "Fleetwood Mac", correct_year: 1977 },
];

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
  const rounds = [5, 10, 20].includes(requestedRounds) ? requestedRounds : 5;

  const songs = shuffle(SONGS).slice(0, rounds).map((song) => ({
    ...song,
    preview_url: null,
    option_years: buildOptionYears(song.correct_year),
  }));

  return NextResponse.json({ songs });
}
