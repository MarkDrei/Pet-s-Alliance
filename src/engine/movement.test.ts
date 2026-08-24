import { describe, expect, it } from "vitest";
import { hexKey } from "./hex";
import { heroMoveTargets, heroPathTo, heroReachable, marbleSlide, robotLineRun } from "./movement";
import { at, hero, makeGame, prop, robot, terrain } from "@/test/fixtures";

describe("hero movement (BFS)", () => {
  it("teddy reaches tiles within 3 steps", () => {
    const state = makeGame({ heroes: [hero("teddy", 0, 0)] });
    const teddy = state.heroes[0];
    const targets = heroMoveTargets(state, teddy);
    expect(targets).toContainEqual(at(0, 3));
    expect(targets).toContainEqual(at(0, -3));
    expect(targets).toContainEqual(at(2, -3));
    expect(targets).not.toContainEqual(at(0, 4));
    expect(targets).not.toContainEqual(at(0, 0)); // own tile is not a move
  });

  it("non-jumpers cannot pass through blocked tiles", () => {
    // Wall of props directly north; teddy must go around.
    const state = makeGame({
      heroes: [hero("teddy", 0, 3)],
      props: [prop("blocks", 0, 2), prop("blocks", 1, 2), prop("blocks", -1, 3)],
    });
    const teddy = state.heroes[0];
    const reach = heroReachable(state, teddy);
    // (0, 2) is occupied: not landable.
    expect(reach.has(hexKey(at(0, 2)))).toBe(false);
    // (0, 1) is 2 steps through the wall but 4+ around: unreachable at move 3.
    expect(reach.has(hexKey(at(0, 1)))).toBe(false);
  });

  it("bunny jumps over blockers but cannot land on them", () => {
    const state = makeGame({
      heroes: [hero("bunny", 0, 3)],
      props: [prop("blocks", 0, 2)],
      robots: [robot("stomper", 0, 1)],
    });
    const bunny = state.heroes[0];
    const reach = heroReachable(state, bunny);
    // Straight over the block and the robot (3 steps to (0, 0)).
    expect(reach.has(hexKey(at(0, 0)))).toBe(true);
    // May not land on the blocked tiles themselves.
    expect(reach.has(hexKey(at(0, 2)))).toBe(false);
    expect(reach.has(hexKey(at(0, 1)))).toBe(false);
  });

  it("jump paths include the tiles leapt over", () => {
    const state = makeGame({
      heroes: [hero("bunny", 0, 3)],
      props: [prop("blocks", 0, 2)],
    });
    const path = heroPathTo(state, state.heroes[0], at(0, 1));
    expect(path).toEqual([at(0, 2), at(0, 1)]);
  });

  it("toppled props can be crossed by anyone", () => {
    const state = makeGame({
      heroes: [hero("teddy", 0, 3)],
      props: [prop("tower", 0, 2)],
    });
    state.props[0].toppled = true;
    const reach = heroReachable(state, state.heroes[0]);
    expect(reach.has(hexKey(at(0, 2)))).toBe(true);
    expect(reach.has(hexKey(at(0, 0)))).toBe(true);
  });

  it("returns no targets once the hero has moved or acted", () => {
    const state = makeGame({ heroes: [hero("teddy", 0, 0)] });
    state.heroes[0].hasMoved = true;
    expect(heroMoveTargets(state, state.heroes[0])).toEqual([]);
    state.heroes[0].hasMoved = false;
    state.heroes[0].hasActed = true;
    expect(heroMoveTargets(state, state.heroes[0])).toEqual([]);
  });

  it("paths never cross non-adjacent hexes", () => {
    const state = makeGame({ heroes: [hero("unicorn", 0, 0)] });
    const path = heroPathTo(state, state.heroes[0], at(2, -3));
    expect(path).not.toBeNull();
    let prev = at(0, 0);
    for (const step of path!) {
      expect(
        Math.abs(step.q - prev.q) + Math.abs(step.r - prev.r) + Math.abs(step.q + step.r - prev.q - prev.r),
      ).toBe(2); // hex distance 1
      prev = step;
    }
  });
});

describe("robot line runs", () => {
  it("stops before blockers", () => {
    const state = makeGame({
      robots: [robot("stomper", 0, -3)],
      props: [prop("tower", 0, 0)],
    });
    const run = robotLineRun(state, at(0, -3), 3, 5); // S
    expect(run).toEqual([at(0, -2), at(0, -1)]);
  });

  it("stops before cushions", () => {
    const state = makeGame({
      robots: [robot("stomper", 0, -3)],
      terrain: [terrain("cushion", 0, -1)],
    });
    const run = robotLineRun(state, at(0, -3), 3, 5);
    expect(run).toEqual([at(0, -2)]);
  });

  it("stops at the board edge and respects the step cap", () => {
    const state = makeGame({ robots: [robot("stomper", 0, -3)] });
    expect(robotLineRun(state, at(0, -3), 0, 5)).toEqual([at(0, -4), at(0, -5)]); // N to edge
    expect(robotLineRun(state, at(0, -3), 3, 2)).toEqual([at(0, -2), at(0, -1)]);
  });
});

describe("marble slides", () => {
  it("does nothing off marbles", () => {
    const state = makeGame({});
    expect(marbleSlide(state, at(0, 0), 3)).toEqual({ path: [], end: "landed" });
  });

  it("slides across every marble hex and lands on the first non-marble hex", () => {
    const state = makeGame({
      terrain: [terrain("marbles", 0, -2), terrain("marbles", 0, -1), terrain("marbles", 0, 0)],
    });
    const slide = marbleSlide(state, at(0, -2), 3); // S
    expect(slide.end).toBe("landed");
    expect(slide.path).toEqual([at(0, -1), at(0, 0), at(0, 1)]);
  });

  it("bumps and stays on the last marble when the exit is blocked", () => {
    const state = makeGame({
      props: [prop("tower", 0, 1)],
      terrain: [terrain("marbles", 0, -1), terrain("marbles", 0, 0)],
    });
    const slide = marbleSlide(state, at(0, -1), 3);
    expect(slide.end).toBe("bumped");
    expect(slide.path).toEqual([at(0, 0)]);
  });

  it("bumps against cushions too", () => {
    const state = makeGame({
      terrain: [terrain("marbles", 0, 0), terrain("cushion", 0, 1)],
    });
    const slide = marbleSlide(state, at(0, 0), 3);
    expect(slide.end).toBe("bumped");
    expect(slide.path).toEqual([]);
  });

  it("exits the board when the track runs off it", () => {
    const state = makeGame({
      terrain: [terrain("marbles", 0, 4), terrain("marbles", 0, 5)],
    });
    const slide = marbleSlide(state, at(0, 4), 3);
    expect(slide.end).toBe("exited");
    expect(slide.path).toEqual([at(0, 5), at(0, 6)]);
  });
});
