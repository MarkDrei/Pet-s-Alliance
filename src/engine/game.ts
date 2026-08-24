import type { Axial, Dir } from "./hex";
import {
  directionBetween,
  hexDistance,
  hexKey,
  inBoard,
  neighbor,
} from "./hex";
import { isSpawnBlocked, occupantAt } from "./board";
import {
  BUMP_DAMAGE,
  CANNONBALL_DAMAGE,
  CANNONBALL_DAMAGE_HEAVY,
  HERO_DEFS,
  isToppleable,
  ROBOT_DEFS,
} from "./defs";
import { heroPathTo, heroMoveTargets } from "./movement";
import { attackTiles, planAllRobots } from "./planning";
import type {
  ActionResult,
  Frame,
  GameEvent,
  GameState,
  HeroState,
  ItemId,
  LevelDef,
  Outcome,
  PropState,
  RobotDefId,
  RobotState,
} from "./types";

export type Rng = () => number;

const defaultRng: Rng = Math.random;

function clone<T>(value: T): T {
  return structuredClone(value);
}

/** Mutable working copy plus the frame log for animation playback. */
interface Ctx {
  state: GameState;
  frames: Frame[];
}

function record(ctx: Ctx, event: GameEvent): void {
  ctx.frames.push({ event, state: clone(ctx.state) });
}

function result(ctx: Ctx): ActionResult {
  return { state: ctx.state, frames: ctx.frames };
}

function openCtx(state: GameState): Ctx {
  return { state: clone(state), frames: [] };
}

// ---------------------------------------------------------------------------
// Game creation
// ---------------------------------------------------------------------------

export function createGame(level: LevelDef): GameState {
  const heroes: HeroState[] = level.heroes.map((h, i) => ({
    id: `hero-${h.defId}-${i}`,
    defId: h.defId,
    pos: h.pos,
    hp: HERO_DEFS[h.defId].hp,
    maxHp: HERO_DEFS[h.defId].hp,
    shielded: false,
    hasMoved: false,
    hasActed: false,
    down: false,
    doneForRound: false,
  }));
  const robots: RobotState[] = level.robots.map((r, i) => ({
    id: `robot-${r.defId}-${i}`,
    defId: r.defId,
    pos: r.pos,
    hp: ROBOT_DEFS[r.defId].hp,
    maxHp: ROBOT_DEFS[r.defId].hp,
    facing: r.facing ?? 3,
    intent: null,
    stunned: false,
    removed: false,
  }));
  const props: PropState[] = level.props.map((p, i) => ({
    id: `prop-${p.defId}-${i}`,
    defId: p.defId,
    pos: p.pos,
    toppled: false,
    shielded: false,
  }));
  const terrain: Record<string, "marbles" | "cushion"> = {};
  for (const t of level.terrain) terrain[hexKey(t.pos)] = t.kind;

  const state: GameState = {
    levelId: level.id,
    floor: level.floor,
    round: 1,
    totalRounds: level.rounds,
    phase: "player",
    heroes,
    robots,
    props,
    terrain,
    chaos: 0,
    maxChaos: level.maxChaos,
    pendingSpawns: clone(level.spawns),
    spawnCounter: level.robots.length,
    items: [...level.items],
    windupAvailable: level.items.includes("windup-key"),
    cannonballUsed: false,
    activeHeroId: null,
    executionIndex: 0,
    lastRemovedRobotDefId: null,
    result: null,
  };
  return planAllRobots(state);
}

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

function getHero(state: GameState, heroId: string): HeroState {
  const hero = state.heroes.find((h) => h.id === heroId);
  if (!hero) throw new Error(`unknown hero ${heroId}`);
  return hero;
}

function getRobot(state: GameState, robotId: string): RobotState {
  const robot = state.robots.find((r) => r.id === robotId);
  if (!robot) throw new Error(`unknown robot ${robotId}`);
  return robot;
}

