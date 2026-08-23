import { describe, expect, it } from "vitest";
import {
  abilityTargets,
  canHeroAct,
  canHeroMove,
  createGame,
  endTurn,
  itemTargets,
  moveHero,
  stepExecution,
  applyAbility,
  applyItem,
} from "./game";
import type { GameState } from "./types";
import { at, fixedRng, hero, makeGame, makeLevel, prop, robot, terrain } from "@/test/fixtures";

/** Run the whole robot phase; returns the state and all event types. */
function runRobotPhase(state: GameState, rng = fixedRng()) {
  let s = endTurn(state).state;
  const events: string[] = [];
  while (s.phase === "execution") {
    const res = stepExecution(s, rng);
    s = res.state;
    events.push(...res.frames.map((f) => f.event.type));
  }
  return { state: s, events };
}

describe("createGame", () => {
  it("sets up heroes, robots, props, and round-1 intents", () => {
    const state = makeGame({
      heroes: [hero("teddy", 0, 3), hero("bunny", -2, 4)],
      robots: [robot("stomper", 0, -4)],
      props: [prop("tower", 0, 0)],
    });
    expect(state.round).toBe(1);
    expect(state.phase).toBe("player");
    expect(state.heroes[0].hp).toBe(5);
    expect(state.heroes[1].hp).toBe(3);
    expect(state.robots[0].hp).toBe(2);
    expect(state.robots[0].intent).not.toBeNull();
    expect(state.chaos).toBe(0);
  });
});

describe("hero moves", () => {
  it("moves along a path and emits one step per hex", () => {
    const state = makeGame({ heroes: [hero("teddy", 0, 3)] });
    const res = moveHero(state, state.heroes[0].id, at(0, 1));
    expect(res.state.heroes[0].pos).toEqual(at(0, 1));
    expect(res.state.heroes[0].hasMoved).toBe(true);
    expect(res.frames.filter((f) => f.event.type === "heroStep")).toHaveLength(2);
  });

  it("rejects a second move and moving after the ability", () => {
    const state = makeGame({
      heroes: [hero("teddy", 0, 3)],
      robots: [robot("stomper", 0, 2)],
    });
    const heroId = state.heroes[0].id;
    const moved = moveHero(state, heroId, at(1, 3)).state;
    expect(() => moveHero(moved, heroId, at(0, 3))).toThrow(/already moved/);

    const acted = applyAbility(state, heroId, { kind: "robot", robotId: state.robots[0].id }).state;
    expect(() => moveHero(acted, heroId, at(1, 3))).toThrow(/before the ability/);
  });

  it("finalizes the previous hero when another one starts acting", () => {
    const state = makeGame({
      heroes: [hero("teddy", 0, 3), hero("bunny", -2, 4)],
    });
    const [teddy, bunny] = state.heroes;
    let s = moveHero(state, teddy.id, at(0, 2)).state;
    s = moveHero(s, bunny.id, at(-2, 3)).state;
    expect(s.heroes[0].doneForRound).toBe(true);
    // Teddy may not come back for its ability.
    expect(() =>
      applyAbility(s, teddy.id, { kind: "robot", robotId: "nope" }),
    ).toThrow();
  });

  it("allows move then ability on the same hero", () => {
    const state = makeGame({
      heroes: [hero("teddy", 0, 3)],
      robots: [robot("stomper", 0, 1)],
    });
    const heroId = state.heroes[0].id;
    const moved = moveHero(state, heroId, at(0, 2)).state;
    const res = applyAbility(moved, heroId, { kind: "robot", robotId: moved.robots[0].id });
    expect(res.state.heroes[0].hasActed).toBe(true);
  });

  it("rejects moves outside the player phase", () => {
    const state = makeGame({ heroes: [hero("teddy", 0, 3)] });
    const exec = endTurn(state).state;
    expect(() => moveHero(exec, exec.heroes[0].id, at(0, 2))).toThrow(/player turn/);
  });
});

