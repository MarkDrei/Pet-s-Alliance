import type { LevelDef } from "@/engine";

/**
 * Level 1: "Der Teppich" — the carpet zone of the kids' room.
 * The plushies start near the bed (bottom), the robots roll in from the
 * shelf (top) and try to topple the block towers to wake the kids.
 */
export const LEVEL_1: LevelDef = {
  id: "level-1",
  gridSize: 8,
  roundsToSurvive: 5,
  maxChaos: 3,
  heroStarts: [
    { defId: "teddy", pos: { x: 2, y: 6 } },
    { defId: "bunny", pos: { x: 4, y: 6 } },
    { defId: "unicorn", pos: { x: 3, y: 7 } },
  ],
  // All robots enter from the back edge (the shelf side, row y = 0).
  robotStarts: [
    { defId: "stomper", pos: { x: 1, y: 0 }, facing: "south" },
    { defId: "dasher", pos: { x: 6, y: 0 }, facing: "south" },
  ],
  spawns: [
    { round: 2, defId: "stomper", pos: { x: 0, y: 0 }, facing: "south" },
    { round: 3, defId: "dasher", pos: { x: 4, y: 0 }, facing: "south" },
    { round: 4, defId: "stomper", pos: { x: 7, y: 0 }, facing: "south" },
  ],
  props: [
    { defId: "tower", pos: { x: 2, y: 3 } },
    { defId: "tower", pos: { x: 5, y: 3 } },
    { defId: "tower", pos: { x: 4, y: 5 } },
    { defId: "tower", pos: { x: 1, y: 5 } },
    { defId: "blocks", pos: { x: 0, y: 4 } },
    { defId: "blocks", pos: { x: 4, y: 2 } },
    { defId: "blocks", pos: { x: 6, y: 5 } },
  ],
  items: ["windup-key"],
};
