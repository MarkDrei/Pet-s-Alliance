import { describe, expect, it } from "vitest";
import { abilityTargets, applyAbility, createGame, endPlayerTurn } from "./game";
import { vec } from "./grid";
import { testContent, testLevel } from "./testUtils";

const content = testContent();

describe("push (Wegschubsen)", () => {
  it("pushes an adjacent robot one tile away from the hero", () => {
    const state = createGame(
      content,
      testLevel({
        heroStarts: [{ defId: "tank", pos: vec(2, 2) }],
        robotStarts: [{ defId: "stomper", pos: vec(2, 3), facing: "north" }],
      }),
    );
    const next = applyAbility(content, state, state.heroes[0].id, vec(2, 3));
    expect(next.robots[0].pos).toEqual(vec(2, 4));
    expect(next.robots[0].facing).toBe("south");
    expect(next.heroes[0].hasActed).toBe(true);
    expect(next.robots[0].intent).not.toBeNull();
  });

  it("bumps the robot for 1 damage when pushed into the wall", () => {
    const state = createGame(
      content,
      testLevel({
        heroStarts: [{ defId: "tank", pos: vec(2, 6) }],
        robotStarts: [{ defId: "stomper", pos: vec(2, 7), facing: "north" }],
      }),
    );
    const next = applyAbility(content, state, state.heroes[0].id, vec(2, 7));
    expect(next.robots[0].pos).toEqual(vec(2, 7));
    expect(next.robots[0].hp).toBe(1);
    expect(next.events).toContainEqual(expect.objectContaining({ type: "robotBumped" }));
  });

  it("destroys a 1-hp robot pushed into an obstacle", () => {
    const state = createGame(
      content,
      testLevel({
        heroStarts: [{ defId: "tank", pos: vec(2, 2) }],
        robotStarts: [{ defId: "dasher", pos: vec(3, 2), facing: "north" }],
        props: [{ defId: "rock", pos: vec(4, 2) }],
      }),
    );
    const next = applyAbility(content, state, state.heroes[0].id, vec(3, 2));
    expect(next.robots).toHaveLength(0);
    expect(next.events).toContainEqual(
      expect.objectContaining({ type: "robotDestroyed" }),
    );
  });

  it("rejects targets out of range", () => {
    const state = createGame(
      content,
      testLevel({
        heroStarts: [{ defId: "tank", pos: vec(2, 2) }],
        robotStarts: [{ defId: "stomper", pos: vec(2, 5), facing: "north" }],
      }),
    );
    const next = applyAbility(content, state, state.heroes[0].id, vec(2, 5));
    expect(next).toBe(state);
  });
});

describe("nudge (Anschubsen)", () => {
  it("makes the robot stumble away from the bunny", () => {
    const state = createGame(
      content,
      testLevel({
        heroStarts: [{ defId: "scout", pos: vec(3, 2) }],
        robotStarts: [{ defId: "stomper", pos: vec(3, 3), facing: "north" }],
        props: [{ defId: "tower", pos: vec(0, 3) }],
      }),
    );
    // Bunny stands north of the robot, so the stumble goes south.
    const next = applyAbility(content, state, state.heroes[0].id, vec(3, 3));
    const robot = next.robots[0];
    expect(robot.facing).toBe("south");
    expect(robot.confused).toBe(true);
    expect(robot.intent!.path[0]).toEqual(vec(3, 4));
  });

  it("the player steers the direction via the bunny's position", () => {
    const state = createGame(
      content,
      testLevel({
        heroStarts: [{ defId: "scout", pos: vec(2, 3) }],
        robotStarts: [{ defId: "stomper", pos: vec(3, 3), facing: "north" }],
      }),
    );
    // Bunny stands west of the robot, so the stumble goes east.
    const next = applyAbility(content, state, state.heroes[0].id, vec(3, 3));
    expect(next.robots[0].facing).toBe("east");
    expect(next.robots[0].intent!.path[0]).toEqual(vec(4, 3));
  });
});

describe("shield (Funkelschild)", () => {
  it("shields an ally in range", () => {
    const state = createGame(
      content,
      testLevel({
        heroStarts: [
          { defId: "support", pos: vec(3, 3) },
          { defId: "tank", pos: vec(3, 1) },
        ],
      }),
    );
    const support = state.heroes[0];
    const next = applyAbility(content, state, support.id, vec(3, 1));
    expect(next.heroes[1].shielded).toBe(true);
  });

  it("can shield itself but not allies out of range", () => {
    const state = createGame(
      content,
      testLevel({
        heroStarts: [
          { defId: "support", pos: vec(0, 0) },
          { defId: "tank", pos: vec(7, 7) },
        ],
      }),
    );
    const targets = abilityTargets(content, state, state.heroes[0].id);
    expect(targets).toContainEqual(vec(0, 0));
    expect(targets).not.toContainEqual(vec(7, 7));
  });

  it("can shield a standing tower in range, but not obstacles", () => {
    const state = createGame(
      content,
      testLevel({
        heroStarts: [{ defId: "support", pos: vec(3, 3) }],
        props: [
          { defId: "tower", pos: vec(3, 1) },
          { defId: "rock", pos: vec(4, 3) },
        ],
      }),
    );
    const targets = abilityTargets(content, state, state.heroes[0].id);
    expect(targets).toContainEqual(vec(3, 1));
    expect(targets).not.toContainEqual(vec(4, 3));

    const next = applyAbility(content, state, state.heroes[0].id, vec(3, 1));
    expect(next.props[0].shielded).toBe(true);
  });

  it("a shielded tower survives one topple attempt", () => {
    const state = createGame(
      content,
      testLevel({
        heroStarts: [{ defId: "support", pos: vec(1, 1) }],
        robotStarts: [{ defId: "stomper", pos: vec(0, 2), facing: "south" }],
        props: [{ defId: "tower", pos: vec(0, 3) }],
      }),
    );
    const shielded = applyAbility(content, state, state.heroes[0].id, vec(0, 3));
    const next = endPlayerTurn(content, shielded);
    expect(next.props[0].toppled).toBe(false);
    expect(next.props[0].shielded).toBe(false);
    expect(next.events).toContainEqual(
      expect.objectContaining({ type: "shieldBlocked", propId: next.props[0].id }),
    );
  });
});

describe("action economy", () => {
  it("a hero cannot use its ability twice per turn", () => {
    const state = createGame(
      content,
      testLevel({
        heroStarts: [{ defId: "tank", pos: vec(2, 2) }],
        robotStarts: [{ defId: "stomper", pos: vec(2, 3), facing: "north" }],
      }),
    );
    const afterFirst = applyAbility(content, state, state.heroes[0].id, vec(2, 3));
    const afterSecond = applyAbility(content, afterFirst, afterFirst.heroes[0].id, vec(2, 4));
    expect(afterSecond).toBe(afterFirst);
  });
});
