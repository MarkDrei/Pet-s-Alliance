"use client";

/* eslint-disable @next/next/no-img-element */
import { publicUrl } from "@/assetUrl";
import { HERO_DEFS, ROBOT_DEFS, isToppleable } from "@/engine/defs";
import { hexKey } from "@/engine/hex";
import type { GameState } from "@/engine/types";
import { de } from "@/i18n/de";
import { RobotSprite, PropSprite, TerrainSprite } from "./sprites";
import type { InspectTarget } from "./useGameController";

interface InspectPanelProps {
  view: GameState;
  target: InspectTarget;
  onClose: () => void;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <span className="rounded-lg bg-white/10 px-2 py-0.5 text-xs">
      <span className="text-white/60">{label} </span>
      <span className="font-bold">{value}</span>
    </span>
  );
}

export function InspectPanel({ view, target, onClose }: InspectPanelProps) {
  let content: React.ReactNode = null;

  if (target.kind === "hero") {
    const hero = view.heroes.find((h) => h.id === target.id);
    if (!hero) return null;
    const def = HERO_DEFS[hero.defId];
    const text = de.heroes[hero.defId];
    content = (
      <div className="flex gap-3">
        <img
          src={publicUrl(`/sprites/heroes/${hero.defId}.png`)}
          alt={text.name}
          className="h-16 w-16 shrink-0 object-contain"
        />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-bold text-honey-300">{text.name}</span>
            <Stat label={de.hp} value={`${hero.hp}/${hero.maxHp}`} />
            <Stat label={de.stats.move} value={def.move} />
          </div>
          <p className="mt-1 text-xs leading-snug text-white/80">{text.description}</p>
          <p className="mt-1.5 text-xs">
            <span className="font-bold text-plum-400">
              {de.ability}: {text.ability}
            </span>{" "}
            <span className="text-white/70">{text.abilityHint}</span>
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11px]">
            {hero.down ? (
              <span className="rounded-md bg-danger-500/30 px-1.5 py-0.5">{de.down}</span>
            ) : (
              <>
                <span
                  className={`rounded-md px-1.5 py-0.5 ${hero.hasMoved || hero.doneForRound ? "bg-white/10 text-white/45 line-through" : "bg-mint-400/25 text-mint-300"}`}
                >
                  {de.inspect.canStillMove}
                </span>
                <span
                  className={`rounded-md px-1.5 py-0.5 ${hero.hasActed || hero.doneForRound ? "bg-white/10 text-white/45 line-through" : "bg-mint-400/25 text-mint-300"}`}
                >
                  {de.inspect.canStillAct}
                </span>
                {hero.shielded && (
                  <span className="rounded-md bg-sky-soft/25 px-1.5 py-0.5">✨ {de.shielded}</span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  } else if (target.kind === "robot") {
    const robot = view.robots.find((r) => r.id === target.id);
    if (!robot) return null;
    const def = ROBOT_DEFS[robot.defId];
    const text = de.robots[robot.defId];
    const intent = robot.intent;
    content = (
      <div className="flex gap-3">
        <svg viewBox="-34 -46 68 62" className="h-16 w-16 shrink-0">
          <RobotSprite defId={robot.defId} />
        </svg>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-bold text-danger-400">{text.name}</span>
            <Stat label={de.hp} value={`${robot.hp}/${robot.maxHp}`} />
            <Stat label={de.stats.move} value={def.move} />
            <Stat label={de.stats.damage} value={def.damage} />
          </div>
          <p className="mt-1 text-xs leading-snug text-white/80">{text.description}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11px]">
            {def.heavy && (
              <span className="rounded-md bg-amber-500/25 px-1.5 py-0.5 text-amber-200">
                {de.heavyLabel}
              </span>
            )}
            {robot.stunned && (
              <span className="rounded-md bg-sky-soft/25 px-1.5 py-0.5">
                {de.fx.stunned} {de.stunnedLabel}
              </span>
            )}
            {intent && (
              <span className="rounded-md bg-danger-500/20 px-1.5 py-0.5 text-danger-400">
                {de.inspect.planLabel}:{" "}
                {intent.attacks ? de.inspect.planWalk(intent.steps) : de.inspect.planNoAttack}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  } else if (target.kind === "prop") {
    const prop = view.props.find((p) => p.id === target.id);
    if (!prop) return null;
    content = (
      <div className="flex items-center gap-3">
        <svg viewBox="-30 -40 60 70" className="h-14 w-14 shrink-0">
          <PropSprite defId={prop.defId} toppled={prop.toppled} />
        </svg>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-bold text-honey-300">
              {de.inspect.propNames[prop.defId]}
            </span>
            {prop.toppled && (
              <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[11px] text-white/60">
                {de.inspect.toppledLabel}
              </span>
            )}
            {prop.shielded && (
              <span className="rounded-md bg-sky-soft/25 px-1.5 py-0.5 text-[11px]">
                ✨ {de.shielded}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs leading-snug text-white/80">
            {de.inspect.propHints[prop.defId]}
          </p>
          {isToppleable(prop.defId) && !prop.toppled && (
            <p className="mt-1 text-[11px] text-white/55">{de.robotRuleHint}</p>
          )}
        </div>
      </div>
    );
  } else {
    const kind = view.terrain[hexKey(target.pos)];
    if (!kind) return null;
    content = (
      <div className="flex items-center gap-3">
        <svg viewBox="-28 -28 56 56" className="h-14 w-14 shrink-0">
          <TerrainSprite kind={kind} />
        </svg>
        <div>
          <span className="text-base font-bold text-sky-soft">
            {de.inspect.terrainNames[kind]}
          </span>
          <p className="mt-1 text-xs leading-snug text-white/80">
            {de.inspect.terrainHints[kind]}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-slide-up pointer-events-auto mx-3 mb-2 rounded-2xl border-2 border-white/15 bg-night-900/95 p-3 shadow-xl shadow-black/50 backdrop-blur">
      <button
        onClick={onClose}
        aria-label="✕"
        className="btn-squish absolute right-5 top-2 flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-xs"
      >
        ✕
      </button>
      {content}
    </div>
  );
}
