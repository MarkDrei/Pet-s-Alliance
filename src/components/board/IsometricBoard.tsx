"use client";

import type { Content, Direction, GameState, RobotState, Vec } from "@/engine";
import { directionFromTo, vecEquals, vecKey } from "@/engine";
import { Sprite } from "@/components/sprites/registry";
import { TILE_H, TILE_W, boardViewBox, diamondPoints, gridToScreen } from "./iso";

export type HighlightKind = "move" | "target";

export interface IsometricBoardProps {
  content: Content;
  state: GameState;
  selectedHeroId: string | null;
  selectedRobotId: string | null;
  highlightTiles: Vec[];
  highlightKind: HighlightKind | null;
  onTileClick: (pos: Vec) => void;
}

interface Entity {
  key: string;
  pos: Vec;
  render: () => React.ReactElement;
}

/**
 * Maps grid space onto the isometric ground plane: grid +x becomes the
 * down-right tile edge, grid +y the down-left one. Anything drawn inside
 * this transform lies flat on the floor like a painted marking.
 */
const GROUND_TRANSFORM = `matrix(${TILE_W / 2} ${TILE_H / 2} ${-TILE_W / 2} ${TILE_H / 2} 0 0)`;

const GRID_ANGLE: Record<Direction, number> = {
  east: 0,
  south: 90,
  west: 180,
  north: 270,
};

/**
 * The direction a robot is about to head: the first step of its planned path
 * if it has one, otherwise its facing (e.g. a dasher waiting at a wall or a
 * confused robot about to stumble off the edge).
 */
function robotHeading(robot: RobotState): Direction {
  if (robot.intent && robot.intent.path.length > 0) {
    return directionFromTo(robot.pos, robot.intent.path[0]) ?? robot.facing;
  }
  return robot.facing;
}

/** Ground arrow in front of a robot showing where it will head. */
function HeadingArrow({ direction }: { direction: Direction }) {
  // Drawn in grid units pointing east (+x), then rotated in grid space and
  // flattened onto the ground, so it reads correctly in all four directions.
  const arrowPath =
    "M 0.12 -0.1 L 0.33 -0.1 L 0.33 -0.2 L 0.62 0 L 0.33 0.2 L 0.33 0.1 L 0.12 0.1 Z";
  return (
    <g transform={`${GROUND_TRANSFORM} rotate(${GRID_ANGLE[direction]})`} opacity={0.95}>
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 0; 0.07 0; 0 0"
          dur="1.4s"
          repeatCount="indefinite"
        />
        <path
          d={arrowPath}
          fill="url(#heading-arrow-fill)"
          stroke="#6b4310"
          strokeWidth={1.5}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </g>
    </g>
  );
}

