import { BackButton } from "@/src/components/ui/BackButton";
import { ClassicGameClient } from "./_components/classic-game-client";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ClassicGamePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const roundsParam = params.rounds;
  const eraParam = params.era;
  const parsedRounds = Number(
    Array.isArray(roundsParam) ? roundsParam[0] : roundsParam ?? 10,
  );
  const era = Array.isArray(eraParam) ? eraParam[0] : eraParam ?? "mix";
  const rounds = [5, 10, 20].includes(parsedRounds) ? parsedRounds : 10;

  return (
    <>
      <BackButton className="mb-4" />
      <ClassicGameClient rounds={rounds} era={era} />
    </>
  );
}
