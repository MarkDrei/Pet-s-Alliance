import type { Vec } from "@/engine";

/** Isometric tile footprint in screen pixels (SVG user units). */
export const TILE_W = 96;
export const TILE_H = 48;

/**
 * Projects grid coordinates to the screen position of the tile's center.
 * Grid x runs toward the lower right, grid y toward the lower left.
 */
export function gridToScreen(pos: Vec): { sx: number; sy: number } {
  return {
    sx: ((pos.x - pos.y) * TILE_W) / 2,
    sy: ((pos.x + pos.y) * TILE_H) / 2,
  };
}

/** Bounding box of an entire board of `size` x `size` tiles, plus headroom. */
export function boardViewBox(size: number): string {
  const minX = -((size - 1) * TILE_W) / 2 - TILE_W / 2;
  const width = size * TILE_W;
  const headroom = 84; // space above the top tile for tall sprites
  const minY = -TILE_H / 2 - headroom;
  const height = (size - 1) * TILE_H + TILE_H + headroom + 16;
  return `${minX} ${minY} ${width} ${height}`;
}

/** Corner points of a tile diamond centered on the origin. */
export function diamondPoints(scale = 1): string {
  const w = (TILE_W / 2) * scale;
  const h = (TILE_H / 2) * scale;
  return `0,${-h} ${w},0 0,${h} ${-w},0`;
}
