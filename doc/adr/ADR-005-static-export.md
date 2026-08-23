# ADR-005: Static export hosted under `/pets`

## Status

Accepted (2026-08-23)

## Context

The game has no backend at runtime. The intended deployment is a folder on a plain webserver (`…/pets/`), not a Node host.

## Decision

Build with Next.js static export (`output: "export"`) and `basePath: "/pets"`. `trailingSlash: true` emits `game/index.html` so `/pets/game/` works without rewrite rules. Files from `public/` that are referenced as raw URLs (sprite sheets) go through `publicUrl()` so they pick up the same prefix; `next/link` is prefixed by Next itself.

## Consequences

- `npm run build` writes a static site to `out/`. Copy the contents of `out/` into the server's `pets/` directory.
- Changing the subfolder requires a rebuild (`basePath` is inlined).
- A later Node/backend deploy can drop `output: "export"`; `basePath` can stay or go independently.
