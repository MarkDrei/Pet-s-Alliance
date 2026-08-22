import type { Vec } from "@/engine";

/** Isometric tile footprint in screen pixels (SVG user units), at rotation 0. */
export const TILE_W = 96;
export const TILE_H = 48;

/**
 * Rigid rotation of the projected board picture, in radians. 0 is the
 * classic corner-on diamond. Because the whole picture is rotated (not the
 * ground plane before the iso squash), tiles stay perfectly symmetric 2:1
 * diamonds and all grid lines stay parallel — nothing gets skewed.
 * `-Math.atan2(TILE_H, TILE_W)` would turn the view exactly far enough that
 * the back row (grid y = 0) runs horizontally left-to-right.
 */
export const BOARD_ROTATION_RAD = 0;

const cos = Math.cos(BOARD_ROTATION_RAD);
const sin = Math.sin(BOARD_ROTATION_RAD);

function rotated(x: number, y: number): { x: number; y: number } {
  return { x: x * cos - y * sin, y: x * sin + y * cos };
}

/**
 * Screen vector of one step along grid +x / +y. Everything on the board
 * (tile shapes, positions, ground markings) derives from these two axes, so
 * changing BOARD_ROTATION_RAD re-orients the whole view. Sprites are
 * billboards anchored at the projected tile center and stay upright.
 */
export const AXIS_X = rotated(TILE_W / 2, TILE_H / 2);
export const AXIS_Y = rotated(-TILE_W / 2, TILE_H / 2);

/** Projects grid coordinates to the screen position of the tile's center. */
export function gridToScreen(pos: Vec): { sx: number; sy: number } {
  return {
    sx: pos.x * AXIS_X.x + pos.y * AXIS_Y.x,
    sy: pos.x * AXIS_X.y + pos.y * AXIS_Y.y,
  };
}

/** Bounding box of an entire board of `size` x `size` tiles, plus headroom. */
export function boardViewBox(size: number): string {
  const corners = [
    { x: -0.5, y: -0.5 },
    { x: size - 0.5, y: -0.5 },
    { x: -0.5, y: size - 0.5 },
    { x: size - 0.5, y: size - 0.5 },
  ].map(gridToScreen);
  const minX = Math.min(...corners.map((c) => c.sx));
  const maxX = Math.max(...corners.map((c) => c.sx));
  const minY = Math.min(...corners.map((c) => c.sy));
  const maxY = Math.max(...corners.map((c) => c.sy));
  const headroom = 84; // space above the back tiles for tall sprites
  return `${minX} ${minY - headroom} ${maxX - minX} ${maxY - minY + headroom + 16}`;
}

/** Corner points of a tile (rhombus on the rotated ground) centered on origin. */
export function diamondPoints(scale = 1): string {
  const corners = [
    { x: -(AXIS_X.x + AXIS_Y.x) / 2, y: -(AXIS_X.y + AXIS_Y.y) / 2 },
    { x: (AXIS_X.x - AXIS_Y.x) / 2, y: (AXIS_X.y - AXIS_Y.y) / 2 },
    { x: (AXIS_X.x + AXIS_Y.x) / 2, y: (AXIS_X.y + AXIS_Y.y) / 2 },
    { x: (AXIS_Y.x - AXIS_X.x) / 2, y: (AXIS_Y.y - AXIS_X.y) / 2 },
  ];
  return corners.map((c) => `${c.x * scale},${c.y * scale}`).join(" ");
}
