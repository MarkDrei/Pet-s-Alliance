import type { ReactElement } from "react";
import { diamondPoints } from "@/components/board/iso";
import { BUNNY_WALK, IDLE_FRAME, type SpriteSheet } from "./sheets";

/**
 * All visuals are looked up here by id. Today every id maps to a hand-drawn
 * SVG placeholder; later each can map to a sprite image component without
 * touching board or game code.
 *
 * Convention: every sprite renders into a `<g>` whose origin is the CENTER of
 * the tile it stands on. Standing sprites extend upward (negative y).
 */

function Shadow({ rx = 20 }: { rx?: number }) {
  return <ellipse cx={0} cy={2} rx={rx} ry={rx * 0.38} fill="#1a1433" opacity={0.28} />;
}

/**
 * Draws one frame of a sprite sheet, anchored like the drawn placeholders. The
 * nested `<svg>` crops the sheet to the frame, so switching frames later is a
 * matter of passing different grid coordinates.
 */
function SheetSprite({
  sheet,
  row = IDLE_FRAME.row,
  col = IDLE_FRAME.col,
  shadowRx,
}: {
  sheet: SpriteSheet;
  row?: number;
  col?: number;
  shadowRx: number;
}) {
  const size = sheet.frame * sheet.scale;
  return (
    <g>
      <Shadow rx={shadowRx} />
      <svg
        x={-sheet.anchorX * sheet.scale}
        y={-sheet.anchorY * sheet.scale}
        width={size}
        height={size}
        viewBox={`${col * sheet.frame} ${row * sheet.frame} ${sheet.frame} ${sheet.frame}`}
      >
        <image
          href={sheet.href}
          width={sheet.widthPx}
          height={sheet.heightPx}
          style={{ imageRendering: "pixelated" }}
        />
      </svg>
    </g>
  );
}

// ---------------------------------------------------------------------------
// Tiles
// ---------------------------------------------------------------------------

function TileLight() {
  return (
    <g>
      <polygon points={diamondPoints()} fill="#8b9dd4" stroke="#6c7db3" strokeWidth={1} />
      <polygon points={diamondPoints(0.8)} fill="none" stroke="#ffffff" strokeWidth={1} opacity={0.09} />
    </g>
  );
}

function TileDark() {
  return (
    <g>
      <polygon points={diamondPoints()} fill="#7c8fc9" stroke="#6c7db3" strokeWidth={1} />
      <polygon points={diamondPoints(0.8)} fill="none" stroke="#ffffff" strokeWidth={1} opacity={0.07} />
    </g>
  );
}

// ---------------------------------------------------------------------------
// Heroes
// ---------------------------------------------------------------------------

function Teddy() {
  return (
    <g>
      <Shadow rx={19} />
      {/* legs */}
      <ellipse cx={-8} cy={-4} rx={6.5} ry={5} fill="#96613c" stroke="#6e4527" strokeWidth={1.2} />
      <ellipse cx={8} cy={-4} rx={6.5} ry={5} fill="#96613c" stroke="#6e4527" strokeWidth={1.2} />
      {/* body */}
      <ellipse cx={0} cy={-18} rx={15} ry={14.5} fill="#b07b4f" stroke="#7c5233" strokeWidth={1.5} />
      <ellipse cx={0} cy={-15} rx={9} ry={8.5} fill="#e3c095" />
      {/* arms */}
      <circle cx={-14.5} cy={-21} r={5.5} fill="#a9744a" stroke="#7c5233" strokeWidth={1.2} />
      <circle cx={14.5} cy={-21} r={5.5} fill="#a9744a" stroke="#7c5233" strokeWidth={1.2} />
      {/* head */}
      <circle cx={0} cy={-40} r={12.5} fill="#b07b4f" stroke="#7c5233" strokeWidth={1.5} />
      <circle cx={-9.5} cy={-49.5} r={5} fill="#b07b4f" stroke="#7c5233" strokeWidth={1.2} />
      <circle cx={9.5} cy={-49.5} r={5} fill="#b07b4f" stroke="#7c5233" strokeWidth={1.2} />
      <circle cx={-9.5} cy={-49.5} r={2.3} fill="#e3c095" />
      <circle cx={9.5} cy={-49.5} r={2.3} fill="#e3c095" />
      {/* face */}
      <ellipse cx={0} cy={-36} rx={6.5} ry={5.5} fill="#e3c095" />
      <ellipse cx={0} cy={-38.5} rx={2.6} ry={2} fill="#4a3220" />
      <circle cx={-4.8} cy={-43} r={1.7} fill="#33241a" />
      <circle cx={4.8} cy={-43} r={1.7} fill="#33241a" />
      {/* red scarf */}
      <path d="M -11 -29 Q 0 -24 11 -29 L 10 -25 Q 0 -20.5 -10 -25 Z" fill="#d9534f" stroke="#a83c39" strokeWidth={1} />
    </g>
  );
}

function Bunny() {
  return <SheetSprite sheet={BUNNY_WALK} shadowRx={14} />;
}

