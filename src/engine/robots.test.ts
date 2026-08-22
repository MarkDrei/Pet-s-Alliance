import { describe, expect, it } from "vitest";
import { createGame, endPlayerTurn } from "./game";
import { vec } from "./grid";
import { computeIntent } from "./robots";
import { testContent, testLevel } from "./testUtils";

const content = testContent();

describe("robot intents", () => {
  it("stomper walks toward the nearest tower and attacks when it gets adjacent", () => {
    const state = createGame(
      content,
      testLevel({
        robotStarts: [{ defId: "stomper", pos: vec(0, 0), facing: "south" }],
        props: [{ defId: "tower", pos: vec(0, 3) }],
      }),
    );
    const intent = state.robots[0].intent!;
    expect(intent.path).toHaveLength(2);
    expect(intent.path[1]).toEqual(vec(0, 2));
    expect(intent.attackTile).toEqual(vec(0, 3));
  });

  it("stomper prefers towers over heroes", () => {
    const state = createGame(
      content,
      testLevel({
        robotStarts: [{ defId: "stomper", pos: vec(3, 3), facing: "south" }],
        heroStarts: [{ defId: "tank", pos: vec(3, 4) }],
        props: [{ defId: "tower", pos: vec(3, 0) }],
      }),
    );
    const intent = state.robots[0].intent!;
    // Adjacent hero would be the lazy pick; the tower across the room wins.
    expect(intent.path[0]).toEqual(vec(3, 2));
  });

  it("stomper moves like a rook: one straight line per turn, never around corners", () => {
    const state = createGame(
      content,
      testLevel({
        robotStarts: [{ defId: "stomper", pos: vec(0, 0), facing: "south" }],
        props: [{ defId: "tower", pos: vec(2, 2) }],
      }),
    );
    const intent = state.robots[0].intent!;
    // An L-shaped path like (0,1),(1,1) would be closer but is not allowed.
    expect(intent.path).toEqual([vec(1, 0), vec(2, 0)]);
  });

  it("stomper stays put when no straight line brings it closer", () => {
    const state = createGame(
      content,
      testLevel({
        robotStarts: [{ defId: "stomper", pos: vec(0, 0), facing: "south" }],
        props: [
          { defId: "tower", pos: vec(0, 3) },
          { defId: "rock", pos: vec(0, 1) }, // blocks the only useful line
        ],
      }),
    );
    const intent = state.robots[0].intent!;
    expect(intent.path).toEqual([]);
    expect(intent.attackTile).toBeNull();
  });

  it("stomper without a planned attack does not attack from afar", () => {
    const state = createGame(
      content,
      testLevel({
        robotStarts: [{ defId: "stomper", pos: vec(0, 0), facing: "south" }],
        props: [{ defId: "tower", pos: vec(0, 5) }],
      }),
    );
    expect(state.robots[0].intent!.attackTile).toBeNull();
  });

  it("dasher charges its facing direction and targets the first thing it hits", () => {
    const state = createGame(
      content,
      testLevel({
        robotStarts: [{ defId: "dasher", pos: vec(3, 0), facing: "south" }],
        heroStarts: [{ defId: "tank", pos: vec(3, 2) }],
      }),
    );
    const intent = state.robots[0].intent!;
    expect(intent.path).toEqual([vec(3, 1)]);
    expect(intent.attackTile).toEqual(vec(3, 2));
  });

  it("dasher ignores non-attackable walls beyond its range", () => {
    const state = createGame(
      content,
      testLevel({
        robotStarts: [{ defId: "dasher", pos: vec(0, 5), facing: "south" }],
      }),
    );
    const intent = state.robots[0].intent!;
    expect(intent.path).toEqual([vec(0, 6), vec(0, 7)]);
    expect(intent.attackTile).toBeNull();
  });
});

