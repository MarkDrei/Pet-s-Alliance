import { ALL_DIRECTIONS, CLOCKWISE, DIRECTIONS, directionFromTo, isOrthogonallyAdjacent, inBounds, manhattan, vecAdd } from "./grid";
import { heroAt, isTileBlocked, standingPropAt } from "./movement";
import type { Content, Direction, GameEvent, GameState, RobotIntent, RobotState, Vec } from "./types";

/**
 * All robots move like a rook in chess: straight orthogonal lines only, never
 * around corners. This returns the free tiles along one line, in order,
 * stopping before the first blocker or the board edge.
 */
function straightLine(state: GameState, from: Vec, dir: Direction, maxSteps: number): Vec[] {
  const step = DIRECTIONS[dir];
  const line: Vec[] = [];
  let current = from;
  for (let i = 0; i < maxSteps; i++) {
    const next = vecAdd(current, step);
    if (!inBounds(next, state.gridSize) || isTileBlocked(state, next)) break;
    line.push(next);
    current = next;
  }
  return line;
}

/** Chaos targets first (standing towers), then living heroes. */
function pickStomperTarget(content: Content, state: GameState, robot: RobotState): Vec | null {
  const towers = state.props
    .filter((p) => !p.toppled && content.props[p.defId].toppleable)
    .map((p) => p.pos);
  const heroes = state.heroes.filter((h) => h.hp > 0).map((h) => h.pos);
  const group = towers.length > 0 ? towers : heroes;

  let best: Vec | null = null;
  for (const target of group) {
    if (!best || manhattan(robot.pos, target) < manhattan(robot.pos, best)) {
      best = target;
    }
  }
  return best;
}

/**
 * Stomper plan: pick the straight-line move (any of the four rook directions,
 * stopping anywhere along the free part of the line) that gets closest to the
 * target; smash the target if the stop is adjacent to it. Ties prefer the
 * shorter move, so a stomper never overshoots.
 */
function computeStomperIntent(
  content: Content,
  state: GameState,
  robot: RobotState,
): RobotIntent {
  const def = content.robots[robot.defId];
  const target = pickStomperTarget(content, state, robot);
  if (!target) return { path: [], attackTile: null };

  let bestPath: Vec[] = [];
  let bestDistance = manhattan(robot.pos, target);

  for (const dir of ALL_DIRECTIONS) {
    const line = straightLine(state, robot.pos, dir, def.move);
    for (let stop = 0; stop < line.length; stop++) {
      const distance = manhattan(line[stop], target);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestPath = line.slice(0, stop + 1);
      }
    }
  }

  const finalPos = bestPath.length > 0 ? bestPath[bestPath.length - 1] : robot.pos;
  const attackTile = isOrthogonallyAdjacent(finalPos, target) ? target : null;
  return { path: bestPath, attackTile };
}

/**
 * Straight-line intent in the robot's facing direction: charge up to
 * `moveRange` tiles, stopping to attack the first hero or standing prop hit.
 * A confused (nudged) robot keeps stumbling past the board edge and falls
 * off; robots never do that voluntarily.
 */
function computeDirectionalIntent(
  state: GameState,
  robot: RobotState,
  moveRange: number,
  canExitBoard: boolean,
): RobotIntent {
  const dir = DIRECTIONS[robot.facing];
  const path: Vec[] = [];
  let current = robot.pos;

  for (let step = 0; step < moveRange; step++) {
    const next = vecAdd(current, dir);
    if (!inBounds(next, state.gridSize)) {
      return { path, attackTile: null, exitsBoard: canExitBoard };
    }
    if (isTileBlocked(state, next)) {
      const isAttackable = Boolean(heroAt(state, next) ?? standingPropAt(state, next));
      return { path, attackTile: isAttackable ? next : null };
    }
    path.push(next);
    current = next;
  }
  return { path, attackTile: null };
}

export function computeIntent(content: Content, state: GameState, robot: RobotState): RobotIntent {
  const def = content.robots[robot.defId];

  if (robot.confused) {
    return computeDirectionalIntent(state, robot, def.move, true);
  }

  if (def.behavior === "dasher") {
    return computeDirectionalIntent(state, robot, def.move, false);
  }

  return computeStomperIntent(content, state, robot);
}

export function computeAllIntents(content: Content, state: GameState): void {
  for (const robot of state.robots) {
    robot.intent = computeIntent(content, state, robot);
  }
}

/**
 * Executes a single robot's intent, mutating `state` and appending events.
 * Robots that no longer exist (e.g. already fell off the board) are skipped.
 */
export function executeRobot(content: Content, state: GameState, robotId: string): void {
  const robot = state.robots.find((r) => r.id === robotId);
  if (!robot) return;

  if (robot.stunned) {
    robot.stunned = false;
    robot.intent = null;
    state.events.push({ type: "robotStunnedSkip", robotId: robot.id });
    return;
  }

  const intent = robot.intent ?? { path: [], attackTile: null };

  // Move along the planned path, stopping if a tile became blocked.
  let completedPath = true;
  for (const tile of intent.path) {
    if (isTileBlocked(state, tile)) {
      completedPath = false;
      break;
    }
    const dir = directionFromTo(robot.pos, tile);
    if (dir) robot.facing = dir;
    robot.pos = tile;
  }

  // A stumbling robot that reaches the edge falls off the board.
  if (intent.exitsBoard && completedPath) {
    state.robots = state.robots.filter((r) => r.id !== robot.id);
    state.events.push({ type: "robotExited", robotId: robot.id });
    return;
  }

  // Attack the planned tile if still adjacent and still occupied.
  if (intent.attackTile && isOrthogonallyAdjacent(robot.pos, intent.attackTile)) {
    resolveAttack(content, state, robot, intent.attackTile);
  }

  // A dasher stuck against a wall turns to find a new lane.
  const def = content.robots[robot.defId];
  const usesDirectional = def.behavior === "dasher" || robot.confused;
  if (usesDirectional && intent.path.length === 0 && !intent.attackTile) {
    robot.facing = CLOCKWISE[robot.facing];
  }

  robot.confused = false;
  robot.intent = null;
}

function resolveAttack(content: Content, state: GameState, robot: RobotState, tile: Vec): void {
  const def = content.robots[robot.defId];

  const prop = standingPropAt(state, tile);
  if (prop && content.props[prop.defId].toppleable) {
    if (prop.shielded) {
      prop.shielded = false;
      state.events.push({ type: "shieldBlocked", propId: prop.id });
      return;
    }
    prop.toppled = true;
    state.events.push({ type: "towerToppled", robotId: robot.id, propId: prop.id });
    return;
  }

  const hero = heroAt(state, tile);
  if (hero) {
    if (hero.shielded) {
      hero.shielded = false;
      state.events.push({ type: "shieldBlocked", heroId: hero.id });
      return;
    }
    hero.hp = Math.max(0, hero.hp - def.damage);
    state.events.push({
      type: "heroHit",
      robotId: robot.id,
      heroId: hero.id,
      damage: def.damage,
    } satisfies GameEvent);
    if (hero.hp === 0) {
      state.events.push({ type: "heroDown", heroId: hero.id });
    }
  }
}
