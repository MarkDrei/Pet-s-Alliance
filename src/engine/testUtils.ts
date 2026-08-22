import type { Content, LevelDef } from "./types";

/** Minimal content set for engine tests, independent of real game content. */
export function testContent(): Content {
  return {
    heroes: {
      tank: {
        id: "tank",
        maxHp: 5,
        move: 2,
        canJump: false,
        ability: { id: "push", range: 1 },
        visual: "teddy",
      },
      scout: {
        id: "scout",
        maxHp: 3,
        move: 4,
        canJump: true,
        ability: { id: "nudge", range: 1 },
        visual: "bunny",
      },
      support: {
        id: "support",
        maxHp: 3,
        move: 3,
        canJump: false,
        ability: { id: "shield", range: 3 },
        visual: "unicorn",
      },
    },
    robots: {
      stomper: {
        id: "stomper",
        maxHp: 2,
        move: 2,
        damage: 1,
        behavior: "stomper",
        visual: "robot-stomper",
      },
      dasher: {
        id: "dasher",
        maxHp: 1,
        move: 3,
        damage: 1,
        behavior: "dasher",
        visual: "robot-dasher",
      },
    },
    props: {
      tower: { id: "tower", toppleable: true, visual: "tower" },
      rock: { id: "rock", toppleable: false, visual: "blocks" },
    },
    items: {
      "windup-key": { id: "windup-key", visual: "windup-key" },
    },
  };
}

export function testLevel(overrides: Partial<LevelDef> = {}): LevelDef {
  return {
    id: "test-level",
    gridSize: 8,
    roundsToSurvive: 5,
    maxChaos: 3,
    heroStarts: [],
    robotStarts: [],
    spawns: [],
    props: [],
    items: [],
    ...overrides,
  };
}
