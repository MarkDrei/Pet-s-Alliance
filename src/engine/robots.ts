import { ALL_DIRECTIONS, CLOCKWISE, DIRECTIONS, directionFromTo, isOrthogonallyAdjacent, inBounds, manhattan, neighbors, vecAdd } from "./grid";
import { heroAt, isTileBlockedForRobot, standingPropAt, terrainKindAt } from "./movement";
import type { Content, Direction, GameEvent, GameState, RobotIntent, RobotState, Vec } from "./types";

/**
 * All robots move like a rook in chess: straight orthogonal lines only, never
 * around corners. This returns the free tiles along one line, in order,
 * stopping before the first blocker or the board edge.
 */
function straightLine(
  content: Content,
  state: GameState,
  from: Vec,
  dir: Direction,
  maxSteps: number,
): Vec[] {
  const step = DIRECTIONS[dir];
  const line: Vec[] = [];
  let current = from;
  for (let i = 0; i < maxSteps; i++) {
    const next = vecAdd(current, step);
    if (!inBounds(next, state.gridSize) || isTileBlockedForRobot(content, state, next)) break;
    line.push(next);
    current = next;
  }
  return line;
}

/**
 * Marble physics: if a moving robot ends on marble tiles, it keeps sliding in
 * its movement direction until it leaves the marbles, hits a blocker, or
 * tumbles off the board edge. Mutates `path` and returns whether the slide
 * carries past the edge.
 */
function extendWithSlide(
  content: Content,
  state: GameState,
  start: Vec,
  path: Vec[],
): boolean {
  if (path.length === 0) return false;
  let current = path[path.length - 1];
  const dir = directionFromTo(path.length > 1 ? path[path.length - 2] : start, current);
  if (!dir) return false;

  while (terrainKindAt(content, state, current) === "marbles") {
    const next = vecAdd(current, DIRECTIONS[dir]);
    if (!inBounds(next, state.gridSize)) return true;
    if (isTileBlockedForRobot(content, state, next)) break;
    path.push(next);
    current = next;
  }
  return false;
}

/** Chaos targets first (standing towers), then living heroes. */
function pickChaosTarget(content: Content, state: GameState, robot: RobotState): Vec | null {
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
 * Rook move toward a target: pick the straight-line move (any of the four
 * directions, stopping anywhere along the free part of the line) that gets
 * closest to the target. Ties prefer the shorter move, so a robot never
 * overshoots. Returns the chosen path (without slide physics applied).
 */
function pathToward(
  content: Content,
  state: GameState,
  robot: RobotState,
  target: Vec,
  moveRange: number,
): Vec[] {
  let bestPath: Vec[] = [];
  let bestDistance = manhattan(robot.pos, target);

  for (const dir of ALL_DIRECTIONS) {
    const line = straightLine(content, state, robot.pos, dir, moveRange);
    for (let stop = 0; stop < line.length; stop++) {
      const distance = manhattan(line[stop], target);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestPath = line.slice(0, stop + 1);
      }
    }
  }
  return bestPath;
}

function finalPos(robot: RobotState, path: Vec[]): Vec {
  return path.length > 0 ? path[path.length - 1] : robot.pos;
}

/** Stomper: march toward the target, smash it if the stop is adjacent. */
function computeStomperIntent(content: Content, state: GameState, robot: RobotState): RobotIntent {
  const def = content.robots[robot.defId];
  const target = pickChaosTarget(content, state, robot);
  if (!target) return { path: [], attackTile: null };

  const path = pathToward(content, state, robot, target, def.move);
  const exitsBoard = extendWithSlide(content, state, robot.pos, path);
  if (exitsBoard) return { path, attackTile: null, exitsBoard: true };

  const stop = finalPos(robot, path);
  const attackTile = isOrthogonallyAdjacent(stop, target) ? target : null;
  return { path, attackTile };
}

/** Spinner: move toward the target, then whirl into all four adjacent tiles. */
function computeSpinnerIntent(content: Content, state: GameState, robot: RobotState): RobotIntent {
  const def = content.robots[robot.defId];
  const target = pickChaosTarget(content, state, robot);
  const path = target ? pathToward(content, state, robot, target, def.move) : [];
  const exitsBoard = extendWithSlide(content, state, robot.pos, path);
  if (exitsBoard) return { path, attackTile: null, exitsBoard: true };

  return { path, attackTile: null, attackTiles: neighbors(finalPos(robot, path), state.gridSize) };
}

