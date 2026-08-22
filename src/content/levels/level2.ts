import type { LevelDef } from "@/engine";

/**
 * Level 2: "Die Bücherecke" — the reading corner with the big bookshelf.
 * New here: the spinner robot (whirls into everything around it), soft
 * cushions robots cannot roll onto, and book stacks as chaos targets.
 * The cushions form a safe reading nest the plushies can retreat into.
 */
export const LEVEL_2: LevelDef = {
  id: "level-2",
  gridSize: 8,
  roundsToSurvive: 6,
  maxChaos: 3,
  floor: { light: "tile-wood-light", dark: "tile-wood-dark" },
  heroStarts: [
    { defId: "teddy", pos: { x: 2, y: 6 } },
    { defId: "bunny", pos: { x: 5, y: 6 } },
    { defId: "unicorn", pos: { x: 3, y: 7 } },
  ],
  robotStarts: [
    { defId: "spinner", pos: { x: 4, y: 0 }, facing: "south" },
    { defId: "stomper", pos: { x: 1, y: 0 }, facing: "south" },
  ],
  spawns: [
    { round: 2, defId: "dasher", pos: { x: 6, y: 0 }, facing: "south" },
    { round: 3, defId: "spinner", pos: { x: 2, y: 0 }, facing: "south" },
    { round: 4, defId: "stomper", pos: { x: 7, y: 0 }, facing: "south" },
    { round: 5, defId: "dasher", pos: { x: 0, y: 0 }, facing: "south" },
  ],
  props: [
    { defId: "books", pos: { x: 1, y: 3 } },
    { defId: "books", pos: { x: 6, y: 3 } },
    { defId: "books", pos: { x: 3, y: 4 } },
    { defId: "books", pos: { x: 4, y: 2 } },
    { defId: "blocks", pos: { x: 0, y: 2 } },
    { defId: "blocks", pos: { x: 7, y: 2 } },
  ],
  terrain: [
    { defId: "cushion", pos: { x: 2, y: 5 } },
    { defId: "cushion", pos: { x: 3, y: 5 } },
    { defId: "cushion", pos: { x: 5, y: 5 } },
    { defId: "cushion", pos: { x: 6, y: 4 } },
  ],
  items: ["windup-key"],
};
