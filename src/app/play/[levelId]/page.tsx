import { notFound } from "next/navigation";
import { GameScreen } from "@/components/game/GameScreen";
import { getLevel, LEVELS } from "@/engine/levels";
import { de } from "@/i18n/de";

export function generateStaticParams() {
  return LEVELS.map((level) => ({ levelId: level.id }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ levelId: string }>;
}) {
  const { levelId } = await params;
  const text = de.levels[levelId];
  return { title: text ? `${text.name} – ${de.title}` : de.title };
}

export default async function PlayPage({
  params,
}: {
  params: Promise<{ levelId: string }>;
}) {
  const { levelId } = await params;
  const level = getLevel(levelId);
  if (!level) notFound();
  return <GameScreen level={level} />;
}
