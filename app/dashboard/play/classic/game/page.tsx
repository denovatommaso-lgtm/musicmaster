import Link from "next/link";
import { ClassicGameClient } from "./_components/classic-game-client";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ClassicGamePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const roundsParam = params.rounds;
  const parsedRounds = Number(
    Array.isArray(roundsParam) ? roundsParam[0] : roundsParam ?? 10,
  );
  const rounds = [5, 10, 20].includes(parsedRounds) ? parsedRounds : 10;

  return (
    <>
      <Link
        href="/dashboard/play/classic"
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-white/60 transition hover:text-white"
      >
        <span aria-hidden="true">←</span>
        Back
      </Link>
      <ClassicGameClient rounds={rounds} />
    </>
  );
}
