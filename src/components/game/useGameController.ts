"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { occupantAt, terrainAt } from "@/engine/board";
import {
  abilityTargets,
  createGame,
  endTurn,
  itemTargets,
  moveHero,
  stepExecution,
  applyAbility,
  applyItem,
  type AbilityTarget,
} from "@/engine/game";
import { hexEquals, type Axial } from "@/engine/hex";
import { heroMoveTargets } from "@/engine/movement";
import type { Frame, GameEvent, GameState, ItemId, LevelDef } from "@/engine/types";
import { de, eventText, type TickerEvent } from "@/i18n/de";

export type InspectTarget =
  | { kind: "hero"; id: string }
  | { kind: "robot"; id: string }
  | { kind: "prop"; id: string }
  | { kind: "terrain"; pos: Axial };

export type UiMode =
  | { kind: "idle" }
  | { kind: "hero"; heroId: string }
  | { kind: "ability"; heroId: string }
  | { kind: "item"; itemId: ItemId };

const TICKER_TYPES = new Set<GameEvent["type"]>([
  "towerToppled",
  "heroHit",
  "shieldBlocked",
  "heroDown",
  "robotBumped",
  "robotDestroyed",
  "robotExploded",
  "robotStunnedSkip",
  "robotSpawned",
  "robotExited",
  "cannonballHit",
]);

/** How long each animation frame stays on screen (ms). */
function frameDuration(event: GameEvent): number {
  switch (event.type) {
    case "heroStep":
      return event.jump ? 240 : 210;
    case "robotStep":
      return 280;
    case "robotSlid":
      return 150;
    case "pushShove":
      return 230;
    case "nudgeTurned":
      return 420;
    case "shieldCast":
      return 550;
    case "windupApplied":
      return 550;
    case "robotActs":
      return 420;
    case "robotAttacked":
      return 520;
    case "blocksHit":
      return 320;
    case "towerToppled":
      return 620;
    case "heroHit":
      return 500;
    case "shieldBlocked":
      return 550;
    case "heroDown":
      return 700;
    case "robotBumped":
      return 420;
    case "robotDestroyed":
      return 560;
    case "robotExploded":
      return 700;
    case "robotStunnedSkip":
      return 650;
    case "robotSpawned":
      return 550;
    case "robotExited":
      return 500;
    case "cannonballHit":
      return 600;
    case "roundStarted":
      return 900;
    case "turnEnded":
      return 500;
    case "levelEnded":
      return 700;
  }
}

export interface GameController {
  view: GameState;
  event: GameEvent | null;
  busy: boolean;
  mode: UiMode;
  inspect: InspectTarget | null;
  ticker: string;
  actingRobotId: string | null;
  moveTargets: Axial[];
  abilityTargetList: AbilityTarget[];
  itemTargetIds: string[];
  onTileTap: (hex: Axial) => void;
  onSelectHero: (heroId: string) => void;
  onStartAbility: (heroId: string) => void;
  onStartItem: (itemId: ItemId) => void;
  onCancelTargeting: () => void;
  onEndTurn: () => void;
  onRestart: () => void;
  closeInspect: () => void;
}

