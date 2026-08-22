# ADR-004: Ship pixel-art sprite images and crop frames in the registry

## Status

Accepted (2026-08-22)

## Context

The drawn SVG placeholders are readable but not the target look, and ADR-001
already foresees registry entries becoming `<image>`. Real art needs a source
and a layout convention. Generated pixel art arrives either as a single still
image or as a grid of frames (facings x animation frames), so the registry needs
one way to place both without a slicing pipeline.

## Decision

Sprite art is generated with Retro Diffusion on Replicate and committed under
`public/sprites/`. Image geometry is declared in
`src/components/sprites/sheets.ts`, and `registry.tsx` renders a frame through a
nested `<svg>` whose `viewBox` crops the source to one grid cell. A still sprite
is just a one-frame grid, so stills and animation sheets share one code path.

Frames are anchored by an explicit ground point (`anchorX`, `anchorY` in source
pixels) so an image sprite stands on the tile center exactly like a drawn one.
Scaling is per image: sources at or below their display size render `pixelated`,
larger sources render smooth, because nearest-neighbour downscaling drops pixels
and makes small features like eyes flicker.

Characters are generated with `retro-diffusion/rd-plus` at 128px or larger with
`remove_bg`. The animation model (`rd-animation`) is limited to 48px frames,
where faces stop reading, so it is only worth it when animation matters more
than looks. The first asset is the bunny (`rd-plus`, style `default`, 128px, from
the prompt library of the `replicate-sprites` skill).

## Consequences

- No slicing pipeline and no build step: assets are plain files under `public/`,
  and frame selection is data (`row`, `col`).
- Walk animation and per-unit facing stay a registry-local change: a sheet with
  more frames only needs a different descriptor.
- Every image needs its ground line measured once, otherwise sprites float or
  sink; the anchor is verified per asset when it is added.
- Mixed look while migrating: units without generated art keep drawn SVG
  placeholders, which is acceptable and invisible to the rest of the app.
- Raw `public/` URLs must go through `publicUrl()` to survive `basePath`
  ([ADR-005](ADR-005-static-export.md)).

## Alternatives considered

- **Slice each frame into its own PNG**: simpler markup, but more files, a
  slicing script to maintain, and animation would need all frames re-referenced.
- **CSS sprite background positioning**: does not compose with the single-SVG
  board, where sprites must scale and sort with the isometric scene.
