"use client";

import type { GameState } from "@/engine";
import { chaosCount } from "@/engine";
import { de } from "@/i18n/de";

export function TopBar({ game }: { game: GameState }) {
  const chaos = chaosCount(game);
  return (
    <header className="flex items-center justify-between gap-3 px-4 py-3">
      <div>
        <div className="text-xs uppercase tracking-widest text-foreground/60">{de.level1Name}</div>
        <div className="text-lg font-bold">{de.round(game.round, game.roundsToSurvive)}</div>
      </div>
      <div className="text-center text-sm text-foreground/80">{de.objective(game.roundsToSurvive)}</div>
      <div className="text-right">
        <div className="text-xs uppercase tracking-widest text-foreground/60">{de.chaos}</div>
        <div className="flex gap-1.5 pt-1" aria-label={`${de.chaos}: ${chaos} / ${game.maxChaos}`}>
          {Array.from({ length: game.maxChaos }).map((_, i) => (
            <span
              key={i}
              className={`inline-block h-3.5 w-3.5 rounded-full border ${
                i < chaos ? "border-danger bg-danger" : "border-panel-border bg-panel"
              }`}
            />
          ))}
        </div>
      </div>
    </header>
  );
}
