"use client";

import { CONTENT } from "@/content";
import { IsometricBoard } from "@/components/board/IsometricBoard";
import { BottomBar } from "@/components/hud/BottomBar";
import { EventTicker } from "@/components/hud/EventTicker";
import { GameOverOverlay } from "@/components/hud/GameOverOverlay";
import { TopBar } from "@/components/hud/TopBar";
import { highlightTilesFor, useGameStore } from "@/state/gameStore";

export function GameScreen() {
  const store = useGameStore();
  const { game, selectedHeroId, selectedRobotId, mode } = store;

  const highlightTiles = highlightTilesFor(store);
  const highlightKind = mode === "move" ? "move" : mode === "idle" ? null : "target";

  return (
    <div className="relative flex h-dvh w-full flex-col">
      <div className="mx-auto w-full max-w-md">
        <TopBar game={game} />
        <EventTicker game={game} />
      </div>
      <main className="flex min-h-0 w-full flex-1 items-center">
        <IsometricBoard
          content={CONTENT}
          state={game}
          selectedHeroId={selectedHeroId}
          selectedRobotId={selectedRobotId}
          highlightTiles={highlightTiles}
          highlightKind={highlightKind}
          onTileClick={store.tileClicked}
        />
      </main>
      <div className="mx-auto w-full max-w-md">
        <BottomBar
          game={game}
          selectedHeroId={selectedHeroId}
          selectedRobotId={selectedRobotId}
          mode={mode}
          onSetMode={store.setMode}
          onEndTurn={store.endTurn}
        />
      </div>
      <GameOverOverlay game={game} onRestart={store.restart} />
    </div>
  );
}
