import type { Axial } from "./hex";
import { hexEquals, hexKey, inBoard } from "./hex";
import type { GameState, HeroState, PropState, RobotState } from "./types";

export type Occupant =
  | { kind: "hero"; hero: HeroState }
  | { kind: "robot"; robot: RobotState }
  | { kind: "prop"; prop: PropState };

/**
 * The piece standing on a tile, if any. Toppled props are flat rubble
 * and do not occupy; downed heroes and removed robots are off the board.
 */
export function occupantAt(state: GameState, hex: Axial): Occupant | null {
  const hero = state.heroes.find((h) => !h.down && hexEquals(h.pos, hex));
  if (hero) return { kind: "hero", hero };
  const robot = state.robots.find((r) => !r.removed && hexEquals(r.pos, hex));
  if (robot) return { kind: "robot", robot };
  const prop = state.props.find((p) => !p.toppled && hexEquals(p.pos, hex));
  if (prop) return { kind: "prop", prop };
  return null;
}

export function terrainAt(state: GameState, hex: Axial): "marbles" | "cushion" | null {
  return state.terrain[hexKey(hex)] ?? null;
}

/** Blocked for hero movement: off-board or occupied by a standing piece. */
export function isBlockedForHero(state: GameState, hex: Axial): boolean {
  if (!inBoard(hex)) return true;
  return occupantAt(state, hex) !== null;
}

/**
 * Blocked for robot movement: off-board, occupied, or a cushion
 * (robots cannot enter or roll onto cushions).
 */
export function isBlockedForRobot(state: GameState, hex: Axial): boolean {
  if (!inBoard(hex)) return true;
  if (terrainAt(state, hex) === "cushion") return true;
  return occupantAt(state, hex) !== null;
}

/**
 * A spawn tile is blocked when it is a cushion or occupied by a living
 * hero, a robot, or a standing prop (toppled rubble is fine).
 */
export function isSpawnBlocked(state: GameState, hex: Axial): boolean {
  return isBlockedForRobot(state, hex);
}
