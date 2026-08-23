# Pet's Alliance: Game Mechanics

This document describes the implemented rules and content. The game is a
turn-based defense game on an 8×8 orthogonal grid. The player controls
plushies; toy robots try to topple chaos targets and wake the children.

Player-facing text is German and is defined in `src/i18n/de.ts`. German text
quoted below is the current in-game explanation.

## Objective and turn flow

- Each level starts at round 1 in the `playerTurn` phase.
- Every living plushie may move once and use its ability once per round.
  German: **„Jedes Plüschtier darf sich pro Runde einmal bewegen und einmal
  seine Fähigkeit einsetzen.“**
- The player ends the turn with **„Zug beenden“**.
- The robot phase queues all robots and executes them one at a time. The UI
  previews their plans with red path and attack tiles.
- After all robots act, due spawns are created, defeated checks are evaluated,
  hero actions and shields reset, and the next player round begins.
- The player wins after completing the configured number of rounds.
- The player loses if all plushies have 0 HP or the number of toppled
  toppleable props reaches the level's chaos limit.

The HUD uses **„Runde X von Y“**, **„Chaos“**, and the objective
**„Haltet Y Runden durch!“**. Victory text is **„Die Kinder haben friedlich
weitergeschlafen. Gut gemacht, Plüschtiere!“**. Defeat text is either
**„Zu viel Chaos – die Kinder sind aufgewacht!“** or **„Alle Plüschtiere sind
erschöpft. Die Roboter feiern!“**.

## Grid, occupancy, and movement

- Coordinates are zero-based `(x, y)` on an 8×8 board. North decreases `y`,
  south increases `y`, east increases `x`, and west decreases `x`.
- Adjacency and ability range use Manhattan distance. Area attacks affect the
  four orthogonally adjacent tiles, not diagonals.
- A tile is blocked for normal movement when occupied by a living hero, a
  robot, or a standing prop. A toppled prop is flat rubble and can be crossed.
- Heroes use breadth-first movement up to their movement value. A non-jumping
  hero cannot pass through blocked tiles. A jumping hero may pass over blocked
  tiles, but may only land on a free tile.
- Heroes cannot move diagonally and cannot move after they have already moved.
- Robot movement is orthogonal and straight-line only (rook-like), never
  around corners. German: **„Roboter ziehen nur in geraden Linien – wie ein
  Turm beim Schach.“**
- Robots stop before a blocker. Their AI chooses a straight path that gets
  closest to its target, with ties favoring the shorter path.
- A blocked robot spawn is delayed by one round.

## Player characters

| Code / German name | HP | Move | Ability | Rules and German explanation |
| --- | ---: | ---: | --- | --- |
| `teddy` / **Teddybär** | 5 | 3 | Push, range 1 | **„Robuster Beschützer – hält viel aus und stellt sich den Robotern in den Weg.“** **„Wegschubsen“** pushes an adjacent robot one tile away. If the destination is blocked or off-board, the robot bumps and takes 1 damage instead. |
| `bunny` / **Häschen** | 3 | 5 | Nudge, range 1 | **„Flinker Späher – springt beim Laufen über Hindernisse und Roboter hinweg.“** **„Anschubsen“** makes an adjacent robot stumble away from the bunny; the bunny's position determines the direction. |
| `unicorn` / **Einhorn** | 3 | 4 | Shield, range 3 | **„Magische Unterstützung für das Team.“** **„Funkelschild“** protects a living plushie or standing toppleable prop from its next hit or topple attempt. The caster may target itself. |

All ability targets must be in range and the ability can be used only once per
round. Heavy robots cannot be pushed or nudged. The German ability hints are:

- Push: **„Schubst einen Roboter nebenan ein Feld weg. Prallt er gegen etwas,
  geht er kaputt(er).“**
- Nudge: **„Schubst einen Roboter nebenan an, sodass er vom Häschen weg stolpert
  – die Richtung bestimmst du durch deine Position.“**
- Shield: **„Beschützt ein Plüschtier oder einen Turm vor dem nächsten Treffer.“**

## Robots

Robots select standing toppleable props as targets before living heroes. If no
toppleable props remain, they target heroes.

