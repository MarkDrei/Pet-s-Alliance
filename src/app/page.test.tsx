import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { useGameStore } from "@/state/gameStore";
import TitlePage from "./page";

describe("title page", () => {
  it("shows the title and one card per level", () => {
    render(<TitlePage />);
    expect(screen.getByRole("heading", { name: "Pet's Alliance" })).toBeInTheDocument();

    expect(screen.getByText("Der Teppich")).toBeInTheDocument();
    expect(screen.getByText("Die Bücherecke")).toBeInTheDocument();
    expect(screen.getByText("Die Murmelbahn")).toBeInTheDocument();
    expect(screen.getByText("Die Schreibtisch-Festung")).toBeInTheDocument();

    const links = screen.getAllByRole("link");
    for (const link of links) {
      expect(link).toHaveAttribute("href", "/game");
    }
    expect(links).toHaveLength(4);
  });

  it("starts the chosen level when its card is clicked", async () => {
    const user = userEvent.setup();
    render(<TitlePage />);
    await user.click(screen.getByText("Die Murmelbahn"));
    expect(useGameStore.getState().game.levelId).toBe("level-3");
  });
});
