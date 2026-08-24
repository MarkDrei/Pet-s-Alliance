# Assets needed

Every piece of art the game still needs, and exactly where the file goes.
Until these exist, the game renders designed inline-SVG placeholders from
[`src/components/game/sprites.tsx`](../src/components/game/sprites.tsx).

**Shared style notes.** Match the existing hero art in
`public/sprites/heroes/` (soft-shaded cartoon toys, thick friendly shapes,
transparent background). Pieces are viewed slightly from above on a
flat-top hex board at night; warm rim light works well. PNG with alpha,
1024×1024 source, content filling ~85% of the canvas, feet/base near the
bottom center so the sprite sits on the tile.

## Already done

| File | Status |
| --- | --- |
| `public/sprites/heroes/teddy.png` | in game |
| `public/sprites/heroes/bunny.png` | in game (256px plush, replaced the earlier pixel-art version) |
| `public/sprites/heroes/unicorn.png` | in game |
| `public/sprites/robots/*.png` | in game (all five) |
| `public/sprites/props/*.png` | in game (tower, books, blocks, both toppled variants) |

## Robots — `public/sprites/robots/`

Wind-up tin-toy robots, mischievous but not scary (kids' game). All five are
in the game; the files below are 256px cutouts rendered as glossy 3D toys,
which is a different surface treatment from the plush heroes.

| File | Description |
| --- | --- |
| `stomper.png` | Stampfer: red tin walker on two big stomp feet, round amber eyes, wind-up key. |
| `dasher.png` | Flitzer: slim wheeled racer leaning forward, cyan visor eye. Fragile look (1 HP). |
| `kipplaster.png` | Kipplaster: chunky yellow toy dump truck with a tilting bed. |
| `bomber.png` | Knalli: round orange bomb-bot with short legs, lit fuse, excited grin. |
| `rostzahn.png` | Rostzahn: the boss. Big rusty robot, jagged tooth grill, rivets. Drawn wider than the others so it reads as heavier. |

## Props — `public/sprites/props/`

Standing and toppled variants are separate files; the toppled ones read
as flat rubble that can be walked over. Only the music box is still a
placeholder; it is waiting for a blue version.

| File | Status | Description |
| --- | --- | --- |
| `tower.png` | in game | Bauklotz-Turm: wobbly tower of 3–4 colorful wooden blocks (red/yellow/blue). |
| `tower-toppled.png` | in game | The same blocks scattered flat. |
| `books.png` | in game | Bücherstapel: stack of thick picture books, slightly askew. |
| `books-toppled.png` | in game | Books fanned out flat on the floor. |
| `musicbox.png` | needed | Spieluhr: precious music box with golden crank and floating note, in blue. Should feel special (level-4 objective). |
| `musicbox-toppled.png` | needed | Tipped over, lid open, no note. |
| `blocks.png` | in game | Bauklötze: low, sturdy wall of interlocked blocks in muted colors — reads as "solid obstacle", not a target. |

## Terrain tiles — `public/sprites/terrain/`

Drawn on top of the floor hex, under the pieces. Should fit inside a
flat-top hexagon footprint.

| File | Description |
| --- | --- |
| `marbles.png` | Cluster of glossy glass marbles on a subtle track groove. |
| `cushion.png` | Soft pastel cushion with a center button, slightly squished. |

## Items — `public/sprites/items/`

Square icons for the action bar (256×256 is plenty).

| File | Description |
| --- | --- |
| `windup-key.png` | Golden wind-up key. |
| `cannonball.png` | Toy cannonball with a shine, small motion sparks. |

## Floors and UI — `public/sprites/ui/`

Optional polish; the game currently uses flat tinted hexes per level.

A first pass of generated floor textures (flux-schnell) was tried and rolled
back: photographic textures fought with the pieces, and muting them enough to
read left the board dull. Raw output is kept under `.sprite-gen/tiles-flux/`.

| File | Description |
| --- | --- |
| `title-logo.png` | "Pet's Alliance" wordmark for the title screen (current title is animated text). |
| `floor-rug.png` | Seamless red/pattern rug texture (level 1). |
| `floor-wood.png` | Seamless warm wooden floor (level 2). |
| `floor-track.png` | Seamless cool marble-run track floor (level 3). |
| `floor-desk.png` | Seamless desk wood with pencil scratches (level 4). |

## How to wire new art in

- Hero PNGs are loaded directly by filename — nothing to change.
- Robots, props, terrain: replace the corresponding placeholder in
  `src/components/game/sprites.tsx` with an `<image href=...>` (see
  `HeroSprite` for the pattern).
- Item icons: swap the inline SVGs in the same file
  (`WindupKeyIcon`, `CannonballIcon`).

## Not art, but eventually nice (out of scope for now)

- Sounds: tap, stomp, crash, dump, BUMM, topple, shield chime, marble
  roll, wind-up click, victory/defeat jingles.
- Music: calm night-time loop.
