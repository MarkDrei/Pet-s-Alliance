import { DIRECTIONS, directionFromTo, inBounds, manhattan, vecAdd } from "./grid";
import { isTileBlockedForRobot, terrainKindAt } from "./movement";
import { computeIntent } from "./robots";
import type { Content, Direction, GameState, HeroState, RobotState, Vec } from "./types";

/**
 * Marble physics for a pushed robot: keep sliding in the push direction while
 * standing on marbles. Returns false if the robot tumbled off the board (and
 * was removed).
 */
function slidePushedRobot(
  content: Content,
  state: GameState,
  robot: RobotState,
  dir: Direction,
): boolean {
  while (terrainKindAt(content, state, robot.pos) === "marbles") {
    const next = vecAdd(robot.pos, DIRECTIONS[dir]);
    if (!inBounds(next, state.gridSize)) {
      state.robots = state.robots.filter((r) => r.id !== robot.id);
      state.events.push({ type: "robotExited", robotId: robot.id });
      return false;
    }
    if (isTileBlockedForRobot(content, state, next)) break;
    robot.pos = next;
  }
  return true;
}

/**
 * Teddy's "Wegschubsen": push an adjacent robot one tile away.
 * If the destination is off-board or blocked, the robot bumps into it and
 * takes 1 damage instead. Robots at 0 hp break and are removed. A robot
 * pushed onto marbles keeps sliding. Heavy robots cannot be pushed.
 */
export function pushRobot(
  content: Content,
  state: GameState,
  hero: HeroState,
  robot: RobotState,
): void {
  if (content.robots[robot.defId].heavy) return;
  const dir = directionFromTo(hero.pos, robot.pos);
  if (!dir) return;

  const dest = vecAdd(robot.pos, DIRECTIONS[dir]);
  if (!inBounds(dest, state.gridSize) || isTileBlockedForRobot(content, state, dest)) {
    robot.hp -= 1;
    state.events.push({ type: "robotBumped", robotId: robot.id });
    if (robot.hp <= 0) {
      state.robots = state.robots.filter((r) => r.id !== robot.id);
      state.events.push({ type: "robotDestroyed", robotId: robot.id });
      return;
    }
  } else {
    robot.pos = dest;
    robot.facing = dir;
    if (!slidePushedRobot(content, state, robot, dir)) return;
  }
  robot.intent = computeIntent(content, state, robot);
}

/**
 * Bunny's "Anschubsen": shove an adjacent robot so it stumbles AWAY from the
 * bunny. The player steers the stumble direction by where the bunny stands.
 * Heavy robots cannot be nudged.
 */
export function nudgeRobot(
  content: Content,
  state: GameState,
  hero: HeroState,
  robot: RobotState,
): void {
  if (content.robots[robot.defId].heavy) return;
  const dir = directionFromTo(hero.pos, robot.pos);
  if (!dir) return;
  robot.facing = dir;
  robot.confused = true;
  robot.intent = computeIntent(content, state, robot);
}

/**
 * Unicorn's "Funkelschild" targets: living plushies and standing towers
 * within range (including the caster). Shields absorb exactly one hit.
 */
export function shieldTargets(content: Content, state: GameState, caster: HeroState): Vec[] {
  const range = content.heroes[caster.defId].ability.range;
  const heroTiles = state.heroes
    .filter((h) => h.hp > 0 && manhattan(caster.pos, h.pos) <= range)
    .map((h) => h.pos);
  const towerTiles = state.props
    .filter(
      (p) =>
        !p.toppled &&
        content.props[p.defId].toppleable &&
        manhattan(caster.pos, p.pos) <= range,
    )
    .map((p) => p.pos);
  return [...heroTiles, ...towerTiles];
}

/** Robots within push/nudge range of the hero. Heavy robots can't be moved. */
export function adjacentRobotTargets(
  content: Content,
  state: GameState,
  hero: HeroState,
): Vec[] {
  const range = content.heroes[hero.defId].ability.range;
  return state.robots
    .filter((r) => !content.robots[r.defId].heavy && manhattan(hero.pos, r.pos) <= range)
    .map((r) => r.pos);
}