describe("push", () => {
  it("shoves one hex, then forces travel up to the robot's move", () => {
    const state = makeGame({
      heroes: [hero("teddy", 0, 1)],
      robots: [robot("stomper", 0, 0)],
    });
    const res = applyAbility(state, state.heroes[0].id, {
      kind: "robot",
      robotId: state.robots[0].id,
    });
    // Away from teddy is north: shove to (0,-1), travel 2 more.
    expect(res.state.robots[0].pos).toEqual(at(0, -3));
    expect(res.state.robots[0].hp).toBe(2); // no bump
    expect(res.frames.some((f) => f.event.type === "pushShove")).toBe(true);
  });

  it("keeps the published plan (facing and steps) after the push", () => {
    const state = makeGame({
      heroes: [hero("teddy", 0, 1)],
      robots: [robot("stomper", 0, 0)],
      props: [prop("tower", 0, 5)],
    });
    const before = state.robots[0].intent;
    const res = applyAbility(state, state.heroes[0].id, {
      kind: "robot",
      robotId: state.robots[0].id,
    });
    expect(res.state.robots[0].intent).toEqual(before);
  });

  it("bumps on a blocker and stops; a blocking robot is bumped too", () => {
    const state = makeGame({
      heroes: [hero("teddy", 0, 1)],
      robots: [robot("stomper", 0, 0), robot("dasher", 0, -2)],
    });
    const res = applyAbility(state, state.heroes[0].id, {
      kind: "robot",
      robotId: state.robots[0].id,
    });
    expect(res.state.robots[0].pos).toEqual(at(0, -1));
    expect(res.state.robots[0].hp).toBe(1); // bumped
    // Dasher has 1 HP: the bump destroys it.
    expect(res.state.robots[1].removed).toBe(true);
    expect(res.frames.some((f) => f.event.type === "robotDestroyed")).toBe(true);
  });

  it("bumps without moving when the first hex away is blocked", () => {
    const state = makeGame({
      heroes: [hero("teddy", 0, 1)],
      robots: [robot("stomper", 0, 0)],
      props: [prop("blocks", 0, -1)],
    });
    const res = applyAbility(state, state.heroes[0].id, {
      kind: "robot",
      robotId: state.robots[0].id,
    });
    expect(res.state.robots[0].pos).toEqual(at(0, 0));
    expect(res.state.robots[0].hp).toBe(1);
  });

  it("pushes a robot off the board and removes it", () => {
    const state = makeGame({
      heroes: [hero("teddy", 0, -3)],
      robots: [robot("stomper", 0, -4)],
    });
    const res = applyAbility(state, state.heroes[0].id, {
      kind: "robot",
      robotId: state.robots[0].id,
    });
    expect(res.state.robots[0].removed).toBe(true);
    expect(res.frames.some((f) => f.event.type === "robotExited")).toBe(true);
    expect(res.state.lastRemovedRobotDefId).toBe("stomper");
  });

  it("a push onto marbles slides immediately in the robot's facing", () => {
    const state = makeGame({
      heroes: [hero("teddy", -1, 0)],
      robots: [robot("stomper", 0, 0)],
      terrain: [terrain("marbles", 2, 0), terrain("marbles", 3, 0)],
    });
    // Robot faces south per its own plan.
    state.robots[0].facing = 3;
    state.robots[0].intent = { facing: 3, steps: 0, attacks: true };
    const res = applyAbility(state, state.heroes[0].id, {
      kind: "robot",
      robotId: state.robots[0].id,
    });
    // Shoved SE to (1,0), travel to (2,0) then (3,0) — a marble hex —
    // then slides in its facing (south) to the first non-marble hex.
    expect(res.state.robots[0].pos).toEqual(at(3, 1));
    expect(res.frames.some((f) => f.event.type === "robotSlid")).toBe(true);
  });

  it("cannot push heavy robots or distant robots", () => {
    const state = makeGame({
      heroes: [hero("teddy", 0, 1)],
      robots: [robot("rostzahn", 0, 0), robot("stomper", 0, -3)],
    });
    expect(() =>
      applyAbility(state, state.heroes[0].id, { kind: "robot", robotId: state.robots[0].id }),
    ).toThrow(/heavy/);
    expect(() =>
      applyAbility(state, state.heroes[0].id, { kind: "robot", robotId: state.robots[1].id }),
    ).toThrow(/range/);
  });
});

