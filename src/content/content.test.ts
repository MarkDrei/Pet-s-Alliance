import { describe, expect, it } from "vitest";
import { inBounds } from "@/engine";
import { CONTENT, LEVELS, LEVEL_ORDER, nextLevelId } from "./index";
import { de } from "@/i18n/de";

/**
 * Sanity checks over the declarative content: every id a level references
 * must exist, everything must be on the board, and nothing may overlap at
 * the start. Catches typos when new content is added.
 */
describe("content integrity", () => {
  it("has four levels in order", () => {
    expect(LEVEL_ORDER).toHaveLength(4);
    expect(nextLevelId("level-1")).toBe("level-2");
    expect(nextLevelId("level-4")).toBeNull();
  });

  for (const levelId of Object.keys(LEVELS)) {
    const level = LEVELS[levelId];

    describe(levelId, () => {
      it("references only existing definitions", () => {
        for (const h of level.heroStarts) expect(CONTENT.heroes[h.defId]).toBeDefined();
        for (const r of level.robotStarts) expect(CONTENT.robots[r.defId]).toBeDefined();
        for (const s of level.spawns) expect(CONTENT.robots[s.defId]).toBeDefined();
        for (const p of level.props) expect(CONTENT.props[p.defId]).toBeDefined();
        for (const t of level.terrain ?? []) expect(CONTENT.terrains[t.defId]).toBeDefined();
        for (const i of level.items) expect(CONTENT.items[i]).toBeDefined();
      });

      it("places everything on the board without overlaps", () => {
        const occupied = new Set<string>();
        const all = [
          ...level.heroStarts.map((h) => h.pos),
          ...level.robotStarts.map((r) => r.pos),
          ...level.props.map((p) => p.pos),
        ];
        for (const pos of all) {
          expect(inBounds(pos, level.gridSize)).toBe(true);
          const key = `${pos.x},${pos.y}`;
          expect(occupied.has(key), `duplicate start position ${key}`).toBe(false);
          occupied.add(key);
        }
        // Terrain lies under units, but must not sit under a standing prop
        // and must be on the board.
        for (const t of level.terrain ?? []) {
          expect(inBounds(t.pos, level.gridSize)).toBe(true);
          const underProp = level.props.some(
            (p) => p.pos.x === t.pos.x && p.pos.y === t.pos.y,
          );
          expect(underProp, `terrain under prop at ${t.pos.x},${t.pos.y}`).toBe(false);
        }
      });

      it("has enough chaos targets and German strings", () => {
        const targets = level.props.filter((p) => CONTENT.props[p.defId].toppleable);
        expect(targets.length).toBeGreaterThanOrEqual(level.maxChaos);
        expect(de.levels[levelId]).toBeDefined();
      });
    });
  }

  it("every robot and prop has German text where the UI needs it", () => {
    for (const id of Object.keys(CONTENT.robots)) {
      expect(de.robots[id], `missing de.robots.${id}`).toBeDefined();
    }
    for (const id of Object.keys(CONTENT.props)) {
      if (CONTENT.props[id].toppleable) {
        expect(de.props[id], `missing de.props.${id}`).toBeDefined();
      }
    }
  });
});
