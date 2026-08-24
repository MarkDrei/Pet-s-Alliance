import { describe, expect, it } from "vitest";
import {
  ALL_DIRS,
  axial,
  BOARD_TILES,
  columnRange,
  directionBetween,
  facingToward,
  hexDistance,
  hexEquals,
  hexKey,
  hexToPixel,
  inBoard,
  neighbor,
  neighbors,
  rotateDir,
} from "./hex";

describe("hex math", () => {
  it("computes the six flat-top neighbors", () => {
    const n = neighbors(axial(0, 0));
    expect(n).toHaveLength(6);
    expect(n).toContainEqual(axial(0, -1)); // N
    expect(n).toContainEqual(axial(1, -1)); // NE
    expect(n).toContainEqual(axial(1, 0)); // SE
    expect(n).toContainEqual(axial(0, 1)); // S
    expect(n).toContainEqual(axial(-1, 1)); // SW
    expect(n).toContainEqual(axial(-1, 0)); // NW
  });

  it("computes hex distance", () => {
    expect(hexDistance(axial(0, 0), axial(0, 0))).toBe(0);
    expect(hexDistance(axial(0, 0), axial(0, 3))).toBe(3);
    expect(hexDistance(axial(0, 0), axial(2, -1))).toBe(2);
    expect(hexDistance(axial(-4, 0), axial(4, 0))).toBe(8);
    expect(hexDistance(axial(0, -5), axial(0, 5))).toBe(10);
  });

  it("every neighbor is at distance 1", () => {
    for (const n of neighbors(axial(2, -3))) {
      expect(hexDistance(axial(2, -3), n)).toBe(1);
    }
  });

  it("rotates directions with wrap-around", () => {
    expect(rotateDir(0, 1)).toBe(1);
    expect(rotateDir(5, 1)).toBe(0);
    expect(rotateDir(0, -1)).toBe(5);
    expect(rotateDir(3, 6)).toBe(3);
  });

  it("finds the direction between adjacent hexes", () => {
    expect(directionBetween(axial(0, 0), axial(0, -1))).toBe(0);
    expect(directionBetween(axial(0, 0), axial(-1, 1))).toBe(4);
    expect(directionBetween(axial(0, 0), axial(2, 0))).toBeNull();
    expect(directionBetween(axial(0, 0), axial(0, 0))).toBeNull();
  });

  it("faces toward a target along a shortest line", () => {
    expect(facingToward(axial(0, 0), axial(0, 3))).toBe(3); // S
    expect(facingToward(axial(0, 0), axial(0, -4))).toBe(0); // N
    expect(facingToward(axial(0, 0), axial(3, -3))).toBe(1); // NE
  });

  it("breaks facing ties by direction order (first wins)", () => {
    // Target at (1, 1): SE (dist 1 -> 1) and S both shorten the distance
    // equally at some point; the first direction in order must win.
    const dir = facingToward(axial(0, 0), axial(1, 1));
    const dists = ALL_DIRS.map((d) => hexDistance(neighbor(axial(0, 0), d), axial(1, 1)));
    const min = Math.min(...dists);
    expect(dists[dir]).toBe(min);
    expect(dists.indexOf(min)).toBe(dir);
  });
});

describe("board shape", () => {
  it("has 79 tiles", () => {
    expect(BOARD_TILES).toHaveLength(79);
  });

  it("boundary files hold seven tiles each", () => {
    expect(columnRange(-4)).toEqual({ rMin: -1, rMax: 5 });
    expect(columnRange(4)).toEqual({ rMin: -5, rMax: 1 });
    expect(BOARD_TILES.filter((t) => t.q === -4)).toHaveLength(7);
    expect(BOARD_TILES.filter((t) => t.q === 4)).toHaveLength(7);
  });

  it("column heights run 7,8,9,10,11,10,9,8,7", () => {
    const heights = [];
    for (let q = -4; q <= 4; q++) {
      heights.push(BOARD_TILES.filter((t) => t.q === q).length);
    }
    expect(heights).toEqual([7, 8, 9, 10, 11, 10, 9, 8, 7]);
  });

  it("left and right boundaries are eight steps apart", () => {
    // Vertically centered tiles of both boundary files.
    expect(hexDistance(axial(-4, 2), axial(4, -2))).toBe(8);
  });

  it("continues four diagonal steps from boundary tops to the top point", () => {
    // Uppermost tile of the left file is (-4, -1); four NE steps reach (0, -5).
    let cur = axial(-4, -1);
    for (let i = 0; i < 4; i++) {
      cur = neighbor(cur, 1); // NE
      expect(inBoard(cur)).toBe(true);
    }
    expect(hexEquals(cur, axial(0, -5))).toBe(true);
    // One more step leaves the board.
    expect(inBoard(neighbor(cur, 1))).toBe(false);
  });

  it("rejects tiles outside the board", () => {
    expect(inBoard(axial(0, 0))).toBe(true);
    expect(inBoard(axial(0, -5))).toBe(true);
    expect(inBoard(axial(0, -6))).toBe(false);
    expect(inBoard(axial(5, 0))).toBe(false);
    expect(inBoard(axial(-4, -2))).toBe(false);
    expect(inBoard(axial(4, 2))).toBe(false);
  });

  it("is taller than wide in pixels (portrait board)", () => {
    const xs = BOARD_TILES.map((t) => hexToPixel(t).x);
    const ys = BOARD_TILES.map((t) => hexToPixel(t).y);
    const width = Math.max(...xs) - Math.min(...xs);
    const height = Math.max(...ys) - Math.min(...ys);
    expect(height).toBeGreaterThan(width);
  });

  it("all board tiles have unique keys", () => {
    const keys = new Set(BOARD_TILES.map(hexKey));
    expect(keys.size).toBe(BOARD_TILES.length);
  });
});