describe("nudge", () => {
  it("rotates the published plan away from the bunny, steps unchanged", () => {
    const state = makeGame({
      heroes: [hero("bunny", 0, 1)],
      robots: [robot("stomper", 0, 0)],
      props: [prop("tower", -3, 3)],
    });
    const stepsBefore = state.robots[0].intent!.steps;
    const res = applyAbility(state, state.heroes[0].id, {
      kind: "robot",
      robotId: state.robots[0].id,
    });
    const r = res.state.robots[0];
    expect(r.facing).toBe(0); // away from the bunny standing south
    expect(r.intent!.facing).toBe(0);
    expect(r.intent!.steps).toBe(stepsBefore);
    expect(r.pos).toEqual(at(0, 0)); // nudge never moves
  });

  it("cannot nudge heavy robots", () => {
    const state = makeGame({
      heroes: [hero("bunny", 0, 1)],
      robots: [robot("rostzahn", 0, 0)],
    });
    expect(() =>
      applyAbility(state, state.heroes[0].id, { kind: "robot", robotId: state.robots[0].id }),
    ).toThrow(/heavy/);
  });
});

describe("shield", () => {
  it("shields a plushie within range 3, including itself", () => {
    const state = makeGame({
      heroes: [hero("unicorn", 0, 2), hero("teddy", 0, 0)],
    });
    const [unicorn, teddy] = state.heroes;
    const res = applyAbility(state, unicorn.id, { kind: "hero", heroId: teddy.id });
    expect(res.state.heroes[1].shielded).toBe(true);

    const self = applyAbility(state, unicorn.id, { kind: "hero", heroId: unicorn.id });
    expect(self.state.heroes[0].shielded).toBe(true);
  });

  it("shields a standing toppleable prop but never blocks", () => {
    const state = makeGame({
      heroes: [hero("unicorn", 0, 2)],
      props: [prop("tower", 0, 0), prop("blocks", 0, 1)],
    });
    const res = applyAbility(state, state.heroes[0].id, {
      kind: "prop",
      propId: state.props[0].id,
    });
    expect(res.state.props[0].shielded).toBe(true);
    expect(() =>
      applyAbility(state, state.heroes[0].id, { kind: "prop", propId: state.props[1].id }),
    ).toThrow(/toppleable/);
  });

  it("rejects out-of-range targets", () => {
    const state = makeGame({
      heroes: [hero("unicorn", 0, 4), hero("teddy", 0, 0)],
    });
    expect(() =>
      applyAbility(state, state.heroes[0].id, { kind: "hero", heroId: state.heroes[1].id }),
    ).toThrow(/range/);
  });

  it("a shield absorbs exactly one hit, then disappears", () => {
    const state = makeGame({
      heroes: [hero("unicorn", 0, 2), hero("teddy", 0, -1)],
      robots: [robot("stomper", 0, -3)],
    });
    // Stomper plans toward teddy (no props): walks and hits.
    const s = applyAbility(state, state.heroes[0].id, {
      kind: "hero",
      heroId: state.heroes[1].id,
    }).state;
    const { state: after, events } = runRobotPhase(s);
    expect(events).toContain("shieldBlocked");
    expect(after.heroes[1].hp).toBe(5); // undamaged
    expect(after.heroes[1].shielded).toBe(false);
  });

  it("a shield absorbs a topple attempt", () => {
    const state = makeGame({
      heroes: [hero("unicorn", 0, 2)],
      robots: [robot("stomper", 0, -2)],
      props: [prop("tower", 0, 1)],
    });
    const s = applyAbility(state, state.heroes[0].id, {
      kind: "prop",
      propId: state.props[0].id,
    }).state;
    const { state: after, events } = runRobotPhase(s);
    expect(events).toContain("shieldBlocked");
    expect(after.props[0].toppled).toBe(false);
    expect(after.chaos).toBe(0);
  });
});

