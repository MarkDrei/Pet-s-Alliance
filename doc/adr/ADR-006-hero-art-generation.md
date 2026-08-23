# ADR-006: Generate hero art with a general-purpose model and key the backdrop locally

## Status

Accepted (2026-08-23)

## Context

[ADR-004](ADR-004-sprite-sheets.md) settled how sprite images are placed, and
picked Retro Diffusion as the source. In practice its output is capped at small
resolutions: at 128px a hero's face is a handful of pixels, and the result reads
as mush on the board rather than as a character. Retro Diffusion also bills per
image regardless of size, so a 128px pixel sprite costs the same order as a
1024px image from a general-purpose model.

General-purpose image models (flux, sdxl and relatives) render an order of
magnitude more detail per euro, but they cannot output an alpha channel, and
every sprite needs one.

## Decision

Hero art is generated with `black-forest-labs/flux-1.1-pro` at 1024x1024 and cut
out locally. The prompt asks for a flat, saturated backdrop in a colour that does
not occur in the character, plus `no cast shadow, no gradient, no floor`.
`scripts/cutout.mjs` in the `replicate-sprites` skill then reads the backdrop
colours off the image border, flood fills inward, writes fractional alpha at the
edge, pads the result onto a square canvas and downscales it.

Flood filling from the border rather than keying globally is what keeps colours
that also occur inside the character - dark eyes on a white backdrop, cream fur
next to sage green. Contact shadows are matched separately and tightly against
darker shades of the backdrop colour, because a loose match also swallows shaded
fur.

Because the source is much larger than its display size, these sprites render
`smooth` (see ADR-004).

Keying is a convenience, not the contract. When a plate cannot be keyed, the
backdrop is removed by hand in an image editor and the same script is run with
`--use-alpha`, which skips keying and only crops, squares and downscales, so
every sprite reaches `public/sprites/` through one path with one anchor
convention. The unicorn took that route.

## Consequences

- Detail per euro improves a lot: `$0.04` per 1024px candidate against
  `$0.025-0.08` per 128px pixel sprite.
- The look changes from pixel art to soft plush rendering. Heroes generated
  before this decision (the bunny) do not match the new ones (the teddy). The
  target style is not settled yet; the mismatch is accepted for now and resolved
  by regenerating the older assets once it is.
- Cutout quality is our problem, not the model's. Backdrop regions that do not
  touch the image border are not reached by the flood fill and stay in the image,
  so every asset is reviewed on a checkerboard and on tile geometry before it is
  committed. A useful measure: for a plush character, fully opaque pixels should
  be around 60% of the bounding box. Far below that means the character itself is
  being keyed away.
- The prompt must ask for a **vivid** key colour. Asked for "chroma green", flux
  returns pale mint, and a pale backdrop cannot be keyed off a white character:
  the backdrop tints the fur until the two share colours. Pale characters are the
  likeliest candidates for manual removal.
- Animation frames are still out of reach: the model has no notion of a frame
  grid. That stays the domain of `rd-animation` or of hand work.

## Alternatives considered

- **Stay with Retro Diffusion**: consistent pixel look and free background
  removal, but faces do not read at the sizes it supports.
- **A background-removal model on Replicate**: better edges on busy backdrops,
  but another request per image and a recurring cost for something a flat
  backdrop makes unnecessary.
- **Prompt flux for pixel art**: it imitates the style without respecting a pixel
  grid, so the result is neither clean pixel art nor a clean cutout.
