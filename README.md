# Pet's Alliance

A turn-based defense game for kids in a night-time children's room:
plushies hold the line against toy robots that want to topple things and
wake the children. Browser-based, mobile-first, vertical screen. All
player-facing text is German.

- **Game rules:** [doc/game-mechanics.md](doc/game-mechanics.md)
- **Missing art / placeholder list:** [doc/assets-needed.md](doc/assets-needed.md)
- **German strings:** [src/i18n/de.ts](src/i18n/de.ts)
- Pipeline hero art lives in `public/sprites/heroes/`.

## Stack

- Next.js (App Router) + React + Tailwind CSS 4 — frontend only, all game
  logic runs in the browser. A backend may come much later.
- Pure TypeScript game engine in `src/engine/` (hex math, robot planning,
  abilities, items, execution, levels) — fully unit-tested with Vitest.
- UI in `src/components/game/`: SVG hex board, animation runner that
  plays engine events one at a time, HUD, inspect panel, event ticker,
  result screen.

## Commands

```bash
npm run dev        # http://localhost:3000
npm test           # run the test suite once
npm run test:watch # watch mode
npm run coverage   # engine + i18n coverage report
npm run lint       # eslint
npm run build      # production Next.js standalone bundle
npm start          # serve the production build on port 3000
```

## VPS deploy (Docker, port 3000)

The app now matches the VPS deployment contract used in
[MarkDrei/vpsIonos](https://github.com/MarkDrei/vpsIonos):

1. `next.config.ts` builds with `output: "standalone"`
2. `Dockerfile` produces a container that serves the app on port `3000`
3. The VPS reverse-proxies the container at the deployment domain root

### Deployment and CI

Deployment is done by the VPS itself, like for all projects there: every push to
`main` triggers the VPS webhook, which builds the image and replaces the container
at <https://pet-s-alliance.ironstrike.de> (other branches get preview
deployments). See [MarkDrei/vpsIonos](https://github.com/MarkDrei/vpsIonos).

GitHub Actions (`.github/workflows/ci.yml`) only runs CI on pushes and pull
requests to `main`: lint, tests, Next.js build and a Docker image build.

Local production smoke test:

```bash
npm install
npm run build
npm start
```

### Optional subpath deploys

The default build serves the app at `/`, which is what the VPS expects.
If you ever need a subpath again, set `NEXT_PUBLIC_BASE_PATH` at build time:

```bash
NEXT_PUBLIC_BASE_PATH=/pets2 npm run build
```

That keeps asset URLs and routes aligned under the chosen prefix.

## Project layout

```
src/engine/          pure game logic (no React)
src/engine/levels/   the four hardcoded levels
src/components/game/ game screen components
src/app/             routes: / (title + level select), /play/[levelId]
src/i18n/de.ts       every German string
doc/                 game design + asset wishlist
```
