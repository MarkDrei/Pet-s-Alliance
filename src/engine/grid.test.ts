import { describe, expect, it } from "vitest";
import { CLOCKWISE, directionFromTo, inBounds, manhattan, neighbors, vec } from "./grid";

describe("grid", () => {
  it("checks bounds of an 8x8 board", () => {
    expect(inBounds(vec(0, 0), 8)).toBe(true);
    expect(inBounds(vec(7, 7), 8)).toBe(true);
    expect(inBounds(vec(-1, 0), 8)).toBe(false);
    expect(inBounds(vec(0, 8), 8)).toBe(false);
  });

  it("computes manhattan distance", () => {
    expect(manhattan(vec(1, 1), vec(4, 3))).toBe(5);
    expect(manhattan(vec(2, 2), vec(2, 2))).toBe(0);
  });

  it("finds orthogonal neighbors inside the board", () => {
    expect(neighbors(vec(0, 0), 8)).toHaveLength(2);
    expect(neighbors(vec(3, 3), 8)).toHaveLength(4);
  });

  it("derives the direction between adjacent tiles", () => {
    expect(directionFromTo(vec(2, 2), vec(2, 1))).toBe("north");
    expect(directionFromTo(vec(2, 2), vec(3, 2))).toBe("east");
    expect(directionFromTo(vec(2, 2), vec(4, 2))).toBeNull();
  });

  it("rotates directions clockwise", () => {
    expect(CLOCKWISE.north).toBe("east");
    expect(CLOCKWISE.west).toBe("north");
  });
});
