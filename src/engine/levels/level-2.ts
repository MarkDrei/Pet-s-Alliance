import { axial } from "../hex";
import type { LevelDef } from "../types";

/**
 * Level 2 — Die Bücherecke (the reading corner).
 * Teaches Kipplaster and soft cushions; book stacks are the chaos
 * targets. The cannonball joins the toy box.
 */
export const level2: LevelDef = {
  id: "level-2",
  floor: "wood",
  rounds: 6,
  maxChaos: 3,
  heroes: [
    { defId: "teddy", pos: axial(0, 3) },
    { defId: "bunny", pos: axial(-2, 4) },
    { defId: "unicorn", pos: axial(2, 2) },
  ],
  robots: [
    { defId: "kipplaster", pos: axial(0, -4) },
    { defId: "stomper", pos: axial(-2, -3) },
  ],
  props: [
    { defId: "books", pos: axial(-2, 1) },
    { defId: "books", pos: axial(1, 0) },
    { defId: "books", pos: axial(0, -1) },
    { defId: "books", pos: axial(3, -2) },
    { defId: "blocks", pos: axial(0, 1) },
  ],
  terrain: [
    { kind: "cushion", pos: axial(-1, 0) },
    { kind: "cushion", pos: axial(2, -2) },
    { kind: "cushion", pos: axial(-3, 2) },
    { kind: "cushion", pos: axial(1, -3) },
  ],
  spawns: [
    { afterRound: 1, defId: "kipplaster", pos: axial(2, -4) },
    { afterRound: 2, defId: "dasher", pos: axial(-1, -4) },
    { afterRound: 4, defId: "kipplaster", pos: axial(0, -5) },
  ],
  items: ["windup-key", "cannonball"],
};
