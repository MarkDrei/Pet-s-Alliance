import { describe, expect, it } from "vitest";
import { attackTiles, computeIntent, planAllRobots, planningTarget, previewIntent } from "./planning";
import { at, hero, makeGame, prop, robot, terrain } from "@/test/fixtures";

describe("planning target", () => {
  it("prefers standing toppleable props and ignores heroes while any exist", () => {
    const state = makeGame({
      heroes: [hero("teddy", 0, -2)], // closer than the tower
      robots: [robot("stomper", 0, -3)],
      props: [prop("tower", 0, 3)],
    });
    expect(planningTarget(state, state.robots[0])).toEqual(at(0, 3));
  });

  it("falls back to living heroes when no standing toppleable prop exists", () => {
    const state = makeGame({
      heroes: [hero("teddy", 0, 2), hero("bunny", 0, 4)],
      robots: [robot("stomper", 0, -3)],
      props: [prop("blocks", 0, 0), prop("tower", 1, 1)],
    });
    state.props[1].toppled = true;
    expect(planningTarget(state, state.robots[0])).toEqual(at(0, 2));
  });

  it("keeps state-array order on distance ties", () => {
    const state = makeGame({
      robots: [robot("stomper", 0, 0)],
      props: [prop("tower", 0, 2), prop("tower", 0, -2)], // both distance 2
    });
    expect(planningTarget(state, state.robots[0])).toEqual(at(0, 2));
  });

  it("skips adjacent candidates for the dasher, still props before heroes", () => {
    const state = makeGame({
      heroes: [hero("teddy", 0, -2)],
      robots: [robot("dasher", 0, 0)],
      props: [prop("tower", 0, 1), prop("tower", 0, 4)],
    });
    // Adjacent tower skipped; the far tower wins even with a closer hero.
    expect(planningTarget(state, state.robots[0], true)).toEqual(at(0, 4));
  });

  it("dasher falls through to heroes when every prop is adjacent", () => {
    const state = makeGame({
      heroes: [hero("teddy", 0, -3)],
      robots: [robot("dasher", 0, 0)],
      props: [prop("tower", 0, 1)],
    });
    expect(planningTarget(state, state.robots[0], true)).toEqual(at(0, -3));
  });

  it("returns null when nothing remains", () => {
    const state = makeGame({
      heroes: [hero("teddy", 0, 3)],
      robots: [robot("dasher", 0, 2)],
    });
    state.heroes[0].down = true;
    expect(planningTarget(state, state.robots[0])).toBeNull();
  });
});

describe("stomper-style intents", () => {
  it("walks straight at the nearest tower and stops at its move value", () => {
    const state = makeGame({
      robots: [robot("stomper", 0, -4)],
      props: [prop("tower", 0, 0)],
    });
    const intent = computeIntent(state, state.robots[0]);
    expect(intent).toEqual({ facing: 3, steps: 2, attacks: true }); // S, 2 steps
  });

  it("publishes an empty path when no stopping point is strictly closer", () => {
    // Tower adjacent: any step would keep or grow the distance.
    const state = makeGame({
      robots: [robot("stomper", 0, -1)],
      props: [prop("tower", 0, 0)],
    });
    const intent = computeIntent(state, state.robots[0]);
    expect(intent.steps).toBe(0);
    expect(intent.facing).toBe(3); // still faces the tower
    expect(intent.attacks).toBe(true);
  });

  it("does not route around blockers", () => {
    // The direct line south is blocked immediately and no sideways run
    // has a strictly closer stopping point: the stomper stays put but
    // still faces the tower and still attacks.
    const state = makeGame({
      robots: [robot("stomper", 0, -2)],
      props: [prop("blocks", 0, -1), prop("tower", 0, 1)],
    });
    const intent = computeIntent(state, state.robots[0]);
    expect(intent.steps).toBe(0);
    expect(intent.facing).toBe(3); // toward the tower
    expect(intent.attacks).toBe(true);
  });

  it("rostzahn plans like a stomper with move 1", () => {
    const state = makeGame({
      robots: [robot("rostzahn", 0, -4)],
      props: [prop("tower", 0, 0)],
    });
    const intent = computeIntent(state, state.robots[0]);
    expect(intent).toEqual({ facing: 3, steps: 1, attacks: true });
  });
});

