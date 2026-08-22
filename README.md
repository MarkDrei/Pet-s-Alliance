# Pet's Alliance

A turn-based mobile strategy game for kids — *Into the Breach* meets *Jagged Alliance*, in a kids' room at night.

Toy robots come alive after dark and try to topple things to wake the children. Three plushie heroes — **Teddybär**, **Häschen**, and **Einhorn** — must survive the night by pushing, redirecting, and outsmarting the robots on an 8x8 isometric board. All robot moves are announced before you act; win by surviving the required number of rounds.

The game UI is in **German**; code and documentation are in English.

## Getting started

```bash
npm install
npm run dev       # http://localhost:3000
```

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run test` | Run the Vitest suite (engine + component tests) |
| `npm run test:watch` | Tests in watch mode |
| `npm run lint` | ESLint |
| `npm run build` | Production build |

## Tech stack

Next.js (App Router) · React · TypeScript · Tailwind CSS · Zustand · Vitest + React Testing Library

## Project structure

```
src/
  app/          Routes: / (title), /game (game screen); future screens get routes here
  engine/       Pure game rules (no React) — fully unit tested
  content/      Declarative game data: heroes, robots, props, items, levels
  state/        Zustand store bridging engine and UI
  components/
    board/      Isometric SVG board + projection helpers
    sprites/    Sprite registry — ALL visuals resolve here (placeholder SVGs today)
    hud/        Top/bottom bars, event ticker, game-over overlay
  i18n/         German player-facing strings
doc/            Arc42 architecture documentation (keep up to date! see AGENTS.md)
```

## Architecture documentation

Arc42-style documentation lives in [doc/](doc/README.md). **It must be kept in sync with the code** — the rules for that (and for the engine/UI separation, sprite registry, and language conventions) are in [AGENTS.md](AGENTS.md).
