import { axial } from "../hex";
import type { LevelDef } from "../types";

/**
 * Level 3 — Die Murmelbahn (the marble run).
 * Teaches Knalli and marble tracks: whoever rolls onto them keeps
 * sliding. Careful pushes can send robots skidding off the board.
 */
export const level3: LevelDef = {
  id: "level-3",
  floor: "track",
  rounds: 6,
  maxChaos: 3,
  heroes: [
    { defId: "teddy", pos: axial(0, 4) },
    { defId: "bunny", pos: axial(-2, 4) },
    { defId: "unicorn", pos: axial(2, 2) },
  ],
  robots: [
    { defId: "bomber", pos: axial(0, -5) },
    { defId: "dasher", pos: axial(2, -4) },
  ],
  props: [
    { defId: "tower", pos: axial(0, 0) },
    { defId: "tower", pos: axial(-3, 1) },
    { defId: "tower", pos: axial(3, -1) },
    { defId: "books", pos: axial(-1, 2) },
  ],
  terrain: [
    // Center track running south, straight at the middle tower.
    { kind: "marbles", pos: axial(0, -3) },
    { kind: "marbles", pos: axial(0, -2) },
    { kind: "marbles", pos: axial(0, -1) },
    // Diagonal track on the west side.
    { kind: "marbles", pos: axial(-3, 0) },
    { kind: "marbles", pos: axial(-2, -1) },
    { kind: "marbles", pos: axial(-1, -2) },
    // Short east track.
    { kind: "marbles", pos: axial(2, 0) },
    { kind: "marbles", pos: axial(2, 1) },
  ],
  spawns: [
    { afterRound: 1, defId: "stomper", pos: axial(-2, -3) },
    { afterRound: 3, defId: "bomber", pos: axial(1, -5) },
    { afterRound: 4, defId: "dasher", pos: axial(-1, -4) },
  ],
  items: ["windup-key", "cannonball"],
};
