import type { LevelDef } from "@/engine";

/**
 * Level 3: "Die Murmelbahn" — the marble run corner. New here: the bomber
 * robot (blows itself up next to a tower) and marble lanes: robots that roll
 * onto them keep sliding — a well-aimed push sends a robot skidding across
 * the room or right off the board.
 */
export const LEVEL_3: LevelDef = {
  id: "level-3",
  gridSize: 8,
  roundsToSurvive: 6,
  maxChaos: 3,
  floor: { light: "tile-track-light", dark: "tile-track-dark" },
  heroStarts: [
    { defId: "teddy", pos: { x: 1, y: 6 } },
    { defId: "bunny", pos: { x: 6, y: 6 } },
    { defId: "unicorn", pos: { x: 3, y: 7 } },
  ],
  robotStarts: [
    { defId: "bomber", pos: { x: 3, y: 0 }, facing: "south" },
    { defId: "stomper", pos: { x: 6, y: 0 }, facing: "south" },
  ],
  spawns: [
    { round: 2, defId: "dasher", pos: { x: 1, y: 0 }, facing: "south" },
    { round: 3, defId: "bomber", pos: { x: 5, y: 0 }, facing: "south" },
    { round: 4, defId: "stomper", pos: { x: 2, y: 0 }, facing: "south" },
    { round: 5, defId: "bomber", pos: { x: 7, y: 0 }, facing: "south" },
  ],
  props: [
    { defId: "tower", pos: { x: 0, y: 5 } },
    { defId: "tower", pos: { x: 7, y: 5 } },
    { defId: "tower", pos: { x: 3, y: 6 } },
    { defId: "tower", pos: { x: 4, y: 4 } },
    { defId: "blocks", pos: { x: 1, y: 1 } },
    { defId: "blocks", pos: { x: 6, y: 1 } },
  ],
  // Two marble lanes with a connector — an "H" across the middle of the room.
  terrain: [
    { defId: "marbles", pos: { x: 2, y: 2 } },
    { defId: "marbles", pos: { x: 2, y: 3 } },
    { defId: "marbles", pos: { x: 2, y: 4 } },
    { defId: "marbles", pos: { x: 2, y: 5 } },
    { defId: "marbles", pos: { x: 5, y: 2 } },
    { defId: "marbles", pos: { x: 5, y: 3 } },
    { defId: "marbles", pos: { x: 5, y: 4 } },
    { defId: "marbles", pos: { x: 5, y: 5 } },
    { defId: "marbles", pos: { x: 3, y: 3 } },
    { defId: "marbles", pos: { x: 4, y: 3 } },
  ],
  items: ["windup-key", "windup-key"],
};