function assertPlayerPhase(state: GameState): void {
  if (state.phase !== "player") throw new Error("not the player turn");
}

/**
 * A hero may not be returned to once the player has activated another
 * one: starting an action finalizes the previously active hero.
 */
function activateHero(ctx: Ctx, heroId: string): void {
  const prev = ctx.state.activeHeroId;
  if (prev && prev !== heroId) {
    const prevHero = ctx.state.heroes.find((h) => h.id === prev);
    if (prevHero) prevHero.doneForRound = true;
  }
  ctx.state.activeHeroId = heroId;
}

// ---------------------------------------------------------------------------
// Damage and shared physics
// ---------------------------------------------------------------------------

function removeRobot(ctx: Ctx, robot: RobotState): void {
  robot.removed = true;
  ctx.state.lastRemovedRobotDefId = robot.defId;
}

/** Bump: 1 damage to a robot; destroys it at 0 HP. */
function bumpRobot(ctx: Ctx, robot: RobotState): void {
  if (robot.removed) return;
  robot.hp = Math.max(0, robot.hp - BUMP_DAMAGE);
  record(ctx, { type: "robotBumped", robotId: robot.id });
  if (robot.hp === 0) {
    removeRobot(ctx, robot);
    record(ctx, { type: "robotDestroyed", robotId: robot.id });
  }
}

function damageHero(ctx: Ctx, robot: RobotState, hero: HeroState, damage: number): void {
  if (hero.shielded) {
    hero.shielded = false;
    record(ctx, { type: "shieldBlocked", heroId: hero.id });
    return;
  }
  hero.hp = Math.max(0, hero.hp - damage);
  record(ctx, { type: "heroHit", robotId: robot.id, heroId: hero.id, damage });
  if (hero.hp === 0) {
    hero.down = true;
    record(ctx, { type: "heroDown", heroId: hero.id });
  }
}

function toppleProp(ctx: Ctx, robot: RobotState, prop: PropState): void {
  if (prop.shielded) {
    prop.shielded = false;
    record(ctx, { type: "shieldBlocked", propId: prop.id });
    return;
  }
  prop.toppled = true;
  ctx.state.chaos += 1;
  record(ctx, { type: "towerToppled", robotId: robot.id, propId: prop.id });
}

/**
 * Slide a robot standing on marbles along `dir` until the first
 * non-marble hex. Blocked exit bumps (blocker robots bump too);
 * running off the board removes the robot.
 */
function slideOnMarbles(ctx: Ctx, robot: RobotState, dir: Dir): void {
  for (;;) {
    if (ctx.state.terrain[hexKey(robot.pos)] !== "marbles") return;
    const next = neighbor(robot.pos, dir);
    if (!inBoard(next)) {
      record(ctx, { type: "robotSlid", robotId: robot.id, from: robot.pos, to: next });
      removeRobot(ctx, robot);
      record(ctx, { type: "robotExited", robotId: robot.id });
      return;
    }
    const occ = occupantAt(ctx.state, next);
    const cushion = ctx.state.terrain[hexKey(next)] === "cushion";
    if (occ || cushion) {
      bumpRobot(ctx, robot);
      if (occ?.kind === "robot") bumpRobot(ctx, occ.robot);
      return;
    }
    const from = robot.pos;
    robot.pos = next;
    record(ctx, { type: "robotSlid", robotId: robot.id, from, to: next });
  }
}

// ---------------------------------------------------------------------------
// Player actions
// ---------------------------------------------------------------------------

