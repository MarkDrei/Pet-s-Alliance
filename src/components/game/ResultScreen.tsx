"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { publicUrl } from "@/assetUrl";
import { LEVELS } from "@/engine/levels";
import type { GameState, HeroDefId, RobotDefId } from "@/engine/types";
import { de } from "@/i18n/de";
import { RobotSprite } from "./sprites";

interface ResultScreenProps {
  view: GameState;
  onRestart: () => void;
}

export function ResultScreen({ view, onRestart }: ResultScreenProps) {
  const result = view.result;
  if (!result) return null;
  const win = result.outcome === "win";

  const outcomeText = win
    ? de.victoryText
    : result.outcome === "loseChaos"
      ? de.defeatChaosText
      : de.defeatHeroesText;

  const speakerName = win
    ? de.heroes[result.speakerDefId]?.name
    : de.robots[result.speakerDefId]?.name;
  const quote = win
    ? de.victoryQuotes[result.speakerDefId]
    : de.defeatQuotes[result.speakerDefId];

  const levelIndex = LEVELS.findIndex((l) => l.id === view.levelId);
  const nextLevel = win && levelIndex >= 0 ? LEVELS[levelIndex + 1] : undefined;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-night-950/85 p-6 backdrop-blur-sm">
      <div className="animate-pop-in w-full max-w-sm rounded-3xl border-2 border-white/15 bg-gradient-to-b from-night-800 to-night-900 p-6 text-center shadow-2xl">
        <div className="text-5xl">{win ? "🌙" : "💥"}</div>
        <h2
          className={`mt-2 text-3xl font-bold ${win ? "text-honey-300" : "text-danger-400"}`}
        >
          {win ? de.victoryTitle : de.defeatTitle}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-white/85">{outcomeText}</p>

        {/* Speaker */}
        <div className="mx-auto mt-5 flex max-w-xs items-center gap-3 rounded-2xl bg-white/8 p-3 text-left">
          {win ? (
            <img
              src={publicUrl(`/sprites/heroes/${result.speakerDefId as HeroDefId}.png`)}
              alt={speakerName}
              className="h-16 w-16 shrink-0 animate-bob object-contain"
            />
          ) : (
            <svg viewBox="-34 -46 68 62" className="h-16 w-16 shrink-0 animate-bob">
              <RobotSprite defId={result.speakerDefId as RobotDefId} />
            </svg>
          )}
          <div>
            <div className="text-sm font-bold text-honey-300">{speakerName}</div>
            <p className="mt-0.5 text-xs italic leading-snug text-white/80">„{quote}“</p>
          </div>
        </div>

        <p className="mt-4 text-sm font-semibold text-white/70">
          {de.chaosScore(view.chaos, view.maxChaos)}
        </p>

        <div className="mt-5 flex flex-col gap-2.5">
          {nextLevel && (
            <Link
              href={`/play/${nextLevel.id}`}
              className="btn-squish rounded-2xl border-b-4 border-amber-700 bg-gradient-to-b from-honey-300 to-honey-400 px-4 py-3 font-bold text-night-900"
            >
              {de.nextLevel}: {de.levels[nextLevel.id].name}
            </Link>
          )}
          <button
            onClick={onRestart}
            className={`btn-squish rounded-2xl border-b-4 px-4 py-3 font-bold ${
              nextLevel
                ? "border-white/15 bg-white/10 text-white"
                : "border-amber-700 bg-gradient-to-b from-honey-300 to-honey-400 text-night-900"
            }`}
          >
            {de.playAgain}
          </button>
          <Link
            href="/"
            className="btn-squish rounded-2xl border-2 border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white/80"
          >
            {de.backToTitle}
          </Link>
        </div>
      </div>
    </div>
  );
}
