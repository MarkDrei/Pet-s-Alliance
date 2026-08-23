# ADR-002: Game rules as a pure TypeScript engine

## Status

Accepted (2026-08-22)

## Context

Game rules (movement, intents, push mechanics, win/lose) must be thoroughly testable, and a backend will eventually own game state.

## Decision

All rules live in `src/engine/` as pure functions over a serializable `GameState`. Reducers return new states (`structuredClone`) and return the input unchanged for invalid actions. Static definitions are passed in as an explicit `Content` registry so the engine has no import dependency on game content. React components contain no rules; the Zustand store is a thin dispatch layer.

## Consequences

- The whole rule set runs headless in unit tests (57 tests, < 1 s of test time).
- `GameState` can be serialized to local storage or a server without adaptation.
- Content and engine evolve independently: new heroes/robots/levels are data.
- Cost: reducers clone state on every action — negligible at the compact hex-board scale.
