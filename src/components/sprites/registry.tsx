import type { ReactElement } from "react";
import { diamondPoints } from "@/components/board/iso";
import { BUNNY, IDLE_FRAME, type SpriteSheet, TEDDY } from "./sheets";

/**
 * All visuals are looked up here by id. An id maps either to a hand-drawn SVG
 * placeholder or to a frame of a pixel-art sprite sheet, so art can be swapped
 * in one entry at a time without touching board or game code.
 *
 * Convention: every sprite renders into a `<g>` whose origin is the CENTER of
 * the tile it stands on. Standing sprites extend upward (negative y).
 */

function Shadow({ rx = 20 }: { rx?: number }) {
  return <ellipse cx={0} cy={2} rx={rx} ry={rx * 0.38} fill="#1a1433" opacity={0.28} />;
}

/**
 * Draws one frame of a sprite image, anchored like the drawn placeholders. The
 * nested `<svg>` crops to the frame, so animating a multi-frame sheet later is a
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
          style={{
            imageRendering: sheet.rendering === "smooth" ? "auto" : "pixelated",
          }}
        />
      </svg>
    </g>
  );
}

// ---------------------------------------------------------------------------
// Tiles
// ---------------------------------------------------------------------------

function Tile({ fill, stroke }: { fill: string; stroke: string }) {
  return (
    <g>
      <polygon points={diamondPoints()} fill={fill} stroke={stroke} strokeWidth={1} />
      <polygon points={diamondPoints(0.8)} fill="none" stroke="#ffffff" strokeWidth={1} opacity={0.08} />
    </g>
  );
}

// Carpet (level 1), wood floor (book corner), marble track (marble run),
// desk mat (desk fortress).
const TileLight = () => <Tile fill="#8b9dd4" stroke="#6c7db3" />;
const TileDark = () => <Tile fill="#7c8fc9" stroke="#6c7db3" />;
const TileWoodLight = () => <Tile fill="#c9a06a" stroke="#a37e4e" />;
const TileWoodDark = () => <Tile fill="#b98e58" stroke="#a37e4e" />;
const TileTrackLight = () => <Tile fill="#9fb4c7" stroke="#7d93a8" />;
const TileTrackDark = () => <Tile fill="#8ba3b8" stroke="#7d93a8" />;
const TileDeskLight = () => <Tile fill="#84ac8e" stroke="#688e72" />;
const TileDeskDark = () => <Tile fill="#75a080" stroke="#688e72" />;

// ---------------------------------------------------------------------------
// Terrain features (flat on the floor, below units)
// ---------------------------------------------------------------------------

function TerrainMarbles() {
  const marbles = [
    { x: -14, y: -2, r: 4.5, fill: "#7fd1f0" },
    { x: -2, y: 4, r: 5, fill: "#f19ad2" },
    { x: 10, y: -4, r: 4, fill: "#f6c453" },
    { x: 16, y: 4, r: 3.5, fill: "#a58bf2" },
    { x: 2, y: -8, r: 3.5, fill: "#7fbf7f" },
  ];
  return (
    <g>
      {marbles.map((m, i) => (
        <g key={i}>
          <ellipse cx={m.x} cy={m.y + m.r * 0.5} rx={m.r} ry={m.r * 0.4} fill="#1a1433" opacity={0.2} />
          <circle cx={m.x} cy={m.y} r={m.r} fill={m.fill} stroke="#ffffff" strokeWidth={0.8} strokeOpacity={0.5} />
          <circle cx={m.x - m.r * 0.3} cy={m.y - m.r * 0.35} r={m.r * 0.3} fill="#ffffff" opacity={0.8} />
        </g>
      ))}
    </g>
  );
}

function TerrainCushion() {
  return (
    <g>
      <polygon points={diamondPoints(0.78)} fill="#d977b0" stroke="#a95687" strokeWidth={1.5} />
      <polygon points={diamondPoints(0.62)} fill="#e792c2" stroke="none" />
      {/* seams + button */}
      <path d="M -22 0 Q 0 -6 22 0 M -22 0 Q 0 6 22 0" stroke="#a95687" strokeWidth={1} fill="none" opacity={0.6} />
      <circle cx={0} cy={0} r={2.4} fill="#a95687" />
    </g>
  );
}

// ---------------------------------------------------------------------------
// Heroes
// ---------------------------------------------------------------------------

function Teddy() {
  return <SheetSprite sheet={TEDDY} shadowRx={18} />;
}

