import { act } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "@/state/gameStore";
import { GameScreen } from "./GameScreen";

describe("GameScreen", () => {
  beforeEach(() => {
    useGameStore.getState().restart();
  });

  it("shows the round counter, objective and end-turn button", () => {
    render(<GameScreen />);
    expect(screen.getByText("Runde 1 von 5")).toBeInTheDocument();
    expect(screen.getByText("Haltet 5 Runden durch!")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Zug beenden" })).toBeInTheDocument();
  });

  it("shows plushie stats and ability explanation when a plushie is selected", () => {
    render(<GameScreen />);
    const teddy = useGameStore.getState().game.heroes[0];
    act(() => useGameStore.getState().selectHero(teddy.id));

    expect(screen.getByText("Teddybär")).toBeInTheDocument();
    expect(screen.getByText("Bewegung 3")).toBeInTheDocument();
    expect(screen.getByText("Wegschubsen:")).toBeInTheDocument();
    expect(screen.getByText(/Schubst einen Roboter nebenan ein Feld weg/)).toBeInTheDocument();
  });

  it("shows robot stats and behavior rules when a robot is tapped", () => {
    render(<GameScreen />);
    const stomper = useGameStore.getState().game.robots[0];
    act(() => useGameStore.getState().tileClicked(stomper.pos));

    expect(screen.getByText("Stampfer")).toBeInTheDocument();
    expect(screen.getByText("Bewegung 2 · Schaden 1")).toBeInTheDocument();
    expect(screen.getByText(/geraden Linie auf den nächsten Turm/)).toBeInTheDocument();
    expect(screen.getByText(/wie ein Turm beim Schach/)).toBeInTheDocument();
  });

  it("advances to the next round when the turn ends", async () => {
    const user = userEvent.setup();
    render(<GameScreen />);
    await user.click(screen.getByRole("button", { name: "Zug beenden" }));
    expect(screen.getByText("Runde 2 von 5")).toBeInTheDocument();
  });

  it("plays a full run to its conclusion", async () => {
    const user = userEvent.setup();
    render(<GameScreen />);
    const endTurn = screen.getByRole("button", { name: "Zug beenden" });
    for (let i = 0; i < 5; i++) {
      const { game } = useGameStore.getState();
      if (game.phase !== "playerTurn") break;
      await user.click(endTurn);
    }
    const { game } = useGameStore.getState();
    expect(["victory", "defeat"]).toContain(game.phase);
    // Doing nothing lets the robots topple towers or exhaust the plushies.
    expect(screen.getByText(/Geschafft!|Oh nein!/)).toBeInTheDocument();
  });
});
