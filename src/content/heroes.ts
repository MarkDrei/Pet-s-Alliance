import type { HeroDef } from "@/engine";

export const HEROES: Record<string, HeroDef> = {
  teddy: {
    id: "teddy",
    maxHp: 5,
    move: 3,
    canJump: false,
    ability: { id: "push", range: 1 },
    visual: "teddy",
  },
  bunny: {
    id: "bunny",
    maxHp: 3,
    move: 5,
    canJump: true,
    ability: { id: "nudge", range: 1 },
    visual: "bunny",
  },
  unicorn: {
    id: "unicorn",
    maxHp: 3,
    move: 4,
    canJump: false,
    ability: { id: "shield", range: 3 },
    visual: "unicorn",
  },
};
