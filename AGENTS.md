<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Pet's Alliance — Agent Rules

Pet's Alliance is a turn-based mobile strategy game (Into the Breach x Jagged Alliance, for kids): plushie heroes defend a kids' room at night against toy robots that want to topple things and wake the children.

## Keep the architecture documentation up to date (mandatory)

`doc/` contains Arc42-style architecture documentation. **Any change that affects architecture must update the documentation in the same change**, including:

- New/removed/moved modules or folders → `doc/arc42/05_building_blocks.md`
- Changes to the turn loop, robot AI, or state flow → `doc/arc42/06_runtime_view.md`
- New technology, library, or pattern decisions → add an ADR in `doc/adr/` and reference it in `doc/arc42/09_architecture_decisions.md`
- New game terms → `doc/arc42/12_glossary.md`

If you finish a task without checking whether `doc/` needs an update, the task is not finished.

## Architecture rules

1. **Pure engine**: all game rules live in `src/engine/` as pure, side-effect-free TypeScript. No React, no DOM, no Zustand imports there. Engine state (`GameState`) stays fully serializable — a backend will take over state management later.
2. **Content as data**: heroes, robots, props, items, and levels are declarative definitions in `src/content/`. Adding a robot type or level must not require engine changes (extend the engine only for genuinely new mechanics).
3. **All visuals go through the sprite registry** (`src/components/sprites/registry.tsx`). Never draw a game entity inline in the board or HUD. Placeholder SVGs will be replaced by sprite images later — only the registry should need to change.
4. **UI is thin**: components read state from the Zustand store (`src/state/gameStore.ts`) and dispatch engine functions. No game rules in components.

## Language rules

- Code, identifiers, comments, commit messages, and documentation: **English**.
- All player-facing text: **German**, and it lives exclusively in `src/i18n/de.ts`. Never hardcode player-facing strings in components.

## Testing

- Engine changes require engine unit tests (colocated `*.test.ts`).
- Run `npm run test` and `npm run lint` before considering a task done.

## Layout

- The game targets mobile portrait orientation. The game screen is: top bar (round/objective/chaos), 8x8 isometric board in the middle, controls at the bottom.
