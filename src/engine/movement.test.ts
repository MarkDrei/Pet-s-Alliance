import { describe, expect, it } from "vitest";
import { createGame } from "./game";
import { vec, vecEquals } from "./grid";
import { reachableTiles } from "./movement";
import { testContent, testLevel } from "./testUtils";
import type { Vec } from "./types";

const content = testContent();

function contains(tiles: Vec[], target: Vec): boolean {
  return tiles.some((t) => vecEquals(t, target));
}

describe("reachableTiles", () => {
  it("reaches all tiles within move range on an empty board", () => {
    const state = createGame(
      content,
      testLevel({ heroStarts: [{ defId: "tank", pos: vec(3, 3) }] }),
    );
    const hero = state.heroes[0];
    const tiles = reachableTiles(content, state, hero);

    expect(contains(tiles, vec(3, 1))).toBe(true); // 2 north
    expect(contains(tiles, vec(4, 2))).toBe(true); // diagonal via 2 steps
    expect(contains(tiles, vec(3, 0))).toBe(false); // 3 steps away
    expect(contains(tiles, vec(3, 3))).toBe(false); // own tile
  });

  it("cannot pass through or land on blocked tiles", () => {
    const state = createGame(
      content,
      testLevel({
        heroStarts: [{ defId: "tank", pos: vec(0, 0) }],
        props: [{ defId: "rock", pos: vec(0, 1) }],
        robotStarts: [{ defId: "stomper", pos: vec(1, 0), facing: "south" }],
      }),
    );
    const hero = state.heroes[0];
    const tiles = reachableTiles(content, state, hero);

    expect(contains(tiles, vec(0, 1))).toBe(false); // rock
    expect(contains(tiles, vec(1, 0))).toBe(false); // robot
    expect(contains(tiles, vec(0, 2))).toBe(false); // only reachable through them
  });

  it("jumping heroes pass over blockers but cannot land on them", () => {
    const state = createGame(
      content,
      testLevel({
        heroStarts: [{ defId: "scout", pos: vec(0, 0) }],
        props: [
          { defId: "rock", pos: vec(0, 1) },
          { defId: "rock", pos: vec(1, 0) },
        ],
      }),
    );
    const hero = state.heroes[0];
    const tiles = reachableTiles(content, state, hero);

    expect(contains(tiles, vec(0, 2))).toBe(true); // jumped over the rock
    expect(contains(tiles, vec(0, 1))).toBe(false); // cannot land on it
  });

  it("treats toppled towers as walkable rubble", () => {
    const state = createGame(
      content,
      testLevel({
        heroStarts: [{ defId: "tank", pos: vec(0, 0) }],
        props: [{ defId: "tower", pos: vec(0, 1) }],
      }),
    );
    state.props[0].toppled = true;
    const tiles = reachableTiles(content, state, state.heroes[0]);
    expect(contains(tiles, vec(0, 1))).toBe(true);
  });
});