function Bunny() {
  return <SheetSprite sheet={BUNNY} shadowRx={16} />;
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

function RobotSpinner() {
  return (
    <g>
      <Shadow rx={17} />
      {/* spinning tip */}
      <polygon points="-3,-6 3,-6 0,0" fill="#3a414d" />
      {/* cone body with stripes */}
      <path d="M -16 -26 L 16 -26 L 3 -6 L -3 -6 Z" fill="#b0699b" stroke="#7e4a6f" strokeWidth={1.5} />
      <path d="M -11 -19 L 11 -19 L 7.5 -13 L -7.5 -13 Z" fill="#f2c14e" opacity={0.85} />
      {/* whirl arms */}
      <g opacity={0.9}>
        <path d="M -16 -26 Q -26 -28 -24 -35" stroke="#7e4a6f" strokeWidth={2.5} fill="none" />
        <path d="M 16 -26 Q 26 -24 24 -17" stroke="#7e4a6f" strokeWidth={2.5} fill="none" />
      </g>
      {/* cap + eye */}
      <ellipse cx={0} cy={-27} rx={16} ry={6} fill="#c98cb6" stroke="#7e4a6f" strokeWidth={1.5} />
      <circle cx={0} cy={-34} r={6.5} fill="#8b95a7" stroke="#525b6b" strokeWidth={1.3} />
      <RedEye cx={0} cy={-34} r={2.6} />
      {/* handle */}
      <rect x={-1.6} y={-46} width={3.2} height={7} rx={1.5} fill="#525b6b" />
      <circle cx={0} cy={-47.5} r={2.6} fill="#f2c14e" stroke="#b58f33" strokeWidth={0.9} />
    </g>
  );
}

function RobotBomber() {
  return (
    <g>
      <Shadow rx={16} />
      {/* stubby feet */}
      <rect x={-10} y={-6} width={7} height={6} rx={1.5} fill="#525b6b" stroke="#3a414d" strokeWidth={1.1} />
      <rect x={3} y={-6} width={7} height={6} rx={1.5} fill="#525b6b" stroke="#3a414d" strokeWidth={1.1} />
      {/* round bomb body */}
      <circle cx={0} cy={-20} r={14.5} fill="#4a5162" stroke="#2f3542" strokeWidth={1.5} />
      {/* warning stripes */}
      <path d="M -14 -24 A 14.5 14.5 0 0 1 -6 -33 L 0 -27 L -8 -18 Z" fill="#f2c14e" opacity={0.9} />
      <path d="M 14 -16 A 14.5 14.5 0 0 1 6 -7 L 0 -13 L 8 -22 Z" fill="#f2c14e" opacity={0.9} />
      <RedEye cx={-4} cy={-21} r={2.4} />
      <RedEye cx={4} cy={-21} r={2.4} />
      {/* fuse with spark */}
      <path d="M 0 -34 Q 3 -40 8 -41" stroke="#8b95a7" strokeWidth={2.2} fill="none" />
      <g>
        <circle cx={9.5} cy={-42} r={3.2} fill="#ff9d2e" />
        <circle cx={9.5} cy={-42} r={1.4} fill="#ffe08a" />
      </g>
    </g>
  );
}

function RobotBoss() {
  return (
    <g>
      <Shadow rx={23} />
      {/* massive feet */}
      <rect x={-19} y={-9} width={14} height={9} rx={2} fill="#4c3f38" stroke="#332a25" strokeWidth={1.4} />
      <rect x={5} y={-9} width={14} height={9} rx={2} fill="#4c3f38" stroke="#332a25" strokeWidth={1.4} />
      {/* hulking rusty body */}
      <rect x={-19} y={-40} width={38} height={32} rx={4} fill="#8a6a52" stroke="#5b4536" strokeWidth={1.8} />
      <rect x={-13} y={-35} width={26} height={13} rx={2.5} fill="#a58469" />
      {/* rust patches + rivets */}
      <circle cx={-11} cy={-15} r={3.4} fill="#b3502e" opacity={0.75} />
      <circle cx={13} cy={-31} r={2.8} fill="#b3502e" opacity={0.75} />
      <circle cx={-15.5} cy={-37} r={1.3} fill="#5b4536" />
      <circle cx={15.5} cy={-37} r={1.3} fill="#5b4536" />
      <circle cx={-15.5} cy={-11} r={1.3} fill="#5b4536" />
      <circle cx={15.5} cy={-11} r={1.3} fill="#5b4536" />
      {/* crushing arms */}
      <rect x={-27} y={-36} width={8} height={22} rx={3.5} fill="#6e523f" stroke="#5b4536" strokeWidth={1.5} />
      <rect x={19} y={-36} width={8} height={22} rx={3.5} fill="#6e523f" stroke="#5b4536" strokeWidth={1.5} />
      {/* jagged mouth plate */}
      <path d="M -9 -12 L -6 -16 L -3 -12 L 0 -16 L 3 -12 L 6 -16 L 9 -12" stroke="#332a25" strokeWidth={1.6} fill="none" />
      {/* head with horns */}
      <rect x={-13} y={-57} width={26} height={19} rx={3.5} fill="#6e523f" stroke="#332a25" strokeWidth={1.8} />
      <polygon points="-13,-55 -20,-62 -11,-58" fill="#4c3f38" />
      <polygon points="13,-55 20,-62 11,-58" fill="#4c3f38" />
      <RedEye cx={-5.5} cy={-48} r={3.4} />
      <RedEye cx={5.5} cy={-48} r={3.4} />
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

function Book({ x, y, w, fill, rotate = 0 }: { x: number; y: number; w: number; fill: string; rotate?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <rect x={-w / 2} y={-4.5} width={w} height={9} rx={1.5} fill={fill} stroke="#3f3654" strokeWidth={1.2} />
      <rect x={-w / 2 + 2} y={-4.5} width={3} height={9} fill="#ffffff" opacity={0.35} />
    </g>
  );
}

function Books() {
  return (
    <g>
      <Shadow rx={16} />
      <Book x={0} y={-6} w={30} fill="#5b8fd9" />
      <Book x={-1} y={-15} w={27} fill="#e2635e" rotate={-3} />
      <Book x={2} y={-24} w={28} fill="#7fbf7f" rotate={2} />
      <Book x={0} y={-33} w={24} fill="#f2c14e" rotate={-2} />
    </g>
  );
}

function BooksToppled() {
  return (
    <g opacity={0.95}>
      <Book x={-13} y={-4} w={26} fill="#5b8fd9" rotate={-14} />
      <Book x={6} y={-3} w={26} fill="#e2635e" rotate={22} />
      <Book x={14} y={-8} w={24} fill="#7fbf7f" rotate={64} />
      <Book x={-4} y={-9} w={22} fill="#f2c14e" rotate={-38} />
    </g>
  );
}

function MusicBox() {
  return (
    <g>
      <Shadow rx={15} />
      {/* box */}
      <rect x={-14} y={-20} width={28} height={17} rx={3} fill="#d977b0" stroke="#a95687" strokeWidth={1.5} />
      <rect x={-11} y={-17} width={22} height={11} rx={2} fill="#e792c2" />
      {/* crank */}
      <path d="M 14 -14 Q 21 -14 21 -8" stroke="#a95687" strokeWidth={2.2} fill="none" />
      <circle cx={21} cy={-7} r={2.4} fill="#f6c453" stroke="#d9a63e" strokeWidth={1} />
      {/* dancing figure */}
      <line x1={0} y1={-20} x2={0} y2={-27} stroke="#a95687" strokeWidth={1.6} />
      <circle cx={0} cy={-32} r={4.5} fill="#fdfbff" stroke="#c9b8d8" strokeWidth={1.2} />
      <polygon points="-5,-27 5,-27 0,-21" fill="#a58bf2" />
      {/* floating note */}
      <g transform="translate(-12 -34)">
        <ellipse cx={0} cy={2} rx={2.4} ry={1.8} fill="#4d4358" />
        <line x1={2.2} y1={1.5} x2={2.2} y2={-6} stroke="#4d4358" strokeWidth={1.4} />
        <path d="M 2.2 -6 Q 6 -5 6 -2" stroke="#4d4358" strokeWidth={1.4} fill="none" />
      </g>
    </g>
  );
}

function MusicBoxToppled() {
  return (
    <g opacity={0.95}>
      <g transform="rotate(78)">
        <rect x={-14} y={-16} width={28} height={16} rx={3} fill="#d977b0" stroke="#a95687" strokeWidth={1.5} />
        <rect x={-11} y={-13} width={22} height={10} rx={2} fill="#e792c2" />
      </g>
      <circle cx={14} cy={-10} r={2.4} fill="#f6c453" stroke="#d9a63e" strokeWidth={1} />
      {/* spilled notes */}
      <g transform="translate(-16 -14) scale(0.8)">
        <ellipse cx={0} cy={2} rx={2.4} ry={1.8} fill="#4d4358" />
        <line x1={2.2} y1={1.5} x2={2.2} y2={-6} stroke="#4d4358" strokeWidth={1.4} />
      </g>
      <g transform="translate(18 -20) scale(0.7)">
        <ellipse cx={0} cy={2} rx={2.4} ry={1.8} fill="#4d4358" />
        <line x1={2.2} y1={1.5} x2={2.2} y2={-6} stroke="#4d4358" strokeWidth={1.4} />
      </g>
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
  "tile-wood-light": TileWoodLight,
  "tile-wood-dark": TileWoodDark,
  "tile-track-light": TileTrackLight,
  "tile-track-dark": TileTrackDark,
  "tile-desk-light": TileDeskLight,
  "tile-desk-dark": TileDeskDark,
  "terrain-marbles": TerrainMarbles,
  "terrain-cushion": TerrainCushion,
  teddy: Teddy,
  bunny: Bunny,
  unicorn: Unicorn,
  "robot-stomper": RobotStomper,
  "robot-dasher": RobotDasher,
  "robot-spinner": RobotSpinner,
  "robot-bomber": RobotBomber,
  "robot-boss": RobotBoss,
  tower: Tower,
  "tower-toppled": TowerToppled,
  blocks: Blocks,
  books: Books,
  "books-toppled": BooksToppled,
  musicbox: MusicBox,
  "musicbox-toppled": MusicBoxToppled,
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
