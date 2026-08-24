import type { Axial, Dir } from "./hex";
import { ALL_DIRS, hexEquals, hexKey, inBoard, neighbor } from "./hex";
import { isBlockedForHero, isBlockedForRobot } from "./board";
import { HERO_DEFS } from "./defs";
import type { GameState, HeroState } from "./types";

/**
 * Breadth-first search of a hero's reachable tiles up to its move value.
 *
 * Non-jumpers cannot pass through blocked tiles. Jumpers (bunny) may pass
 * over blocked tiles but only land on free ones. Returns landable tiles
 * (excluding the start) with parent pointers for path reconstruction —
 * jump paths include the blocked tiles that were leapt over.
 */
export function heroReachable(
  state: GameState,
  hero: HeroState,
): Map<string, { hex: Axial; parent: string | null }> {
  const def = HERO_DEFS[hero.defId];
  const visited = new Map<string, { hex: Axial; parent: string | null; depth: number }>();
  const startKey = hexKey(hero.pos);
  visited.set(startKey, { hex: hero.pos, parent: null, depth: 0 });
  let frontier: Axial[] = [hero.pos];

  for (let depth = 1; depth <= def.move; depth++) {
    const next: Axial[] = [];
    for (const cur of frontier) {
      for (const dir of ALL_DIRS) {
        const n = neighbor(cur, dir);
        if (!inBoard(n)) continue;
        const key = hexKey(n);
        if (visited.has(key)) continue;
        const blocked = isBlockedForHero(state, n);
        if (blocked && !def.jumper) continue;
        visited.set(key, { hex: n, parent: hexKey(cur), depth });
        next.push(n);
      }
    }
    frontier = next;
  }

  const reachable = new Map<string, { hex: Axial; parent: string | null }>();
  for (const [key, entry] of visited) {
    if (key === startKey) continue;
    if (isBlockedForHero(state, entry.hex)) continue; // jumped-over tile, not landable
    reachable.set(key, { hex: entry.hex, parent: entry.parent });
  }
  return reachable;
}

/** Landable destinations for the given hero (empty when it already moved). */
export function heroMoveTargets(state: GameState, hero: HeroState): Axial[] {
  if (hero.hasMoved || hero.hasActed || hero.down || hero.doneForRound) return [];
  return [...heroReachable(state, hero).values()].map((e) => e.hex);
}

/**
 * The step-by-step path to a reachable destination, start tile excluded.
 * Jump paths may include blocked tiles that the bunny leaps over.
 */
export function heroPathTo(state: GameState, hero: HeroState, dest: Axial): Axial[] | null {
  const reach = heroReachable(state, hero);
  const startKey = hexKey(hero.pos);
  const destKey = hexKey(dest);
  if (!reach.has(destKey)) return null;

  // Rebuild parent chain from the full visited map used by heroReachable:
  // reach only stores landable tiles, so walk parents through both maps.
  const def = HERO_DEFS[hero.defId];
  const visited = new Map<string, { hex: Axial; parent: string | null }>();
  visited.set(startKey, { hex: hero.pos, parent: null });
  let frontier: Axial[] = [hero.pos];
  for (let depth = 1; depth <= def.move; depth++) {
    const next: Axial[] = [];
    for (const cur of frontier) {
      for (const dir of ALL_DIRS) {
        const n = neighbor(cur, dir);
        if (!inBoard(n)) continue;
        const key = hexKey(n);
        if (visited.has(key)) continue;
        if (isBlockedForHero(state, n) && !def.jumper) continue;
        visited.set(key, { hex: n, parent: hexKey(cur) });
        next.push(n);
      }
    }
    frontier = next;
  }

  const path: Axial[] = [];
  let key: string | null = destKey;
  while (key && key !== startKey) {
    const entry = visited.get(key);
    if (!entry) return null;
    path.unshift(entry.hex);
    key = entry.parent;
  }
  return path;
}

/**
 * The connected straight-line run a robot could walk in `dir`: every tile
 * entered before the board edge or the first tile blocked for robots,
 * capped at `maxSteps`.
 */
export function robotLineRun(
  state: GameState,
  from: Axial,
  dir: Dir,
  maxSteps: number,
): Axial[] {
  const run: Axial[] = [];
  let cur = from;
  for (let i = 0; i < maxSteps; i++) {
    const next = neighbor(cur, dir);
    if (!inBoard(next) || isBlockedForRobot(state, next)) break;
    run.push(next);
    cur = next;
  }
  return run;
}

/**
 * Marble-slide preview from `from` in `dir`: the robot crosses every
 * marble hex and lands on the first non-marble hex.
 *
 * Returns the tiles entered plus how the slide ends: `landed` on a free
 * non-marble hex, `bumped` against a blocker or the board edge (staying
 * on the last marble), or `exited` off the board.
 */
export function marbleSlide(
  state: GameState,
  from: Axial,
  dir: Dir,
): { path: Axial[]; end: "landed" | "bumped" | "exited" } {
  const path: Axial[] = [];
  let cur = from;
  // Only slides when standing on marbles.
  if (state.terrain[hexKey(cur)] !== "marbles") return { path, end: "landed" };
  for (;;) {
    const next = neighbor(cur, dir);
    if (!inBoard(next)) return { path: [...path, next], end: "exited" };
    if (isBlockedForRobot(state, next)) return { path, end: "bumped" };
    path.push(next);
    cur = next;
    if (state.terrain[hexKey(cur)] !== "marbles") return { path, end: "landed" };
  }
}

/** True when the two hexes are the same tile. */
export function samePos(a: Axial, b: Axial): boolean {
  return hexEquals(a, b);
}
