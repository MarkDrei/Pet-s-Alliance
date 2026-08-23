import { BOARD_TILES, hexToPixel, type Axial } from "@/engine/hex";

/** Hex size (center-to-corner) in SVG viewBox units. */
export const HEX = 34;

export function tileCenter(h: Axial): { x: number; y: number } {
  const p = hexToPixel(h);
  return { x: p.x * HEX, y: p.y * HEX };
}

/** Polygon points for a flat-top hex at `h`, scaled by `inset` (0..1). */
export function tilePoints(h: Axial, inset = 1): string {
  const { x, y } = tileCenter(h);
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    pts.push(
      `${(x + Math.cos(angle) * HEX * inset).toFixed(1)},${(y + Math.sin(angle) * HEX * inset).toFixed(1)}`,
    );
  }
  return pts.join(" ");
}

export const VIEW_RECT = (() => {
  const xs = BOARD_TILES.map((t) => tileCenter(t).x);
  const ys = BOARD_TILES.map((t) => tileCenter(t).y);
  const pad = HEX + 14;
  const minX = Math.min(...xs) - pad;
  const maxX = Math.max(...xs) + pad;
  const minY = Math.min(...ys) - pad;
  const maxY = Math.max(...ys) + pad;
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
})();

export const VIEW_BOX = `${VIEW_RECT.x} ${VIEW_RECT.y} ${VIEW_RECT.width} ${VIEW_RECT.height}`;