| Code / German name | HP | Move | Damage | Behavior |
| --- | ---: | ---: | ---: | --- |
| `stomper` / **Stampfer** | 2 | 2 | 1 | Marches in a straight line toward the nearest target and topples or hits it when adjacent. German: **„Stapft jede Runde in einer geraden Linie auf den nächsten Turm zu und wirft ihn um, sobald er daneben steht.“** |
| `dasher` / **Flitzer** | 1 | 3 | 1 | Charges in its facing direction and attacks the first hero or standing prop in its lane. German: **„Rast geradeaus in seine Blickrichtung und rammt das Erste, was ihm im Weg steht.“** |
| `spinner` / **Kreisel** | 2 | 1 | 1 | Moves toward a target, then attacks all four adjacent tiles. German: **„Dreht sich wild im Kreis und trifft nach seinem Zug ALLE vier Felder um sich herum — haltet Abstand!“** |
| `bomber` / **Knalli** | 1 | 2 | 1 | Moves toward the nearest target; when adjacent, blasts all four adjacent tiles and destroys itself. German: **„Flitzt zum nächsten Turm und macht dort BUMM: Die Explosion trifft alles daneben — und Knalli selbst ist danach weg.“** |
| `rostzahn` / **Rostzahn** | 4 | 1 | 2 | A heavy boss with stomper behavior. It cannot be pushed or nudged. German: **„Der Anführer der Roboter: langsam, aber riesig stark. Zu schwer zum Schubsen — nur der Aufziehschlüssel oder viele Rempler halten ihn auf.“** |

When a robot is blocked while trying to move directionally, it turns clockwise
to find a new lane on its next plan. A robot can be confused by Nudge; it then
stumbles in its facing direction and may fall off the board.

## Terrain and floor tiles

Terrain is placed on top of the level's checkerboard floor. Floor appearance
(`tile-light`/`tile-dark`, wood, track, or desk variants) is visual only.

| Code / German name | Mechanic |
| --- | --- |
| `marbles` / **Murmeln** | A robot that ends movement on marbles keeps sliding in its movement direction while it remains on marbles. Sliding stops on a non-marble tile, a blocker, or when the robot leaves the board. Pushing a robot onto marbles also starts sliding. Plushies are unaffected. German level text: **„Vorsicht, hier rollt alles!“** and **„Murmel-Bahnen — wer draufrollt, rutscht weiter!“** |
| `cushion` / **Kissen** | Robots cannot enter or roll onto cushions; cushions therefore stop robot paths. Plushies may stand and move onto them. German: **„weiche Kissen, auf die kein Roboter rollen kann.“** |

## Props and chaos

- `tower` / **Turm** (Bauklotz-Turm), `books` / **Bücherstapel**, and
  `musicbox` / **Spieluhr** are toppleable chaos targets.
- `blocks` / **Bauklötze** are non-toppleable blocking obstacles.
- A robot attack on a toppleable prop marks it toppled and increments the chaos
  count. A shielded prop consumes its shield instead.
- Reaching `maxChaos` immediately causes defeat after the robot phase.
- The level UI describes the objective with **„Chaos“** and refers to the
  music box as **„die Spieluhr“**.

## Item

`windup-key` / **Aufziehschlüssel** targets any robot and makes it skip its next
robot execution. The item is consumed on use. German: **„Zieht einen Roboter
auf – er setzt eine Runde aus.“** Level 1 and 2 provide one key; levels 3 and
4 provide two.

## Damage, shields, and robot interactions

- A robot hit reduces a hero's HP by the robot's damage, never below zero.
  At 0 HP the hero is **„erschöpft“** and no longer blocks tiles or counts as a
  living target.
- A shield absorbs exactly one hero hit or one topple attempt, then disappears.
  Shields reset at the start of the next player round.
- A push into a blocked tile or off-board deals one damage to a non-heavy robot.
  At 0 HP it is removed.
- A robot that falls off the board is removed.
- A bomber is removed after its explosion. A spinner attacks after moving; its
  attack can hit multiple occupants, one per affected tile.

## Engine events and German event text

The event ticker translates these `GameEvent` types:

| Event type | Meaning | German ticker pattern |
| --- | --- | --- |
| `towerToppled` | A robot toppled a toppleable prop. | **„{Roboter} hat {Prop} umgeworfen!“** |
| `heroHit` | A robot damaged a hero. | **„{Roboter} hat {Plüschtier} getroffen!“** |
| `shieldBlocked` | A shield prevented a hit or topple. | **„Das Funkelschild hat {Ziel} beschützt!“** |
| `heroDown` | A hero reached 0 HP. | **„{Plüschtier} ist erschöpft!“** |
| `robotBumped` | A blocked push damaged a robot. | **„{Roboter} ist angeeckt und hat gewackelt!“** |
| `robotDestroyed` | A robot reached 0 HP and was removed. | **„Ein Roboter ist kaputtgegangen!“** |
| `robotExploded` | A bomber completed its blast and was removed. | **„{Roboter} ist mit einem lauten BUMM explodiert!“** |
| `robotStunnedSkip` | A wind-up-key target skipped its action. | **„{Roboter} war aufgezogen und hat ausgesetzt.“** |
| `robotSpawned` | A scheduled robot entered the board. | **„Ein neuer Roboter ist aufgetaucht!“** |
| `robotExited` | A robot fell off the board. | **„{Roboter} ist vom Spielfeld gepurzelt!“** |

