"use client";

/* eslint-disable @next/next/no-img-element */
import { publicUrl } from "@/assetUrl";
import { HERO_DEFS } from "@/engine/defs";
import type { GameState, ItemId } from "@/engine/types";
import { de } from "@/i18n/de";
import { CannonballIcon, WindupKeyIcon } from "./sprites";
import type { UiMode } from "./useGameController";

interface ActionBarProps {
  view: GameState;
  mode: UiMode;
  busy: boolean;
  onSelectHero: (heroId: string) => void;
  onStartAbility: (heroId: string) => void;
  onStartItem: (itemId: ItemId) => void;
  onCancelTargeting: () => void;
  onEndTurn: () => void;
}

export function ActionBar({
  view,
  mode,
  busy,
  onSelectHero,
  onStartAbility,
  onStartItem,
  onCancelTargeting,
  onEndTurn,
}: ActionBarProps) {
  const playerTurn = view.phase === "player" && !busy;
  const selectedHeroId =
    mode.kind === "hero" || mode.kind === "ability" ? mode.heroId : null;
  const selectedHero = view.heroes.find((h) => h.id === selectedHeroId) ?? null;

  const targetHint =
    mode.kind === "ability" && selectedHero
      ? de.targetHint[HERO_DEFS[selectedHero.defId].ability]
      : mode.kind === "item"
        ? de.targetHint[mode.itemId === "cannonball" ? "cannonball" : "item"]
        : null;

  return (
    <div className="px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      {targetHint && (
        <div className="mb-2 flex items-center justify-between gap-2 rounded-2xl border-2 border-honey-300/60 bg-honey-300/15 px-3 py-2">
          <span className="animate-pulse-soft text-sm font-semibold text-honey-300">{targetHint}</span>
          <button
            onClick={onCancelTargeting}
            className="btn-squish rounded-xl bg-white/15 px-3 py-1 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Hero roster */}
        <div className="flex flex-1 gap-2">
          {view.heroes.map((hero) => {
            const def = HERO_DEFS[hero.defId];
            const selected = hero.id === selectedHeroId;
            const spent = hero.hasMoved && hero.hasActed;
            const inactive = hero.down || hero.doneForRound || spent;
            return (
              <button
                key={hero.id}
                onClick={() => onSelectHero(hero.id)}
                disabled={!playerTurn || hero.down}
                className={`btn-squish relative flex-1 rounded-2xl border-2 p-1.5 pt-1 text-center transition-colors ${
                  selected
                    ? "border-mint-400 bg-mint-400/20"
                    : inactive
                      ? "border-white/10 bg-white/5 opacity-55"
                      : "border-white/25 bg-white/10"
                }`}
              >
                <img
                  src={publicUrl(`/sprites/heroes/${hero.defId}.png`)}
                  alt={de.heroes[hero.defId].name}
                  className={`mx-auto h-10 w-10 object-contain ${hero.down ? "grayscale" : ""}`}
                />
                <div className="mt-0.5 flex justify-center gap-0.5">
                  {Array.from({ length: hero.maxHp }, (_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 w-1.5 rounded-full ${i < hero.hp ? "bg-candy-500" : "bg-white/20"}`}
                    />
                  ))}
                </div>
                {hero.down && (
                  <span className="absolute inset-x-0 top-1 text-[9px] font-bold text-white/70">
                    {de.down}
                  </span>
                )}
                {hero.shielded && (
                  <span className="absolute -right-1 -top-1 text-xs">✨</span>
                )}
                {/* Ability button pops up on the selected hero */}
                {selected && !hero.hasActed && !hero.down && (
                  <span
                    role="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartAbility(hero.id);
                    }}
                    className={`btn-squish absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl border-2 px-2.5 py-1 text-xs font-bold shadow-lg ${
                      mode.kind === "ability"
                        ? "border-honey-300 bg-honey-400 text-night-900"
                        : "border-plum-400 bg-plum-500 text-white"
                    }`}
                  >
                    ✨ {def && de.heroes[hero.defId].ability}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Items */}
        <div className="flex flex-col gap-1.5">
          {view.items.includes("windup-key") && (
            <button
              onClick={() => onStartItem("windup-key")}
              disabled={!playerTurn || !view.windupAvailable}
              title={de.items["windup-key"].name}
              className={`btn-squish flex h-9 w-9 items-center justify-center rounded-xl border-2 ${
                mode.kind === "item" && mode.itemId === "windup-key"
                  ? "border-honey-300 bg-honey-400/30 text-honey-300"
                  : view.windupAvailable
                    ? "border-sky-soft/50 bg-sky-soft/15 text-sky-soft"
                    : "border-white/10 bg-white/5 text-white/25"
              }`}
            >
              <WindupKeyIcon className="h-5 w-5" />
            </button>
          )}
          {view.items.includes("cannonball") && (
            <button
              onClick={() => onStartItem("cannonball")}
              disabled={!playerTurn || view.cannonballUsed}
              title={de.items.cannonball.name}
              className={`btn-squish flex h-9 w-9 items-center justify-center rounded-xl border-2 ${
                mode.kind === "item" && mode.itemId === "cannonball"
                  ? "border-honey-300 bg-honey-400/30 text-honey-300"
                  : !view.cannonballUsed
                    ? "border-candy-400/50 bg-candy-400/15 text-candy-400"
                    : "border-white/10 bg-white/5 text-white/25"
              }`}
            >
              <CannonballIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* End turn */}
        <button
          onClick={onEndTurn}
          disabled={!playerTurn}
          className={`btn-squish h-[4.75rem] rounded-2xl border-b-4 px-3 text-sm font-bold leading-tight ${
            playerTurn
              ? "border-amber-700 bg-gradient-to-b from-honey-300 to-honey-400 text-night-900 shadow-lg shadow-honey-400/25"
              : "border-white/10 bg-white/10 text-white/40"
          }`}
        >
          {view.phase === "execution" ? "⚙️" : de.endTurn.split(" ").map((w) => (
            <span key={w} className="block">
              {w}
            </span>
          ))}
        </button>
      </div>
    </div>
  );
}
