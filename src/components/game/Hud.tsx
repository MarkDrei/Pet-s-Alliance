"use client";

import Link from "next/link";
import type { GameState } from "@/engine/types";
import { de } from "@/i18n/de";

export function Hud({ view }: { view: GameState }) {
  const levelText = de.levels[view.levelId];
  return (
    <header className="flex items-center gap-3 px-3 pb-1 pt-2">
      <Link
        href="/"
        aria-label={de.backToTitle}
        className="btn-squish flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-white/20 bg-white/10 text-lg"
      >
        ←
      </Link>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold leading-tight text-honey-300">
          {levelText?.name ?? view.levelId}
        </div>
        <div className="text-xs text-white/70">{de.objective(view.totalRounds)}</div>
      </div>
      <div className="text-right">
        <div className="text-sm font-semibold">{de.round(Math.min(view.round, view.totalRounds), view.totalRounds)}</div>
        <div className="mt-0.5 flex items-center justify-end gap-1">
          <span className="text-xs text-white/70">{de.chaos}</span>
          {Array.from({ length: view.maxChaos }, (_, i) => (
            <span
              key={i}
              className={`h-3 w-3 rounded-full border ${
                i < view.chaos
                  ? "border-danger-400 bg-danger-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]"
                  : "border-white/30 bg-white/10"
              }`}
            />
          ))}
        </div>
      </div>
    </header>
  );
}
