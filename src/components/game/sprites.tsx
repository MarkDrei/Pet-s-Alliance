/**
 * Placeholder vector art for every piece without pipeline art.
 * Heroes, robots and props already have PNGs under public/sprites/; the music
 * box and the terrain are drawn inline until their art lands.
 * See doc/assets-needed.md for the replacement list.
 */
import type { CSSProperties } from "react";
import { publicUrl } from "@/assetUrl";
import { isToppleable } from "@/engine/defs";
import type { HeroDefId, PropDefId, RobotDefId, TerrainKind } from "@/engine/types";

const OUTLINE = "#241c3b";

export function HeroSprite({ defId }: { defId: HeroDefId }) {
  return (
    <image
      href={publicUrl(`/sprites/heroes/${defId}.png`)}
      x={-27}
      y={-40}
      width={54}
      height={54}
      style={{ filter: "drop-shadow(0 3px 2px rgba(0,0,0,0.35))" }}
    />
  );
}

/**
 * Frame width and the sprite's ground line as a fraction of that frame, measured
 * from the cutouts. Rostzahn is drawn wider because the boss reads as bulk, and
 * his plate is padded below the feet, hence the ground line above the frame edge.
 */
const ROBOT_ART: Record<RobotDefId, { size: number; ground: number }> = {
  stomper: { size: 54, ground: 1 },
  dasher: { size: 54, ground: 1 },
  kipplaster: { size: 54, ground: 0.984 },
  bomber: { size: 54, ground: 1 },
  rostzahn: { size: 62, ground: 0.793 },
};

/** Where feet meet the tile, matching HeroSprite's frame bottom. */
const GROUND_Y = 14;

export function RobotSprite({ defId }: { defId: RobotDefId }) {
  const { size, ground } = ROBOT_ART[defId];
  return (
    <image
      href={publicUrl(`/sprites/robots/${defId}.png`)}
      x={-size / 2}
      y={GROUND_Y - size * ground}
      width={size}
      height={size}
      style={{ filter: "drop-shadow(0 3px 2px rgba(0,0,0,0.35))" }}
    />
  );
}

/** Where a toppled prop's centre lies, a touch below the tile centre. */
const DEBRIS_Y = 6;

/**
 * Frame width, the anchor point inside that frame as fractions measured off the
 * cutouts, and the tile-space y the anchor lands on. Standing props rest their
 * base on the same ground line as the figures; toppled ones are debris seen from
 * above, so they sit centred on the tile. The frames are padded unevenly, hence
 * the per-sprite anchors.
 */
const PROP_ART: Record<string, { size: number; ax: number; ay: number; y: number }> = {
  tower: { size: 52, ax: 0.5, ay: 0.996, y: GROUND_Y },
  "tower-toppled": { size: 52, ax: 0.498, ay: 0.5, y: DEBRIS_Y },
  books: { size: 84, ax: 0.502, ay: 0.723, y: GROUND_Y },
  "books-toppled": { size: 66, ax: 0.5, ay: 0.514, y: DEBRIS_Y },
  blocks: { size: 62, ax: 0.391, ay: 1, y: GROUND_Y },
};

function PropArt({ name }: { name: string }) {
  const { size, ax, ay, y } = PROP_ART[name];
  return (
    <image
      href={publicUrl(`/sprites/props/${name}.png`)}
      x={-size * ax}
      y={y - size * ay}
      width={size}
      height={size}
      style={{ filter: "drop-shadow(0 3px 2px rgba(0,0,0,0.35))" }}
    />
  );
}

function MusicboxArt({ toppled }: { toppled: boolean }) {
  if (toppled) {
    return (
      <g stroke={OUTLINE} strokeWidth={2} opacity={0.9}>
        <rect x={-16} y={-6} width={30} height={16} rx={5} fill="#f472b6" transform="rotate(-70 0 0)" />
        <path d="M 8 -2 L 14 4" stroke="#9d174d" />
      </g>
    );
  }
  return (
    <g stroke={OUTLINE} strokeWidth={2}>
      <rect x={-15} y={-16} width={30} height={18} rx={5} fill="#f472b6" />
      <rect x={-15} y={-22} width={30} height={8} rx={4} fill="#fbcfe8" />
      <path d="M 15 -10 h 6 v -5" fill="none" stroke="#9d174d" strokeWidth={2.5} />
      <circle cx={23} cy={-16} r={2.8} fill="#fbbf24" />
      <text x={0} y={-27} fontSize={13} textAnchor="middle" fill="#fdf2f8" stroke="none">
        ♪
      </text>
    </g>
  );
}

export function PropSprite({ defId, toppled }: { defId: PropDefId; toppled: boolean }) {
  if (defId === "musicbox") return <MusicboxArt toppled={toppled} />;
  return <PropArt name={toppled && isToppleable(defId) ? `${defId}-toppled` : defId} />;
}

