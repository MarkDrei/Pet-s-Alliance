"use client";

import { useMemo } from "react";
import { BOARD_TILES, hexKey, type Axial, type Dir } from "@/engine/hex";
import { previewIntent } from "@/engine/planning";
import type { AbilityTarget } from "@/engine/game";
import type { FloorKind, GameEvent, GameState } from "@/engine/types";
import { de } from "@/i18n/de";
import { publicUrl } from "@/assetUrl";
import { HEX, tileCenter, tilePoints, VIEW_BOX, VIEW_RECT } from "./layout";
import {
  BlastStar,
  HeroSprite,
  PoofCloud,
  PropSprite,
  RobotSprite,
  SparkleBurst,
  TerrainSprite,
} from "./sprites";
import type { InspectTarget, UiMode } from "./useGameController";

const FLOOR_TEXTURES: Record<FloorKind, string> = {
  rug: "/sprites/ui/floor-rug.png",
  wood: "/sprites/ui/floor-wood.png",
  track: "/sprites/ui/floor-track.png",
  desk: "/sprites/ui/floor-desk.png",
};

const FLOOR_CLIP_ID = "board-floor-clip";

/** Facing angle in degrees for each hex direction (flat-top layout). */
const DIR_ANGLE: Record<Dir, number> = { 0: -90, 1: -30, 2: 30, 3: 90, 4: 150, 5: 210 };

function Heart({ x, filled }: { x: number; filled: boolean }) {
  return (
    <path
      d="M 0 2.4 C -4 -1.6 -3 -5 0 -3.4 C 3 -5 4 -1.6 0 2.4 Z"
      transform={`translate(${x} 0) scale(1.6)`}
      fill={filled ? "#f43f5e" : "rgba(255,255,255,0.25)"}
      stroke="#4c0519"
      strokeWidth={0.7}
    />
  );
}

function HeartRow({ hp, maxHp, y }: { hp: number; maxHp: number; y: number }) {
  const width = (maxHp - 1) * 11;
  return (
    <g transform={`translate(0 ${y})`}>
      {Array.from({ length: maxHp }, (_, i) => (
        <Heart key={i} x={-width / 2 + i * 11} filled={i < hp} />
      ))}
    </g>
  );
}

interface HexBoardProps {
  view: GameState;
  event: GameEvent | null;
  mode: UiMode;
  inspect: InspectTarget | null;
  actingRobotId: string | null;
  moveTargets: Axial[];
  abilityTargetList: AbilityTarget[];
  itemTargetIds: string[];
  onTileTap: (hex: Axial) => void;
}

