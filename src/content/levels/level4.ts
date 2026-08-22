import type { LevelDef } from "@/engine";

/**
 * Level 4: "Die Schreibtisch-Festung" — the final stand at the desk. Every
 * robot type attacks at once, led by Rostzahn: a slow, heavy boss that hits
 * for 2 and cannot be pushed or nudged. The music box in the middle must
 * survive at all costs. Marble lanes along both walls and two cushions give
 * the plushies the tools to fight back.
 */
export const LEVEL_4: LevelDef = {
  id: "level-4",
  gridSize: 8,
  roundsToSurvive: 7,
  maxChaos: 4,
  floor: { light: "tile-desk-light", dark: "tile-desk-dark" },
  heroStarts: [
    { defId: "teddy", pos: { x: 2, y: 6 } },
    { defId: "bunny", pos: { x: 5, y: 6 } },
    { defId: "unicorn", pos: { x: 3, y: 7 } },
  ],
  robotStarts: [
    { defId: "rostzahn", pos: { x: 3, y: 0 }, facing: "south" },
    { defId: "dasher", pos: { x: 6, y: 0 }, facing: "south" },
  ],
  spawns: [
    { round: 2, defId: "spinner", pos: { x: 1, y: 0 }, facing: "south" },
    { round: 3, defId: "bomber", pos: { x: 5, y: 0 }, facing: "south" },
    { round: 4, defId: "stomper", pos: { x: 7, y: 0 }, facing: "south" },
    { round: 5, defId: "spinner", pos: { x: 4, y: 0 }, facing: "south" },
    { round: 6, defId: "bomber", pos: { x: 0, y: 0 }, facing: "south" },
  ],
  props: [
    { defId: "musicbox", pos: { x: 3, y: 5 } },
    { defId: "tower", pos: { x: 1, y: 4 } },
    { defId: "tower", pos: { x: 6, y: 4 } },
    { defId: "tower", pos: { x: 4, y: 3 } },
    { defId: "books", pos: { x: 5, y: 2 } },
    { defId: "blocks", pos: { x: 0, y: 2 } },
    { defId: "blocks", pos: { x: 7, y: 2 } },
  ],
  // Marble gutters along both walls plus two cushion hideouts.
  terrain: [
    { defId: "marbles", pos: { x: 0, y: 3 } },
    { defId: "marbles", pos: { x: 0, y: 4 } },
    { defId: "marbles", pos: { x: 0, y: 5 } },
    { defId: "marbles", pos: { x: 0, y: 6 } },
    { defId: "marbles", pos: { x: 7, y: 3 } },
    { defId: "marbles", pos: { x: 7, y: 4 } },
    { defId: "marbles", pos: { x: 7, y: 5 } },
    { defId: "marbles", pos: { x: 7, y: 6 } },
    { defId: "cushion", pos: { x: 2, y: 4 } },
    { defId: "cushion", pos: { x: 5, y: 5 } },
  ],
  items: ["windup-key", "windup-key"],
};
