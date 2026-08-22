import { create } from "zustand";
import {
  abilityTargets,
  applyAbility,
  applyItem,
  beginRobotPhase,
  createGame,
  executeNextRobot,
  finishRobotPhase,
  heroAt,
  manhattan,
  moveHero,
  reachableTiles,
  robotAt,
  vecEquals,
  type GameEvent,
  type GameState,
  type Vec,
} from "@/engine";
import { CONTENT, LEVELS, LEVEL_1 } from "@/content";
import type { UiEffect } from "@/components/board/effects";
import { de, eventText } from "@/i18n/de";

export type InteractionMode = "idle" | "move" | "ability" | "item";

// Vitest runs with NODE_ENV=test; animations collapse to zero delay there.
const INSTANT = process.env.NODE_ENV === "test";
const MS_PER_TILE = INSTANT ? 0 : 340;
const WINDUP_PAUSE = INSTANT ? 0 : 500;
const STEP_PAUSE = INSTANT ? 0 : 450;
const EVENT_PAUSE = INSTANT ? 0 : 900;
const LOG_LINES = 3;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let effectSeq = 0;
let playbackToken = 0;

export interface GameStore {
  game: GameState;
  selectedHeroId: string | null;
  /** Robot selected for inspection (shows stats and behavior in the HUD). */
  selectedRobotId: string | null;
  mode: InteractionMode;
  /** Robot currently acting during robot-phase playback. */
  activeRobotId: string | null;
  /** True while the robot phase is being played back. */
  animating: boolean;
  /** Transition duration the board applies to unit position changes. */
  moveDurationMs: number;
  /** Transient board effects (impacts, sparkles, poofs, floating text). */
  effects: UiEffect[];
  /** One-shot CSS animation class per unit id (hop, wobble, shake, ...). */
  unitFx: Record<string, string>;
  /** Recent German event lines for the ticker. */
  log: string[];
  selectHero: (heroId: string) => void;
  setMode: (mode: InteractionMode) => void;
  tileClicked: (pos: Vec) => void;
  endTurn: () => void;
  /** Starts a fresh run of the given level (falls back to level 1). */
  startLevel: (levelId: string) => void;
  restart: () => void;
}