/**
 * Bomber: march toward the nearest chaos target and, once adjacent to it,
 * blow up — blasting all four adjacent tiles and destroying itself.
 */
function computeBomberIntent(content: Content, state: GameState, robot: RobotState): RobotIntent {
  const def = content.robots[robot.defId];
  const target = pickChaosTarget(content, state, robot);
  if (!target) return { path: [], attackTile: null };

  const path = pathToward(content, state, robot, target, def.move);
  const exitsBoard = extendWithSlide(content, state, robot.pos, path);
  if (exitsBoard) return { path, attackTile: null, exitsBoard: true };

  const stop = finalPos(robot, path);
  if (!isOrthogonallyAdjacent(stop, target)) return { path, attackTile: null };
  return {
    path,
    attackTile: null,
    attackTiles: neighbors(stop, state.gridSize),
    explodes: true,
  };
}

/**
 * Straight-line intent in the robot's facing direction: charge up to
 * `moveRange` tiles, stopping to attack the first hero or standing prop hit.
 * A confused (nudged) robot keeps stumbling past the board edge and falls
 * off; robots never do that voluntarily — but marble slides can carry anyone
 * over the edge.
 */
function computeDirectionalIntent(
  content: Content,
  state: GameState,
  robot: RobotState,
  moveRange: number,
  canExitBoard: boolean,
): RobotIntent {
  const dir = DIRECTIONS[robot.facing];
  const path: Vec[] = [];
  let current = robot.pos;
  let hitEdge = false;

  for (let step = 0; step < moveRange; step++) {
    const next = vecAdd(current, dir);
    if (!inBounds(next, state.gridSize)) {
      hitEdge = true;
      break;
    }
    if (isTileBlockedForRobot(content, state, next)) {
      const isAttackable = Boolean(heroAt(state, next) ?? standingPropAt(state, next));
      return { path, attackTile: isAttackable ? next : null };
    }
    path.push(next);
    current = next;
  }

  if (hitEdge && canExitBoard) return { path, attackTile: null, exitsBoard: true };
  // Even a voluntary stop can turn into a slide if it lands on marbles —
  // including right over the edge.
  const exitsBoard = extendWithSlide(content, state, robot.pos, path);
  return exitsBoard ? { path, attackTile: null, exitsBoard: true } : { path, attackTile: null };
}

export function computeIntent(content: Content, state: GameState, robot: RobotState): RobotIntent {
  const def = content.robots[robot.defId];

  if (robot.confused) {
    return computeDirectionalIntent(content, state, robot, def.move, true);
  }

  switch (def.behavior) {
    case "dasher":
      return computeDirectionalIntent(content, state, robot, def.move, false);
    case "spinner":
      return computeSpinnerIntent(content, state, robot);
    case "bomber":
      return computeBomberIntent(content, state, robot);
    case "stomper":
      return computeStomperIntent(content, state, robot);
  }
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
    if (isTileBlockedForRobot(content, state, tile)) {
      completedPath = false;
      break;
    }
    const dir = directionFromTo(robot.pos, tile);
    if (dir) robot.facing = dir;
    robot.pos = tile;
  }

  // The movement (stumble or marble slide) carries past the edge: fall off.
  if (intent.exitsBoard && completedPath) {
    state.robots = state.robots.filter((r) => r.id !== robot.id);
    state.events.push({ type: "robotExited", robotId: robot.id });
    return;
  }

  if (intent.explodes && completedPath) {
    // Bomber blast: hit everything around the actual final position, then
    // the bomber is gone.
    for (const tile of neighbors(robot.pos, state.gridSize)) {
      resolveAttack(content, state, robot, tile);
    }
    state.robots = state.robots.filter((r) => r.id !== robot.id);
    state.events.push({ type: "robotExploded", robotId: robot.id });
    return;
  }

  if (intent.attackTiles && !intent.explodes) {
    // Spinner whirl: hit everything around the actual final position.
    for (const tile of neighbors(robot.pos, state.gridSize)) {
      resolveAttack(content, state, robot, tile);
    }
  } else if (intent.attackTile && isOrthogonallyAdjacent(robot.pos, intent.attackTile)) {
    // Attack the planned tile if still adjacent and still occupied.
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