function Unicorn() {
  return (
    <g>
      <Shadow rx={17} />
      {/* legs */}
      <rect x={-11} y={-8} width={5} height={8} rx={2} fill="#f3eef7" stroke="#c9b8d8" strokeWidth={1.1} />
      <rect x={6} y={-8} width={5} height={8} rx={2} fill="#f3eef7" stroke="#c9b8d8" strokeWidth={1.1} />
      {/* body */}
      <ellipse cx={0} cy={-16} rx={13.5} ry={11} fill="#fdfbff" stroke="#c9b8d8" strokeWidth={1.5} />
      {/* rainbow tail */}
      <path d="M 12 -18 Q 20 -16 17 -8" stroke="#f19ad2" strokeWidth={2.4} fill="none" />
      <path d="M 12.5 -15.5 Q 18.5 -13.5 15.5 -8" stroke="#a58bf2" strokeWidth={2.4} fill="none" />
      <path d="M 12.5 -13 Q 16.5 -11 14 -7.5" stroke="#7fd1f0" strokeWidth={2.4} fill="none" />
      {/* head */}
      <circle cx={-1} cy={-35} r={9.5} fill="#fdfbff" stroke="#c9b8d8" strokeWidth={1.5} />
      {/* horn */}
      <polygon points="-3.6,-42.5 2.6,-42.5 -0.5,-57" fill="#f6c453" stroke="#d9a63e" strokeWidth={1.1} />
      <path d="M -2.8 -46 L 1.9 -47.5 M -2 -50 L 1.2 -51.5" stroke="#d9a63e" strokeWidth={0.9} />
      {/* mane */}
      <circle cx={-9.5} cy={-41} r={4} fill="#f19ad2" />
      <circle cx={-11.5} cy={-35} r={3.6} fill="#a58bf2" />
      <circle cx={-11} cy={-29} r={3.3} fill="#7fd1f0" />
      {/* face */}
      <circle cx={-3.5} cy={-37} r={1.6} fill="#4d4358" />
      <circle cx={3} cy={-37} r={1.6} fill="#4d4358" />
      <ellipse cx={0} cy={-31.5} rx={3.6} ry={2.6} fill="#f7d7e3" />
    </g>
  );
}

// ---------------------------------------------------------------------------
// Robots
// ---------------------------------------------------------------------------

function RedEye({ cx, cy, r = 2.8 }: { cx: number; cy: number; r?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r * 1.9} fill="#ff4b4b" opacity={0.3} />
      <circle cx={cx} cy={cy} r={r} fill="#ff4b4b" />
      <circle cx={cx - r * 0.3} cy={cy - r * 0.3} r={r * 0.35} fill="#ffd2d2" />
    </g>
  );
}

function RobotStomper() {
  return (
    <g>
      <Shadow rx={18} />
      {/* stompy feet */}
      <rect x={-13} y={-7} width={10} height={7} rx={1.5} fill="#525b6b" stroke="#3a414d" strokeWidth={1.2} />
      <rect x={3} y={-7} width={10} height={7} rx={1.5} fill="#525b6b" stroke="#3a414d" strokeWidth={1.2} />
      {/* body */}
      <rect x={-13.5} y={-31} width={27} height={24} rx={3} fill="#8b95a7" stroke="#525b6b" strokeWidth={1.5} />
      <rect x={-9} y={-27} width={18} height={10} rx={2} fill="#a7b1c2" />
      <circle cx={-10} cy={-10.5} r={1.4} fill="#525b6b" />
      <circle cx={10} cy={-10.5} r={1.4} fill="#525b6b" />
      <rect x={-6} y={-14} width={12} height={3.5} rx={1.5} fill="#f2c14e" stroke="#b58f33" strokeWidth={0.8} />
      {/* arms */}
      <rect x={-19} y={-27} width={5.5} height={14} rx={2.5} fill="#6f7a8e" stroke="#525b6b" strokeWidth={1.2} />
      <rect x={13.5} y={-27} width={5.5} height={14} rx={2.5} fill="#6f7a8e" stroke="#525b6b" strokeWidth={1.2} />
      {/* head */}
      <rect x={-10} y={-46} width={20} height={15} rx={3} fill="#6f7a8e" stroke="#3a414d" strokeWidth={1.5} />
      <RedEye cx={-4.5} cy={-38.5} />
      <RedEye cx={4.5} cy={-38.5} />
      {/* antenna */}
      <line x1={0} y1={-46} x2={0} y2={-54} stroke="#525b6b" strokeWidth={1.6} />
      <circle cx={0} cy={-55.5} r={2.2} fill="#ff4b4b" />
    </g>
  );
}