export function HexBoard({
  view,
  event,
  mode,
  inspect,
  actingRobotId,
  moveTargets,
  abilityTargetList,
  itemTargetIds,
  onTileTap,
}: HexBoardProps) {
  const executing = view.phase === "execution";

  // Robot plans: red path + attack tiles.
  const plans = useMemo(() => {
    return view.robots
      .filter((r) => !r.removed && r.intent)
      .map((r) => ({ robot: r, preview: previewIntent(view, r) }));
  }, [view]);

  // Positions highlighted as ability / item targets.
  const targetHexes = useMemo(() => {
    const hexes: Axial[] = [];
    for (const t of abilityTargetList) {
      if (t.kind === "robot") {
        const r = view.robots.find((x) => x.id === t.robotId);
        if (r) hexes.push(r.pos);
      } else if (t.kind === "hero") {
        const h = view.heroes.find((x) => x.id === t.heroId);
        if (h) hexes.push(h.pos);
      } else {
        const p = view.props.find((x) => x.id === t.propId);
        if (p) hexes.push(p.pos);
      }
    }
    for (const id of itemTargetIds) {
      const r = view.robots.find((x) => x.id === id);
      if (r) hexes.push(r.pos);
    }
    return hexes;
  }, [abilityTargetList, itemTargetIds, view]);

  const selectedHeroId = mode.kind === "hero" || mode.kind === "ability" ? mode.heroId : null;
  const inspectedRobotId = inspect?.kind === "robot" ? inspect.id : null;

  // Pieces sorted for painting: toppled props flat on the floor first,
  // then everything else by screen y.
  const pieces = useMemo(() => {
    const standing = [
      ...view.props.map((p) => ({ type: "prop" as const, entity: p, flat: p.toppled })),
      ...view.heroes.filter((h) => !h.down).map((h) => ({ type: "hero" as const, entity: h, flat: false })),
      ...view.robots.filter((r) => !r.removed).map((r) => ({ type: "robot" as const, entity: r, flat: false })),
    ];
    return standing.sort((a, b) => {
      if (a.flat !== b.flat) return a.flat ? -1 : 1;
      return tileCenter(a.entity.pos).y - tileCenter(b.entity.pos).y;
    });
  }, [view]);

  return (
    <svg
      viewBox={VIEW_BOX}
      className="h-full w-full touch-manipulation"
      role="img"
      aria-label={de.levels[view.levelId]?.name ?? view.levelId}
    >
      <defs>
        <clipPath id={FLOOR_CLIP_ID}>
          {BOARD_TILES.map((tile) => (
            <polygon key={hexKey(tile)} points={tilePoints(tile, 0.97)} />
          ))}
        </clipPath>
      </defs>

      {/* Floor: one texture across the whole board, showing only through the tiles. */}
      <g clipPath={`url(#${FLOOR_CLIP_ID})`} pointerEvents="none">
        <image
          href={publicUrl(FLOOR_TEXTURES[view.floor])}
          x={VIEW_RECT.x}
          y={VIEW_RECT.y}
          width={VIEW_RECT.width}
          height={VIEW_RECT.height}
          preserveAspectRatio="xMidYMid slice"
        />
      </g>

      <g>
        {BOARD_TILES.map((tile) => {
          const shade = ((tile.q - tile.r) % 2 + 2) % 2;
          return (
            <polygon
              key={hexKey(tile)}
              points={tilePoints(tile, 0.97)}
              fill={shade === 1 ? "rgba(20,10,40,0.13)" : "rgba(255,255,255,0.04)"}
              stroke="rgba(20,10,40,0.5)"
              strokeWidth={1.6}
              onClick={() => onTileTap(tile)}
            />
          );
        })}
      </g>

      {/* Terrain */}
      <g pointerEvents="none">
        {Object.entries(view.terrain).map(([key, kind]) => {
          const [q, r] = key.split(",").map(Number);
          const { x, y } = tileCenter({ q, r });
          return (
            <g key={key} transform={`translate(${x} ${y})`}>
              <TerrainSprite kind={kind} />
            </g>
          );
        })}
      </g>

      {/* Robot plans */}
      <g pointerEvents="none">
        {plans.map(({ robot, preview }) => {
          const acting = actingRobotId === robot.id;
          if (executing && !acting) return null; // others' plans dim out entirely
          const emphasized = acting || inspectedRobotId === robot.id;
          const baseOpacity = executing || emphasized ? 1 : 0.55;
          return (
            <g key={`plan-${robot.id}`} opacity={baseOpacity}>
              {[...preview.path, ...preview.slide].map((t, i) => (
                <polygon
                  key={`p${i}`}
                  points={tilePoints(t, 0.55)}
                  fill="#f87171"
                  opacity={0.35}
                />
              ))}
              {preview.attack.map((t, i) => (
                <polygon
                  key={`a${i}`}
                  points={tilePoints(t, 0.8)}
                  fill="#ef4444"
                  opacity={0.5}
                  stroke="#fecaca"
                  strokeWidth={2}
                  strokeDasharray="6 5"
                  className="animate-pulse-soft"
                />
              ))}
            </g>
          );
        })}
      </g>

      {/* Move targets */}
      <g pointerEvents="none">
        {moveTargets.map((t) => (
          <polygon
            key={`m-${hexKey(t)}`}
            points={tilePoints(t, 0.82)}
            fill="#86efac"
            opacity={0.4}
            stroke="#bbf7d0"
            strokeWidth={2}
          />
        ))}
      </g>

      {/* Ability / item target rings */}
      <g pointerEvents="none">
        {targetHexes.map((t, i) => {
          const { x, y } = tileCenter(t);
          return (
            <circle
              key={`t-${i}`}
              cx={x}
              cy={y}
              r={HEX * 0.72}
              fill="none"
              stroke="#fbbf24"
              strokeWidth={4}
              strokeDasharray="10 7"
              className="animate-pulse-soft"
            />
          );
        })}
      </g>

      {/* Pieces */}
      <g pointerEvents="none">
        {pieces.map(({ type, entity, flat }) => {
          const { x, y } = tileCenter(entity.pos);
          const isSelected = type === "hero" && entity.id === selectedHeroId;
          const isActing = type === "robot" && entity.id === actingRobotId;
          const dimmed =
            (executing && type === "robot" && actingRobotId !== null && !isActing) ||
            (type === "hero" && view.phase === "player" && (entity as GameState["heroes"][number]).doneForRound);
          const wobble =
            event &&
            ((event.type === "robotBumped" && type === "robot" && event.robotId === entity.id) ||
              (event.type === "blocksHit" && type === "prop" && event.propId === entity.id) ||
              (event.type === "heroHit" && type === "hero" && event.heroId === entity.id));
          const isJumping =
            event?.type === "heroStep" && event.jump && type === "hero" && event.heroId === entity.id;
          return (
            // The outer group only positions the piece: its inline
            // transform must never share the element with a CSS animation
            // (animations override inline transforms while filling).
            <g
              key={entity.id}
              style={{
                transform: `translate(${x}px, ${y}px)`,
                transition: "transform 220ms ease-in-out",
              }}
              opacity={dimmed ? 0.45 : 1}
            >
              <g className="animate-pop-in">
                {(isSelected || isActing) && (
                  <ellipse
                    cx={0}
                    cy={6}
                    rx={HEX * 0.68}
                    ry={HEX * 0.42}
                    fill={isActing ? "rgba(251,191,36,0.4)" : "rgba(134,239,172,0.4)"}
                    className="animate-pulse-soft"
                  />
                )}
                <g className={wobble ? "animate-wobble" : isJumping ? "animate-hop" : undefined}>
                  {type === "hero" && <HeroSprite defId={entity.defId} />}
                  {type === "robot" && <RobotSprite defId={entity.defId} />}
                  {type === "prop" && <PropSprite defId={entity.defId} toppled={flat} />}
                </g>
                {/* Facing arrow for robots */}
                {type === "robot" && (
                  <g transform={`rotate(${DIR_ANGLE[entity.facing]})`} opacity={0.9}>
                    <path
                      d={`M ${HEX * 0.62} -5 L ${HEX * 0.82} 0 L ${HEX * 0.62} 5 Z`}
                      fill="#fecaca"
                      stroke="#7f1d1d"
                      strokeWidth={1.2}
                    />
                  </g>
                )}
                {/* Hearts */}
                {type === "hero" && (
                  <HeartRow hp={entity.hp} maxHp={entity.maxHp} y={-HEX * 1.18} />
                )}
                {type === "robot" && entity.maxHp > 1 && (
                  <HeartRow hp={entity.hp} maxHp={entity.maxHp} y={-HEX * 1.18} />
                )}
                {/* Shield ring */}
                {(type === "hero" || type === "prop") && entity.shielded && (
                  <g className="animate-pulse-soft">
                    <circle r={HEX * 0.62} cy={-8} fill="none" stroke="#a5f3fc" strokeWidth={3.5} strokeDasharray="4 6" strokeLinecap="round" />
                    <circle r={HEX * 0.52} cy={-8} fill="rgba(165,243,252,0.12)" />
                  </g>
                )}
                {/* Wind-up Zzz */}
                {type === "robot" && entity.stunned && (
                  <text
                    x={HEX * 0.45}
                    y={-HEX * 0.75}
                    fontSize={17}
                    fontWeight={700}
                    fill="#bae6fd"
                    stroke="#0c4a6e"
                    strokeWidth={0.6}
                    className="animate-bob"
                  >
                    {de.fx.stunned}
                  </text>
                )}
              </g>
            </g>
          );
        })}
      </g>

      {/* Transient effects for the current event */}
      <EffectLayer view={view} event={event} />
    </svg>
  );
}

