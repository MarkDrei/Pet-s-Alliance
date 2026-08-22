import { inBounds, neighbors, vecEquals, vecKey } from "./grid";
import type {
  Content,
  GameState,
  HeroState,
  PropState,
  RobotState,
  TerrainKind,
  Vec,
} from "./types";

export function heroAt(state: GameState, pos: Vec): HeroState | undefined {
  return state.heroes.find((h) => h.hp > 0 && vecEquals(h.pos, pos));
}

export function robotAt(state: GameState, pos: Vec): RobotState | undefined {
  return state.robots.find((r) => vecEquals(r.pos, pos));
}

export function propAt(state: GameState, pos: Vec): PropState | undefined {
  return state.props.find((p) => vecEquals(p.pos, pos));
}

export function standingPropAt(state: GameState, pos: Vec): PropState | undefined {
  const prop = propAt(state, pos);
  return prop && !prop.toppled ? prop : undefined;
}

/**
 * A tile is blocked if a living hero, a robot, or a standing prop occupies it.
 * Toppled towers are flat rubble and can be walked over.
 */
export function isTileBlocked(state: GameState, pos: Vec): boolean {
  if (!inBounds(pos, state.gridSize)) return true;
  return Boolean(heroAt(state, pos) ?? robotAt(state, pos) ?? standingPropAt(state, pos));
}

/** Terrain kind on a tile, or null for plain floor. */
export function terrainKindAt(content: Content, state: GameState, pos: Vec): TerrainKind | null {
  const feature = state.terrain.find((t) => vecEquals(t.pos, pos));
  return feature ? content.terrains[feature.defId].kind : null;
}

/**
 * Robots additionally cannot roll onto cushions (soft ground). Plushies can,
 * so hero movement keeps using plain `isTileBlocked`.
 */
export function isTileBlockedForRobot(content: Content, state: GameState, pos: Vec): boolean {
  return isTileBlocked(state, pos) || terrainKindAt(content, state, pos) === "cushion";
}

/**
 * Tiles a hero can move to this turn (BFS up to its move range).
 * Jumping heroes may pass over blocked tiles but must land on a free one.
 */
export function reachableTiles(content: Content, state: GameState, hero: HeroState): Vec[] {
  const def = content.heroes[hero.defId];
  const visited = new Map<string, number>([[vecKey(hero.pos), 0]]);
  const queue: Vec[] = [hero.pos];
  const result: Vec[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const cost = visited.get(vecKey(current))!;
    if (cost >= def.move) continue;

    for (const next of neighbors(current, state.gridSize)) {
      const key = vecKey(next);
      if (visited.has(key)) continue;
      const blocked = isTileBlocked(state, next);
      if (blocked && !def.canJump) continue;
      visited.set(key, cost + 1);
      queue.push(next);
      if (!blocked) result.push(next);
    }
  }
  return result;
}
