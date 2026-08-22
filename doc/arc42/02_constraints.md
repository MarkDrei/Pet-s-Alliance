# 2. Constraints

| Constraint | Rationale |
| --- | --- |
| Next.js (App Router) + React + TypeScript | Chosen platform; supports the future multi-screen app (menus, setup, settings) |
| Vitest + React Testing Library | Chosen test stack |
| Frontend-only state (no backend) | Current project phase; a backend is planned later, so game state must stay serializable ([ADR-003](../adr/ADR-003-frontend-only-state.md)) |
| Mobile portrait as default layout | Primary target device |
| Player-facing language: German | Target audience; all strings centralized in `src/i18n/de.ts` |
| Code, docs, commits: English | Team convention |
| Placeholder graphics must be sprite-swappable | Sprite art is produced later ([ADR-001](../adr/ADR-001-svg-rendering.md)) |