describe("items", () => {
  it("the wind-up key stuns once per round and resets next round", () => {
    const state = makeGame({
      heroes: [hero("teddy", 0, 3)],
      robots: [robot("stomper", 0, -3), robot("stomper", 2, -3)],
      items: ["windup-key"],
      rounds: 5,
    });
    const s1 = applyItem(state, "windup-key", state.robots[0].id).state;
    expect(s1.windupAvailable).toBe(false);
    expect(() => applyItem(s1, "windup-key", s1.robots[1].id)).toThrow(/already used/);

    const { state: s2, events } = runRobotPhase(s1);
    expect(events).toContain("robotStunnedSkip");
    expect(s2.robots[0].pos).toEqual(at(0, -3)); // no walk
    expect(s2.windupAvailable).toBe(true); // ready again
    expect(s2.robots[0].stunned).toBe(false);
  });

  it("the cannonball deals 2 damage, once per level", () => {
    const state = makeGame({
      heroes: [hero("teddy", 0, 3)],
      robots: [robot("stomper", 0, -3), robot("stomper", 2, -3)],
      items: ["windup-key", "cannonball"],
    });
    const res = applyItem(state, "cannonball", state.robots[0].id);
    expect(res.state.robots[0].hp).toBe(0);
    expect(res.state.robots[0].removed).toBe(true);
    expect(res.frames.map((f) => f.event.type)).toContain("cannonballHit");
    expect(() => applyItem(res.state, "cannonball", res.state.robots[1].id)).toThrow(
      /already used/,
    );
  });

  it("the cannonball deals only 1 damage to Rostzahn", () => {
    const state = makeGame({
      heroes: [hero("teddy", 0, 3)],
      robots: [robot("rostzahn", 0, -3)],
      items: ["cannonball"],
    });
    const res = applyItem(state, "cannonball", state.robots[0].id);
    expect(res.state.robots[0].hp).toBe(3);
    expect(res.state.robots[0].removed).toBe(false);
  });

  it("items unavailable in the level cannot be used", () => {
    const state = makeGame({
      heroes: [hero("teddy", 0, 3)],
      robots: [robot("stomper", 0, -3)],
      items: ["windup-key"],
    });
    expect(() => applyItem(state, "cannonball", state.robots[0].id)).toThrow(/not in this level/);
  });
});