describe("robot execution", () => {
  it("topples a tower and counts chaos", () => {
    const state = createGame(
      content,
      testLevel({
        heroStarts: [{ defId: "tank", pos: vec(7, 7) }],
        robotStarts: [{ defId: "stomper", pos: vec(0, 2), facing: "south" }],
        props: [{ defId: "tower", pos: vec(0, 3) }],
      }),
    );
    const next = endPlayerTurn(content, state);
    expect(next.props[0].toppled).toBe(true);
    expect(next.events).toContainEqual(
      expect.objectContaining({ type: "towerToppled" }),
    );
  });

  it("damages a hero and downs it at 0 hp", () => {
    const state = createGame(
      content,
      testLevel({
        heroStarts: [
          { defId: "tank", pos: vec(0, 3) },
          { defId: "support", pos: vec(7, 7) },
        ],
        robotStarts: [{ defId: "stomper", pos: vec(0, 2), facing: "south" }],
      }),
    );
    state.heroes[0].hp = 1;
    const next = endPlayerTurn(content, state);
    expect(next.heroes[0].hp).toBe(0);
    expect(next.events).toContainEqual(expect.objectContaining({ type: "heroDown" }));
  });

  it("a shield blocks the hit and is consumed", () => {
    const state = createGame(
      content,
      testLevel({
        heroStarts: [{ defId: "tank", pos: vec(0, 3) }],
        robotStarts: [{ defId: "stomper", pos: vec(0, 2), facing: "south" }],
      }),
    );
    state.heroes[0].shielded = true;
    const next = endPlayerTurn(content, state);
    expect(next.heroes[0].hp).toBe(5);
    expect(next.events).toContainEqual(
      expect.objectContaining({ type: "shieldBlocked" }),
    );
  });

  it("a stunned robot skips its turn once", () => {
    const state = createGame(
      content,
      testLevel({
        heroStarts: [{ defId: "tank", pos: vec(7, 7) }],
        robotStarts: [{ defId: "stomper", pos: vec(0, 2), facing: "south" }],
        props: [{ defId: "tower", pos: vec(0, 3) }],
      }),
    );
    state.robots[0].stunned = true;
    const next = endPlayerTurn(content, state);
    expect(next.props[0].toppled).toBe(false);
    expect(next.robots[0].stunned).toBe(false);
    expect(next.events).toContainEqual(
      expect.objectContaining({ type: "robotStunnedSkip" }),
    );
  });

  it("stops moving when its planned path became blocked", () => {
    const state = createGame(
      content,
      testLevel({
        heroStarts: [{ defId: "tank", pos: vec(7, 7) }],
        robotStarts: [{ defId: "dasher", pos: vec(0, 0), facing: "south" }],
      }),
    );
    // Someone stepped into the lane after the intent was computed.
    expect(state.robots[0].intent!.path).toHaveLength(3);
    state.heroes[0].pos = vec(0, 2);
    const next = endPlayerTurn(content, state);
    expect(next.robots[0].pos).toEqual(vec(0, 1));
  });

  it("a nudged robot stumbling over the edge falls off and disappears", () => {
    const state = createGame(
      content,
      testLevel({
        heroStarts: [{ defId: "tank", pos: vec(7, 7) }],
        robotStarts: [{ defId: "stomper", pos: vec(3, 1), facing: "north" }],
      }),
    );
    const robot = state.robots[0];
    robot.confused = true; // as after a bunny nudge from the south
    robot.intent = computeIntent(content, state, robot);
    expect(robot.intent.exitsBoard).toBe(true);
    expect(robot.intent.path).toEqual([vec(3, 0)]);

    const next = endPlayerTurn(content, state);
    expect(next.robots).toHaveLength(0);
    expect(next.events).toContainEqual(expect.objectContaining({ type: "robotExited" }));
  });

  it("robots never run off the board voluntarily", () => {
    const state = createGame(
      content,
      testLevel({
        heroStarts: [{ defId: "tank", pos: vec(7, 0) }],
        robotStarts: [{ defId: "dasher", pos: vec(0, 5), facing: "south" }],
      }),
    );
    expect(state.robots[0].intent!.exitsBoard).toBeFalsy();
    const next = endPlayerTurn(content, state);
    expect(next.robots).toHaveLength(1);
    expect(next.robots[0].pos).toEqual(vec(0, 7));
  });

  it("a dasher stuck against the wall turns clockwise", () => {
    const state = createGame(
      content,
      testLevel({
        heroStarts: [{ defId: "tank", pos: vec(7, 0) }],
        robotStarts: [{ defId: "dasher", pos: vec(0, 7), facing: "south" }],
      }),
    );
    const next = endPlayerTurn(content, state);
    expect(next.robots[0].facing).toBe("west");
  });
});

describe("computeIntent for confused robots", () => {
  it("uses the facing direction instead of pathfinding", () => {
    const state = createGame(
      content,
      testLevel({
        robotStarts: [{ defId: "stomper", pos: vec(3, 3), facing: "east" }],
        props: [{ defId: "tower", pos: vec(3, 5) }],
      }),
    );
    const robot = state.robots[0];
    robot.confused = true;
    const intent = computeIntent(content, state, robot);
    expect(intent.path).toEqual([vec(4, 3), vec(5, 3)]);
  });
});

