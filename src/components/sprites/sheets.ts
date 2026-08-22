import { publicUrl } from "@/assetUrl";

/**
 * Descriptors for the pixel-art images served from `public/sprites/`.
 *
 * An image is treated as a grid of equally sized square frames; a single still
 * sprite is simply a one-frame grid. `anchorX`/`anchorY` are measured in source
 * pixels and mark the spot of a frame that sits on the tile center: horizontally
 * the middle of the figure, vertically its ground line. `scale` converts source
 * pixels into SVG user units (tile footprint 96x48), so a figure ends up roughly
 * as tall as the drawn placeholders.
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
  /**
   * `pixelated` keeps hard pixel edges and suits art drawn at (or below) its
   * display size. Sources noticeably larger than their display size look better
   * `smooth`, because nearest-neighbour would drop pixels and make small
   * details like eyes flicker.
   */
  rendering?: "pixelated" | "smooth";
};

/** Standing bunny hero, a single frame. */
export const BUNNY: SpriteSheet = {
  href: publicUrl("/sprites/heroes/bunny.png"),
  frame: 128,
  widthPx: 128,
  heightPx: 128,
  anchorX: 63.5,
  anchorY: 120,
  scale: 0.474,
  rendering: "smooth",
};

/** Frame of a sheet that represents a unit standing still, facing the camera. */
export const IDLE_FRAME = { row: 0, col: 0 } as const;
