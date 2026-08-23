# 7. Deployment View

The game is a **static site**. There is no Node server, database, or environment variable required at runtime.

## Build

```bash
npm run build
```

Next.js writes HTML/CSS/JS (and a copy of `public/`) to `out/`. Configuration lives in `next.config.ts` ([ADR-005](../adr/ADR-005-static-export.md)):

- `output: "export"` — static files instead of `next start`
- `basePath: "/pets"` — all routes and `_next` assets are under `/pets/…`
- `trailingSlash: true` — `/pets/game/` maps to `game/index.html`

`basePath` is inlined at build time. Hosting under a different folder means changing `basePath` (and `NEXT_PUBLIC_BASE_PATH`) and rebuilding.

Local `npm run dev` is also under the prefix: `http://localhost:3000/pets/`.

## What to copy

Copy **the entire contents of `out/`** (not the `out` folder itself) into a directory named `pets` on the webserver document root, so the URL is `https://<host>/pets/`.

Required pieces:

| Path in `out/` | Role |
| --- | --- |
| `index.html` (+ `index.txt`, `__next.*.txt`) | Title screen (`/pets/`) |
| `game/` | Game screen (`/pets/game/`) |
| `_next/` | JS, CSS, fonts, favicon |
| `sprites/` | Sprite images |
| `favicon.ico` | Browser icon |
| `_not-found/`, `404.html`, `404/` | 404 pages (keep if the host uses them) |

Do not omit `_next/` or the `__next.*.txt` / `index.txt` files; client navigation between title and game depends on them.

Create-Next-App leftovers (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`) are unused by the game; they can be copied or deleted.

## Local preview of the export

HTML requests `/pets/_next/…`, so serving `out/` as the site root will 404 the assets. Put the contents of `out/` inside a `pets` folder and serve the parent directory.

When the backend arrives (player DBs, meta-progression), this section must be extended with the service topology.
