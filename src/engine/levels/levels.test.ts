import { describe, expect, it } from "vitest";
import { hexKey, inBoard } from "../hex";
import { createGame, endTurn, stepExecution } from "../game";
import { LEVELS, getLevel } from "./index";
import { de } from "@/i18n/de";
import { fixedRng } from "@/test/fixtures";

describe("level definitions", () => {
  it("provides four levels with the documented ids", () => {
    expect(LEVELS.map((l) => l.id)).toEqual(["level-1", "level-2", "level-3", "level-4"]);
    expect(getLevel("level-2")?.floor).toBe("wood");
    expect(getLevel("nope")).toBeUndefined();
  });

  it("every level has German strings", () => {
    for (const level of LEVELS) {
      expect(de.levels[level.id]?.name).toBeTruthy();
      expect(de.levels[level.id]?.tagline).toBeTruthy();
    }
  });

  it.each(LEVELS.map((l) => [l.id, l] as const))(
    "%s places everything on the board without overlaps",
    (_id, level) => {
      const used = new Set<string>();
      const placements = [
        ...level.heroes.map((e) => e.pos),
        ...level.robots.map((e) => e.pos),
        ...level.props.map((e) => e.pos),
      ];
      for (const pos of placements) {
        expect(inBoard(pos)).toBe(true);
        const key = hexKey(pos);
        expect(used.has(key)).toBe(false);
        used.add(key);
      }
      for (const t of level.terrain) {
        expect(inBoard(t.pos)).toBe(true);
        // Terrain must not sit under a standing prop or piece.
        expect(used.has(hexKey(t.pos))).toBe(false);
      }
      for (const s of level.spawns) {
        expect(inBoard(s.pos)).toBe(true);
        expect(s.afterRound).toBeGreaterThanOrEqual(1);
        expect(s.afterRound).toBeLessThan(level.rounds);
      }
    },
  );

  it("every level starts playable with intents planned", () => {
    for (const level of LEVELS) {
      const state = createGame(level);
      expect(state.phase).toBe("player");
      for (const robot of state.robots) {
        expect(robot.intent).not.toBeNull();
      }
    }
  });

  it("the wind-up key belongs to every level; Rostzahn only to the last", () => {
    for (const level of LEVELS) {
      expect(level.items).toContain("windup-key");
      const hasRostzahn =
        level.robots.some((r) => r.defId === "rostzahn") ||
        level.spawns.some((s) => s.defId === "rostzahn");
      expect(hasRostzahn).toBe(level.id === "level-4");
    }
  });

  it("each level can lose to chaos: enough toppleable props exist", () => {
    for (const level of LEVELS) {
      const toppleable = level.props.filter((p) => p.defId !== "blocks");
      expect(toppleable.length).toBeGreaterThanOrEqual(level.maxChaos);
    }
  });

  it("the music box appears in level 4", () => {
    expect(getLevel("level-4")!.props.some((p) => p.defId === "musicbox")).toBe(true);
  });

  it.each(LEVELS.map((l) => [l.id, l] as const))(
    "%s terminates cleanly when played passively",
    (_id, level) => {
      // A player who never interferes must still reach a clean result
      // (usually a chaos loss) without the engine ever throwing.
      let state = createGame(level);
      for (let round = 0; round < level.rounds && state.phase === "player"; round++) {
        state = endTurn(state).state;
        while (state.phase === "execution") {
          state = stepExecution(state, fixedRng()).state;
        }
      }
      expect(state.phase).toBe("result");
      expect(state.result).not.toBeNull();
      // Passive play against these layouts must never end in a win:
      // every level has real pressure on its chaos targets.
      expect(state.result!.outcome).not.toBe("win");
    },
  );
});
