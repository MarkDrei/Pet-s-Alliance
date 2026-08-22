import type { Direction, Vec } from "./types";

export const DIRECTIONS: Record<Direction, Vec> = {
  north: { x: 0, y: -1 },
  east: { x: 1, y: 0 },
  south: { x: 0, y: 1 },
  west: { x: -1, y: 0 },
};

export const ALL_DIRECTIONS: Direction[] = ["north", "east", "south", "west"];

export const CLOCKWISE: Record<Direction, Direction> = {
  north: "east",
  east: "south",
  south: "west",
  west: "north",
};

export function vec(x: number, y: number): Vec {
  return { x, y };
}

export function vecEquals(a: Vec, b: Vec): boolean {
  return a.x === b.x && a.y === b.y;
}

export function vecAdd(a: Vec, b: Vec): Vec {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function vecScale(a: Vec, s: number): Vec {
  return { x: a.x * s, y: a.y * s };
}

export function vecKey(v: Vec): string {
  return `${v.x},${v.y}`;
}

export function inBounds(v: Vec, size: number): boolean {
  return v.x >= 0 && v.x < size && v.y >= 0 && v.y < size;
}

export function manhattan(a: Vec, b: Vec): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function isOrthogonallyAdjacent(a: Vec, b: Vec): boolean {
  return manhattan(a, b) === 1;
}

export function neighbors(v: Vec, size: number): Vec[] {
  return ALL_DIRECTIONS.map((d) => vecAdd(v, DIRECTIONS[d])).filter((n) =>
    inBounds(n, size),
  );
}

/** Direction from `a` to an orthogonally adjacent tile `b`, or null. */
export function directionFromTo(a: Vec, b: Vec): Direction | null {
  for (const d of ALL_DIRECTIONS) {
    if (vecEquals(vecAdd(a, DIRECTIONS[d]), b)) return d;
  }
  return null;
}