export function moveHero(
  state: GameState,
  heroId: string,
  dest: Axial,
): ActionResult {
  assertPlayerPhase(state);
  const hero = getHero(state, heroId);
  if (hero.down) throw new Error("hero is exhausted");
  if (hero.doneForRound) throw new Error("hero is done for this round");
  if (hero.hasMoved) throw new Error("hero already moved");
  if (hero.hasActed) throw new Error("move must come before the ability");
  const path = heroPathTo(state, hero, dest);
  if (!path) throw new Error("destination not reachable");

  const ctx = openCtx(state);
  activateHero(ctx, heroId);
  const h = getHero(ctx.state, heroId);
  const jump = HERO_DEFS[h.defId].jumper;
  for (const tile of path) {
    const from = h.pos;
    h.pos = tile;
    record(ctx, { type: "heroStep", heroId, from, to: tile, jump });
  }
  h.hasMoved = true;
  return result(ctx);
}

export type AbilityTarget =
  | { kind: "robot"; robotId: string }
  | { kind: "hero"; heroId: string }
  | { kind: "prop"; propId: string };

export function applyAbility(
  state: GameState,
  heroId: string,
  target: AbilityTarget,
): ActionResult {
  assertPlayerPhase(state);
  const hero = getHero(state, heroId);
  if (hero.down) throw new Error("hero is exhausted");
  if (hero.doneForRound) throw new Error("hero is done for this round");
  if (hero.hasActed) throw new Error("ability already used");
  const def = HERO_DEFS[hero.defId];

  const ctx = openCtx(state);
  activateHero(ctx, heroId);
  const h = getHero(ctx.state, heroId);

  switch (def.ability) {
    case "push": {
      if (target.kind !== "robot") throw new Error("push targets a robot");
      const robot = getRobot(ctx.state, target.robotId);
      validatePushOrNudgeTarget(h, robot, def.abilityRange);
      pushRobot(ctx, h, robot);
      break;
    }
    case "nudge": {
      if (target.kind !== "robot") throw new Error("nudge targets a robot");
      const robot = getRobot(ctx.state, target.robotId);
      validatePushOrNudgeTarget(h, robot, def.abilityRange);
      const dir = directionBetween(h.pos, robot.pos);
      if (dir === null) throw new Error("robot not adjacent");
      robot.facing = dir;
      if (robot.intent) robot.intent.facing = dir;
      record(ctx, { type: "nudgeTurned", robotId: robot.id, facing: dir });
      break;
    }
    case "shield": {
      if (target.kind === "hero") {
        const t = getHero(ctx.state, target.heroId);
        if (t.down) throw new Error("cannot shield an exhausted plushie");
        if (hexDistance(h.pos, t.pos) > def.abilityRange) throw new Error("out of range");
        t.shielded = true;
        record(ctx, { type: "shieldCast", casterId: h.id, targetId: t.id });
      } else if (target.kind === "prop") {
        const t = ctx.state.props.find((p) => p.id === target.propId);
        if (!t) throw new Error(`unknown prop ${target.propId}`);
        if (t.toppled || !isToppleable(t.defId)) {
          throw new Error("only standing toppleable props can be shielded");
        }
        if (hexDistance(h.pos, t.pos) > def.abilityRange) throw new Error("out of range");
        t.shielded = true;
        record(ctx, { type: "shieldCast", casterId: h.id, targetId: t.id });
      } else {
        throw new Error("shield targets a plushie or a toppleable prop");
      }
      break;
    }
  }

  h.hasActed = true;
  return result(ctx);
}

function validatePushOrNudgeTarget(hero: HeroState, robot: RobotState, range: number): void {
  if (robot.removed) throw new Error("robot is gone");
  if (ROBOT_DEFS[robot.defId].heavy) throw new Error("robot is too heavy");
  if (hexDistance(hero.pos, robot.pos) > range) throw new Error("out of range");
}

/**
 * Push: shove one hex away from the pusher, then forced travel in the
 * same direction up to the robot's Move value, or until a blocker or the
 * board edge (bump), then any marble slide. The published plan survives.
 */