## Level configurations

All levels use an 8×8 board. Positions below are `(x, y)` coordinates.
`roundsToSurvive` is the required completed round count and `maxChaos` is the
defeat threshold.

### Level 1 — `level-1`, **„Der Teppich“**

German tagline: **„Die Bauklotz-Türme wackeln schon!“** Feature:
**„Lerne Stampfer und Flitzer kennen.“**

- Survive 5 rounds; defeat at 3 toppled props.
- Heroes: Teddy `(2,6)`, Bunny `(4,6)`, Unicorn `(3,7)`.
- Starting robots: Stampfer `(1,0)`, Flitzer `(6,0)`.
- Spawns: round 2 Stampfer `(0,0)`; round 3 Flitzer `(4,0)`; round 4
  Stampfer `(7,0)`.
- Props: towers `(2,3)`, `(5,3)`, `(4,5)`, `(1,5)`; blocks `(0,4)`,
  `(4,2)`, `(6,5)`.
- Terrain: none. Items: one wind-up key.

### Level 2 — `level-2`, **„Die Bücherecke“**

German tagline: **„Kreisel wirbeln zwischen den Bücherstapeln.“** Feature:
**„Neu: Kreisel-Roboter und weiche Kissen, auf die kein Roboter rollen kann.“**

- Survive 6 rounds; defeat at 3 toppled props.
- Floor: light/dark wood tiles.
- Heroes: Teddy `(2,6)`, Bunny `(5,6)`, Unicorn `(3,7)`.
- Starting robots: Spinner `(4,0)`, Stampfer `(1,0)`.
- Spawns: round 2 Flitzer `(6,0)`; round 3 Spinner `(2,0)`; round 4
  Stampfer `(7,0)`; round 5 Flitzer `(0,0)`.
- Props: books `(1,3)`, `(6,3)`, `(3,4)`, `(4,2)`; blocks `(0,2)`, `(7,2)`.
- Terrain: cushions `(2,5)`, `(3,5)`, `(5,5)`, `(6,4)`.
- Items: one wind-up key.

### Level 3 — `level-3`, **„Die Murmelbahn“**

German tagline: **„Vorsicht, hier rollt alles!“** Feature:
**„Neu: Knalli-Roboter und Murmel-Bahnen — wer draufrollt, rutscht weiter!“**

- Survive 6 rounds; defeat at 3 toppled props.
- Floor: light/dark track tiles.
- Heroes: Teddy `(1,6)`, Bunny `(6,6)`, Unicorn `(3,7)`.
- Starting robots: Bomber `(3,0)`, Stampfer `(6,0)`.
- Spawns: round 2 Flitzer `(1,0)`; round 3 Bomber `(5,0)`; round 4 Stampfer
  `(2,0)`; round 5 Bomber `(7,0)`.
- Props: towers `(0,5)`, `(7,5)`, `(3,6)`, `(4,4)`; blocks `(1,1)`, `(6,1)`.
- Terrain: marbles `(2,2)`, `(2,3)`, `(2,4)`, `(2,5)`, `(5,2)`, `(5,3)`,
  `(5,4)`, `(5,5)`, `(3,3)`, `(4,3)`.
- Items: two wind-up keys.

### Level 4 — `level-4`, **„Die Schreibtisch-Festung“**

German tagline: **„Rostzahn kommt. Beschützt die Spieluhr!“** Feature:
**„Finale: Boss Rostzahn, alle Roboter, Murmeln und Kissen zugleich.“**

- Survive 7 rounds; defeat at 4 toppled props.
- Floor: light/dark desk tiles.
- Heroes: Teddy `(2,6)`, Bunny `(5,6)`, Unicorn `(3,7)`.
- Starting robots: Rostzahn `(3,0)`, Flitzer `(6,0)`.
- Spawns: round 2 Spinner `(1,0)`; round 3 Bomber `(5,0)`; round 4 Stampfer
  `(7,0)`; round 5 Spinner `(4,0)`; round 6 Bomber `(0,0)`.
- Props: music box `(3,5)`; towers `(1,4)`, `(6,4)`, `(4,3)`; books
  `(5,2)`; blocks `(0,2)`, `(7,2)`.
- Terrain: marble gutters at `(0,3)`–`(0,6)` and `(7,3)`–`(7,6)`;
  cushions `(2,4)` and `(5,5)`.
- Items: two wind-up keys.
