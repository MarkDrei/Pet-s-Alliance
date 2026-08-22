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
  /** Whirling top: slow, but hits everything around it every turn. */
  spinner: {
    id: "spinner",
    maxHp: 2,
    move: 1,
    damage: 1,
    behavior: "spinner",
    visual: "robot-spinner",
  },
  /** Wind-up firecracker: races to a tower and blows itself up next to it. */
  bomber: {
    id: "bomber",
    maxHp: 1,
    move: 2,
    damage: 1,
    behavior: "bomber",
    visual: "robot-bomber",
  },
  /** Boss: slow, tough, hits hard, and far too heavy to push or nudge. */
  rostzahn: {
    id: "rostzahn",
    maxHp: 4,
    move: 1,
    damage: 2,
    behavior: "stomper",
    heavy: true,
    visual: "robot-boss",
  },
};