function pushRobot(ctx: Ctx, hero: HeroState, robot: RobotState): void {
  const dir = directionBetween(hero.pos, robot.pos);
  if (dir === null) throw new Error("robot not adjacent");

  const shoveTo = neighbor(robot.pos, dir);
  const shoveBlocked =
    !inBoard(shoveTo) ||
    occupantAt(ctx.state, shoveTo) !== null ||
    ctx.state.terrain[hexKey(shoveTo)] === "cushion";
  if (shoveBlocked) {
    // The robot does not move; that is still a bump.
    bumpRobot(ctx, robot);
    const occ = inBoard(shoveTo) ? occupantAt(ctx.state, shoveTo) : null;
    if (occ?.kind === "robot") bumpRobot(ctx, occ.robot);
    return;
  }

  const from = robot.pos;
  robot.pos = shoveTo;
  record(ctx, { type: "pushShove", robotId: robot.id, from, to: shoveTo });

  let budget = ROBOT_DEFS[robot.defId].move;
  while (budget > 0 && !robot.removed) {
    const next = neighbor(robot.pos, dir);
    if (!inBoard(next)) {
      record(ctx, { type: "robotSlid", robotId: robot.id, from: robot.pos, to: next });
      removeRobot(ctx, robot);
      record(ctx, { type: "robotExited", robotId: robot.id });
      return;
    }
    const occ = occupantAt(ctx.state, next);
    const cushion = ctx.state.terrain[hexKey(next)] === "cushion";
    if (occ || cushion) {
      bumpRobot(ctx, robot);
      if (occ?.kind === "robot") bumpRobot(ctx, occ.robot);
      break;
    }
    const step = robot.pos;
    robot.pos = next;
    record(ctx, { type: "robotSlid", robotId: robot.id, from: step, to: next });
    budget -= 1;
  }

  // Landing on marbles slides immediately, in the robot's current facing.
  if (!robot.removed) slideOnMarbles(ctx, robot, robot.facing);
}

export function applyItem(state: GameState, itemId: ItemId, robotId: string): ActionResult {
  assertPlayerPhase(state);
  if (!state.items.includes(itemId)) throw new Error(`item ${itemId} not in this level`);
  const ctx = openCtx(state);
  const robot = getRobot(ctx.state, robotId);
  if (robot.removed) throw new Error("robot is gone");

  if (itemId === "windup-key") {
    if (!ctx.state.windupAvailable) throw new Error("wind-up key already used this round");
    if (robot.stunned) throw new Error("robot is already wound up");
    ctx.state.windupAvailable = false;
    robot.stunned = true;
    record(ctx, { type: "windupApplied", robotId: robot.id });
  } else {
    if (ctx.state.cannonballUsed) throw new Error("cannonball already used");
    ctx.state.cannonballUsed = true;
    const damage = ROBOT_DEFS[robot.defId].heavy
      ? CANNONBALL_DAMAGE_HEAVY
      : CANNONBALL_DAMAGE;
    robot.hp = Math.max(0, robot.hp - damage);
    record(ctx, { type: "cannonballHit", robotId: robot.id });
    if (robot.hp === 0) {
      removeRobot(ctx, robot);
      record(ctx, { type: "robotDestroyed", robotId: robot.id });
    }
  }
  return result(ctx);
}

export function endTurn(state: GameState): ActionResult {
  assertPlayerPhase(state);
  const ctx = openCtx(state);
  ctx.state.phase = "execution";
  ctx.state.executionIndex = 0;
  ctx.state.activeHeroId = null;
  record(ctx, { type: "turnEnded" });
  return result(ctx);
}

// ---------------------------------------------------------------------------
// Robot execution
// ---------------------------------------------------------------------------

/**
 * Execute the next robot in array order (or close the round when every
 * robot has acted). The UI calls this repeatedly, playing the returned
 * frames as animations between calls.
 */
