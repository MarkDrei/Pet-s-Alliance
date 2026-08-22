"use client";

import Link from "next/link";
import { LEVEL_ORDER } from "@/content";
import { SpriteIcon } from "@/components/sprites/registry";
import { de } from "@/i18n/de";
import { useGameStore } from "@/state/gameStore";

/** Signature robot of each zone, shown on its menu card. */
const LEVEL_ICONS: Record<string, string> = {
  "level-1": "robot-stomper",
  "level-2": "robot-spinner",
  "level-3": "robot-bomber",
  "level-4": "robot-boss",
};

export function LevelSelect() {
  const startLevel = useGameStore((s) => s.startLevel);

  return (
    <nav className="flex w-full flex-col gap-2.5" aria-label={de.chooseLevel}>
      <h2 className="text-xs font-semibold uppercase tracking-widest text-foreground/60">
        {de.chooseLevel}
      </h2>
      {LEVEL_ORDER.map((levelId, i) => {
        const text = de.levels[levelId];
        return (
          <Link
            key={levelId}
            href="/game"
            onClick={() => startLevel(levelId)}
            className="flex items-center gap-3 rounded-2xl border border-panel-border bg-panel/80 px-3 py-2.5 text-left shadow-md transition-transform active:scale-[0.98]"
          >
            <div className="shrink-0 rounded-xl bg-background-deep/50 p-1">
              <SpriteIcon id={LEVEL_ICONS[levelId] ?? "robot-stomper"} size={46} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-xs font-bold uppercase tracking-wide text-accent">
                  {de.levelLabel(i + 1)}
                </span>
                <span className="font-bold">{text.name}</span>
              </div>
              <div className="text-xs italic text-foreground/60">{text.tagline}</div>
              <div className="pt-0.5 text-xs text-foreground/75">{text.feature}</div>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
