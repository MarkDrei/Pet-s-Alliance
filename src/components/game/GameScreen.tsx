"use client";

import type { LevelDef } from "@/engine/types";
import { de } from "@/i18n/de";
import { ActionBar } from "./ActionBar";
import { EventTicker } from "./EventTicker";
import { HexBoard } from "./HexBoard";
import { Hud } from "./Hud";
import { InspectPanel } from "./InspectPanel";
import { ResultScreen } from "./ResultScreen";
import { useGameController } from "./useGameController";

export function GameScreen({ level }: { level: LevelDef }) {
  const game = useGameController(level);

  return (
    <main className="relative mx-auto flex h-dvh max-w-md flex-col overflow-hidden">
      <Hud view={game.view} />

      <div className="relative min-h-0 flex-1">
        <HexBoard
          view={game.view}
          event={game.event}
          mode={game.mode}
          inspect={game.inspect}
          actingRobotId={game.actingRobotId}
          moveTargets={game.moveTargets}
          abilityTargetList={game.abilityTargetList}
          itemTargetIds={game.itemTargetIds}
          onTileTap={game.onTileTap}
        />

        {/* Inspect bottom sheet floats over the lower board edge */}
        {game.inspect && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20">
            <InspectPanel view={game.view} target={game.inspect} onClose={game.closeInspect} />
          </div>
        )}

        {/* Robot phase banner */}
        {game.view.phase === "execution" && (
          <div className="pointer-events-none absolute inset-x-0 top-2 z-10 flex justify-center">
            <span className="animate-slide-up rounded-2xl border border-danger-400/40 bg-night-950/80 px-4 py-1.5 text-sm font-bold text-danger-400">
              ⚙️ {de.robotPhase}
            </span>
          </div>
        )}
      </div>

      <EventTicker text={game.ticker} />

      <ActionBar
        view={game.view}
        mode={game.mode}
        busy={game.busy}
        onSelectHero={game.onSelectHero}
        onStartAbility={game.onStartAbility}
        onStartItem={game.onStartItem}
        onCancelTargeting={game.onCancelTargeting}
        onEndTurn={game.onEndTurn}
      />

      {game.view.phase === "result" && (
        <ResultScreen view={game.view} onRestart={game.onRestart} />
      )}
    </main>
  );
}