export function TerrainSprite({ kind }: { kind: TerrainKind }) {
  if (kind === "marbles") {
    return (
      <g>
        {[
          { x: -9, y: -4, r: 6.5, c: "#38bdf8" },
          { x: 7, y: -8, r: 5.5, c: "#f87171" },
          { x: 2, y: 6, r: 6, c: "#4ade80" },
          { x: -4, y: 12, r: 4.5, c: "#facc15" },
        ].map((m, i) => (
          <g key={i}>
            <circle cx={m.x} cy={m.y} r={m.r} fill={m.c} stroke={OUTLINE} strokeWidth={1.5} />
            <circle cx={m.x - m.r / 3} cy={m.y - m.r / 3} r={m.r / 3.2} fill="#ffffff" opacity={0.8} />
          </g>
        ))}
      </g>
    );
  }
  return (
    <g stroke={OUTLINE} strokeWidth={2}>
      <rect x={-21} y={-16} width={42} height={32} rx={14} fill="#c4b5fd" />
      <path d="M -21 0 Q 0 8 21 0" fill="none" stroke="#7c3aed" opacity={0.5} />
      <circle cx={0} cy={-2} r={3} fill="#7c3aed" stroke="none" />
    </g>
  );
}

// --- Effects ---------------------------------------------------------------

export function BlastStar({ size = 30 }: { size?: number }) {
  const pts: string[] = [];
  for (let i = 0; i < 12; i++) {
    const r = i % 2 === 0 ? size : size * 0.45;
    const a = (Math.PI / 6) * i;
    pts.push(`${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`);
  }
  return (
    <g>
      <polygon points={pts.join(" ")} fill="#fbbf24" stroke="#ea580c" strokeWidth={2.5} />
      <circle r={size * 0.35} fill="#fef3c7" />
    </g>
  );
}

export function SparkleBurst() {
  return (
    <g stroke="#fef9c3" strokeWidth={2.5} strokeLinecap="round">
      {[0, 45, 90, 135].map((a) => (
        <line
          key={a}
          x1={0}
          y1={-12}
          x2={0}
          y2={-20}
          transform={`rotate(${a})`}
        />
      ))}
      {[22, 67, 112, 157].map((a) => (
        <line key={a} x1={0} y1={-8} x2={0} y2={-13} transform={`rotate(${a})`} opacity={0.7} />
      ))}
    </g>
  );
}

/** 5-pointed comic star, drawn around the origin. */
function starPoints(size: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? size : size * 0.45;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`);
  }
  return pts.join(" ");
}

/** Ray layout for the impact burst: direction, flight distance, size, delay. */
const IMPACT_RAYS = [
  { angle: -80, dist: 34, size: 9, delay: 0 },
  { angle: -20, dist: 28, size: 7, delay: 70 },
  { angle: 45, dist: 32, size: 8, delay: 30 },
  { angle: 105, dist: 26, size: 6.5, delay: 100 },
  { angle: 165, dist: 30, size: 8.5, delay: 50 },
  { angle: 225, dist: 27, size: 7, delay: 90 },
];

/**
 * Comic-style "seeing stars" burst: little yellow stars pop out of the hit
 * tile, spin outward and fade — like a knocked-out cartoon character.
 * The outer group per star only sets the flight direction; the animated
 * inner group must not carry an inline transform (animations override it).
 */
export function ImpactStars() {
  return (
    <g>
      {IMPACT_RAYS.map(({ angle, dist, size, delay }, i) => (
        <g key={i} transform={`rotate(${angle})`}>
          <g
            className="animate-star-fly"
            style={{ animationDelay: `${delay}ms`, "--star-dist": `${dist}px` } as CSSProperties}
          >
            <polygon
              points={starPoints(size)}
              fill="#fde047"
              stroke="#ea580c"
              strokeWidth={1.6}
              strokeLinejoin="round"
            />
          </g>
        </g>
      ))}
    </g>
  );
}

export function PoofCloud() {
  return (
    <g fill="#e2e8f0" stroke="#94a3b8" strokeWidth={1.5} opacity={0.9}>
      <circle cx={-8} cy={0} r={8} />
      <circle cx={8} cy={-2} r={7} />
      <circle cx={0} cy={-8} r={8} />
      <circle cx={2} cy={4} r={6} />
    </g>
  );
}

// --- Small HTML icons for the action bar -----------------------------------

export function WindupKeyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx={12} cy={7} r={4} />
      <circle cx={12} cy={7} r={1.3} fill="currentColor" stroke="none" />
      <path d="M 12 11 V 21 M 9 17 h 6" strokeLinecap="round" />
    </svg>
  );
}

export function CannonballIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <circle cx={12} cy={13} r={8} />
      <circle cx={9.5} cy={10.5} r={2.2} fill="#ffffff" opacity={0.5} />
      <path d="M 17 4 l 2 -2 M 19.5 8 l 2.5 -1 M 14.5 2.5 l 1 -2.5" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
    </svg>
  );
}
