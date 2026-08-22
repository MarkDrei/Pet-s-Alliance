import type { Content, LevelDef } from "@/engine";
import { HEROES } from "./heroes";
import { ITEMS } from "./items";
import { PROPS } from "./props";
import { ROBOTS } from "./robots";
import { TERRAINS } from "./terrains";
import { LEVEL_1 } from "./levels/level1";
import { LEVEL_2 } from "./levels/level2";
import { LEVEL_3 } from "./levels/level3";
import { LEVEL_4 } from "./levels/level4";

export { LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4 };

export const CONTENT: Content = {
  heroes: HEROES,
  robots: ROBOTS,
  props: PROPS,
  items: ITEMS,
  terrains: TERRAINS,
};

/** All levels in play order — the zones of the kids' room. */
export const LEVELS: Record<string, LevelDef> = {
  [LEVEL_1.id]: LEVEL_1,
  [LEVEL_2.id]: LEVEL_2,
  [LEVEL_3.id]: LEVEL_3,
  [LEVEL_4.id]: LEVEL_4,
};

export const LEVEL_ORDER = [LEVEL_1.id, LEVEL_2.id, LEVEL_3.id, LEVEL_4.id];

/** The level after `levelId`, or null for the last one. */
export function nextLevelId(levelId: string): string | null {
  const index = LEVEL_ORDER.indexOf(levelId);
  return index >= 0 && index < LEVEL_ORDER.length - 1 ? LEVEL_ORDER[index + 1] : null;
}
