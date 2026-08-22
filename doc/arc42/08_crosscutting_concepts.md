# 8. Crosscutting Concepts

## Internationalization

- All player-facing text lives in `src/i18n/de.ts` (German). Components never hardcode player-facing strings.
- The engine communicates outcomes as typed `GameEvent`s; `eventText()` in `de.ts` translates them. This keeps the engine language-agnostic and makes additional languages a matter of adding a strings module.

## Visuals / sprite swapping

- Every game visual (tiles, heroes, robots, props, items) is identified by a **visual id** stored in the content definitions and resolved by the sprite registry (`src/components/sprites/registry.tsx`).
- Sprites are SVG `<g>` components anchored at the tile center, extending upward. Swapping a placeholder for real art means replacing its registry entry — board, HUD, and engine stay untouched.
- Image sprites come from pixel art in `public/sprites/`, described in `sprites/sheets.ts` and cropped to a single frame by a nested `<svg>` viewBox — a still sprite is a one-frame grid. The declared ground anchor puts the figure's feet on the tile center, so drawn and image sprites are interchangeable ([ADR-004](../adr/ADR-004-sprite-sheets.md)).
- Iso projection constants and helpers live in `src/components/board/iso.ts` (tile 96x48, classic 2:1 diamond).

## State and immutability

- Engine reducers (`moveHero`, `useAbility`, `useItem`, `endPlayerTurn`) never mutate their input; they clone via `structuredClone` and return a new `GameState`. Invalid actions return the input state unchanged (reference-equal), which doubles as a validation signal in tests.
- `GameState` is fully serializable (plain data, ids instead of references) so it can later be persisted or moved to a server.

## Testing

- Engine: unit tests colocated with each module, using `testUtils.ts` fixtures independent of real game content.
- UI: React Testing Library smoke/integration tests (jsdom), including a full run of the core loop through the real store.

## Error handling philosophy

The engine validates player actions at its boundary (reachability, ranges, phase) and otherwise trusts its own invariants. There are no exceptions in the game loop; invalid input is a no-op.
