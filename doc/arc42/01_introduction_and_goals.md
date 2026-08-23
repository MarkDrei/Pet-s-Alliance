# 1. Introduction and Goals

## What is Pet's Alliance?

A turn-based mobile strategy game for kids. At night, toy robots come alive in a kids' room and try to cause chaos (toppling things) to wake the children. Three plushie heroes — Teddybär, Häschen, and Einhorn — must stop them. Gameplay is a kid-friendly mix of *Into the Breach* (fully visible enemy intents, push-based tactics on a small grid) and *Jagged Alliance* (a squad of distinct characters).

The game is played in **German**; code and documentation are in English.

## Core game rules (current slice)

- Hexagonal board optimized for portrait play: seven tiles high on the left and
  right sides, four diagonal steps from each side endpoint toward the top and
  bottom, and eight steps from side to side; no fog of war — everything is visible.
- Each round: robots reveal their full intents (movement path + attack tile), then the player moves each hero (once) and uses each hero's ability (once), then the robots execute.
- Heroes do not attack directly. They push, redirect, shield, and block. Robots break when they bump into walls and obstacles.
- Robots move along connected hex edges, so blocking a lane is a core tactic.
- Win: survive a fixed number of rounds. Lose: all heroes are down, or the chaos meter (toppled targets) reaches its limit.
- Items (1-2 per level) are single-use tactical tools.

## Heroes

| Hero | Role | Ability |
| --- | --- | --- |
| Teddybär | Tank (5 HP, move 3) | *Wegschubsen*: push an adjacent robot one tile away; bumps deal 1 damage |
| Häschen | Scout (3 HP, move 5, jumps over obstacles) | *Anschubsen*: shove an adjacent robot so it stumbles away from the bunny — the player steers the direction by positioning the bunny |
| Einhorn | Support (3 HP, move 4) | *Funkelschild*: shield a plushie or a standing tower against the next hit (placeholder for its final magic ability) |

## Planned (not yet implemented)

- Roguelike structure with meta-progression between runs (unlockable characters and item variants).
- 4 levels as 4 distinct zones of the kids' room (only zone 1, "Der Teppich", exists today).
- Many more robot types, heroes to choose from, setup/level/settings screens.
- A backend (player DBs, …); today all state lives in the frontend.

## Quality goals

1. **Extensibility**: new content (heroes, robots, levels, items) is added as data, not code.
2. **Replaceable visuals**: placeholder SVGs will be swapped for sprite art without touching game code.
3. **Testability**: all game rules are unit-testable without a browser.

## Stakeholders

| Stakeholder | Interest |
| --- | --- |
| Kids (players) | Simple, readable, friendly turn-based tactics in German |
| Developers / AI agents | Clear module boundaries, current documentation (see `AGENTS.md`) |
