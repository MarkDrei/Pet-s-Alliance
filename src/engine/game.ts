import { adjacentRobotTargets, nudgeRobot, pushRobot, shieldTargets } from "./abilities";
import { vecEquals } from "./grid";
import { heroAt, isTileBlocked, reachableTiles, robotAt, standingPropAt } from "./movement";
import { computeAllIntents, executeRobot } from "./robots";
import type { Content, GameState, LevelDef, Vec } from "./types";

export function createGame(content: Content, level: LevelDef): GameState {
  const state: GameState = {
    levelId: level.id,
    gridSize: level.gridSize,
    round: 1,
    roundsToSurvive: level.roundsToSurvive,
    maxChaos: level.maxChaos,
    phase: "playerTurn",
    heroes: level.heroStarts.map((start, i) => ({
      id: `hero-${start.defId}-${i}`,
      defId: start.defId,
      pos: start.pos,
      hp: content.heroes[start.defId].maxHp,
      hasMoved: false,
      hasActed: false,
      shielded: false,
    })),
    robots: [],
    props: level.props.map((p, i) => ({
      id: `prop-${p.defId}-${i}`,
      defId: p.defId,
      pos: p.pos,
      toppled: false,
      shielded: false,
    })),
    items: level.items.map((defId) => ({ defId, used: false })),
    pendingSpawns: [...level.spawns],
    pendingRobotIds: [],
    events: [],
    nextUnitId: 0,
  };

  for (const start of level.robotStarts) {
    state.robots.push({
      id: `robot-${start.defId}-${state.nextUnitId++}`,
      defId: start.defId,
      pos: start.pos,
      hp: content.robots[start.defId].maxHp,
      facing: start.facing,
      stunned: false,
      confused: false,
      intent: null,
    });
  }

  computeAllIntents(content, state);
  return state;
}

function clone(state: GameState): GameState {
  return structuredClone(state);
}

export function moveHero(
  content: Content,
  state: GameState,
  heroId: string,
  dest: Vec,
): GameState {
  if (state.phase !== "playerTurn") return state;
  const hero = state.heroes.find((h) => h.id === heroId);
  if (!hero || hero.hp <= 0 || hero.hasMoved) return state;
  const reachable = reachableTiles(content, state, hero);
  if (!reachable.some((t) => vecEquals(t, dest))) return state;

  const next = clone(state);
  const nextHero = next.heroes.find((h) => h.id === heroId)!;
  nextHero.pos = dest;
  nextHero.hasMoved = true;
  // Positions changed, so previews must stay honest.
  computeAllIntents(content, next);
  return next;
}

/**
 * Uses the hero's ability on the tile `target`. The ability type comes from
 * the hero definition; the target tile is resolved to a robot or hero.
 */
export function applyAbility(
  content: Content,
  state: GameState,
  heroId: string,
  target: Vec,
): GameState {
  if (state.phase !== "playerTurn") return state;
  const hero = state.heroes.find((h) => h.id === heroId);
  if (!hero || hero.hp <= 0 || hero.hasActed) return state;

  const valid = abilityTargets(content, state, heroId).some((t) => vecEquals(t, target));
  if (!valid) return state;

  const next = clone(state);
  const nextHero = next.heroes.find((h) => h.id === heroId)!;
  const ability = content.heroes[hero.defId].ability.id;

  if (ability === "push") {
    const robot = robotAt(next, target);
    if (!robot) return state;
    pushRobot(content, next, nextHero, robot);
  } else if (ability === "nudge") {
    const robot = robotAt(next, target);
    if (!robot) return state;
    nudgeRobot(content, next, nextHero, robot);
  } else {
    const ally = heroAt(next, target);
    if (ally) {
      ally.shielded = true;
    } else {
      const prop = standingPropAt(next, target);
      if (!prop || !content.props[prop.defId].toppleable) return state;
      prop.shielded = true;
    }
  }

  nextHero.hasActed = true;
  return next;
}

