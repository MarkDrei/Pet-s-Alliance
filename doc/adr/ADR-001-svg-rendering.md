# ADR-001: Render the board as SVG/React components

## Status

Accepted (2026-08-22)

## Context

The portrait hexagonal board needs placeholder graphics now and sprite art later. Candidates: SVG/React components, or a canvas engine (PixiJS).

## Decision

Use a single SVG element with React components for tiles, units, overlays, and effects. Isometric projection is a pure function (`board/iso.ts`); all visuals resolve through a sprite registry keyed by visual id.

## Consequences

- Lightweight: no game-engine dependency, straightforward unit testing with jsdom, declarative rendering driven by state.
- Sprite swap path: registry entries change from drawn SVG to `<image>` (or similar) — nothing else changes.
- Sufficient for a turn-based game; if heavy animation/particles ever demand it, a canvas layer can be introduced behind the same registry abstraction.

## Alternatives considered

- **PixiJS canvas**: native sprite/animation support, but heavier setup, imperative lifecycle alongside React, and harder component testing. Not needed for turn-based pacing.
