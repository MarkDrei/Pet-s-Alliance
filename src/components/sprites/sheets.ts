/**
 * Descriptors for pixel-art sprite sheets served from `public/sprites/`.
 *
 * A sheet is a grid of equally sized square frames. `anchorX`/`anchorY` are
 * measured in source pixels and mark the spot of a frame that sits on the tile
 * center: horizontally the middle of the figure, vertically its ground line.
 * `scale` converts source pixels into SVG user units (tile footprint 96x48),
 * so a figure ends up roughly as tall as the drawn placeholders.
 */
export type SpriteSheet = {
  href: string;
  /** Edge length of one square frame in source pixels. */
  frame: number;
  widthPx: number;
  heightPx: number;
  anchorX: number;
  anchorY: number;
  scale: number;
};

/**
 * Bunny walk cycle: four rows of facings, four columns of walk frames. Row 0 is
 * the front view and column 0 works as the standing pose, which is all the
 * board needs while units have no facing or step animation.
 */
export const BUNNY_WALK: SpriteSheet = {
  href: "/sprites/heroes/bunny-walk.png",
  frame: 48,
  widthPx: 192,
  heightPx: 192,
  anchorX: 23,
  anchorY: 43,
  scale: 1.46,
};

/** Frame of a sheet that represents a unit standing still, facing the camera. */
export const IDLE_FRAME = { row: 0, col: 0 } as const;