describe("robot execution", () => {
  it("robots act one at a time in array order", () => {
    const state = makeGame({
      heroes: [hero("teddy", 0, 5)],
      robots: [robot("stomper", 0, -4), robot("stomper", 2, -4)],
      props: [prop("tower", 0, 0)],
    });
    const s = endTurn(state).state;
    const first = stepExecution(s, fixedRng());
    // Only the first robot moved.
    expect(first.state.robots[0].pos).not.toEqual(at(0, -4));
    expect(first.state.robots[1].pos).toEqual(at(2, -4));
    const second = stepExecution(first.state, fixedRng());
    expect(second.state.robots[1].pos).not.toEqual(at(2, -4));
  });

  it("a stomper walks its plan and hits the hex in front", () => {
    const state = makeGame({
      heroes: [hero("teddy", 0, 0)],
      robots: [robot("stomper", 0, -3)],
    });
    // Plan: 2 steps south, then hit (0, 0) where teddy stands.
    const { state: after, events } = runRobotPhase(state);
    expect(after.robots[0].pos).toEqual(at(0, -1));
    expect(events).toContain("heroHit");
    expect(after.heroes[0].hp).toBe(4);
  });

  it("rechecks each step: a new blocker stops the walk, attack still fires", () => {
    const state = makeGame({
      heroes: [hero("teddy", 1, -3)],
      robots: [robot("stomper", 0, -4)],
      props: [prop("tower", 0, 0)],
    });
    // Plan is 2 steps south. Teddy steps into the lane.
    const s = moveHero(state, state.heroes[0].id, at(0, -3)).state;
    const { state: after } = runRobotPhase(s);
    expect(after.robots[0].pos).toEqual(at(0, -4)); // never moved
    expect(after.heroes[0].hp).toBe(4); // hit on the tile in front
  });

  it("an attack on another robot bumps it for 1", () => {
    const state = makeGame({
      heroes: [hero("teddy", 0, 5)],
      robots: [robot("stomper", 0, -1), robot("stomper", 0, 0)],
    });
    state.robots[0].intent = { facing: 3, steps: 0, attacks: true };
    state.robots[1].intent = { facing: 3, steps: 0, attacks: true };
    const s = endTurn(state).state;
    const res = stepExecution(s, fixedRng());
    expect(res.state.robots[1].hp).toBe(1);
    expect(res.frames.map((f) => f.event.type)).toContain("robotBumped");
  });

  it("toppling a prop raises chaos", () => {
    const state = makeGame({
      heroes: [hero("teddy", 0, 5)],
      robots: [robot("stomper", 0, -2)],
      props: [prop("tower", 0, 0)],
      maxChaos: 3,
    });
    const { state: after, events } = runRobotPhase(state);
    expect(events).toContain("towerToppled");
    expect(after.chaos).toBe(1);
    expect(after.props[0].toppled).toBe(true);
  });

  it("blocks are hit but stay standing", () => {
    const state = makeGame({
      heroes: [hero("teddy", 0, 5)],
      robots: [robot("stomper", 0, -1)],
      props: [prop("blocks", 0, 0)],
    });
    state.robots[0].intent = { facing: 3, steps: 0, attacks: true };
    const { state: after, events } = runRobotPhase(state);
    expect(events).toContain("blocksHit");
    expect(after.chaos).toBe(0);
    expect(after.props[0].toppled).toBe(false);
  });

  it("the kipplaster hits the flanks; straight ahead is safe", () => {
    const state = makeGame({
      heroes: [hero("teddy", 0, 1), hero("bunny", 1, 0)],
      robots: [robot("kipplaster", 0, 0)],
    });
    state.robots[0].facing = 3;
    state.robots[0].intent = { facing: 3, steps: 0, attacks: true };
    const { state: after } = runRobotPhase(state);
    expect(after.heroes[0].hp).toBe(5); // in front: safe
    expect(after.heroes[1].hp).toBe(2); // on the flank: hit
  });

  it("the bomber blasts all six neighbors and is always removed", () => {
    const state = makeGame({
      heroes: [hero("teddy", 0, 1), hero("bunny", -3, 4)],
      robots: [robot("bomber", 0, 0)],
      props: [prop("tower", 1, -1)],
      maxChaos: 3,
    });
    state.robots[0].intent = { facing: 3, steps: 0, attacks: true };
    const { state: after, events } = runRobotPhase(state);
    expect(events).toContain("robotExploded");
    expect(after.robots[0].removed).toBe(true);
    expect(after.heroes[0].hp).toBe(4);
    expect(after.props[0].toppled).toBe(true);
  });

  it("the bomber explodes even when every neighbor is empty", () => {
    const state = makeGame({
      heroes: [hero("teddy", 0, 5)],
      robots: [robot("bomber", 0, -4)],
    });
    state.robots[0].intent = { facing: 3, steps: 0, attacks: true };
    const { state: after, events } = runRobotPhase(state);
    expect(events).toContain("robotExploded");
    expect(after.robots[0].removed).toBe(true);
  });

  it("a wound-up bomber does not blast", () => {
    const state = makeGame({
      heroes: [hero("teddy", 0, 1)],
      robots: [robot("bomber", 0, 0)],
      items: ["windup-key"],
    });
    state.robots[0].intent = { facing: 3, steps: 0, attacks: true };
    const s = applyItem(state, "windup-key", state.robots[0].id).state;
    const { state: after, events } = runRobotPhase(s);
    expect(events).not.toContain("robotExploded");
    expect(after.robots[0].removed).toBe(false);
    expect(after.heroes[0].hp).toBe(5);
  });

  it("rostzahn deals 2 damage", () => {
    const state = makeGame({
      heroes: [hero("teddy", 0, 0)],
      robots: [robot("rostzahn", 0, -2)],
    });
    const { state: after } = runRobotPhase(state);
    expect(after.heroes[0].hp).toBe(3);
  });

  it("a robot sliding off the board is removed", () => {
    const state = makeGame({
      heroes: [hero("teddy", -3, 5)],
      robots: [robot("stomper", 0, 2)],
      terrain: [terrain("marbles", 0, 4), terrain("marbles", 0, 5)],
    });
    state.robots[0].facing = 3;
    state.robots[0].intent = { facing: 3, steps: 2, attacks: true };
    const { state: after, events } = runRobotPhase(state);
    expect(events).toContain("robotExited");
    expect(after.robots[0].removed).toBe(true);
  });
});