function EffectLayer({ view, event }: { view: GameState; event: GameEvent | null }) {
  if (!event) return null;

  const robotPos = (robotId: string) => view.robots.find((r) => r.id === robotId)?.pos;
  const heroPos = (heroId: string) => view.heroes.find((h) => h.id === heroId)?.pos;
  const propPos = (propId: string) => view.props.find((p) => p.id === propId)?.pos;

  const at = (pos: Axial | undefined, node: React.ReactNode, cls = "animate-blast") => {
    if (!pos) return null;
    const { x, y } = tileCenter(pos);
    return (
      <g pointerEvents="none" transform={`translate(${x} ${y})`}>
        <g className={cls}>{node}</g>
      </g>
    );
  };

  switch (event.type) {
    case "robotAttacked":
      return (
        <g pointerEvents="none">
          {event.tiles.map((t, i) => (
            <polygon
              key={i}
              points={tilePoints(t, 0.85)}
              fill="#fbbf24"
              opacity={0.55}
              className="animate-blast"
            />
          ))}
        </g>
      );
    case "robotExploded":
      return at(robotPos(event.robotId), <BlastStar size={HEX * 1.6} />);
    case "cannonballHit":
      return at(robotPos(event.robotId), <BlastStar size={HEX * 0.9} />);
    case "robotDestroyed":
    case "robotExited":
      return at(robotPos(event.robotId), <PoofCloud />);
    case "heroDown":
      return at(heroPos(event.heroId), <PoofCloud />);
    case "towerToppled":
      return at(propPos(event.propId), <PoofCloud />);
    case "heroHit":
      return at(
        heroPos(event.heroId),
        <text
          y={-HEX}
          textAnchor="middle"
          fontSize={26}
          fontWeight={700}
          fill="#fda4af"
          stroke="#881337"
          strokeWidth={1}
        >
          -{event.damage}
        </text>,
        "animate-pop-in",
      );
    case "shieldBlocked": {
      const pos = event.heroId ? heroPos(event.heroId) : event.propId ? propPos(event.propId) : undefined;
      return at(pos, <SparkleBurst />, "animate-pop-in");
    }
    case "shieldCast": {
      const target =
        view.heroes.find((h) => h.id === event.targetId) ??
        view.props.find((p) => p.id === event.targetId);
      return at(target?.pos, <SparkleBurst />, "animate-pop-in");
    }
    case "windupApplied":
      return at(
        robotPos(event.robotId),
        <text y={-HEX * 0.9} textAnchor="middle" fontSize={24}>
          🔑
        </text>,
        "animate-pop-in",
      );
    case "robotSpawned":
      return at(robotPos(event.robotId), <SparkleBurst />, "animate-pop-in");
    default:
      return null;
  }
}
