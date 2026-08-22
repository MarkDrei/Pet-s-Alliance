"use client";

import { CONTENT } from "@/content";
import type { GameState } from "@/engine";
import { de } from "@/i18n/de";
import { SpriteIcon } from "@/components/sprites/registry";
import type { InteractionMode } from "@/state/gameStore";

interface BottomBarProps {
  game: GameState;
  selectedHeroId: string | null;
  selectedRobotId: string | null;
  mode: InteractionMode;
  /** True while the robot phase is being played back; inputs are locked. */
  busy: boolean;
  onSetMode: (mode: InteractionMode) => void;
  onEndTurn: () => void;
}

function Hearts({ hp, maxHp }: { hp: number; maxHp: number }) {
  return (
    <span className="text-danger" aria-label={`${de.hp}: ${hp} / ${maxHp}`}>
      {"\u2665".repeat(hp)}
      <span className="opacity-30">{"\u2665".repeat(maxHp - hp)}</span>
    </span>
  );
}

function ActionButton({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
        active
          ? "border-accent bg-accent text-background-deep"
          : "border-panel-border bg-panel text-foreground"
      } disabled:opacity-40`}
    >
      {label}
    </button>
  );
}

export function BottomBar({
  game,
  selectedHeroId,
  selectedRobotId,
  mode,
  busy,
  onSetMode,
  onEndTurn,
}: BottomBarProps) {
  const hero = game.heroes.find((h) => h.id === selectedHeroId);
  const heroDef = hero ? CONTENT.heroes[hero.defId] : null;
  const heroText = hero ? de.heroes[hero.defId] : null;
  const robot = game.robots.find((r) => r.id === selectedRobotId);
  const robotDef = robot ? CONTENT.robots[robot.defId] : null;
  const robotText = robot ? de.robots[robot.defId] : null;
  const item = game.items.find((i) => !i.used);
  const itemText = item ? de.items[item.defId] : null;

  const targetHint = busy
    ? de.robotPhase
    : mode === "move"
      ? de.targetHint.move
      : mode === "ability" && heroDef
        ? de.targetHint[heroDef.ability.id]
        : mode === "item"
          ? de.targetHint.item
          : null;

  return (
    <footer className="space-y-2 px-4 pb-4 pt-2">
      {targetHint && (
        <div className="text-center text-sm font-medium text-accent">{targetHint}</div>
      )}

      <div className="flex min-h-20 items-center gap-3 rounded-2xl border border-panel-border bg-panel/80 px-3 py-2">
        {hero && heroDef && heroText ? (
          <>
            <div className="shrink-0 rounded-xl bg-background-deep/50 p-1">
              <SpriteIcon id={heroDef.visual} size={52} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-bold">{heroText.name}</span>
                <span className="text-sm">
                  <Hearts hp={hero.hp} maxHp={heroDef.maxHp} />
                </span>
                <span className="text-xs text-foreground/70">
                  {de.stats.move} {heroDef.move}
                </span>
                {hero.shielded && <span className="text-xs text-sky-300">{de.shielded}</span>}
              </div>
              <div className="text-xs text-foreground/60">{heroText.description}</div>
              <div className="pt-0.5 text-xs text-foreground/80">
                <span className="font-semibold text-accent">{heroText.ability}:</span>{" "}
                {heroText.abilityHint}
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-1.5">
              <ActionButton
                label={hero.hasMoved ? de.moved : de.move}
                active={mode === "move"}
                disabled={hero.hasMoved}
                onClick={() => onSetMode(mode === "move" ? "idle" : "move")}
              />
              <ActionButton
                label={hero.hasActed ? de.acted : heroText.ability}
                active={mode === "ability"}
                disabled={hero.hasActed}
                onClick={() => onSetMode(mode === "ability" ? "idle" : "ability")}
              />
            </div>
          </>
        ) : robot && robotDef && robotText ? (
          <>
            <div className="shrink-0 rounded-xl bg-background-deep/50 p-1">
              <SpriteIcon id={robotDef.visual} size={52} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-bold">{robotText.name}</span>
                <span className="text-sm">
                  <Hearts hp={robot.hp} maxHp={robotDef.maxHp} />
                </span>
                <span className="text-xs text-foreground/70">
                  {de.stats.move} {robotDef.move} · {de.stats.damage} {robotDef.damage}
                </span>
                {robotDef.heavy && (
                  <span className="text-xs font-semibold text-danger">{de.heavyLabel}</span>
                )}
                {robot.stunned && <span className="text-xs text-accent">{de.stunnedLabel}</span>}
              </div>
              <div className="text-xs text-foreground/80">{robotText.description}</div>
              <div className="pt-0.5 text-xs text-foreground/50">{de.robotRuleHint}</div>
            </div>
          </>
        ) : (
          <div className="flex-1 text-center text-sm text-foreground/70">
            <div>{de.selectHint}</div>
            <div className="pt-1 text-xs text-foreground/50">{de.heroRuleHint}</div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {item && itemText && (
          <button
            type="button"
            onClick={() => onSetMode(mode === "item" ? "idle" : "item")}
            title={itemText.hint}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold ${
              mode === "item"
                ? "border-accent bg-accent text-background-deep"
                : "border-panel-border bg-panel"
            }`}
          >
            <SpriteIcon id={CONTENT.items[item.defId].visual} size={22} />
            {itemText.name}
          </button>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={onEndTurn}
          className="flex-1 rounded-xl bg-accent px-4 py-3 text-base font-bold text-background-deep active:scale-[0.98] disabled:opacity-40"
        >
          {de.endTurn}
        </button>
      </div>
    </footer>
  );
}
