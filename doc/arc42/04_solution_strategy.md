# 4. Solution Strategy

| Goal | Strategy |
| --- | --- |
| Testable game rules | **Pure engine** (`src/engine/`): all rules are pure TypeScript functions over a serializable `GameState`. No React/DOM/store imports. ([ADR-002](../adr/ADR-002-pure-engine.md)) |
| Extensible content | **Content as data** (`src/content/`): heroes, robots, props, items, levels are declarative definitions consumed by the engine via a `Content` registry parameter |
| Replaceable visuals | **Sprite registry** (`src/components/sprites/registry.tsx`): every visual is looked up by id; placeholder SVG components today, sprite images later ([ADR-001](../adr/ADR-001-svg-rendering.md)) |
| Future backend | Engine state is plain serializable data; UI dispatches engine functions through a thin Zustand store, which is the single seam where a server could later take over ([ADR-003](../adr/ADR-003-frontend-only-state.md)) |
| German UI, English code | All player-facing strings in `src/i18n/de.ts`; engine emits typed events which the UI translates |
| Many future screens | Next.js App Router; each screen is a route (`/`, `/game`, later `/setup`, `/settings`, …) |
