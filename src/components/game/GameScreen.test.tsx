// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { GameScreen } from "./GameScreen";
import { level1 } from "@/engine/levels/level-1";
import { de } from "@/i18n/de";

afterEach(cleanup);

describe("game screen", () => {
  it("renders HUD, board, roster, and items for level 1", () => {
    render(<GameScreen level={level1} />);
    expect(screen.getByText(de.levels["level-1"].name)).toBeInTheDocument();
    expect(screen.getByText(de.round(1, level1.rounds))).toBeInTheDocument();
    expect(screen.getByText(de.objective(level1.rounds))).toBeInTheDocument();
    expect(screen.getByText(de.chaos)).toBeInTheDocument();
    // Roster chips for all three plushies.
    expect(screen.getByAltText(de.heroes.teddy.name)).toBeInTheDocument();
    expect(screen.getByAltText(de.heroes.bunny.name)).toBeInTheDocument();
    expect(screen.getByAltText(de.heroes.unicorn.name)).toBeInTheDocument();
    // Wind-up key present, cannonball withheld in level 1.
    expect(screen.getByTitle(de.items["windup-key"].name)).toBeInTheDocument();
    expect(screen.queryByTitle(de.items.cannonball.name)).not.toBeInTheDocument();
    // End turn ready.
    expect(screen.getByText("Zug")).toBeInTheDocument();
    // Initial hint in the ticker.
    expect(screen.getByText(de.selectHint)).toBeInTheDocument();
  });

  it("selecting a hero offers its ability and inspect details", () => {
    render(<GameScreen level={level1} />);
    const chip = screen.getByAltText(de.heroes.teddy.name).closest("button")!;
    fireEvent.click(chip);
    // Ability popup on the chip.
    expect(screen.getByText(`✨ ${de.heroes.teddy.ability}`)).toBeInTheDocument();
    // Inspect panel with the hero description.
    expect(screen.getByText(de.heroes.teddy.description)).toBeInTheDocument();
    expect(screen.getByText(de.inspect.canStillMove)).toBeInTheDocument();
  });

  it("starting the ability shows the German target hint", () => {
    render(<GameScreen level={level1} />);
    fireEvent.click(screen.getByAltText(de.heroes.teddy.name).closest("button")!);
    fireEvent.click(screen.getByText(`✨ ${de.heroes.teddy.ability}`));
    expect(screen.getByText(de.targetHint.push)).toBeInTheDocument();
  });

  it("shows the cannonball in level 4", () => {
    render(<GameScreen level={{ ...level1, items: ["windup-key", "cannonball"] }} />);
    expect(screen.getByTitle(de.items.cannonball.name)).toBeInTheDocument();
  });

  it("positions every piece on its own tile", () => {
    const { container } = render(<GameScreen level={level1} />);
    const positioned = [...container.querySelectorAll("g")].filter((g) =>
      g.style.transform.includes("translate"),
    );
    // Level 1: 3 heroes + 2 robots + 5 props.
    expect(positioned).toHaveLength(10);
    const transforms = positioned.map((g) => g.style.transform);
    expect(new Set(transforms).size).toBe(10);
    for (const g of positioned) {
      // A CSS animation on the same element would override the inline
      // position transform (all pieces would collapse onto one tile).
      expect(g.getAttribute("class") ?? "").not.toContain("animate-");
    }
  });
});
