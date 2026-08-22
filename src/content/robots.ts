import type { RobotDef } from "@/engine";

export const ROBOTS: Record<string, RobotDef> = {
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
};
