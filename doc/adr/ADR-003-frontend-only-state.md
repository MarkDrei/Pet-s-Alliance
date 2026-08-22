# ADR-003: Frontend-only state now, designed for a later backend

## Status

Accepted (2026-08-22)

## Context

The current phase needs no backend, but player DBs and meta-progression are planned.

## Decision

All state lives in the browser: game state in a Zustand store (`src/state/gameStore.ts`), no persistence yet. To keep the backend path open:

1. `GameState` is plain serializable data (ids, no object references, no functions).
2. All state transitions go through engine functions — the store is the single seam where a server API could replace local calls.
3. No component reads or mutates game state except through the store.

## Consequences

- Zero infrastructure today; a run is lost on reload (accepted for now).
- Adding persistence or a server later means changing the store layer only.
- Meta-progression (roguelike unlocks) will first need local storage, then the backend — both fit behind the same seam.
