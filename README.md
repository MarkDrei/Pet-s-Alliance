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
npm run dev        # http://localhost:3000/pets2
npm test           # run the test suite once
npm run test:watch # watch mode
npm run coverage   # engine + i18n coverage report
npm run lint       # eslint
npm run build      # static site into out/
```

## Static deploy (`/pets2`)

The app is frontend-only. `next.config.ts` uses `output: "export"` and
`basePath: "/pets2"`, so `npm run build` writes a static site into `out/`.

1. `npm run build`
2. Upload **the contents of `out/`** (not the `out` folder itself) into the
   `/pets2` directory on your web server.
3. Open `https://your-domain/pets2/`

Each route is a folder with `index.html` (`trailingSlash: true`), so Apache,
nginx, and similar hosts can serve `/pets2/play/level-1/` without extra
rewrites. To host under a different folder, change `basePath` in
`next.config.ts` and rebuild.

## Project layout

```
src/engine/          pure game logic (no React)
src/engine/levels/   the four hardcoded levels
src/components/game/ game screen components
src/app/             routes: / (title + level select), /play/[levelId]
src/i18n/de.ts       every German string
doc/                 game design + asset wishlist
```