describe("spinner", () => {
  it("plans a whirl into all four adjacent tiles after moving", () => {
    const state = createGame(
      content,
      testLevel({
        robotStarts: [{ defId: "spinner", pos: vec(3, 3), facing: "south" }],
        props: [{ defId: "tower", pos: vec(3, 5) }],
      }),
    );
    const intent = state.robots[0].intent!;
    expect(intent.path).toEqual([vec(3, 4)]);
    expect(intent.attackTiles).toContainEqual(vec(3, 5));
    expect(intent.attackTiles).toContainEqual(vec(2, 4));
    expect(intent.attackTiles).toContainEqual(vec(4, 4));
    expect(intent.attackTiles).toContainEqual(vec(3, 3));
  });

  it("hits towers and heroes on all sides at once", () => {
    const state = createGame(
      content,
      testLevel({
        heroStarts: [{ defId: "tank", pos: vec(2, 4) }],
        robotStarts: [{ defId: "spinner", pos: vec(3, 3), facing: "south" }],
        props: [{ defId: "tower", pos: vec(3, 5) }],
      }),
    );
    const next = endPlayerTurn(content, state);
    expect(next.props[0].toppled).toBe(true);
    expect(next.heroes[0].hp).toBe(4);
  });
});

describe("bomber", () => {
  it("explodes next to its target, toppling it and destroying itself", () => {
    const state = createGame(
      content,
      testLevel({
        heroStarts: [{ defId: "tank", pos: vec(7, 7) }],
        robotStarts: [{ defId: "bomber", pos: vec(0, 0), facing: "south" }],
        props: [{ defId: "tower", pos: vec(0, 3) }],
      }),
    );
    const intent = state.robots[0].intent!;
    expect(intent.explodes).toBe(true);
    expect(intent.attackTiles).toContainEqual(vec(0, 3));

    const next = endPlayerTurn(content, state);
    expect(next.props[0].toppled).toBe(true);
    expect(next.robots).toHaveLength(0);
    expect(next.events).toContainEqual(expect.objectContaining({ type: "robotExploded" }));
  });

  it("keeps marching while the target is still out of reach", () => {
    const state = createGame(
      content,
      testLevel({
        heroStarts: [{ defId: "tank", pos: vec(7, 7) }],
        robotStarts: [{ defId: "bomber", pos: vec(0, 0), facing: "south" }],
        props: [{ defId: "tower", pos: vec(0, 6) }],
      }),
    );
    expect(state.robots[0].intent!.explodes).toBeFalsy();
    const next = endPlayerTurn(content, state);
    expect(next.robots).toHaveLength(1);
    expect(next.props[0].toppled).toBe(false);
  });
});

describe("marble terrain", () => {
  it("a robot ending its move on marbles slides until it leaves them", () => {
    const state = createGame(
      content,
      testLevel({
        robotStarts: [{ defId: "stomper", pos: vec(0, 0), facing: "south" }],
        props: [{ defId: "tower", pos: vec(0, 6) }],
        terrain: [
          { defId: "marbles", pos: vec(0, 2) },
          { defId: "marbles", pos: vec(0, 3) },
        ],
      }),
    );
    const intent = state.robots[0].intent!;
    expect(intent.path).toEqual([vec(0, 1), vec(0, 2), vec(0, 3), vec(0, 4)]);

    const next = endPlayerTurn(content, state);
    expect(next.robots[0].pos).toEqual(vec(0, 4));
  });

  it("a marble lane can carry a robot off the board edge", () => {
    const state = createGame(
      content,
      testLevel({
        heroStarts: [{ defId: "tank", pos: vec(7, 0) }],
        robotStarts: [{ defId: "dasher", pos: vec(0, 4), facing: "south" }],
        terrain: [
          { defId: "marbles", pos: vec(0, 6) },
          { defId: "marbles", pos: vec(0, 7) },
        ],
      }),
    );
    const intent = state.robots[0].intent!;
    expect(intent.exitsBoard).toBe(true);

    const next = endPlayerTurn(content, state);
    expect(next.robots).toHaveLength(0);
    expect(next.events).toContainEqual(expect.objectContaining({ type: "robotExited" }));
  });
});

describe("cushion terrain", () => {
  it("blocks robot movement lanes", () => {
    const state = createGame(
      content,
      testLevel({
        robotStarts: [{ defId: "stomper", pos: vec(0, 0), facing: "south" }],
        props: [{ defId: "tower", pos: vec(0, 4) }],
        terrain: [{ defId: "cushion", pos: vec(0, 2) }],
      }),
    );
    const intent = state.robots[0].intent!;
    // The lane toward the tower ends in front of the cushion.
    expect(intent.path).toEqual([vec(0, 1)]);
  });
});
