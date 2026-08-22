"use client";

import type { Vec } from "@/engine";
import { gridToScreen } from "./iso";

/**
 * One-shot visual effects layered over the board (impacts, dust, sparkles,
 * floating text). Effects are transient UI state owned by the game store;
 * each self-animates via SVG <animate> and is removed by the store after its
 * time to live.
 */
export type EffectKind =
  | "impact" // something got hit
  | "crash" // a tower toppled
  | "poof" // a robot broke or fell off the board
  | "sparkleCast" // the unicorn casts its shield
  | "shieldPop" // a shield absorbed a hit
  | "spawn" // a robot arrives
  | "floatText"; // rising text like "-1" or "Zzz"

export interface UiEffect {
  id: string;
  kind: EffectKind;
  pos: Vec;
  text?: string;
  color?: string;
}

function RingBurst({ color }: { color: string }) {
  return (
    <ellipse cx={0} cy={0} rx={8} ry={4} fill="none" stroke={color} strokeWidth={4} opacity={0.9}>
      <animate attributeName="rx" values="8;36" dur="0.5s" fill="freeze" />
      <animate attributeName="ry" values="4;18" dur="0.5s" fill="freeze" />
      <animate attributeName="stroke-width" values="4;0.5" dur="0.5s" fill="freeze" />
      <animate attributeName="opacity" values="0.9;0" dur="0.5s" fill="freeze" />
    </ellipse>
  );
}

function StarBurst({ color }: { color: string }) {
  const spokes = [0, 60, 120, 180, 240, 300];
  return (
    <g>
      <animateTransform attributeName="transform" type="scale" values="0.4;1.5" dur="0.45s" fill="freeze" />
      <animate attributeName="opacity" values="1;0" dur="0.45s" fill="freeze" />
      {spokes.map((angle) => (
        <polygon
          key={angle}
          points="0,-4 3,-14 0,-24 -3,-14"
          fill={color}
          transform={`rotate(${angle}) translate(0 -2) scale(1 0.6)`}
        />
      ))}
      <circle cx={0} cy={0} r={6} fill="#ffffff" opacity={0.9} />
    </g>
  );
}

function Poof() {
  const puffs = [
    { x: -10, y: -6, r: 9, delay: 0 },
    { x: 8, y: -10, r: 11, delay: 0.06 },
    { x: 0, y: -18, r: 8, delay: 0.12 },
    { x: 12, y: -2, r: 7, delay: 0.09 },
  ];
  return (
    <g>
      {puffs.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={p.r} fill="#cfcfe2" opacity={0.85}>
          <animate attributeName="r" values={`${p.r};${p.r * 2}`} dur="0.6s" begin={`${p.delay}s`} fill="freeze" />
          <animate attributeName="cy" values={`${p.y};${p.y - 14}`} dur="0.6s" begin={`${p.delay}s`} fill="freeze" />
          <animate attributeName="opacity" values="0.85;0" dur="0.6s" begin={`${p.delay}s`} fill="freeze" />
        </circle>
      ))}
    </g>
  );
}

function SparkleCast({ color }: { color: string }) {
  const sparkles = [
    { x: -18, y: -30, s: 1, delay: 0.05 },
    { x: 16, y: -38, s: 0.8, delay: 0.15 },
    { x: 0, y: -50, s: 1.1, delay: 0.1 },
    { x: -8, y: -14, s: 0.7, delay: 0.2 },
    { x: 22, y: -18, s: 0.9, delay: 0 },
  ];
  return (
    <g>
      <RingBurst color={color} />
      {sparkles.map((sp, i) => (
        <g key={i} transform={`translate(${sp.x} ${sp.y}) scale(${sp.s})`}>
          <path d="M 0 -7 L 2 -2 L 7 0 L 2 2 L 0 7 L -2 2 L -7 0 L -2 -2 Z" fill={color} opacity={0}>
            <animate attributeName="opacity" values="0;1;0" dur="0.7s" begin={`${sp.delay}s`} fill="freeze" />
          </path>
        </g>
      ))}
    </g>
  );
}

function FloatText({ text, color }: { text: string; color: string }) {
  return (
    <text
      x={0}
      y={-46}
      textAnchor="middle"
      fontSize={17}
      fontWeight={800}
      fill={color}
      stroke="#1d1840"
      strokeWidth={0.8}
      style={{ fontFamily: "var(--font-geist-sans), sans-serif", paintOrder: "stroke" }}
    >
      {text}
      <animate attributeName="y" values="-46;-72" dur="0.9s" fill="freeze" />
      <animate attributeName="opacity" values="1;1;0" keyTimes="0;0.6;1" dur="0.9s" fill="freeze" />
    </text>
  );
}

function EffectVisual({ effect }: { effect: UiEffect }) {
  switch (effect.kind) {
    case "impact":
      return <StarBurst color={effect.color ?? "#ffd76a"} />;
    case "crash":
      return (
        <g>
          <StarBurst color="#ff9d2e" />
          <Poof />
        </g>
      );
    case "poof":
      return <Poof />;
    case "sparkleCast":
      return <SparkleCast color="#8ef0ff" />;
    case "shieldPop":
      return <RingBurst color="#8ef0ff" />;
    case "spawn":
      return <RingBurst color="#ff6b6b" />;
    case "floatText":
      return <FloatText text={effect.text ?? ""} color={effect.color ?? "#ffffff"} />;
  }
}

export function EffectsLayer({ effects }: { effects: UiEffect[] }) {
  return (
    <g pointerEvents="none">
      {effects.map((effect) => {
        const { sx, sy } = gridToScreen(effect.pos);
        return (
          <g key={effect.id} transform={`translate(${sx} ${sy})`}>
            <EffectVisual effect={effect} />
          </g>
        );
      })}
    </g>
  );
}
