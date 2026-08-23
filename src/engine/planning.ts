import type { Axial, Dir } from "./hex";
import {
  ALL_DIRS,
  facingToward,
  hexDistance,
  inBoard,
  neighbor,
  rotateDir,
} from "./hex";
import { isBlockedForRobot, occupantAt } from "./board";
import { isToppleable, ROBOT_DEFS } from "./defs";
import { marbleSlide, robotLineRun } from "./movement";
import type { AttackShape, GameState, RobotIntent, RobotState } from "./types";

/**
 * Planning target per doc/game-mechanics.md: standing toppleable props
 * first (ignoring heroes entirely while any exist), otherwise living
 * heroes. Nearest wins; equal distances keep state-array order.
 *
 * With `skipAdjacent` (dasher), every adjacent candidate is skipped,
 * still props before heroes.
 */
export function planningTarget(
  state: GameState,
  robot: RobotState,
  skipAdjacent = false,
): Axial | null {
  const props = state.props
    .filter((p) => !p.toppled && isToppleable(p.defId))
    .map((p) => p.pos);
  const heroes = state.heroes.filter((h) => !h.down).map((h) => h.pos);

  const pickNearest = (candidates: Axial[]): Axial | null => {
    let best: Axial | null = null;
    let bestDist = Infinity;
    for (const c of candidates) {
      const d = hexDistance(robot.pos, c);
      if (skipAdjacent && d <= 1) continue;
      if (d < bestDist) {
        bestDist = d;
        best = c;
      }
    }
    return best;
  };

  if (skipAdjacent) {
    return pickNearest(props) ?? pickNearest(heroes);
  }
  if (props.length > 0) return pickNearest(props);
  return pickNearest(heroes);
}

/**
 * The strictly-closer search: evaluate the six directions in fixed order;
 * on each connected run consider every stopping point; keep a point only
 * when strictly closer to the target than the best so far (which starts
 * at the robot's current tile). First direction/point to win a tie stays.
 */
function strictlyCloserSearch(
  state: GameState,
  robot: RobotState,
  target: Axial,
  maxSteps: number,
  dirs: readonly Dir[],
): { dir: Dir; steps: number } | null {
  let bestDist = hexDistance(robot.pos, target);
  let bestDir: Dir | null = null;
  let bestSteps = 0;
  for (const dir of dirs) {
    const run = robotLineRun(state, robot.pos, dir, maxSteps);
    for (let i = 0; i < run.length; i++) {
      const d = hexDistance(run[i], target);
      if (d < bestDist) {
        bestDist = d;
        bestDir = dir;
        bestSteps = i + 1;
      }
    }
  }
  return bestDir === null ? null : { dir: bestDir, steps: bestSteps };
}

function computeDasherIntent(state: GameState, robot: RobotState): RobotIntent {
  const def = ROBOT_DEFS.dasher;
  const target = planningTarget(state, robot, true);
  const legalDirs = ALL_DIRS.filter((d) => {
    const first = neighbor(robot.pos, d);
    return inBoard(first) && !isBlockedForRobot(state, first);
  });
  if (!target || legalDirs.length === 0) {
    return {
      facing: target ? facingToward(robot.pos, target) : robot.facing,
      steps: 0,
      attacks: false,
    };
  }
  const found = strictlyCloserSearch(state, robot, target, def.move, legalDirs);
  if (!found) {
    return { facing: facingToward(robot.pos, target), steps: 0, attacks: false };
  }
  // The published charge runs the whole lane, ending on the last free hex.
  const run = robotLineRun(state, robot.pos, found.dir, def.move);
  const final = run[run.length - 1];
  const crash = neighbor(final, found.dir);
  const attacks = inBoard(crash) && occupantAt(state, crash) !== null;
  return { facing: found.dir, steps: run.length, attacks };
}

/** Compute one robot's intent during the planning step. */
export function computeIntent(state: GameState, robot: RobotState): RobotIntent {
  const def = ROBOT_DEFS[robot.defId];
  if (def.dasher) return computeDasherIntent(state, robot);

  const target = planningTarget(state, robot);
  if (!target) return { facing: robot.facing, steps: 0, attacks: true };

  const found = strictlyCloserSearch(state, robot, target, def.move, ALL_DIRS);
  if (!found) {
    return { facing: facingToward(robot.pos, target), steps: 0, attacks: true };
  }
  return { facing: found.dir, steps: found.steps, attacks: true };
}

/** Recompute and store intents for every robot on the board. */
export function planAllRobots(state: GameState): GameState {
  return {
    ...state,
    robots: state.robots.map((r) => {
      if (r.removed) return r;
      const intent = computeIntent(state, r);
      return { ...r, intent, facing: intent.facing };
    }),
  };
}

/** Attack tiles for a shape from `from` while facing `facing`. */
export function attackTiles(from: Axial, facing: Dir, shape: AttackShape): Axial[] {
  switch (shape) {
    case "front":
      return [neighbor(from, facing)];
    case "flanks":
      return [neighbor(from, rotateDir(facing, -1)), neighbor(from, rotateDir(facing, 1))];
    case "ring":
      return ALL_DIRS.map((d) => neighbor(from, d));
  }
}

export interface IntentPreview {
  /** Planned walk, re-checked against current occupancy (stops early). */
  path: Axial[];
  /** Marble slide after the walk, if the walk ends on marbles. */
  slide: Axial[];
  slideEnd: "landed" | "bumped" | "exited" | null;
  /** Where the robot will stand when it attacks. */
  final: Axial;
  /** Tiles the attack shape will hit (empty when the plan has no attack). */
  attack: Axial[];
}

/**
 * Execution preview of a robot's published intent from its *current*
 * tile: the same facing and step count, re-checked stepwise against the
 * current board, plus any marble slide, plus the attack tiles. This is
 * what the red overlay shows and what execution walks.
 */
export function previewIntent(state: GameState, robot: RobotState): IntentPreview {
  const def = ROBOT_DEFS[robot.defId];
  const intent = robot.intent;
  if (!intent) {
    return { path: [], slide: [], slideEnd: null, final: robot.pos, attack: [] };
  }
  const path = robotLineRun(state, robot.pos, intent.facing, intent.steps);
  let final = path.length > 0 ? path[path.length - 1] : robot.pos;
  let slide: Axial[] = [];
  let slideEnd: IntentPreview["slideEnd"] = null;
  const slideResult = marbleSlide(state, final, intent.facing);
  const slid = slideResult.path.length > 0 || slideResult.end !== "landed";
  if (slid) {
    slide = slideResult.path;
    slideEnd = slideResult.end;
    if (slideEnd === "exited") {
      // The last slide tile is off-board; the robot leaves the game.
      final = slide.length > 1 ? slide[slide.length - 2] : final;
    } else if (slide.length > 0) {
      final = slide[slide.length - 1];
    }
  }
  const attack =
    intent.attacks && slideEnd !== "exited"
      ? attackTiles(final, intent.facing, def.shape)
      : [];
  return { path, slide, slideEnd, final, attack };
}