export function useGameController(level: LevelDef): GameController {
  const [view, setView] = useState<GameState>(() => createGame(level));
  const engineRef = useRef<GameState>(view);
  const queueRef = useRef<Frame[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [busy, setBusy] = useState(false);
  const [event, setEvent] = useState<GameEvent | null>(null);
  const [mode, setMode] = useState<UiMode>({ kind: "idle" });
  const [inspect, setInspect] = useState<InspectTarget | null>(null);
  const [ticker, setTicker] = useState<string>(de.selectHint);
  const [actingRobotId, setActingRobotId] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Frame playback: a self-scheduling closure (stable across renders)
  // that shows one frame, waits its duration, then plays the next.
  const pump = useMemo(() => {
    const playNext = (): void => {
      const frame = queueRef.current.shift();
      if (!frame) {
        // Queue drained: keep the robot phase rolling, else hand back control.
        if (engineRef.current.phase === "execution") {
          const res = stepExecution(engineRef.current);
          engineRef.current = res.state;
          queueRef.current.push(...res.frames);
          playNext();
          return;
        }
        setBusy(false);
        setEvent(null);
        setActingRobotId(null);
        setView(engineRef.current);
        return;
      }

      setView(frame.state);
      setEvent(frame.event);
      if (TICKER_TYPES.has(frame.event.type)) {
        setTicker(eventText(frame.state, frame.event as TickerEvent));
      } else if (frame.event.type === "turnEnded") {
        setTicker(de.robotPhase);
      } else if (frame.event.type === "roundStarted") {
        setTicker(de.selectHint);
      }
      if (frame.event.type === "robotActs" || frame.event.type === "robotStunnedSkip") {
        // The acting robot is the default inspect target during execution.
        setActingRobotId(frame.event.robotId);
        setInspect({ kind: "robot", id: frame.event.robotId });
      }
      timerRef.current = setTimeout(playNext, frameDuration(frame.event));
    };
    return playNext;
  }, []);

  const runAction = useCallback(
    (fn: (s: GameState) => { state: GameState; frames: Frame[] }) => {
      try {
        const res = fn(engineRef.current);
        engineRef.current = res.state;
        queueRef.current.push(...res.frames);
      } catch {
        return; // the UI should never offer invalid actions
      }
      setBusy(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      pump();
    },
    [pump],
  );

  // --- derived target lists -------------------------------------------------

  const moveTargets = useMemo(() => {
    if (busy || view.phase !== "player" || mode.kind !== "hero") return [];
    const hero = view.heroes.find((h) => h.id === mode.heroId);
    if (!hero) return [];
    return heroMoveTargets(view, hero);
  }, [view, mode, busy]);

  const abilityTargetList = useMemo(() => {
    if (busy || view.phase !== "player" || mode.kind !== "ability") return [];
    return abilityTargets(view, mode.heroId);
  }, [view, mode, busy]);

  const itemTargetIds = useMemo(() => {
    if (busy || view.phase !== "player" || mode.kind !== "item") return [];
    return itemTargets(view, mode.itemId);
  }, [view, mode, busy]);

  // --- interactions ---------------------------------------------------------

  const inspectAt = useCallback(
    (hex: Axial): InspectTarget | null => {
      const occ = occupantAt(view, hex);
      if (occ) {
        if (occ.kind === "hero") return { kind: "hero", id: occ.hero.id };
        if (occ.kind === "robot") return { kind: "robot", id: occ.robot.id };
        return { kind: "prop", id: occ.prop.id };
      }
      const toppled = view.props.find((p) => p.toppled && hexEquals(p.pos, hex));
      if (toppled) return { kind: "prop", id: toppled.id };
      if (terrainAt(view, hex)) return { kind: "terrain", pos: hex };
      return null;
    },
    [view],
  );

  const toggleInspect = useCallback(
    (target: InspectTarget | null) => {
      setInspect((prev) => {
        if (!target) return null;
        if (
          prev &&
          prev.kind === target.kind &&
          (prev.kind === "terrain"
            ? hexEquals((prev as { pos: Axial }).pos, (target as { pos: Axial }).pos)
            : (prev as { id: string }).id === (target as { id: string }).id)
        ) {
          return null; // tap the same piece again: close
        }
        return target;
      });
    },
    [],
  );

  const onTileTap = useCallback(
    (hex: Axial) => {
      if (busy || view.phase !== "player") {
        toggleInspect(inspectAt(hex));
        return;
      }
      const occ = occupantAt(view, hex);

      if (mode.kind === "ability") {
        const hit = abilityTargetList.find((t) => {
          if (t.kind === "robot") return occ?.kind === "robot" && occ.robot.id === t.robotId;
          if (t.kind === "hero") return occ?.kind === "hero" && occ.hero.id === t.heroId;
          return occ?.kind === "prop" && occ.prop.id === t.propId;
        });
        if (hit) {
          const heroId = mode.heroId;
          setMode({ kind: "hero", heroId });
          runAction((s) => applyAbility(s, heroId, hit));
        } else {
          setMode({ kind: "hero", heroId: mode.heroId });
        }
        return;
      }

      if (mode.kind === "item") {
        if (occ?.kind === "robot" && itemTargetIds.includes(occ.robot.id)) {
          const itemId = mode.itemId;
          setMode({ kind: "idle" });
          runAction((s) => applyItem(s, itemId, occ.robot.id));
        } else {
          setMode({ kind: "idle" });
        }
        return;
      }

      // Move destination?
      if (mode.kind === "hero" && moveTargets.some((t) => hexEquals(t, hex))) {
        const heroId = mode.heroId;
        runAction((s) => moveHero(s, heroId, hex));
        return;
      }

      // Selecting / inspecting pieces.
      if (occ?.kind === "hero") {
        const hero = occ.hero;
        if (mode.kind === "hero" && mode.heroId === hero.id) {
          setMode({ kind: "idle" });
          setInspect(null);
        } else {
          if (!hero.down && !hero.doneForRound) setMode({ kind: "hero", heroId: hero.id });
          setInspect({ kind: "hero", id: hero.id });
        }
        return;
      }
      if (occ || terrainAt(view, hex) || view.props.some((p) => p.toppled && hexEquals(p.pos, hex))) {
        toggleInspect(inspectAt(hex));
        return;
      }
      // Empty floor: close everything.
      setMode({ kind: "idle" });
      setInspect(null);
    },
    [busy, view, mode, moveTargets, abilityTargetList, itemTargetIds, runAction, inspectAt, toggleInspect],
  );

  const onSelectHero = useCallback(
    (heroId: string) => {
      if (busy || view.phase !== "player") return;
      const hero = view.heroes.find((h) => h.id === heroId);
      if (!hero || hero.down) return;
      if (mode.kind === "hero" && mode.heroId === heroId) {
        setMode({ kind: "idle" });
        setInspect(null);
        return;
      }
      setMode({ kind: "hero", heroId });
      setInspect({ kind: "hero", id: heroId });
    },
    [busy, view, mode],
  );

  const onStartAbility = useCallback(
    (heroId: string) => {
      if (busy || view.phase !== "player") return;
      setMode({ kind: "ability", heroId });
    },
    [busy, view],
  );

  const onStartItem = useCallback(
    (itemId: ItemId) => {
      if (busy || view.phase !== "player") return;
      setMode({ kind: "item", itemId });
    },
    [busy, view],
  );

  const onCancelTargeting = useCallback(() => {
    setMode((m) => (m.kind === "ability" ? { kind: "hero", heroId: m.heroId } : { kind: "idle" }));
  }, []);

  const onEndTurn = useCallback(() => {
    if (busy || view.phase !== "player") return;
    setMode({ kind: "idle" });
    setInspect(null);
    runAction((s) => endTurn(s));
  }, [busy, view, runAction]);

  const onRestart = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    queueRef.current = [];
    const fresh = createGame(level);
    engineRef.current = fresh;
    setView(fresh);
    setBusy(false);
    setEvent(null);
    setMode({ kind: "idle" });
    setInspect(null);
    setActingRobotId(null);
    setTicker(de.selectHint);
  }, [level]);

  const closeInspect = useCallback(() => setInspect(null), []);

  return {
    view,
    event,
    busy,
    mode,
    inspect,
    ticker,
    actingRobotId,
    moveTargets,
    abilityTargetList,
    itemTargetIds,
    onTileTap,
    onSelectHero,
    onStartAbility,
    onStartItem,
    onCancelTargeting,
    onEndTurn,
    onRestart,
    closeInspect,
  };
}
