import { describe, expect, it } from "vitest";
import { hexDistance, hexEquals, type Axial } from "./hex";
import {
  abilityTargets,
  endTurn,
  itemTargets,
  moveHero,
  stepExecution,
  applyAbility,
  applyItem,
  createGame,
} from "./game";
import { heroMoveTargets } from "./movement";
import { previewIntent } from "./planning";
import { HERO_DEFS, isToppleable } from "./defs";
import { LEVELS } from "./levels";
import type { GameState } from "./types";
import { fixedRng } from "@/test/fixtures";

/**
 * Greedy policy: wind up the most dangerous robot, push/nudge adjacent
 * robots, shield threatened props, and walk plushies toward the action.
 */
function playRound(state: GameState): GameState {
  let s = state;

  const threatened = (st: GameState): string | null => {
    for (const r of st.robots) {
      if (r.removed || r.stunned || !r.intent?.attacks) continue;
      const prev = previewIntent(st, r);
      for (const tile of prev.attack) {
        const prop = st.props.find(
          (p) => !p.toppled && isToppleable(p.defId) && hexEquals(p.pos, tile),
        );
        if (prop) return r.id;
      }
    }
    return null;
  };

  // Wind-up key on a robot about to topple something.
  const danger = threatened(s);
  if (danger && itemTargets(s, "windup-key").includes(danger)) {
    s = applyItem(s, "windup-key", danger).state;
  }

  for (const hero of s.heroes) {
    if (hero.down) continue;
    const cur = () => s.heroes.find((h) => h.id === hero.id)!;

    // Ability first when something is in range.
    const targets = abilityTargets(s, hero.id);
    const ability = HERO_DEFS[hero.defId].ability;
    if (targets.length > 0 && !cur().hasActed) {
      if (ability === "push" || ability === "nudge") {
        // Prefer a robot that still threatens a prop.
        const pick =
          targets.find((t) => t.kind === "robot" && t.robotId === threatened(s)) ?? targets[0];
        s = applyAbility(s, hero.id, pick).state;
        continue;
      }
      if (ability === "shield") {
        const dangerId = threatened(s);
        if (dangerId) {
          const robot = s.robots.find((r) => r.id === dangerId)!;
          const prev = previewIntent(s, robot);
          const prop = s.props.find(
            (p) =>
              !p.toppled &&
              isToppleable(p.defId) &&
              !p.shielded &&
              prev.attack.some((t) => hexEquals(t, p.pos)),
          );
          const target = targets.find((t) => t.kind === "prop" && prop && t.propId === prop.id);
          if (target) {
            s = applyAbility(s, hero.id, target).state;
            continue;
          }
        }
      }
    }

    // Otherwise walk toward the nearest live robot.
    const moves = heroMoveTargets(s, cur());
    const robots = s.robots.filter((r) => !r.removed);
    if (moves.length > 0 && robots.length > 0) {
      const score = (t: Axial) => Math.min(...robots.map((r) => hexDistance(t, r.pos)));
      let best = moves[0];
      for (const m of moves) if (score(m) < score(best)) best = m;
      if (score(best) < score(cur().pos)) {
        s = moveHero(s, hero.id, best).state;
      }
    }

    // Ability again after moving (push/nudge may now be in range).
    const after = abilityTargets(s, hero.id);
    if (after.length > 0 && !cur().hasActed && (ability === "push" || ability === "nudge")) {
      const pick = after.find((t) => t.kind === "robot" && t.robotId === threatened(s)) ?? after[0];
      s = applyAbility(s, hero.id, pick).state;
    }
  }

  s = endTurn(s).state;
  while (s.phase === "execution") {
    s = stepExecution(s, fixedRng()).state;
  }
  return s;
}

describe("level balance", () => {
  // Together with the passive-play checks in levels.test.ts this pins the
  // difficulty window: doing nothing loses, playing sensibly wins.
  it.each(LEVELS.map((l) => [l.id, l] as const))(
    "%s is winnable with simple sensible play",
    (_id, level) => {
      let s = createGame(level);
      for (let i = 0; i < level.rounds + 1 && s.phase === "player"; i++) {
        s = playRound(s);
      }
      expect(s.phase).toBe("result");
      expect(s.result?.outcome).toBe("win");
    },
  );
});