export const useGameStore = create<GameStore>((set, get) => {
  function spawnEffect(effect: Omit<UiEffect, "id">, ttlMs = 1000): void {
    const id = `fx-${effectSeq++}`;
    set({ effects: [...get().effects, { ...effect, id }] });
    setTimeout(() => {
      set({ effects: get().effects.filter((e) => e.id !== id) });
    }, ttlMs);
  }

  function playUnitFx(unitId: string, cssClass: string, ttlMs = 700): void {
    set({ unitFx: { ...get().unitFx, [unitId]: cssClass } });
    setTimeout(() => {
      const rest = { ...get().unitFx };
      delete rest[unitId];
      set({ unitFx: rest });
    }, ttlMs);
  }

  function appendLog(state: GameState, events: GameEvent[]): void {
    if (events.length === 0) return;
    const lines = events.map((e) => eventText(state, e));
    set({ log: [...get().log, ...lines].slice(-LOG_LINES) });
  }

  /** Turns fresh engine events into board effects and unit animations. */
  function visualizeEvents(before: GameState, after: GameState, events: GameEvent[]): void {
    for (const event of events) {
      switch (event.type) {
        case "towerToppled": {
          const prop = after.props.find((p) => p.id === event.propId);
          if (prop) spawnEffect({ kind: "crash", pos: prop.pos });
          break;
        }
        case "heroHit": {
          const hero = after.heroes.find((h) => h.id === event.heroId);
          if (hero) {
            spawnEffect({ kind: "impact", pos: hero.pos });
            spawnEffect({ kind: "floatText", pos: hero.pos, text: de.fx.hit, color: "#ff6b6b" });
            playUnitFx(hero.id, "fx-flinch");
          }
          break;
        }
        case "shieldBlocked": {
          const target = event.heroId
            ? after.heroes.find((h) => h.id === event.heroId)
            : after.props.find((p) => p.id === event.propId);
          if (target) spawnEffect({ kind: "shieldPop", pos: target.pos });
          break;
        }
        case "heroDown": {
          const hero = after.heroes.find((h) => h.id === event.heroId);
          if (hero) spawnEffect({ kind: "poof", pos: hero.pos });
          break;
        }
        case "robotBumped": {
          const robot = after.robots.find((r) => r.id === event.robotId);
          if (robot) {
            spawnEffect({ kind: "impact", pos: robot.pos });
            playUnitFx(robot.id, "fx-shake");
          }
          break;
        }
        case "robotDestroyed": {
          const robot = before.robots.find((r) => r.id === event.robotId);
          if (robot) {
            spawnEffect({ kind: "poof", pos: robot.pos });
            spawnEffect({ kind: "impact", pos: robot.pos });
          }
          break;
        }
        case "robotExploded": {
          const robot = before.robots.find((r) => r.id === event.robotId);
          if (robot) {
            // Blast at the bomber's final position: the end of its path.
            const path = robot.intent?.path ?? [];
            const at = path.length > 0 ? path[path.length - 1] : robot.pos;
            spawnEffect({ kind: "crash", pos: at });
            spawnEffect({ kind: "impact", pos: at });
          }
          break;
        }
        case "robotStunnedSkip": {
          const robot = after.robots.find((r) => r.id === event.robotId);
          if (robot) {
            spawnEffect({ kind: "floatText", pos: robot.pos, text: de.fx.stunned, color: "#f6c453" });
          }
          break;
        }
        case "robotSpawned": {
          const robot = after.robots.find((r) => r.id === event.robotId);
          if (robot) spawnEffect({ kind: "spawn", pos: robot.pos });
          break;
        }
        case "robotExited": {
          const robot = before.robots.find((r) => r.id === event.robotId);
          if (robot) {
            // Poof at the edge tile the robot tumbled over.
            const path = robot.intent?.path ?? [];
            const edge = path.length > 0 ? path[path.length - 1] : robot.pos;
            spawnEffect({ kind: "poof", pos: edge });
          }
          break;
        }
      }
    }
  }

  /** Applies a player-action state change and visualizes what happened. */
  function commitAction(before: GameState, after: GameState, moveTiles: number): void {
    const newEvents = after.events.slice(before.events.length);
    set({ game: after, moveDurationMs: Math.max(1, moveTiles) * MS_PER_TILE, mode: "idle" });
    visualizeEvents(before, after, newEvents);
    appendLog(after, newEvents);
  }

  return {
    game: createGame(CONTENT, LEVEL_1),
    selectedHeroId: null,
    selectedRobotId: null,
    mode: "idle",
    activeRobotId: null,
    animating: false,
    moveDurationMs: MS_PER_TILE,
    effects: [],
    unitFx: {},
    log: [],

    selectHero: (heroId) => {
      const hero = get().game.heroes.find((h) => h.id === heroId);
      if (!hero || hero.hp <= 0) return;
      set({
        selectedHeroId: heroId,
        selectedRobotId: null,
        mode: hero.hasMoved ? "idle" : "move",
      });
    },

    setMode: (mode) => set({ mode }),

    tileClicked: (pos) => {
      const { game, mode, selectedHeroId, animating } = get();
      if (game.phase !== "playerTurn" || animating) return;

      const tappedHero = heroAt(game, pos);

      if (mode === "move" && selectedHeroId) {
        const hero = game.heroes.find((h) => h.id === selectedHeroId)!;
        if (reachableTiles(CONTENT, game, hero).some((t) => vecEquals(t, pos))) {
          const after = moveHero(CONTENT, game, selectedHeroId, pos);
          commitAction(game, after, manhattan(hero.pos, pos));
          playUnitFx(selectedHeroId, "fx-hop");
          return;
        }
      }

      if (mode === "ability" && selectedHeroId) {
        if (abilityTargets(CONTENT, game, selectedHeroId).some((t) => vecEquals(t, pos))) {
          const hero = game.heroes.find((h) => h.id === selectedHeroId)!;
          const abilityId = CONTENT.heroes[hero.defId].ability.id;
          const after = applyAbility(CONTENT, game, selectedHeroId, pos);
          if (after !== game) {
            commitAction(game, after, 1);
            playUnitFx(selectedHeroId, "fx-lunge");
            const robot = robotAt(game, pos);
            if (abilityId === "nudge" && robot) playUnitFx(robot.id, "fx-wobble");
            if (abilityId === "shield") spawnEffect({ kind: "sparkleCast", pos });
          }
          return;
        }
      }

      if (mode === "item") {
        if (robotAt(game, pos)) {
          const itemIndex = game.items.findIndex((i) => !i.used);
          if (itemIndex >= 0) {
            const after = applyItem(game, itemIndex, pos);
            if (after !== game) {
              commitAction(game, after, 0);
              spawnEffect({ kind: "floatText", pos, text: de.fx.stunned, color: "#f6c453" });
              const robot = robotAt(game, pos);
              if (robot) playUnitFx(robot.id, "fx-wobble");
            }
          }
          return;
        }
        set({ mode: "idle" });
        return;
      }

      // Fall through: tapping a plushie (re)selects it, tapping a robot
      // inspects it, tapping empty ground clears the selection.
      if (tappedHero) {
        get().selectHero(tappedHero.id);
        return;
      }
      const tappedRobot = robotAt(game, pos);
      if (tappedRobot) {
        set({ selectedRobotId: tappedRobot.id, selectedHeroId: null, mode: "idle" });
        return;
      }
      set({ selectedHeroId: null, selectedRobotId: null, mode: "idle" });
    },

    endTurn: async () => {
      const { game, animating } = get();
      if (game.phase !== "playerTurn" || animating) return;
      const token = ++playbackToken;

      let current = beginRobotPhase(game);
      set({
        game: current,
        selectedHeroId: null,
        selectedRobotId: null,
        mode: "idle",
        animating: true,
      });

      while (current.pendingRobotIds.length > 0) {
        if (token !== playbackToken) return;
        const robotId = current.pendingRobotIds[0];
        const before = current;
        const robotBefore = before.robots.find((r) => r.id === robotId);

        // Wind-up: spotlight the acting robot and let it rev before moving.
        if (robotBefore && !robotBefore.stunned) {
          set({ activeRobotId: robotId });
          playUnitFx(robotId, "fx-windup", WINDUP_PAUSE);
          await sleep(WINDUP_PAUSE);
          if (token !== playbackToken) return;
        }

        current = executeNextRobot(CONTENT, current);
        const robotAfter = current.robots.find((r) => r.id === robotId);
        const newEvents = current.events.slice(before.events.length);
        const tilesMoved =
          robotBefore && robotAfter ? manhattan(robotBefore.pos, robotAfter.pos) : 0;
        const exitTiles =
          robotBefore && !robotAfter ? (robotBefore.intent?.path.length ?? 0) : 0;
        const moveMs = (tilesMoved + exitTiles) * MS_PER_TILE;

        set({
          game: current,
          activeRobotId: robotAfter ? robotId : null,
          moveDurationMs: Math.max(1, moveMs),
        });
        // Locomotion flavor while gliding: stompers march, dashers lean in.
        if (robotBefore && robotAfter && moveMs > 0) {
          const behavior = CONTENT.robots[robotBefore.defId].behavior;
          playUnitFx(robotId, behavior === "dasher" ? "fx-dash" : "fx-march", moveMs);
        }
        visualizeEvents(before, current, newEvents);
        appendLog(current, newEvents);

        await sleep(moveMs + (newEvents.length > 0 ? EVENT_PAUSE : STEP_PAUSE));
      }

      if (token !== playbackToken) return;
      const before = current;
      current = finishRobotPhase(CONTENT, current);
      const newEvents = current.events.slice(before.events.length);
      set({ game: current, activeRobotId: null, animating: false });
      visualizeEvents(before, current, newEvents);
      appendLog(current, newEvents);
    },

    startLevel: (levelId) => {
      playbackToken++;
      set({
        game: createGame(CONTENT, LEVELS[levelId] ?? LEVEL_1),
        selectedHeroId: null,
        selectedRobotId: null,
        mode: "idle",
        activeRobotId: null,
        animating: false,
        moveDurationMs: MS_PER_TILE,
        effects: [],
        unitFx: {},
        log: [],
      });
    },

    restart: () => {
      get().startLevel(get().game.levelId);
    },
  };
});

/** Tiles to highlight for the current interaction mode. */
export function highlightTilesFor(store: GameStore): Vec[] {
  const { game, mode, selectedHeroId } = store;
  if (game.phase !== "playerTurn") return [];
  if (mode === "move" && selectedHeroId) {
    const hero = game.heroes.find((h) => h.id === selectedHeroId);
    if (!hero || hero.hasMoved || hero.hp <= 0) return [];
    return reachableTiles(CONTENT, game, hero);
  }
  if (mode === "ability" && selectedHeroId) {
    return abilityTargets(CONTENT, game, selectedHeroId);
  }
  if (mode === "item") {
    return game.robots.map((r) => r.pos);
  }
  return [];
}