describe("dasher intents", () => {
  it("charges the full lane and crashes into the tile beyond", () => {
    const state = makeGame({
      robots: [robot("dasher", 0, -4)],
      props: [prop("tower", 0, 0)],
    });
    const intent = computeIntent(state, state.robots[0]);
    // Move 3: charges (0,-3),(0,-2),(0,-1); crash tile (0,0) is occupied.
    expect(intent).toEqual({ facing: 3, steps: 3, attacks: true });
  });

  it("stops on the last free hex before the target", () => {
    const state = makeGame({
      robots: [robot("dasher", 0, -3)],
      props: [prop("tower", 0, 0)],
    });
    const intent = computeIntent(state, state.robots[0]);
    expect(intent).toEqual({ facing: 3, steps: 2, attacks: true });
  });

  it("skips adjacent targets and aims at something else", () => {
    const state = makeGame({
      heroes: [hero("teddy", 0, 1)], // adjacent pet: not a legal crash
      robots: [robot("dasher", 0, 0)],
      props: [prop("tower", -3, 3)],
    });
    const intent = computeIntent(state, state.robots[0]);
    expect(intent.facing).not.toBe(3);
    expect(intent.steps).toBeGreaterThan(0);
  });

  it("publishes no attack when the lane is empty", () => {
    const state = makeGame({
      heroes: [hero("teddy", 0, 5)],
      robots: [robot("dasher", 0, -4)],
    });
    const intent = computeIntent(state, state.robots[0]);
    // Charges 3 south; (0,-1)+ still free, no crash.
    expect(intent).toEqual({ facing: 3, steps: 3, attacks: false });
  });

  it("publishes an empty path when boxed in", () => {
    const state = makeGame({
      heroes: [hero("teddy", 0, 5)],
      robots: [robot("dasher", 0, -5)], // top point
      props: [
        prop("blocks", 0, -4),
        prop("blocks", 1, -5),
        // (-1,-4) is the third in-board neighbor of the point.
        prop("blocks", -1, -4),
      ],
    });
    const intent = computeIntent(state, state.robots[0]);
    expect(intent.steps).toBe(0);
    expect(intent.attacks).toBe(false);
  });

  it("must charge at least one hex: never attacks without moving", () => {
    const state = makeGame({
      heroes: [hero("teddy", 3, -3)],
      robots: [robot("dasher", 0, 0)],
    });
    const intent = computeIntent(state, state.robots[0]);
    expect(intent.steps).toBeGreaterThanOrEqual(1);
  });
});

describe("attack shapes", () => {
  it("front: the single hex in facing", () => {
    expect(attackTiles(at(0, 0), 3, "front")).toEqual([at(0, 1)]);
  });

  it("flanks: front-left and front-right, never straight ahead", () => {
    const tiles = attackTiles(at(0, 0), 3, "flanks"); // facing S
    expect(tiles).toHaveLength(2);
    expect(tiles).toContainEqual(at(1, 0)); // SE
    expect(tiles).toContainEqual(at(-1, 1)); // SW
    expect(tiles).not.toContainEqual(at(0, 1));
    // Both flanks touch the robot and the hex in front.
  });

  it("ring: all six neighbors", () => {
    const tiles = attackTiles(at(0, 0), 0, "ring");
    expect(tiles).toHaveLength(6);
    expect(tiles).toContainEqual(at(0, -1));
    expect(tiles).toContainEqual(at(1, 0));
    expect(tiles).toContainEqual(at(-1, 1));
  });
});

describe("intent preview", () => {
  it("shows path and attack tiles for the published plan", () => {
    const state = planAllRobots(
      makeGame({
        robots: [robot("stomper", 0, -4)],
        props: [prop("tower", 0, 0)],
      }),
    );
    const preview = previewIntent(state, state.robots[0]);
    expect(preview.path).toEqual([at(0, -3), at(0, -2)]);
    expect(preview.final).toEqual(at(0, -2));
    expect(preview.attack).toEqual([at(0, -1)]);
  });

  it("re-checks steps against the current board (stops early)", () => {
    const state = planAllRobots(
      makeGame({
        heroes: [hero("teddy", 0, 5)],
        robots: [robot("stomper", 0, -4)],
        props: [prop("tower", 0, 0)],
      }),
    );
    // Teddy steps into the lane after planning.
    state.heroes[0].pos = at(0, -3);
    const preview = previewIntent(state, state.robots[0]);
    expect(preview.path).toEqual([]);
    expect(preview.final).toEqual(at(0, -4));
    expect(preview.attack).toEqual([at(0, -3)]); // hits the blocker tile
  });

  it("includes the marble slide after the walk", () => {
    const state = planAllRobots(
      makeGame({
        robots: [robot("stomper", 0, -4)],
        props: [prop("tower", 0, 2)],
        terrain: [terrain("marbles", 0, -2), terrain("marbles", 0, -1)],
      }),
    );
    // Plan: 2 steps S onto the marbles, then slide to (0,0).
    const preview = previewIntent(state, state.robots[0]);
    expect(preview.path).toEqual([at(0, -3), at(0, -2)]);
    expect(preview.slide).toEqual([at(0, -1), at(0, 0)]);
    expect(preview.slideEnd).toBe("landed");
    expect(preview.final).toEqual(at(0, 0));
    expect(preview.attack).toEqual([at(0, 1)]);
  });

  it("previews a slide off the board with no attack", () => {
    const state = makeGame({
      heroes: [hero("teddy", -4, 5)], // out of the lane
      robots: [robot("stomper", 0, 2, 3)],
      terrain: [terrain("marbles", 0, 4), terrain("marbles", 0, 5)],
    });
    state.robots[0].intent = { facing: 3, steps: 2, attacks: true };
    const preview = previewIntent(state, state.robots[0]);
    expect(preview.slideEnd).toBe("exited");
    expect(preview.attack).toEqual([]);
  });
});