export function IsometricBoard({
  content,
  state,
  selectedHeroId,
  selectedRobotId,
  highlightTiles,
  highlightKind,
  onTileClick,
}: IsometricBoardProps) {
  const size = state.gridSize;
  const tiles: Vec[] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) tiles.push({ x, y });
  }

  const intentPathTiles: Vec[] = [];
  const intentAttackTiles: Vec[] = [];
  if (state.phase === "playerTurn") {
    for (const robot of state.robots) {
      if (!robot.intent) continue;
      intentPathTiles.push(...robot.intent.path);
      if (robot.intent.attackTile) intentAttackTiles.push(robot.intent.attackTile);
    }
  }

  const entities: Entity[] = [];

  for (const prop of state.props) {
    const def = content.props[prop.defId];
    const visual = prop.toppled ? (def.toppledVisual ?? def.visual) : def.visual;
    entities.push({
      key: prop.id,
      pos: prop.pos,
      render: () => (
        <g>
          {prop.shielded && !prop.toppled && (
            <ellipse cx={0} cy={-2} rx={27} ry={14} fill="#8ef0ff" fillOpacity={0.14} stroke="#8ef0ff" strokeWidth={2} strokeDasharray="6 4" />
          )}
          <Sprite id={visual} />
        </g>
      ),
    });
  }

  for (const hero of state.heroes) {
    const def = content.heroes[hero.defId];
    const selected = hero.id === selectedHeroId;
    entities.push({
      key: hero.id,
      pos: hero.pos,
      render: () => (
        <g opacity={hero.hp <= 0 ? 0.3 : 1}>
          {selected && (
            <ellipse cx={0} cy={0} rx={32} ry={16} fill="none" stroke="#ffffff" strokeWidth={2.5} strokeDasharray="8 5" opacity={0.9}>
              <animate attributeName="opacity" values="0.9;0.4;0.9" dur="1.4s" repeatCount="indefinite" />
            </ellipse>
          )}
          {hero.shielded && (
            <ellipse cx={0} cy={-2} rx={27} ry={14} fill="#8ef0ff" fillOpacity={0.14} stroke="#8ef0ff" strokeWidth={2} strokeDasharray="6 4" />
          )}
          <g transform={hero.hp <= 0 ? "rotate(80) scale(1 0.9)" : undefined}>
            <Sprite id={def.visual} />
          </g>
        </g>
      ),
    });
  }

  for (const robot of state.robots) {
    const def = content.robots[robot.defId];
    const selected = robot.id === selectedRobotId;
    entities.push({
      key: robot.id,
      pos: robot.pos,
      render: () => (
        <g>
          {selected && (
            <ellipse cx={0} cy={0} rx={32} ry={16} fill="none" stroke="#ff9d9d" strokeWidth={2.5} strokeDasharray="8 5" opacity={0.9}>
              <animate attributeName="opacity" values="0.9;0.4;0.9" dur="1.4s" repeatCount="indefinite" />
            </ellipse>
          )}
          <HeadingArrow direction={robotHeading(robot)} />
          <Sprite id={def.visual} />
          {robot.stunned && (
            <g transform="translate(14 -52) scale(0.45)">
              <g>
                <animateTransform attributeName="transform" type="rotate" values="0;360" dur="2.5s" repeatCount="indefinite" />
                <Sprite id="windup-key" />
              </g>
            </g>
          )}
        </g>
      ),
    });
  }

  entities.sort((a, b) => a.pos.x + a.pos.y - (b.pos.x + b.pos.y) || a.pos.y - b.pos.y);

  const highlightColor = highlightKind === "move" ? "#7ef2b1" : "#ffd76a";

  return (
    <svg
      viewBox={boardViewBox(size)}
      className="block w-full max-h-full touch-manipulation select-none"
      role="application"
      aria-label="Spielfeld"
    >
      <defs>
        <linearGradient id="heading-arrow-fill" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffe08a" />
          <stop offset="100%" stopColor="#ff9d2e" />
        </linearGradient>
      </defs>

      {/* Ground tiles */}
      {tiles.map((pos) => {
        const { sx, sy } = gridToScreen(pos);
        return (
          <g key={vecKey(pos)} transform={`translate(${sx} ${sy})`}>
            <Sprite id={(pos.x + pos.y) % 2 === 0 ? "tile-light" : "tile-dark"} />
          </g>
        );
      })}

      {/* Robot intent previews */}
      {intentPathTiles.map((pos, i) => {
        const { sx, sy } = gridToScreen(pos);
        return (
          <polygon
            key={`ip-${i}-${vecKey(pos)}`}
            transform={`translate(${sx} ${sy})`}
            points={diamondPoints(0.92)}
            fill="#ff6b6b"
            opacity={0.22}
          />
        );
      })}
      {intentAttackTiles.map((pos, i) => {
        const { sx, sy } = gridToScreen(pos);
        return (
          <g key={`ia-${i}-${vecKey(pos)}`} transform={`translate(${sx} ${sy})`}>
            <polygon points={diamondPoints(0.92)} fill="#ff4b4b" opacity={0.32}>
              <animate attributeName="opacity" values="0.32;0.55;0.32" dur="1.2s" repeatCount="indefinite" />
            </polygon>
            <polygon points={diamondPoints(0.92)} fill="none" stroke="#ff4b4b" strokeWidth={2} opacity={0.8} />
          </g>
        );
      })}

      {/* Player action highlights */}
      {highlightTiles.map((pos, i) => {
        const { sx, sy } = gridToScreen(pos);
        return (
          <g key={`hl-${i}-${vecKey(pos)}`} transform={`translate(${sx} ${sy})`}>
            <polygon points={diamondPoints(0.85)} fill={highlightColor} opacity={0.3} />
            <polygon points={diamondPoints(0.85)} fill="none" stroke={highlightColor} strokeWidth={1.8} opacity={0.85} />
          </g>
        );
      })}

      {/* Units and props, painter's order */}
      {entities.map((entity) => {
        const { sx, sy } = gridToScreen(entity.pos);
        return (
          <g key={entity.key} transform={`translate(${sx} ${sy})`} pointerEvents="none">
            {entity.render()}
          </g>
        );
      })}

      {/* Invisible tap layer so taps always resolve to a tile */}
      {tiles.map((pos) => {
        const { sx, sy } = gridToScreen(pos);
        const interactive =
          state.phase === "playerTurn" &&
          (highlightTiles.some((t) => vecEquals(t, pos)) ||
            state.heroes.some((h) => h.hp > 0 && vecEquals(h.pos, pos)) ||
            state.robots.some((r) => vecEquals(r.pos, pos)));
        return (
          <polygon
            key={`tap-${vecKey(pos)}`}
            transform={`translate(${sx} ${sy})`}
            points={diamondPoints()}
            fill="transparent"
            style={{ cursor: interactive ? "pointer" : "default" }}
            onClick={() => onTileClick(pos)}
          />
        );
      })}
    </svg>
  );
}
