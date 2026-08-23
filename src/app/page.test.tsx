// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import Home from "./page";
import { de } from "@/i18n/de";

afterEach(cleanup);

describe("main screen", () => {
  it("shows the animated title and tagline", () => {
    render(<Home />);
    // The title is split into per-letter spans; check a fragment.
    expect(screen.getByRole("heading", { level: 1 }).textContent?.replace(/\u00a0/g, " ")).toBe(
      de.title,
    );
    expect(screen.getByText(de.tagline)).toBeInTheDocument();
  });

  it("links to all four levels with their German names", () => {
    render(<Home />);
    for (const id of ["level-1", "level-2", "level-3", "level-4"]) {
      const link = screen.getByText(de.levels[id].name).closest("a");
      expect(link).toHaveAttribute("href", `/play/${id}`);
    }
  });

  it("shows the future meta buttons as coming soon and disabled", () => {
    render(<Home />);
    const team = screen.getByRole("button", { name: new RegExp(de.chooseTeam) });
    const settings = screen.getByRole("button", { name: new RegExp(de.settings) });
    expect(team).toBeDisabled();
    expect(settings).toBeDisabled();
    expect(screen.getAllByText(de.comingSoon)).toHaveLength(2);
  });
});
