/**
 * Placeholder vector art for every piece without pipeline art.
 * Heroes already have PNGs in public/sprites/heroes/; everything else is
 * drawn inline so the game looks finished while art is produced.
 * See doc/assets-needed.md for the replacement list.
 */
import { publicUrl } from "@/assetUrl";
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

function block(x: number, y: number, w: number, h: number, fill: string, rotate = 0) {
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx={3}
      fill={fill}
      transform={rotate ? `rotate(${rotate} ${x + w / 2} ${y + h / 2})` : undefined}
    />
  );
}

function TowerArt({ toppled }: { toppled: boolean }) {
  if (toppled) {
    return (
      <g stroke={OUTLINE} strokeWidth={2} opacity={0.85}>
        {block(-20, 0, 16, 12, "#60a5fa", -14)}
        {block(-2, 2, 15, 11, "#facc15", 10)}
        {block(8, -8, 14, 11, "#f87171", 28)}
      </g>
    );
  }
  return (
    <g stroke={OUTLINE} strokeWidth={2}>
      {block(-12, -6, 24, 13, "#60a5fa")}
      {block(-10, -19, 20, 13, "#facc15", -3)}
      {block(-8, -31, 16, 12, "#f87171", 4)}
    </g>
  );
}

function BooksArt({ toppled }: { toppled: boolean }) {
  if (toppled) {
    return (
      <g stroke={OUTLINE} strokeWidth={2} opacity={0.85}>
        {block(-19, -1, 22, 8, "#34d399", -18)}
        {block(-4, 2, 22, 8, "#a78bfa", 6)}
        {block(-8, -8, 20, 8, "#fb923c", 24)}
      </g>
    );
  }
  return (
    <g stroke={OUTLINE} strokeWidth={2}>
      {block(-14, -2, 28, 9, "#34d399")}
      {block(-12, -11, 26, 9, "#a78bfa", -4)}
      {block(-11, -20, 24, 9, "#fb923c", 3)}
    </g>
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

function BlocksArt() {
  return (
    <g stroke={OUTLINE} strokeWidth={2}>
      {block(-18, -8, 17, 15, "#94a3b8")}
      {block(1, -8, 17, 15, "#cbd5e1")}
      {block(-9, -21, 17, 14, "#64748b")}
    </g>
  );
}

export function PropSprite({ defId, toppled }: { defId: PropDefId; toppled: boolean }) {
  switch (defId) {
    case "tower":
      return <TowerArt toppled={toppled} />;
    case "books":
      return <BooksArt toppled={toppled} />;
    case "musicbox":
      return <MusicboxArt toppled={toppled} />;
    case "blocks":
      return <BlocksArt />;
  }
}

export function TerrainSprite({ kind }: { kind: TerrainKind }) {
  return (
    <image
      href={`/sprites/terrain/${kind}.png`}
      x={-24}
      y={-24}
      width={48}
      height={48}
      style={{ filter: "drop-shadow(0 2px 1px rgba(0,0,0,0.25))" }}
    />
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
