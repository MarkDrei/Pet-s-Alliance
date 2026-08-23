import { axial } from "../hex";
import type { LevelDef } from "../types";

/**
 * Level 1 — Der Teppich (the rug).
 * Teaches Stampfer, Flitzer, block towers and blocking Bauklötze.
 * Gentle start: the wind-up key, no cannonball yet.
 */
export const level1: LevelDef = {
  id: "level-1",
  floor: "rug",
  rounds: 5,
  maxChaos: 2,
  heroes: [
    { defId: "teddy", pos: axial(0, 3) },
    { defId: "bunny", pos: axial(-2, 4) },
    { defId: "unicorn", pos: axial(2, 2) },
  ],
  robots: [
    { defId: "stomper", pos: axial(0, -4) },
    { defId: "dasher", pos: axial(2, -4) },
  ],
  props: [
    { defId: "tower", pos: axial(0, 1) },
    { defId: "tower", pos: axial(-2, 2) },
    { defId: "tower", pos: axial(2, 0) },
    { defId: "blocks", pos: axial(-1, 0) },
    { defId: "blocks", pos: axial(1, -1) },
  ],
  terrain: [],
  spawns: [
    { afterRound: 1, defId: "stomper", pos: axial(-2, -3) },
    { afterRound: 3, defId: "dasher", pos: axial(1, -5) },
  ],
  items: ["windup-key"],
};
