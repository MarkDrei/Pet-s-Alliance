import type { Axial, Dir } from "./hex";

export type HeroDefId = "teddy" | "bunny" | "unicorn";
export type RobotDefId = "stomper" | "dasher" | "kipplaster" | "bomber" | "rostzahn";
export type PropDefId = "tower" | "books" | "musicbox" | "blocks";
export type TerrainKind = "marbles" | "cushion";
export type ItemId = "windup-key" | "cannonball";
export type FloorKind = "rug" | "wood" | "track" | "desk";

export type AbilityId = "push" | "nudge" | "shield";

/** Which tiles a robot hits from its final hex, relative to facing. */
export type AttackShape = "front" | "flanks" | "ring";

export interface HeroDef {
  id: HeroDefId;
  hp: number;
  move: number;
  ability: AbilityId;
  abilityRange: number;
  /** Jumpers may pass over blocked tiles but only land on free ones. */
  jumper: boolean;
}

export interface RobotDef {
  id: RobotDefId;
  hp: number;
  move: number;
  damage: number;
  shape: AttackShape;
  /** Heavy robots cannot be pushed or nudged. */
  heavy: boolean;
  /** Dashers must charge and never enter their crash tile. */
  dasher: boolean;
  /** Bombers are removed after their blast. */
  explodes: boolean;
}

export interface HeroState {
  id: string;
  defId: HeroDefId;
  pos: Axial;
  hp: number;
  maxHp: number;
  shielded: boolean;
  hasMoved: boolean;
  hasActed: boolean;
  /** Exhausted (0 HP): removed from the board but kept for the result screen. */
  down: boolean;
  /** Finalized for this round: the player may not return to it. */
  doneForRound: boolean;
}

/**
 * A robot's published plan: facing, step count, and whether the attack
 * shape fires after the walk. Path and attack tiles are always derived
 * from the robot's *current* tile (see previewIntent), so a Push redraws
 * the same line from the new tile and a Nudge rotates it in place.
 */
export interface RobotIntent {
  facing: Dir;
  steps: number;
  attacks: boolean;
}

export interface RobotState {
  id: string;
  defId: RobotDefId;
  pos: Axial;
  hp: number;
  maxHp: number;
  facing: Dir;
  intent: RobotIntent | null;
  /** Wound up by the key: skips its execution this round. */
  stunned: boolean;
  /** Destroyed, exploded, or fell off the board. */
  removed: boolean;
}

export interface PropState {
  id: string;
  defId: PropDefId;
  pos: Axial;
  toppled: boolean;
  shielded: boolean;
}

export interface SpawnEntry {
  /** The spawn is created at the close of this round. */
  afterRound: number;
  defId: RobotDefId;
  pos: Axial;
  facing?: Dir;
}

export interface LevelDef {
  id: string;
  floor: FloorKind;
  rounds: number;
  maxChaos: number;
  heroes: { defId: HeroDefId; pos: Axial }[];
  robots: { defId: RobotDefId; pos: Axial; facing?: Dir }[];
  props: { defId: PropDefId; pos: Axial }[];
  terrain: { kind: TerrainKind; pos: Axial }[];
  spawns: SpawnEntry[];
  items: ItemId[];
}

export type Phase = "player" | "execution" | "result";

export type Outcome = "win" | "loseChaos" | "loseWipe";

export interface GameResult {
  outcome: Outcome;
  /** Hero defId on win, robot defId on loss — the result-screen speaker. */
  speakerDefId: HeroDefId | RobotDefId;
}

export interface GameState {
  levelId: string;
  floor: FloorKind;
  round: number;
  totalRounds: number;
  phase: Phase;
  heroes: HeroState[];
  robots: RobotState[];
  props: PropState[];
  /** hexKey -> terrain kind. */
  terrain: Record<string, TerrainKind>;
  chaos: number;
  maxChaos: number;
  pendingSpawns: SpawnEntry[];
  spawnCounter: number;
  items: ItemId[];
  windupAvailable: boolean;
  cannonballUsed: boolean;
  /** Hero currently acting; other fresh heroes finalize it when they start. */
  activeHeroId: string | null;
  /** Index of the next robot to execute during the robot phase. */
  executionIndex: number;
  /** defId of the robot removed most recently (for the result screen). */
  lastRemovedRobotDefId: RobotDefId | null;
  result: GameResult | null;
}

/**
 * Engine events. Ticker events match `TickerEvent` in src/i18n/de.ts;
 * the rest exist so the UI can animate every action one at a time.
 */
export type GameEvent =
  // --- ticker events (German text via eventText) ---
  | { type: "towerToppled"; robotId: string; propId: string }
  | { type: "heroHit"; robotId: string; heroId: string; damage: number }
  | { type: "shieldBlocked"; heroId?: string; propId?: string }
  | { type: "heroDown"; heroId: string }
  | { type: "robotBumped"; robotId: string }
  | { type: "robotDestroyed"; robotId: string }
  | { type: "robotExploded"; robotId: string }
  | { type: "robotStunnedSkip"; robotId: string }
  | { type: "robotSpawned"; robotId: string }
  | { type: "robotExited"; robotId: string }
  | { type: "cannonballHit"; robotId: string }
  // --- animation events ---
  | { type: "heroStep"; heroId: string; from: Axial; to: Axial; jump: boolean }
  | { type: "robotStep"; robotId: string; from: Axial; to: Axial }
  | { type: "robotSlid"; robotId: string; from: Axial; to: Axial }
  | { type: "pushShove"; robotId: string; from: Axial; to: Axial }
  | { type: "nudgeTurned"; robotId: string; facing: Dir }
  | { type: "shieldCast"; casterId: string; targetId: string }
  | { type: "windupApplied"; robotId: string }
  | { type: "robotActs"; robotId: string }
  | { type: "robotAttacked"; robotId: string; tiles: Axial[]; shape: AttackShape }
  | { type: "blocksHit"; propId: string }
  | { type: "roundStarted"; round: number }
  | { type: "turnEnded" }
  | { type: "levelEnded"; outcome: Outcome };

/** A snapshot of the game right after `event` happened. */
export interface Frame {
  event: GameEvent;
  state: GameState;
}

export interface ActionResult {
  state: GameState;
  frames: Frame[];
}
