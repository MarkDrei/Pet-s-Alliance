"use client";

import Link from "next/link";
import type { GameState } from "@/engine";
import { chaosCount } from "@/engine";
import { de } from "@/i18n/de";
import { SpriteIcon } from "@/components/sprites/registry";

export function GameOverOverlay({
  game,
  onRestart,
  onNextLevel,
}: {
  game: GameState;
  onRestart: () => void;
  /** Starts the next zone; null when this was the last one. */
  onNextLevel: (() => void) | null;
}) {
  if (game.phase !== "victory" && game.phase !== "defeat") return null;

  const victory = game.phase === "victory";
  const text = victory
    ? de.victoryText
    : chaosCount(game) >= game.maxChaos
      ? de.defeatChaosText
      : de.defeatHeroesText;

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background-deep/80 p-6">
      <div className="w-full max-w-sm rounded-3xl border border-panel-border bg-panel p-6 text-center shadow-2xl">
        <div className="flex justify-center">
          <SpriteIcon id={victory ? "unicorn" : "robot-stomper"} size={72} />
        </div>
        <h2 className="pt-2 text-2xl font-extrabold">
          {victory ? de.victoryTitle : de.defeatTitle}
        </h2>
        <p className="pt-2 text-sm text-foreground/80">{text}</p>
        <div className="flex flex-col gap-2 pt-5">
          {victory && onNextLevel && (
            <button
              type="button"
              onClick={onNextLevel}
              className="rounded-xl bg-accent px-4 py-3 font-bold text-background-deep"
            >
              {de.nextLevel}
            </button>
          )}
          <button
            type="button"
            onClick={onRestart}
            className={
              victory && onNextLevel
                ? "rounded-xl border border-panel-border px-4 py-3 font-semibold text-foreground/85"
                : "rounded-xl bg-accent px-4 py-3 font-bold text-background-deep"
            }
          >
            {de.playAgain}
          </button>
          <Link
            href="/"
            className="rounded-xl border border-panel-border px-4 py-3 font-semibold text-foreground/85"
          >
            {de.backToTitle}
          </Link>
        </div>
      </div>
    </div>
  );
}