describe("round close", () => {
  it("creates due spawns at round close", () => {
    const state = makeGame({
      heroes: [hero("teddy", 0, 3)],
      robots: [robot("stomper", -2, -3)],
      props: [prop("tower", 0, 0)],
      spawns: [{ afterRound: 1, defId: "dasher", pos: at(0, -5) }],
      rounds: 5,
    });
    const { state: after, events } = runRobotPhase(state);
    expect(events).toContain("robotSpawned");
    expect(after.robots).toHaveLength(2);
    expect(after.robots[1].defId).toBe("dasher");
    expect(after.robots[1].intent).not.toBeNull(); // planned for the new round
    expect(after.round).toBe(2);
  });

  it("delays a blocked spawn by one round", () => {
    const state = makeGame({
      heroes: [hero("teddy", 0, 3)],
      robots: [robot("stomper", -2, -3)],
      props: [prop("tower", 0, 0), prop("blocks", 0, -5)],
      spawns: [{ afterRound: 1, defId: "dasher", pos: at(0, -5) }],
      rounds: 5,
    });
    const { state: after } = runRobotPhase(state);
    expect(after.robots).toHaveLength(1);
    expect(after.pendingSpawns).toEqual([{ afterRound: 2, defId: "dasher", pos: at(0, -5) }]);
  });

  it("resets actions, shields, stuns, and the wind-up key", () => {
    const state = makeGame({
      heroes: [hero("teddy", 0, 3), hero("unicorn", 2, 2)],
      robots: [robot("stomper", -2, -3)],
      props: [prop("tower", 0, 0)],
      items: ["windup-key"],
      rounds: 5,
    });
    let s = moveHero(state, state.heroes[0].id, at(0, 2)).state;
    s = applyAbility(s, s.heroes[1].id, { kind: "hero", heroId: s.heroes[1].id }).state;
    s = applyItem(s, "windup-key", s.robots[0].id).state;
    const { state: after } = runRobotPhase(s);
    expect(after.round).toBe(2);
    const h = after.heroes[0];
    expect(h.hasMoved).toBe(false);
    expect(h.doneForRound).toBe(false);
    expect(after.heroes[1].hasActed).toBe(false);
    expect(after.heroes[1].shielded).toBe(false);
    expect(after.robots[0].stunned).toBe(false);
    expect(after.windupAvailable).toBe(true);
  });

  it("wins after holding the configured number of rounds", () => {
    const state = makeGame({ heroes: [hero("teddy", 0, 3)], rounds: 2 });
    const r1 = runRobotPhase(state);
    expect(r1.state.phase).toBe("player");
    const r2 = runRobotPhase(r1.state);
    expect(r2.state.phase).toBe("result");
    expect(r2.state.result?.outcome).toBe("win");
    expect(r2.events).toContain("levelEnded");
  });

  it("loses when chaos reaches maxChaos — even on the last round", () => {
    const state = makeGame({
      heroes: [hero("teddy", 0, 5)],
      robots: [robot("stomper", 0, -2)],
      props: [prop("tower", 0, 0)],
      maxChaos: 1,
      rounds: 1, // lose first beats the win check
    });
    const { state: after } = runRobotPhase(state);
    expect(after.result?.outcome).toBe("loseChaos");
  });

  it("loses when every plushie is exhausted", () => {
    const state = makeGame({
      heroes: [hero("teddy", 0, 0)],
      robots: [robot("stomper", 0, -2)],
      rounds: 5,
    });
    state.heroes[0].hp = 1;
    const { state: after, events } = runRobotPhase(state);
    expect(events).toContain("heroDown");
    expect(after.result?.outcome).toBe("loseWipe");
  });

  it("picks a hero speaker on win and a surviving robot on loss", () => {
    const win = runRobotPhase(makeGame({ heroes: [hero("teddy", 0, 3)], rounds: 1 }));
    expect(win.state.result?.speakerDefId).toBe("teddy");

    const lose = runRobotPhase(
      (() => {
        // Teddy stands on the kipplaster's flank tile and goes down.
        const s = makeGame({
          heroes: [hero("teddy", 1, -1)],
          robots: [robot("kipplaster", 0, -2)],
          rounds: 5,
        });
        s.heroes[0].hp = 1;
        return s;
      })(),
    );
    expect(lose.state.result?.speakerDefId).toBe("kipplaster");
  });

  it("falls back to the last removed robot when none is left", () => {
    const state = makeGame({
      heroes: [hero("teddy", 0, 1)],
      robots: [robot("bomber", 0, 0)],
      rounds: 5,
    });
    state.heroes[0].hp = 1;
    state.robots[0].intent = { facing: 3, steps: 0, attacks: true };
    const { state: after } = runRobotPhase(state);
    expect(after.result?.outcome).toBe("loseWipe");
    expect(after.result?.speakerDefId).toBe("bomber");
  });
});

