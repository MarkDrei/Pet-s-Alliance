import type { HeroDef, HeroDefId, RobotDef, RobotDefId, PropDefId } from "./types";

/** Stat blocks from doc/game-mechanics.md "Player characters". */
export const HERO_DEFS: Record<HeroDefId, HeroDef> = {
  teddy: { id: "teddy", hp: 5, move: 3, ability: "push", abilityRange: 1, jumper: false },
  bunny: { id: "bunny", hp: 3, move: 5, ability: "nudge", abilityRange: 1, jumper: true },
  unicorn: { id: "unicorn", hp: 3, move: 4, ability: "shield", abilityRange: 3, jumper: false },
};

/** Stat blocks from doc/game-mechanics.md "Robots". */
export const ROBOT_DEFS: Record<RobotDefId, RobotDef> = {
  stomper: {
    id: "stomper",
    hp: 2,
    move: 2,
    damage: 1,
    shape: "front",
    heavy: false,
    dasher: false,
    explodes: false,
  },
  dasher: {
    id: "dasher",
    hp: 1,
    move: 3,
    damage: 1,
    shape: "front",
    heavy: false,
    dasher: true,
    explodes: false,
  },
  kipplaster: {
    id: "kipplaster",
    hp: 2,
    move: 2,
    damage: 1,
    shape: "flanks",
    heavy: false,
    dasher: false,
    explodes: false,
  },
  bomber: {
    id: "bomber",
    hp: 1,
    move: 2,
    damage: 1,
    shape: "ring",
    heavy: false,
    dasher: false,
    explodes: true,
  },
  rostzahn: {
    id: "rostzahn",
    hp: 4,
    move: 1,
    damage: 2,
    shape: "front",
    heavy: true,
    dasher: false,
    explodes: false,
  },
};

/** Chaos targets can be toppled; blocks only block. */
export const TOPPLEABLE: ReadonlySet<PropDefId> = new Set(["tower", "books", "musicbox"]);

export function isToppleable(defId: PropDefId): boolean {
  return TOPPLEABLE.has(defId);
}

export const BUMP_DAMAGE = 1;
export const CANNONBALL_DAMAGE = 2;
export const CANNONBALL_DAMAGE_HEAVY = 1;
