import { describe, expect, it } from "vitest";
import { isBlockedForHero, isBlockedForRobot, isSpawnBlocked, occupantAt, terrainAt } from "./board";
import { at, hero, makeGame, prop, robot, terrain } from "@/test/fixtures";

describe("occupancy", () => {
  const state = makeGame({
    heroes: [hero("teddy", 0, 3)],
    robots: [robot("stomper", 0, -3)],
    props: [prop("tower", 0, 0), prop("blocks", 1, 0)],
    terrain: [terrain("cushion", -1, 0), terrain("marbles", 2, 0)],
  });

  it("finds heroes, robots, and standing props", () => {
    expect(occupantAt(state, at(0, 3))?.kind).toBe("hero");
    expect(occupantAt(state, at(0, -3))?.kind).toBe("robot");
    expect(occupantAt(state, at(0, 0))?.kind).toBe("prop");
    expect(occupantAt(state, at(2, 2))).toBeNull();
  });

  it("toppled props are flat rubble and do not occupy", () => {
    const s = structuredClone(state);
    s.props[0].toppled = true;
    expect(occupantAt(s, at(0, 0))).toBeNull();
  });

  it("downed heroes and removed robots do not occupy", () => {
    const s = structuredClone(state);
    s.heroes[0].down = true;
    s.robots[0].removed = true;
    expect(occupantAt(s, at(0, 3))).toBeNull();
    expect(occupantAt(s, at(0, -3))).toBeNull();
  });

  it("reads terrain", () => {
    expect(terrainAt(state, at(-1, 0))).toBe("cushion");
    expect(terrainAt(state, at(2, 0))).toBe("marbles");
    expect(terrainAt(state, at(0, 1))).toBeNull();
  });
});

describe("blocking rules", () => {
  const state = makeGame({
    heroes: [hero("teddy", 0, 3)],
    robots: [robot("stomper", 0, -3)],
    props: [prop("tower", 0, 0)],
    terrain: [terrain("cushion", -1, 0), terrain("marbles", 2, 0)],
  });

  it("blocks heroes on pieces and off-board, not on cushions", () => {
    expect(isBlockedForHero(state, at(0, 0))).toBe(true);
    expect(isBlockedForHero(state, at(0, -3))).toBe(true);
    expect(isBlockedForHero(state, at(0, -6))).toBe(true);
    expect(isBlockedForHero(state, at(-1, 0))).toBe(false); // cushion is fine
    expect(isBlockedForHero(state, at(2, 0))).toBe(false); // marbles are fine
  });

  it("blocks robots on cushions too", () => {
    expect(isBlockedForRobot(state, at(-1, 0))).toBe(true);
    expect(isBlockedForRobot(state, at(2, 0))).toBe(false);
    expect(isBlockedForRobot(state, at(0, 0))).toBe(true);
  });

  it("spawn blocking matches robot blocking", () => {
    expect(isSpawnBlocked(state, at(0, 3))).toBe(true); // hero
    expect(isSpawnBlocked(state, at(-1, 0))).toBe(true); // cushion
    expect(isSpawnBlocked(state, at(1, 1))).toBe(false);
  });

  it("spawn tiles with toppled rubble are not blocked", () => {
    const s = structuredClone(state);
    s.props[0].toppled = true;
    expect(isSpawnBlocked(s, at(0, 0))).toBe(false);
  });
});
