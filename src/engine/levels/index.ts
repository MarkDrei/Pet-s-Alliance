import type { LevelDef } from "../types";
import { level1 } from "./level-1";
import { level2 } from "./level-2";
import { level3 } from "./level-3";
import { level4 } from "./level-4";

export const LEVELS: readonly LevelDef[] = [level1, level2, level3, level4];

export function getLevel(id: string): LevelDef | undefined {
  return LEVELS.find((l) => l.id === id);
}
