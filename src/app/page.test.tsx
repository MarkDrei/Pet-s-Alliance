import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TitlePage from "./page";

describe("title page", () => {
  it("shows the title and a link into the game", () => {
    render(<TitlePage />);
    expect(screen.getByRole("heading", { name: "Pet's Alliance" })).toBeInTheDocument();
    const playLink = screen.getByRole("link", { name: "Spielen" });
    expect(playLink).toHaveAttribute("href", "/game");
  });
});
