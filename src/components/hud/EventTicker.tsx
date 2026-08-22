"use client";

import type { GameState } from "@/engine";
import { eventText } from "@/i18n/de";

export function EventTicker({ game }: { game: GameState }) {
  if (game.events.length === 0) return null;
  return (
    <div className="mx-4 rounded-lg bg-background-deep/70 px-3 py-2 text-sm" role="log">
      {game.events.slice(-3).map((event, i) => (
        <div key={i} className="text-foreground/85">
          {eventText(game, event)}
        </div>
      ))}
    </div>
  );
}
