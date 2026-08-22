# 11. Risks and Technical Debt

| Item | Notes |
| --- | --- |
| No persistence | A run is lost on reload. Meta-progression (planned) will need local storage first, later the backend. |
| Animation timing lives in the store | Playback pacing (per-tile duration, pauses) is hardcoded in `gameStore.ts` and collapses to zero under `NODE_ENV=test`. A future settings screen ("Animationen schneller/aus") should turn these into user preferences. |
| Einhorn ability is a placeholder | *Funkelschild* stands in until the final magic ability is designed. |
| Single level | Zones 2-4, roguelike run structure, and meta-progression are unimplemented; the level format (`LevelDef`) is designed to carry them. |
| No character/item selection | The team is fixed to the three plushies; screens for setup/selection are planned routes. |
| German strings module is flat | Fine for one language; if more languages arrive, introduce a proper i18n layer with typed keys. |
