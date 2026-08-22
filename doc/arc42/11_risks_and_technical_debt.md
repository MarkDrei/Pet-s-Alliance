# 11. Risks and Technical Debt

| Item | Notes |
| --- | --- |
| No persistence | A run is lost on reload. Meta-progression (planned) will need local storage first, later the backend. |
| Robot phase is not animated | `endPlayerTurn` executes the whole robot phase in one state transition; the event ticker narrates it. Step-by-step animation will require the engine to expose per-robot execution steps (the event list is already ordered, which helps). |
| Einhorn ability is a placeholder | *Funkelschild* stands in until the final magic ability is designed. |
| Single level | Zones 2-4, roguelike run structure, and meta-progression are unimplemented; the level format (`LevelDef`) is designed to carry them. |
| No character/item selection | The team is fixed to the three plushies; screens for setup/selection are planned routes. |
| German strings module is flat | Fine for one language; if more languages arrive, introduce a proper i18n layer with typed keys. |
