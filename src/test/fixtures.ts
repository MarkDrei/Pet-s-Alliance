import { createGame } from "@/engine/game";
import type { Axial } from "@/engine/hex";
import type {
  GameState,
  HeroDefId,
  LevelDef,
  PropDefId,
  RobotDefId,
  TerrainKind,
} from "@/engine/types";

let counter = 0;

/** A minimal level for engine tests; override whatever the test needs. */
export function makeLevel(partial: Partial<LevelDef> = {}): LevelDef {
  counter += 1;
  return {
    id: `test-level-${counter}`,
    floor: "rug",
    rounds: 3,
    maxChaos: 2,
    heroes: [{ defId: "teddy", pos: { q: 0, r: 3 } }],
    robots: [],
    props: [],
    terrain: [],
    spawns: [],
    items: [],
    ...partial,
  };
}

export function makeGame(partial: Partial<LevelDef> = {}): GameState {
  return createGame(makeLevel(partial));
}

export function hero(defId: HeroDefId, q: number, r: number) {
  return { defId, pos: { q, r } };
}

export function robot(defId: RobotDefId, q: number, r: number, facing?: 0 | 1 | 2 | 3 | 4 | 5) {
  return { defId, pos: { q, r }, facing };
}

export function prop(defId: PropDefId, q: number, r: number) {
  return { defId, pos: { q, r } };
}

export function terrain(kind: TerrainKind, q: number, r: number) {
  return { kind, pos: { q, r } };
}

export function at(q: number, r: number): Axial {
  return { q, r };
}

/** Deterministic RNG that always returns the same value. */
export function fixedRng(value = 0): () => number {
  return () => value;
}
