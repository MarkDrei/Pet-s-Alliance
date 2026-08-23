/**
 * Flat-top hexagon math on axial coordinates (q = column, r = axial row).
 *
 * The board uses flat-top hexes: flat sides face up and down, points face
 * left and right. Columns ("files") are staggered vertically. Pixel
 * projection (size 1): x = 1.5 * q, y = sqrt(3) * (r + q / 2).
 */

export interface Axial {
  readonly q: number;
  readonly r: number;
}

/** 0..5 index into {@link DIRECTIONS}. */
export type Dir = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * The six edge directions of a flat-top hex, clockwise starting north.
 * This fixed order is also the deterministic tie-break order used by
 * robot planning ("first direction wins").
 */
export const DIRECTIONS: readonly Axial[] = [
  { q: 0, r: -1 }, // N
  { q: 1, r: -1 }, // NE
  { q: 1, r: 0 }, // SE
  { q: 0, r: 1 }, // S
  { q: -1, r: 1 }, // SW
  { q: -1, r: 0 }, // NW
];

export const DIR_NAMES = ["N", "NE", "SE", "S", "SW", "NW"] as const;

export const ALL_DIRS: readonly Dir[] = [0, 1, 2, 3, 4, 5];

export function axial(q: number, r: number): Axial {
  return { q, r };
}

export function hexKey(h: Axial): string {
  return `${h.q},${h.r}`;
}

export function hexEquals(a: Axial, b: Axial): boolean {
  return a.q === b.q && a.r === b.r;
}

export function hexAdd(a: Axial, b: Axial): Axial {
  return { q: a.q + b.q, r: a.r + b.r };
}

export function neighbor(h: Axial, dir: Dir): Axial {
  return hexAdd(h, DIRECTIONS[dir]);
}

export function neighbors(h: Axial): Axial[] {
  return DIRECTIONS.map((d) => hexAdd(h, d));
}

/** Hex distance in steps between two axial coordinates. */
export function hexDistance(a: Axial, b: Axial): number {
  const dq = a.q - b.q;
  const dr = a.r - b.r;
  return (Math.abs(dq) + Math.abs(dr) + Math.abs(dq + dr)) / 2;
}

/** Rotate a direction clockwise by `by` sixths (may be negative). */
export function rotateDir(dir: Dir, by: number): Dir {
  return ((((dir + by) % 6) + 6) % 6) as Dir;
}

/**
 * Direction from `a` to an adjacent hex `b`, or null when not adjacent.
 */
export function directionBetween(a: Axial, b: Axial): Dir | null {
  for (const d of ALL_DIRS) {
    if (hexEquals(neighbor(a, d), b)) return d;
  }
  return null;
}

/**
 * Facing from `from` toward `target`: the first hex step on a shortest
 * line. Ties resolve in {@link DIRECTIONS} order (first wins), matching
 * the planning rules in doc/game-mechanics.md.
 */
export function facingToward(from: Axial, target: Axial): Dir {
  let best: Dir = 0;
  let bestDist = Infinity;
  for (const d of ALL_DIRS) {
    const dist = hexDistance(neighbor(from, d), target);
    if (dist < bestDist) {
      bestDist = dist;
      best = d;
    }
  }
  return best;
}

/**
 * Board shape (see doc/game-mechanics.md "Grid, occupancy, and movement"):
 * left and right boundary files of 7 tiles, 8 hex steps apart, with four
 * diagonal steps from each boundary end toward the top and bottom points.
 * That is the hexagon q in [-4, 4], r in [max(-5, -5 - q), min(5, 5 - q)]
 * — 79 tiles, taller than wide, made for a portrait screen.
 */
export const BOARD_MIN_Q = -4;
export const BOARD_MAX_Q = 4;

export function columnRange(q: number): { rMin: number; rMax: number } {
  return { rMin: Math.max(-5, -5 - q), rMax: Math.min(5, 5 - q) };
}

export const BOARD_TILES: readonly Axial[] = (() => {
  const tiles: Axial[] = [];
  for (let q = BOARD_MIN_Q; q <= BOARD_MAX_Q; q++) {
    const { rMin, rMax } = columnRange(q);
    for (let r = rMin; r <= rMax; r++) tiles.push({ q, r });
  }
  return tiles;
})();

const BOARD_KEY_SET: ReadonlySet<string> = new Set(BOARD_TILES.map(hexKey));

export function inBoard(h: Axial): boolean {
  return BOARD_KEY_SET.has(hexKey(h));
}

/** Pixel center of a hex for a flat-top layout with hex size 1. */
export function hexToPixel(h: Axial): { x: number; y: number } {
  return { x: 1.5 * h.q, y: Math.sqrt(3) * (h.r + h.q / 2) };
}