export function stepExecution(state: GameState, rng: Rng = defaultRng): ActionResult {
  if (state.phase !== "execution") throw new Error("not the robot phase");
  const ctx = openCtx(state);

  while (ctx.state.executionIndex < ctx.state.robots.length) {
    const robot = ctx.state.robots[ctx.state.executionIndex];
    ctx.state.executionIndex += 1;
    if (robot.removed) continue;
    executeRobot(ctx, robot);
    return result(ctx);
  }

  closeRound(ctx, rng);
  return result(ctx);
}

function executeRobot(ctx: Ctx, robot: RobotState): void {
  const def = ROBOT_DEFS[robot.defId];
  const intent = robot.intent;

  if (robot.stunned) {
    record(ctx, { type: "robotStunnedSkip", robotId: robot.id });
    return;
  }
  record(ctx, { type: "robotActs", robotId: robot.id });
  if (!intent) return;

  // Walk: every planned step is rechecked; a blocked step discards the rest.
  for (let i = 0; i < intent.steps; i++) {
    const next = neighbor(robot.pos, intent.facing);
    if (!inBoard(next)) break;
    if (occupantAt(ctx.state, next) || ctx.state.terrain[hexKey(next)] === "cushion") break;
    const from = robot.pos;
    robot.pos = next;
    record(ctx, { type: "robotStep", robotId: robot.id, from, to: next });
  }

  // Marble slide after the planned steps, in the current facing.
  slideOnMarbles(ctx, robot, intent.facing);
  if (robot.removed) return;

  if (!intent.attacks) return;
  const tiles = attackTiles(robot.pos, intent.facing, def.shape);
  record(ctx, { type: "robotAttacked", robotId: robot.id, tiles, shape: def.shape });
  for (const tile of tiles) {
    resolveHit(ctx, robot, tile, def.damage);
  }

  if (def.explodes && !robot.removed) {
    removeRobot(ctx, robot);
    record(ctx, { type: "robotExploded", robotId: robot.id });
  }
}

/** Resolve one attacked tile against whatever now stands there. */
function resolveHit(ctx: Ctx, attacker: RobotState, tile: Axial, damage: number): void {
  if (!inBoard(tile)) return;
  const occ = occupantAt(ctx.state, tile);
  if (!occ) return;
  switch (occ.kind) {
    case "hero":
      damageHero(ctx, attacker, occ.hero, damage);
      break;
    case "robot":
      if (occ.robot.id !== attacker.id) bumpRobot(ctx, occ.robot);
      break;
    case "prop":
      if (isToppleable(occ.prop.defId) && !occ.prop.toppled) {
        toppleProp(ctx, attacker, occ.prop);
      } else {
        record(ctx, { type: "blocksHit", propId: occ.prop.id });
      }
      break;
  }
}

// ---------------------------------------------------------------------------
// Round close
// ---------------------------------------------------------------------------

function closeRound(ctx: Ctx, rng: Rng): void {
  const s = ctx.state;

  // 1. Due spawns (blocked spawns are delayed by one round).
  const remaining: typeof s.pendingSpawns = [];
  for (const spawn of s.pendingSpawns) {
    if (spawn.afterRound > s.round) {
      remaining.push(spawn);
      continue;
    }
    if (isSpawnBlocked(s, spawn.pos)) {
      remaining.push({ ...spawn, afterRound: s.round + 1 });
      continue;
    }
    const robot: RobotState = {
      id: `robot-${spawn.defId}-${s.spawnCounter}`,
      defId: spawn.defId,
      pos: spawn.pos,
      hp: ROBOT_DEFS[spawn.defId].hp,
      maxHp: ROBOT_DEFS[spawn.defId].hp,
      facing: spawn.facing ?? 3,
      intent: null,
      stunned: false,
      removed: false,
    };
    s.spawnCounter += 1;
    s.robots.push(robot);
    record(ctx, { type: "robotSpawned", robotId: robot.id });
  }
  s.pendingSpawns = remaining;

  // 2. Lose checks first — including on the last round.
  const allDown = s.heroes.every((h) => h.down);
  let outcome: Outcome | null = null;
  if (allDown) outcome = "loseWipe";
  else if (s.chaos >= s.maxChaos) outcome = "loseChaos";
  else if (s.round >= s.totalRounds) outcome = "win";

  if (outcome) {
    s.phase = "result";
    s.result = { outcome, speakerDefId: pickSpeaker(s, outcome, rng) };
    record(ctx, { type: "levelEnded", outcome });
    return;
  }

  // 3. Next round: reset hero actions, leftover shields, stuns and the key.
  for (const h of s.heroes) {
    h.shielded = false;
    h.hasMoved = false;
    h.hasActed = false;
    h.doneForRound = false;
  }
  for (const p of s.props) p.shielded = false;
  for (const r of s.robots) r.stunned = false;
  s.windupAvailable = s.items.includes("windup-key");
  s.round += 1;
  s.phase = "player";
  s.activeHeroId = null;
  s.executionIndex = 0;
  ctx.state = planAllRobots(s);
  record(ctx, { type: "roundStarted", round: ctx.state.round });
}

