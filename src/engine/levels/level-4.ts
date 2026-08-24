import { axial } from "../hex";
import type { LevelDef } from "../types";

/**
 * Level 4 — Die Schreibtisch-Festung (the desk fortress).
 * The finale: Rostzahn leads a mixed assault on the music box. A block
 * wall guards it, but a marble track runs straight at the gap.
 */
export const level4: LevelDef = {
  id: "level-4",
  floor: "desk",
  rounds: 7,
  maxChaos: 3,
  heroes: [
    { defId: "teddy", pos: axial(0, 3) },
    { defId: "bunny", pos: axial(-2, 4) },
    { defId: "unicorn", pos: axial(1, 2) },
  ],
  robots: [
    { defId: "rostzahn", pos: axial(0, -4) },
    { defId: "stomper", pos: axial(-2, -3) },
    { defId: "kipplaster", pos: axial(2, -4) },
  ],
  props: [
    { defId: "musicbox", pos: axial(0, 2) },
    { defId: "tower", pos: axial(-2, 1) },
    { defId: "tower", pos: axial(2, -1) },
    { defId: "books", pos: axial(-1, 0) },
    { defId: "books", pos: axial(1, -1) },
    // Wall in front of the music box, with a gap straight down the middle.
    { defId: "blocks", pos: axial(-1, 1) },
    { defId: "blocks", pos: axial(1, 0) },
  ],
  terrain: [
    { kind: "cushion", pos: axial(-3, 3) },
    { kind: "cushion", pos: axial(3, -1) },
    // Marble track aimed at the gap in the wall.
    { kind: "marbles", pos: axial(0, -2) },
    { kind: "marbles", pos: axial(0, -1) },
    { kind: "marbles", pos: axial(0, 0) },
  ],
  spawns: [
    { afterRound: 1, defId: "dasher", pos: axial(1, -5) },
    { afterRound: 2, defId: "bomber", pos: axial(-1, -4) },
    { afterRound: 3, defId: "kipplaster", pos: axial(2, -4) },
    { afterRound: 5, defId: "stomper", pos: axial(0, -5) },
  ],
  items: ["windup-key", "cannonball"],
};
