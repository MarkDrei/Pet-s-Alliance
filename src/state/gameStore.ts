import { create } from "zustand";
import {
  abilityTargets,
  createGame,
  endPlayerTurn,
  heroAt,
  moveHero,
  reachableTiles,
  robotAt,
  applyAbility,
  applyItem,
  vecEquals,
  type GameState,
  type Vec,
} from "@/engine";
import { CONTENT, LEVEL_1 } from "@/content";

export type InteractionMode = "idle" | "move" | "ability" | "item";

export interface GameStore {
  game: GameState;
  selectedHeroId: string | null;
  /** Robot selected for inspection (shows stats and behavior in the HUD). */
  selectedRobotId: string | null;
  mode: InteractionMode;
  selectHero: (heroId: string) => void;
  setMode: (mode: InteractionMode) => void;
  tileClicked: (pos: Vec) => void;
  endTurn: () => void;
  restart: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  game: createGame(CONTENT, LEVEL_1),
  selectedHeroId: null,
  selectedRobotId: null,
  mode: "idle",

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
    const { game, mode, selectedHeroId } = get();
    if (game.phase !== "playerTurn") return;

    const tappedHero = heroAt(game, pos);

    if (mode === "move" && selectedHeroId) {
      const hero = game.heroes.find((h) => h.id === selectedHeroId)!;
      if (reachableTiles(CONTENT, game, hero).some((t) => vecEquals(t, pos))) {
        set({ game: moveHero(CONTENT, game, selectedHeroId, pos), mode: "idle" });
        return;
      }
    }

    if (mode === "ability" && selectedHeroId) {
      if (abilityTargets(CONTENT, game, selectedHeroId).some((t) => vecEquals(t, pos))) {
        set({ game: applyAbility(CONTENT, game, selectedHeroId, pos), mode: "idle" });
        return;
      }
    }

    if (mode === "item") {
      if (robotAt(game, pos)) {
        const itemIndex = game.items.findIndex((i) => !i.used);
        if (itemIndex >= 0) {
          set({ game: applyItem(game, itemIndex, pos), mode: "idle" });
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

  endTurn: () => {
    set({
      game: endPlayerTurn(CONTENT, get().game),
      selectedHeroId: null,
      selectedRobotId: null,
      mode: "idle",
    });
  },

  restart: () => {
    set({
      game: createGame(CONTENT, LEVEL_1),
      selectedHeroId: null,
      selectedRobotId: null,
      mode: "idle",
    });
  },
}));

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
