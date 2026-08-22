import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { publicUrl } from "@/assetUrl";
import { Sprite, SpriteIcon } from "./registry";

describe("sprite registry", () => {
  it.each(["teddy", "bunny", "unicorn", "robot-stomper", "robot-dasher", "tower", "tower-toppled", "blocks", "tile-light", "tile-dark", "windup-key"])(
    "renders the '%s' sprite",
    (id) => {
      const { container } = render(<svg>{<Sprite id={id} />}</svg>);
      expect(container.querySelector("g, rect, polygon, circle")).not.toBeNull();
    },
  );

  it.each([
    ["bunny", "/sprites/heroes/bunny.png", "0 0 128 128"],
    ["teddy", "/sprites/heroes/teddy.png", "0 0 256 256"],
  ])("renders the %s from its sprite image, cropped to the idle frame", (id, file, viewBox) => {
    const { container } = render(<svg>{<Sprite id={id} />}</svg>);
    expect(container.querySelector("image")).toHaveAttribute("href", publicUrl(file));
    expect(container.querySelector("svg svg")).toHaveAttribute("viewBox", viewBox);
  });

  it("renders a magenta placeholder for unknown ids", () => {
    const { container } = render(<svg>{<Sprite id="does-not-exist" />}</svg>);
    const rect = container.querySelector("rect");
    expect(rect).toHaveAttribute("fill", "#ff00ff");
  });

  it("wraps sprites in a standalone svg icon", () => {
    const { container } = render(<SpriteIcon id="teddy" size={32} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "32");
  });
});
