/**
 * Core engine types. The engine is pure TypeScript: no React, no DOM,
 * no side effects. All game rules operate on these types.
 */

export interface Vec {
  x: number;
  y: number;
}

export type Direction = "north" | "east" | "south" | "west";

// ---------------------------------------------------------------------------
// Content definitions (static data, provided by src/content/)
// ---------------------------------------------------------------------------

export type AbilityId = "push" | "nudge" | "shield";

export interface AbilityDef {
  id: AbilityId;
  range: number;
}

export interface HeroDef {
  id: string;
  maxHp: number;
  move: number;
  /** Can pass over blocked tiles while moving (but not land on them). */
  canJump: boolean;
  ability: AbilityDef;
  /** Sprite registry key. */
  visual: string;
}

/**
 * - stomper: rook-moves toward the nearest chaos target, smashes it when adjacent.
 * - dasher: charges straight along its facing, rams the first thing in the lane.
 * - spinner: rook-moves toward the nearest target, then whirls — hits ALL four
 *   adjacent tiles every turn.
 * - bomber: rook-moves toward the nearest chaos target and self-destructs when
 *   it arrives, blasting all four adjacent tiles.
 */
export type RobotBehavior = "stomper" | "dasher" | "spinner" | "bomber";

export interface RobotDef {
  id: string;
  maxHp: number;
  move: number;
  damage: number;
  behavior: RobotBehavior;
  /** Too heavy for the plushies to push or nudge (boss robots). */
  heavy?: boolean;
  visual: string;
}

export interface PropDef {
  id: string;
  /** Toppleable props are the robots' chaos targets (e.g. block towers). */
  toppleable: boolean;
  visual: string;
  toppledVisual?: string;
}

export interface ItemDef {
  id: string;
  visual: string;
}

/**
 * - marbles: robots that move onto them keep sliding in their movement
 *   direction until they leave the marbles, hit a blocker, or tumble off the
 *   board. Plushies hop over them carefully and are unaffected.
 * - cushion: soft ground robots cannot roll onto; plushies may stand on it.
 */
export type TerrainKind = "marbles" | "cushion";

export interface TerrainDef {
  id: string;
  kind: TerrainKind;
  visual: string;
}

export interface SpawnDef {
  /** Round at whose start the robot appears. */
  round: number;
  defId: string;
  pos: Vec;
  facing: Direction;
}

export interface LevelDef {
  id: string;
  gridSize: number;
  roundsToSurvive: number;
  /** Number of toppled targets that means defeat. */
  maxChaos: number;
  heroStarts: { defId: string; pos: Vec }[];
  robotStarts: { defId: string; pos: Vec; facing: Direction }[];
  spawns: SpawnDef[];
  props: { defId: string; pos: Vec }[];
  /** Terrain features on the floor (marble lanes, cushions). */
  terrain?: { defId: string; pos: Vec }[];
  /** Item def ids available in this level. */
  items: string[];
  /** Floor tile visuals for this environment (checkerboard light/dark). */
  floor?: { light: string; dark: string };
}

/** Lookup registry for all static definitions, passed into engine functions. */
export interface Content {
  heroes: Record<string, HeroDef>;
  robots: Record<string, RobotDef>;
  props: Record<string, PropDef>;
  items: Record<string, ItemDef>;
  terrains: Record<string, TerrainDef>;
}

// ---------------------------------------------------------------------------
// Runtime state (fully serializable — no references into content)
// ---------------------------------------------------------------------------

export interface HeroState {
  id: string;
  defId: string;
  pos: Vec;
  hp: number;
  hasMoved: boolean;
  hasActed: boolean;
  /** Blocks the next robot hit, granted by the unicorn's shield. */
  shielded: boolean;
}

export interface RobotIntent {
  /** Tiles the robot plans to move through, in order (excluding current pos). */
  path: Vec[];
  /** Tile the robot plans to attack after moving, if any. */
  attackTile: Vec | null;
  /** Area attack tiles (spinner whirl, bomber blast) after moving. */
  attackTiles?: Vec[];
  /** The robot will blow itself up after moving (bomber). */
  explodes?: boolean;
  /** The movement continues past the board edge: the robot will fall off. */
  exitsBoard?: boolean;
}

export interface RobotState {
  id: string;
  defId: string;
  pos: Vec;
  hp: number;
  facing: Direction;
  /** Skips its next execution (wind-up key item). */
  stunned: boolean;
  /** Nudged by the bunny: stumbles in facing direction instead of its plan. */
  confused: boolean;
  intent: RobotIntent | null;
}

export interface PropState {
  id: string;
  defId: string;
  pos: Vec;
  toppled: boolean;
  /** Blocks the next topple attempt, granted by the unicorn's shield. */
  shielded: boolean;
}

export interface ItemState {
  defId: string;
  used: boolean;
}

export type Phase = "playerTurn" | "robotTurn" | "victory" | "defeat";

export type GameEvent =
  | { type: "towerToppled"; robotId: string; propId: string }
  | { type: "heroHit"; robotId: string; heroId: string; damage: number }
  | { type: "shieldBlocked"; heroId?: string; propId?: string }
  | { type: "heroDown"; heroId: string }
  | { type: "robotBumped"; robotId: string }
  | { type: "robotDestroyed"; robotId: string }
  | { type: "robotExploded"; robotId: string }
  | { type: "robotStunnedSkip"; robotId: string }
  | { type: "robotSpawned"; robotId: string }
  | { type: "robotExited"; robotId: string };

export interface GameState {
  levelId: string;
  gridSize: number;
  round: number;
  roundsToSurvive: number;
  maxChaos: number;
  phase: Phase;
  heroes: HeroState[];
  robots: RobotState[];
  props: PropState[];
  /** Static terrain features, copied from the level definition. */
  terrain: { defId: string; pos: Vec }[];
  /** Floor tile visuals of this level's environment. */
  floor: { light: string; dark: string };
  items: ItemState[];
  /** Robots not yet on the board (copied from the level definition). */
  pendingSpawns: SpawnDef[];
  /**
   * Robots that still have to act in the current robot phase, in order.
   * Filled by `beginRobotPhase`, drained one id per `executeNextRobot` so the
   * UI can play the phase back robot by robot.
   */
  pendingRobotIds: string[];
  /** What happened during the last robot phase, for the UI to narrate. */
  events: GameEvent[];
  /** Monotonic counter used to mint unique unit ids. */
  nextUnitId: number;
}
