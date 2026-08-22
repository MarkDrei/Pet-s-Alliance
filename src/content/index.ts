import type { Content } from "@/engine";
import { HEROES } from "./heroes";
import { ITEMS } from "./items";
import { PROPS } from "./props";
import { ROBOTS } from "./robots";

export { LEVEL_1 } from "./levels/level1";

export const CONTENT: Content = {
  heroes: HEROES,
  robots: ROBOTS,
  props: PROPS,
  items: ITEMS,
};