/** Valid target tiles for the hero's ability, for validation and UI highlights. */
export function abilityTargets(content: Content, state: GameState, heroId: string): Vec[] {
  const hero = state.heroes.find((h) => h.id === heroId);
  if (!hero || hero.hp <= 0 || hero.hasActed) return [];
  const ability = content.heroes[hero.defId].ability.id;
  if (ability === "shield") return shieldTargets(content, state, hero);
  return adjacentRobotTargets(content, state, hero);
}

/** Wind-up key: the chosen robot skips its next turn. */
export function applyItem(state: GameState, itemIndex: number, target: Vec): GameState {
  if (state.phase !== "playerTurn") return state;
  const item = state.items[itemIndex];
  if (!item || item.used) return state;
  if (!robotAt(state, target)) return state;

  const next = clone(state);
  const robot = robotAt(next, target)!;
  robot.stunned = true;
  robot.intent = { path: [], attackTile: null };
  next.items[itemIndex].used = true;
  return next;
}

/**
 * Starts the robot phase: queues all robots so they can be executed one by
 * one (`executeNextRobot`), which lets the UI play the phase back with
 * animations. Events accumulate across the whole phase.
 */
export function beginRobotPhase(state: GameState): GameState {
  if (state.phase !== "playerTurn") return state;
  const next = clone(state);
  next.phase = "robotTurn";
  next.events = [];
  next.pendingRobotIds = next.robots.map((r) => r.id);
  return next;
}

/** Executes the next queued robot. No-op when the queue is empty. */
export function executeNextRobot(content: Content, state: GameState): GameState {
  if (state.phase !== "robotTurn" || state.pendingRobotIds.length === 0) return state;
  const next = clone(state);
  const robotId = next.pendingRobotIds.shift()!;
  executeRobot(content, next, robotId);
  return next;
}

/**
 * Ends the robot phase once the queue is drained: evaluates win/lose,
 * otherwise advances the round (spawns, flag resets, fresh intents).
 */
export function finishRobotPhase(content: Content, state: GameState): GameState {
  if (state.phase !== "robotTurn" || state.pendingRobotIds.length > 0) return state;
  const next = clone(state);

  const chaos = next.props.filter((p) => p.toppled).length;
  const allHeroesDown = next.heroes.every((h) => h.hp <= 0);
  if (allHeroesDown || chaos >= next.maxChaos) {
    next.phase = "defeat";
    return next;
  }
  if (next.round >= next.roundsToSurvive) {
    next.phase = "victory";
    return next;
  }

  next.phase = "playerTurn";
  next.round += 1;
  spawnDueRobots(content, next);
  for (const hero of next.heroes) {
    hero.hasMoved = false;
    hero.hasActed = false;
    hero.shielded = false;
  }
  for (const prop of next.props) {
    prop.shielded = false;
  }
  computeAllIntents(content, next);
  return next;
}

/** Runs the whole robot phase in one step (headless / tests). */
export function endPlayerTurn(content: Content, state: GameState): GameState {
  let next = beginRobotPhase(state);
  if (next === state) return state;
  while (next.pendingRobotIds.length > 0) {
    next = executeNextRobot(content, next);
  }
  return finishRobotPhase(content, next);
}

function spawnDueRobots(content: Content, state: GameState): void {
  const due = state.pendingSpawns.filter((s) => s.round <= state.round);
  state.pendingSpawns = state.pendingSpawns.filter((s) => s.round > state.round);

  for (const spawn of due) {
    // A blocked spawn tile delays the arrival to the next round.
    if (isTileBlocked(state, spawn.pos)) {
      state.pendingSpawns.push({ ...spawn, round: state.round + 1 });
      continue;
    }
    const id = `robot-${spawn.defId}-${state.nextUnitId++}`;
    state.robots.push({
      id,
      defId: spawn.defId,
      pos: spawn.pos,
      hp: content.robots[spawn.defId].maxHp,
      facing: spawn.facing,
      stunned: false,
      confused: false,
      intent: null,
    });
    state.events.push({ type: "robotSpawned", robotId: id });
  }
}

/** Chaos meter value for the HUD. */
export function chaosCount(state: GameState): number {
  return state.props.filter((p) => p.toppled).length;
}