function RobotDasher() {
  return (
    <g>
      <Shadow rx={19} />
      {/* wheels */}
      <circle cx={-10} cy={-4} r={5.5} fill="#3a414d" stroke="#262b33" strokeWidth={1.2} />
      <circle cx={10} cy={-4} r={5.5} fill="#3a414d" stroke="#262b33" strokeWidth={1.2} />
      <circle cx={-10} cy={-4} r={2} fill="#8b95a7" />
      <circle cx={10} cy={-4} r={2} fill="#8b95a7" />
      {/* body */}
      <rect x={-16.5} y={-19} width={33} height={13} rx={6} fill="#9aa5b8" stroke="#525b6b" strokeWidth={1.5} />
      <rect x={-6} y={-25} width={12} height={7} rx={2.5} fill="#6f7a8e" stroke="#525b6b" strokeWidth={1.2} />
      {/* red visor */}
      <rect x={-11} y={-16.5} width={22} height={6} rx={3} fill="#2a2f3a" />
      <rect x={-8.5} y={-15} width={17} height={3} rx={1.5} fill="#ff4b4b" />
      <rect x={-8.5} y={-15} width={17} height={3} rx={1.5} fill="#ff4b4b" opacity={0.35} transform="scale(1.25 1.6)" />
      {/* antenna */}
      <line x1={4} y1={-25} x2={7} y2={-31} stroke="#525b6b" strokeWidth={1.4} />
      <circle cx={7.5} cy={-32} r={1.8} fill="#ff4b4b" />
    </g>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

function Block({
  x,
  y,
  size,
  fill,
  stroke,
  letter,
  rotate = 0,
}: {
  x: number;
  y: number;
  size: number;
  fill: string;
  stroke: string;
  letter: string;
  rotate?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <rect
        x={-size / 2}
        y={-size / 2}
        width={size}
        height={size}
        rx={2.5}
        fill={fill}
        stroke={stroke}
        strokeWidth={1.4}
      />
      <text
        x={0}
        y={0.5}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={size * 0.55}
        fontWeight={700}
        fill="#ffffff"
        opacity={0.9}
        style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}
      >
        {letter}
      </text>
    </g>
  );
}

function Tower() {
  return (
    <g>
      <Shadow rx={15} />
      <Block x={0} y={-9} size={18} fill="#e2635e" stroke="#b34a46" letter="A" />
      <Block x={-1} y={-26} size={16} fill="#f2c14e" stroke="#c1963a" letter="B" rotate={-4} />
      <Block x={1} y={-41} size={14} fill="#5b8fd9" stroke="#44699f" letter="C" rotate={5} />
    </g>
  );
}

function TowerToppled() {
  return (
    <g opacity={0.95}>
      <Block x={-14} y={-6} size={15} fill="#e2635e" stroke="#b34a46" letter="A" rotate={-24} />
      <Block x={3} y={-5} size={14} fill="#f2c14e" stroke="#c1963a" letter="B" rotate={38} />
      <Block x={16} y={-8} size={12} fill="#5b8fd9" stroke="#44699f" letter="C" rotate={80} />
    </g>
  );
}

function Blocks() {
  return (
    <g>
      <Shadow rx={19} />
      <Block x={-9} y={-10} size={19} fill="#7fbf7f" stroke="#5c9459" letter="D" />
      <Block x={9} y={-9} size={17} fill="#d977b0" stroke="#a95687" letter="E" rotate={3} />
      <Block x={-1} y={-25} size={15} fill="#f2c14e" stroke="#c1963a" letter="F" rotate={-6} />
      <circle cx={17} cy={-21} r={5.5} fill="#5b8fd9" stroke="#44699f" strokeWidth={1.3} />
      <path d="M 11.5 -21 A 5.5 5.5 0 0 1 22.5 -21" fill="#e2635e" stroke="#44699f" strokeWidth={1.3} />
    </g>
  );
}

// ---------------------------------------------------------------------------
// Items
// ---------------------------------------------------------------------------

function WindupKey() {
  return (
    <g>
      <circle cx={0} cy={-38} r={9} fill="none" stroke="#d9a63e" strokeWidth={5} />
      <rect x={-2.5} y={-30} width={5} height={22} rx={2} fill="#f6c453" stroke="#d9a63e" strokeWidth={1.2} />
      <rect x={-11} y={-14} width={22} height={6} rx={2} fill="#f6c453" stroke="#d9a63e" strokeWidth={1.2} />
    </g>
  );
}

function Missing() {
  return <rect x={-12} y={-24} width={24} height={24} fill="#ff00ff" stroke="#990099" />;
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

const registry: Record<string, () => ReactElement> = {
  "tile-light": TileLight,
  "tile-dark": TileDark,
  teddy: Teddy,
  bunny: Bunny,
  unicorn: Unicorn,
  "robot-stomper": RobotStomper,
  "robot-dasher": RobotDasher,
  tower: Tower,
  "tower-toppled": TowerToppled,
  blocks: Blocks,
  "windup-key": WindupKey,
};

export function Sprite({ id }: { id: string }) {
  const Component = registry[id] ?? Missing;
  return <Component />;
}

/** Standalone icon wrapper for HUD portraits, buttons and menus. */
export function SpriteIcon({ id, size = 48 }: { id: string; size?: number }) {
  return (
    <svg
      viewBox="-30 -62 60 68"
      width={size}
      height={size}
      role="img"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <Sprite id={id} />
    </svg>
  );
}
