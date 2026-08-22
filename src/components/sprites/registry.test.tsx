import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Sprite, SpriteIcon } from "./registry";

describe("sprite registry", () => {
  it.each(["teddy", "bunny", "unicorn", "robot-stomper", "robot-dasher", "tower", "tower-toppled", "blocks", "tile-light", "tile-dark", "windup-key"])(
    "renders the '%s' sprite",
    (id) => {
      const { container } = render(<svg>{<Sprite id={id} />}</svg>);
      expect(container.querySelector("g, rect, polygon, circle")).not.toBeNull();
    },
  );

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