describe("UI validation helpers", () => {
  it("reports move and act availability", () => {
    const state = makeGame({
      heroes: [hero("teddy", 0, 3)],
      robots: [robot("stomper", 0, 2)],
    });
    const heroId = state.heroes[0].id;
    expect(canHeroMove(state, heroId)).toBe(true);
    expect(canHeroAct(state, heroId)).toBe(true);
    const moved = moveHero(state, heroId, at(1, 2)).state;
    expect(canHeroMove(moved, heroId)).toBe(false);
  });

  it("lists ability and item targets", () => {
    const state = makeGame({
      heroes: [hero("teddy", 0, 3), hero("unicorn", 0, 4)],
      robots: [robot("stomper", 0, 2), robot("rostzahn", 1, 2)],
      props: [prop("tower", 0, 5), prop("blocks", 1, 4)],
      items: ["windup-key", "cannonball"],
    });
    const teddyTargets = abilityTargets(state, state.heroes[0].id);
    expect(teddyTargets).toEqual([{ kind: "robot", robotId: state.robots[0].id }]);

    const unicornTargets = abilityTargets(state, state.heroes[1].id);
    expect(unicornTargets).toContainEqual({ kind: "hero", heroId: state.heroes[0].id });
    expect(unicornTargets).toContainEqual({ kind: "prop", propId: state.props[0].id });
    expect(unicornTargets).not.toContainEqual({ kind: "prop", propId: state.props[1].id });

    expect(itemTargets(state, "windup-key")).toHaveLength(2);
    const used = applyItem(state, "cannonball", state.robots[0].id).state;
    expect(itemTargets(used, "cannonball")).toEqual([]);
  });
});

describe("full level definitions", () => {
  it("a passive player eventually loses every level to chaos", () => {
    // Sanity: robots topple things when nobody interferes.
    const state = createGame(
      makeLevel({
        heroes: [hero("teddy", -4, 5)],
        robots: [robot("stomper", 0, -3)],
        props: [prop("tower", 0, 0)],
        maxChaos: 1,
        rounds: 20,
      }),
    );
    let s = state;
    for (let round = 0; round < 20 && s.phase === "player"; round++) {
      s = runRobotPhase(s).state;
    }
    expect(s.phase).toBe("result");
    expect(s.result?.outcome).toBe("loseChaos");
  });
});
