// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ResultScreen } from "./ResultScreen";
import { createGame } from "@/engine/game";
import { level1 } from "@/engine/levels/level-1";
import { level4 } from "@/engine/levels/level-4";
import type { GameState } from "@/engine/types";
import { de } from "@/i18n/de";

afterEach(cleanup);

function withResult(state: GameState, result: GameState["result"], chaos = 1): GameState {
  return { ...state, phase: "result", result, chaos };
}

describe("result screen", () => {
  it("shows the win text, speaker quote, chaos score, and next level", () => {
    const state = withResult(createGame(level1), { outcome: "win", speakerDefId: "bunny" });
    render(<ResultScreen view={state} onRestart={vi.fn()} />);
    expect(screen.getByText(de.victoryTitle)).toBeInTheDocument();
    expect(screen.getByText(de.victoryText)).toBeInTheDocument();
    expect(screen.getByText(de.heroes.bunny.name)).toBeInTheDocument();
    expect(screen.getByText(`„${de.victoryQuotes.bunny}“`)).toBeInTheDocument();
    expect(screen.getByText(de.chaosScore(1, level1.maxChaos))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(de.nextLevel))).toBeInTheDocument();
    expect(screen.getByText(de.playAgain)).toBeInTheDocument();
  });

  it("shows the chaos defeat with a robot speaker", () => {
    const state = withResult(
      createGame(level1),
      { outcome: "loseChaos", speakerDefId: "stomper" },
      level1.maxChaos,
    );
    render(<ResultScreen view={state} onRestart={vi.fn()} />);
    expect(screen.getByText(de.defeatTitle)).toBeInTheDocument();
    expect(screen.getByText(de.defeatChaosText)).toBeInTheDocument();
    expect(screen.getByText(de.robots.stomper.name)).toBeInTheDocument();
    expect(screen.getByText(`„${de.defeatQuotes.stomper}“`)).toBeInTheDocument();
    expect(screen.queryByText(new RegExp(de.nextLevel))).not.toBeInTheDocument();
  });

  it("shows the wipe defeat text", () => {
    const state = withResult(createGame(level1), {
      outcome: "loseWipe",
      speakerDefId: "dasher",
    });
    render(<ResultScreen view={state} onRestart={vi.fn()} />);
    expect(screen.getByText(de.defeatHeroesText)).toBeInTheDocument();
  });

  it("offers no next level after the finale", () => {
    const state = withResult(createGame(level4), { outcome: "win", speakerDefId: "teddy" });
    render(<ResultScreen view={state} onRestart={vi.fn()} />);
    expect(screen.queryByText(new RegExp(de.nextLevel))).not.toBeInTheDocument();
    expect(screen.getByText(de.playAgain)).toBeInTheDocument();
  });
});