function pickSpeaker(
  s: GameState,
  outcome: Outcome,
  rng: Rng,
): GameState["heroes"][number]["defId"] | RobotDefId {
  if (outcome === "win") {
    // Any plushie from the roster, including exhausted ones.
    const pick = s.heroes[Math.floor(rng() * s.heroes.length)];
    return pick.defId;
  }
  const alive = s.robots.filter((r) => !r.removed);
  if (alive.length > 0) return alive[Math.floor(rng() * alive.length)].defId;
  return s.lastRemovedRobotDefId ?? "stomper";
}

// ---------------------------------------------------------------------------
// UI helpers (validation without mutation)
// ---------------------------------------------------------------------------

export function canHeroMove(state: GameState, heroId: string): boolean {
  const hero = state.heroes.find((h) => h.id === heroId);
  if (!hero || state.phase !== "player") return false;
  if (hero.down || hero.doneForRound || hero.hasMoved || hero.hasActed) return false;
  return heroMoveTargets(state, hero).length > 0;
}

export function canHeroAct(state: GameState, heroId: string): boolean {
  const hero = state.heroes.find((h) => h.id === heroId);
  if (!hero || state.phase !== "player") return false;
  if (hero.down || hero.doneForRound || hero.hasActed) return false;
  return abilityTargets(state, heroId).length > 0;
}

/** Every legal ability target for the hero, for the UI target picker. */
export function abilityTargets(state: GameState, heroId: string): AbilityTarget[] {
  const hero = state.heroes.find((h) => h.id === heroId);
  if (!hero || hero.down) return [];
  const def = HERO_DEFS[hero.defId];
  const targets: AbilityTarget[] = [];
  if (def.ability === "push" || def.ability === "nudge") {
    for (const r of state.robots) {
      if (r.removed || ROBOT_DEFS[r.defId].heavy) continue;
      if (hexDistance(hero.pos, r.pos) <= def.abilityRange) {
        targets.push({ kind: "robot", robotId: r.id });
      }
    }
  } else {
    for (const h of state.heroes) {
      if (h.down) continue;
      if (hexDistance(hero.pos, h.pos) <= def.abilityRange) {
        targets.push({ kind: "hero", heroId: h.id });
      }
    }
    for (const p of state.props) {
      if (p.toppled || !isToppleable(p.defId)) continue;
      if (hexDistance(hero.pos, p.pos) <= def.abilityRange) {
        targets.push({ kind: "prop", propId: p.id });
      }
    }
  }
  return targets;
}

export function itemTargets(state: GameState, itemId: ItemId): string[] {
  if (!state.items.includes(itemId)) return [];
  if (itemId === "windup-key" && !state.windupAvailable) return [];
  if (itemId === "cannonball" && state.cannonballUsed) return [];
  return state.robots
    .filter((r) => !r.removed && !(itemId === "windup-key" && r.stunned))
    .map((r) => r.id);
}
