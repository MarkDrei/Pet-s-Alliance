import { describe, expect, it } from "vitest";
import { chaosCount, createGame, endPlayerTurn, moveHero, applyItem } from "./game";
import { vec } from "./grid";
import { testContent, testLevel } from "./testUtils";

const content = testContent();

describe("createGame", () => {
  it("sets up heroes, robots, props and intents from the level", () => {
    const state = createGame(
      content,
      testLevel({
        heroStarts: [{ defId: "tank", pos: vec(2, 6) }],
        robotStarts: [{ defId: "dasher", pos: vec(1, 1), facing: "south" }],
        props: [{ defId: "tower", pos: vec(4, 4) }],
        items: ["windup-key"],
      }),
    );
    expect(state.phase).toBe("playerTurn");
    expect(state.round).toBe(1);
    expect(state.heroes[0].hp).toBe(5);
    expect(state.robots[0].intent).not.toBeNull();
    expect(state.items).toEqual([{ defId: "windup-key", used: false }]);
  });
});

describe("moveHero", () => {
  it("moves to a reachable tile exactly once per turn", () => {
    const state = createGame(
      content,
      testLevel({ heroStarts: [{ defId: "tank", pos: vec(3, 3) }] }),
    );
    const heroId = state.heroes[0].id;
    const moved = moveHero(content, state, heroId, vec(3, 1));
    expect(moved.heroes[0].pos).toEqual(vec(3, 1));
    expect(moved.heroes[0].hasMoved).toBe(true);

    const movedAgain = moveHero(content, moved, heroId, vec(3, 2));
    expect(movedAgain).toBe(moved);
  });

  it("ignores unreachable destinations", () => {
    const state = createGame(
      content,
      testLevel({ heroStarts: [{ defId: "tank", pos: vec(3, 3) }] }),
    );
    const next = moveHero(content, state, state.heroes[0].id, vec(7, 7));
    expect(next).toBe(state);
  });

  it("recomputes robot intents after a hero moves", () => {
    const state = createGame(
      content,
      testLevel({
        heroStarts: [{ defId: "tank", pos: vec(1, 3) }],
        robotStarts: [{ defId: "dasher", pos: vec(0, 0), facing: "south" }],
      }),
    );
    expect(state.robots[0].intent!.attackTile).toBeNull();
    const next = moveHero(content, state, state.heroes[0].id, vec(0, 2));
    expect(next.robots[0].intent!.attackTile).toEqual(vec(0, 2));
  });
});

describe("applyItem (wind-up key)", () => {
  it("stuns the chosen robot and is consumed", () => {
    const state = createGame(
      content,
      testLevel({
        heroStarts: [{ defId: "tank", pos: vec(7, 7) }],
        robotStarts: [{ defId: "stomper", pos: vec(1, 1), facing: "south" }],
        items: ["windup-key"],
      }),
    );
    const next = applyItem(state, 0, vec(1, 1));
    expect(next.robots[0].stunned).toBe(true);
    expect(next.items[0].used).toBe(true);

    const again = applyItem(next, 0, vec(1, 1));
    expect(again).toBe(next);
  });
});

describe("turn loop and outcomes", () => {
  it("advances rounds and resets hero flags", () => {
    const state = createGame(
      content,
      testLevel({
        heroStarts: [{ defId: "tank", pos: vec(3, 3) }],
        roundsToSurvive: 5,
      }),
    );
    const moved = moveHero(content, state, state.heroes[0].id, vec(3, 2));
    const next = endPlayerTurn(content, moved);
    expect(next.round).toBe(2);
    expect(next.phase).toBe("playerTurn");
    expect(next.heroes[0].hasMoved).toBe(false);
  });

  it("declares victory after surviving the final round", () => {
    const state = createGame(
      content,
      testLevel({
        heroStarts: [{ defId: "tank", pos: vec(3, 3) }],
        roundsToSurvive: 1,
      }),
    );
    const next = endPlayerTurn(content, state);
    expect(next.phase).toBe("victory");
  });

  it("declares defeat when chaos reaches the limit", () => {
    const state = createGame(
      content,
      testLevel({
        heroStarts: [{ defId: "tank", pos: vec(7, 7) }],
        robotStarts: [{ defId: "stomper", pos: vec(0, 2), facing: "south" }],
        props: [{ defId: "tower", pos: vec(0, 3) }],
        maxChaos: 1,
      }),
    );
    const next = endPlayerTurn(content, state);
    expect(chaosCount(next)).toBe(1);
    expect(next.phase).toBe("defeat");
  });

  it("declares defeat when all heroes are down", () => {
    const state = createGame(
      content,
      testLevel({
        heroStarts: [{ defId: "tank", pos: vec(0, 3) }],
        robotStarts: [{ defId: "stomper", pos: vec(0, 2), facing: "south" }],
      }),
    );
    state.heroes[0].hp = 1;
    const next = endPlayerTurn(content, state);
    expect(next.phase).toBe("defeat");
  });

  it("spawns scheduled robots at the start of their round", () => {
    const state = createGame(
      content,
      testLevel({
        heroStarts: [{ defId: "tank", pos: vec(3, 3) }],
        spawns: [{ round: 2, defId: "dasher", pos: vec(7, 0), facing: "south" }],
      }),
    );
    expect(state.robots).toHaveLength(0);
    const next = endPlayerTurn(content, state);
    expect(next.robots).toHaveLength(1);
    expect(next.robots[0].pos).toEqual(vec(7, 0));
    expect(next.events).toContainEqual(expect.objectContaining({ type: "robotSpawned" }));
  });

  it("delays a spawn when its tile is occupied", () => {
    const state = createGame(
      content,
      testLevel({
        heroStarts: [{ defId: "tank", pos: vec(7, 0) }],
        spawns: [{ round: 2, defId: "dasher", pos: vec(7, 0), facing: "south" }],
      }),
    );
    const next = endPlayerTurn(content, state);
    expect(next.robots).toHaveLength(0);
    expect(next.pendingSpawns[0].round).toBe(3);
  });
});
