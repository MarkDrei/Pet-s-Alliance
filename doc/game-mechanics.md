# Pet's Alliance: Game Mechanics

This document describes the game rules and content. The game is a
turn-based defense game on a hexagonal board designed for a vertical mobile
screen. The player controls
plushies; toy robots try to topple chaos targets and wake the children.

Player-facing text is German and is defined in `src/i18n/de.ts`. German
text quoted below matches those strings.
Level encounters (boards, spawns, round counts, `maxChaos`, starting
plushies) are not part of this file.

## Objective and turn flow

Each round has a fixed order. Robots plan once at the start of the round.
The player then sees every plan and may interfere. Robots never replan
that round: they only execute the published intent, including any player
changes to it.

1. **Planning.** Every robot already on the board gets one intent: a
   facing, a step count, and an attack shape (which tiles it will hit).
   The UI previews all plans with red path and attack tiles.
2. **Player turn.** The player activates one living plushie at a time
   and does not return to it later. For that plushie: optional move
   first, then optional ability. Move may be skipped; ability may be
   skipped; if both happen, move is first. Global items may be used at
   any moment during the player turn and do not belong to a plushie's
   move or ability. German: **„Jedes Plüschtier darf sich pro Runde
   einmal bewegen und einmal seine Fähigkeit einsetzen.“** Unused
   plushies may be left idle. The player ends the turn with
   **„Zug beenden“**.
3. **Robot execution.** Robots act in level-list order, **one at a time**
   (new spawns append to the end), using the (possibly modified) intent.
   The next robot does not start until the current robot's walk and
   attack animations have finished. They do not choose a new facing and
   they do not search for a new path. They walk, then hit the tiles
   their shape already named. It must always be obvious which robot is
   acting.
4. **Round close.** Due spawns are created, then lose checks, then the
   win check. Hero actions and leftover shields reset. If the level
   continues, the next round starts at planning again.

- A level starts at round 1 in the planning step.
- **Lose first.** After robot execution, if every plushie is at 0 HP or
  the toppled-prop count has reached `maxChaos`, the player loses —
  including on the last round.
- **Win only if still standing.** If neither lose condition is true and
  the player has completed the configured number of rounds (this robot
  phase was the last one), the player wins.
- After a win or a loss, the **result screen** is shown (see below).

The HUD uses **„Runde X von Y“**, **„Chaos“**, and the objective
**„Haltet Y Runden durch!“**.

## Presentation, animation, and inspect

The board is the story. Nothing important happens off-screen or in an
instant skip. Every action has its **own** animation, and the next
action waits until that animation ends.

Animated actions include at least: plushie walk, bunny jump, Push
(shove then forced travel), Nudge (facing turn on the spot), shield
cast, wind-up key, cannonball, robot walk, marble slide, Stampfer /
Rostzahn front-hex hit, Flitzer crash, Kreisel spin, Knalli blast,
topple, bump, shield block, plushie exhausted (removed), robot
destroyed, robot exiting the board, and a spawn arriving.

During robot execution the acting robot is highlighted. Only its current
path and attack tiles stay fully lit; other robots' plans dim. The event
ticker speaks after or with that robot's animation, not as a substitute
for it. A skipped (wound-up) robot still gets a short skip animation
before the next robot starts.

Tapping a piece on the board opens an inspect panel (German text from
`src/i18n/de.ts`). Tap the same piece or empty floor to close it.

- **Plushie:** name, hearts, move, ability name and hint, whether it
  still may move or use its ability this round.
- **Robot:** name, hearts, move, damage, behavior text, heavy / wound-up
  if it applies, and its **published plan** (path tiles and attack
  tiles). After a Push or Nudge the inspect preview matches the updated
  plan.
- **Prop or terrain:** name and what it does (toppleable chaos target,
  blocking blocks, marbles, cushion). A shielded prop shows that it is
  protected.

Inspect is always available on the player turn. During robot execution
the acting robot is the default inspect target so it stays clear what
is happening.

## Grid, occupancy, and movement

- Tiles are **flat-top** hexes: the flat sides face up and down, the
  points face left and right. Each tile has six neighbors (E, W, NE, NW,
  SE, SW). Connections that look diagonal on a portrait screen are
  normal hex edges.
- The board is laid out for a vertical screen: the left and right
  boundary files each contain seven tiles (those files are staggered,
  as flat-top columns always are). From the uppermost tile of each
  boundary, the board continues diagonally toward the top for four hex
  steps; from the lowermost tile of each boundary, it continues
  diagonally toward the bottom for four hex steps. The left and right
  boundaries are eight hex steps apart.
- Ability range counts hex steps. Area attacks affect the neighboring hexes
  defined by the ability, not arbitrary screen diagonals.
- A tile is blocked for normal movement when occupied by a living hero, a
  robot, or a standing prop. A toppled prop is flat rubble and can be crossed.
- Heroes use breadth-first movement up to their movement value. A non-jumping
  hero cannot pass through blocked tiles. A jumping hero may pass over blocked
  tiles, but may only land on a free tile.
- Heroes cannot move across non-adjacent hexes and cannot move after they have
  already moved.
- Robots move along connected hex edges and stop before a blocker. Their
  AI only uses a "target" to pick a facing; attacks hit tiles, not a
  chosen entity. Exact planning is defined below.
- A blocked robot spawn is delayed by one round. A spawn tile is blocked
  when it is a cushion or occupied by a living hero, a robot, or a
  standing prop. Toppled rubble is not blocked. Exhausted plushies are
  removed from the board, so they never occupy a spawn tile.

## Player characters

| Code / German name | HP | Move | Ability | Rules and German explanation |
| --- | ---: | ---: | --- | --- |
| `teddy` / **Teddybär** | 5 | 3 | Push, range 1 | **„Robuster Beschützer – hält viel aus und stellt sich den Robotern in den Weg.“** **„Wegschubsen“** immediately shoves an adjacent non-heavy robot one hex away from Teddy, then forces it to keep travelling in that same direction up to the robot's Move value, or until a blocker or the board edge. Hitting a blocker or leaving the board deals 1 damage; leaving the board also removes the robot. If it lands on or crosses marbles, marble sliding applies immediately. The shove does not replace the published plan: the planned step count and planned direction stay. The preview redraws that same line from the robot's new tile. During robot execution the robot still walks those steps, then attacks as planned. A pushed robot can therefore move twice in one round. |
| `bunny` / **Häschen** | 3 | 5 | Nudge, range 1 | **„Flinker Späher – springt beim Laufen über Hindernisse und Roboter hinweg.“** **„Umlenken“** does not move the robot. It only changes the direction of the robot's already published movement. The number of steps stays exactly what the plan already chose. The new direction is away from the bunny; the bunny's position is how the player aims. |
| `unicorn` / **Einhorn** | 3 | 4 | Shield, range 3 | **„Magische Unterstützung für das Team.“** **„Funkelschild“** protects a living plushie or standing toppleable prop from its next hit or topple attempt. The caster may target itself. |

All ability targets must be in range and the ability can be used only once per
round. Heavy robots cannot be pushed or nudged. The German ability hints are:

- Push: **„Schubst einen Roboter nebenan weg. Er rutscht weiter, so weit
  er laufen kann. Prallt er gegen etwas oder vom Rand, geht er
  kaputt(er). Seinen Plan behält er.“**
- Nudge: **„Dreht nur die Richtung eines Roboters nebenan — weg vom
  Häschen. Wie weit er läuft, steht schon in seinem Plan.“**
- Shield: **„Beschützt ein Plüschtier oder etwas, das umfallen kann, vor
  dem nächsten Treffer.“**

## Robots

A robot attack hits **tiles**, never a remembered entity. Planning still
picks a nearby prop or hero, but only to choose a facing and a step
count. After the robot walks, it applies its attack shape to whatever
now sits on those tiles — empty, plushie, robot, or prop.

### NPC decision and pathfinding rules

The engine computes one intent for every robot during the planning step,
before the player turn. An intent is a facing, a step count (the path),
and an attack shape. The player sees every plan and may change a robot's
position (Push), rotate its facing (Nudge), or skip the execution
(wind-up key). Robots never replan in the same round.

A Push leaves facing and step count unchanged. The preview redraws those
steps from the new tile. Nudge leaves the robot where it is and only
rotates facing; the step count stays, so "the tile in front" rotates
with it. If both hit the same robot, apply them in the order the player
used the abilities.

Robots then execute in array order, one at a time. Each planned step is
rechecked. If the next tile is blocked, the robot stops and the rest of
the path is discarded, then the attack shape still happens from where it
stands.

**Planning target** (facing only):

1. Collect all standing toppleable props.
2. If that list is non-empty, ignore heroes and use only those props.
3. Otherwise collect all living heroes.
4. Select the candidate with the smallest hex distance from the robot.
   Equal-distance candidates keep the first order returned by the state
   arrays (props or heroes); there is no random choice.

For `stomper`, `spinner`, `bomber`, `dasher`, and `rostzahn` movement,
pathfinding evaluates the six hex directions. For each direction it
generates a connected run of at most the robot's `move` value:

- Stop before the board edge or the first tile blocked for robots.
- A cushion is blocked for robots. A hero, robot, or standing prop is
  also blocked. Toppled props are not blocked.
- Consider every reachable stopping point on that line, not just the
  endpoint.
- Compare each point by hex distance to the planning target.
- Keep a point only when it is strictly closer than the current best
  point. The first direction and stopping point that win a distance tie
  stay selected. A robot does not route around blockers and does not
  walk farther away to approach later.
- If no candidate is strictly closer than the current position, the path
  is empty. Facing is still the direction toward the planning target
  (the first hex step on a shortest line; ties use the same first-win
  direction order as above).

`stomper`, `rostzahn`, `spinner`, and `bomber` publish that facing and
step count.

`dasher` must charge at least one free hex. It never enters the crash
tile: it stops on the last free hex before a living hero, robot, or
standing prop and hits that crash tile. An adjacent pet or obstacle is
not a legal crash — the dasher must move away and aim at something else.

- If the nearest planning target is adjacent, skip it and take the next
  (still props before heroes; skip every adjacent candidate).
- Only facings whose first step is a free in-board tile are legal.
- Among those, use the same strictly-closer search toward the chosen
  planning target. The published path is that charge, up to Move, ending
  on the last free hex; the next hex on the line is the crash tile if
  occupied.
- If the lane is empty, it charges to the last free in-board tile and
  does not attack.
- If no legal facing or no remaining planning target exists, the path is
  empty and it does not attack.

Marble sliding is terrain physics, not a new AI plan. The preview
includes it, and after a Nudge or Push the slide is redrawn on the new
line. The robot slides across every marble hex in its current facing and
lands on the first non-marble hex. If that hex is blocked or off the
board, it does not enter: bump, and it stays on the last marble. If the
track runs off the board, it exits and is removed. A Push onto marbles
slides immediately the same way. Plushies never slide.

### Attack shapes

Movement includes every planned step and any marble slide after those
steps. Then the robot hits tiles from its final hex, still using the
same facing. Occupancy of a hit tile is resolved the same way for every
robot:

- Empty: nothing.
- Living plushie: that robot's damage, or a shield eats the hit.
- Other robot: bump (1 damage).
- Standing toppleable prop: topple, or a shield eats the topple.
- Bauklötze: hit, they stay standing.

| Code / German name | HP | Move | Damage | Behavior |
| --- | ---: | ---: | ---: | --- |
| `stomper` / **Stampfer** | 2 | 2 | 1 | Walks the planned steps (or fewer if blocked), then hits the single hex in front — the next hex in its facing. German: **„Stapft in einer geraden Linie Richtung nächstem Turm. Nach dem Zug trifft er das Feld genau vor sich — ganz gleich, was dort steht.“** |
| `dasher` / **Flitzer** | 1 | 3 | 1 | Must move at least one hex. Stops on the last free hex, then hits the next hex (crash tile). If already adjacent to a pet or obstacle, it plans a different line and a different crash. No charge means no attack. German: **„Rast geradeaus und rammt das nächste Feld, aber nur nach mindestens einem Schritt. Steht schon etwas direkt davor, sucht er sich eine andere Bahn.“** |
| `spinner` / **Kreisel** | 2 | 1 | 1 | Walks, then hits all six neighboring hexes. German: **„Dreht sich wild im Kreis und trifft nach seinem Zug ALLE sechs Nachbarfelder — haltet Abstand!“** |
| `bomber` / **Knalli** | 1 | 2 | 1 | Walks, then hits all six neighboring hexes and is removed. It always blasts after its walk, even if every neighbor is empty. German: **„Läuft und macht dann BUMM: Die Explosion trifft alle sechs Nachbarfelder — und Knalli selbst ist danach weg. Immer, auch wenn niemand daneben steht.“** |
| `rostzahn` / **Rostzahn** | 4 | 1 | 2 | Stampfer shape (one hex in front) with 2 damage. Push and Nudge do not move it and do not change its plan. It still takes bumps. German: **„Der Anführer der Roboter: langsam, aber riesig stark. Zu schwer zum Schubsen oder Umlenken — nur der Aufziehschlüssel, die Kanonenkugel oder viele Rempler halten ihn auf.“** |

## Terrain and floor tiles

Terrain is placed on top of the level's checkerboard floor. Floor appearance
(`tile-light`/`tile-dark`, wood, track, or desk variants) is visual only.

| Code / German name | Mechanic |
| --- | --- |
| `marbles` / **Murmeln** | A robot that moves or is shoved onto marbles slides in its current facing across every marble hex and lands on the first non-marble hex. If that hex is blocked or off the board: bump, stay on the last marble. If the track runs off the board, the robot is removed. Plushies never slide. German level text: **„Vorsicht, hier rollt alles!“** and **„Murmel-Bahnen — wer draufrollt, rutscht weiter!“** |
| `cushion` / **Kissen** | Robots cannot enter or roll onto cushions; cushions therefore stop robot paths. Plushies may stand and move onto them. German: **„weiche Kissen, auf die kein Roboter rollen kann.“** |

## Props and chaos

- `tower` / **Turm** (Bauklotz-Turm), `books` / **Bücherstapel**, and
  `musicbox` / **Spieluhr** are toppleable chaos targets.
- `blocks` / **Bauklötze** are non-toppleable blocking obstacles.
- A robot attack on a toppleable prop marks it toppled and increments the chaos
  count. A shielded prop consumes its shield instead.
- Reaching `maxChaos` is a lose check at round close (lose first).
- The three toppleable props are mechanically identical; the music box
  is only a named piece. The level UI describes the objective with
  **„Chaos“** and refers to the music box as **„die Spieluhr“**.

## Items

Global items are used on the player turn, target any robot on the board
(no range limit), and do not spend a plushie's move or ability. Both
items may be used in the same round.

| Code / German name | Uses | Effect |
| --- | --- | --- |
| `windup-key` / **Aufziehschlüssel** | Once per round, unlimited times per level | The target skips its execution this round (no walk, no attack). German: **„Zieht einen Roboter auf – er setzt diese Runde aus. Jede Runde wieder einsetzbar.“** |
| `cannonball` / **Kanonenkugel** | Once per level | Deals 2 damage to the target, or 1 damage if the target is Rostzahn. At 0 HP the robot is removed. German: **„Schießt auf einen Roboter: 2 Schaden, bei Rostzahn nur 1. Einmal pro Level.“** |

The wind-up key is ready again at the start of the next player turn. The
cannonball is gone for the rest of the level after one use.

## Result screen

When the level ends, the player sees a full-screen result (not a ticker
line). It always shows the outcome text, the speaker, that speaker's
line, and the chaos score **„Chaos X von Y“** (toppled count and
`maxChaos`).

- **Win.** Outcome: **„Die Kinder haben friedlich weitergeschlafen. Gut
  gemacht, Plüschtiere!“** Pick one plushie at random from the level
  roster (including any that were exhausted and removed). Show that
  plushie and its victory line.
- **Lose (chaos).** Outcome: **„Zu viel Chaos – die Kinder sind
  aufgewacht!“**
- **Lose (wipe).** Outcome: **„Alle Plüschtiere sind erschöpft. Die
  Roboter feiern!“**
- **Lose (either).** Pick one robot at random that is still on the
  board. Show that robot and its defeat line. If no robot remains
  (every robot already left or exploded), pick the last robot that was
  removed this level.

Speaker lines live in `src/i18n/de.ts`:

| Speaker | Result | German line |
| --- | --- | --- |
| `teddy` | Win | **„Ich halt die Stellung. Immer.“** |
| `bunny` | Win | **„Hüpf und weg — und die Roboter auch!“** |
| `unicorn` | Win | **„Ein bisschen Glitzer hält die Nacht ruhig.“** |
| `stomper` | Lose | **„Stampfen, umwerfen, fertig.“** |
| `dasher` | Lose | **„Zu langsam! Ich war schon da.“** |
| `spinner` | Lose | **„Alles dreht sich — besonders eure Türme!“** |
| `bomber` | Lose | **„BUMM. Gute Nacht war gestern.“** |
| `rostzahn` | Lose | **„Zu schwer zum Schubsen. Zu spät zum Schlafen.“** |

## Damage, shields, and robot interactions

- A robot hit reduces a hero's HP by the robot's damage, never below zero.
  At 0 HP the hero is **„erschöpft“** and is removed from the board.
- A shield absorbs exactly one hero hit or one topple attempt, then disappears.
  Any remaining shields are cleared when the robot phase ends, before the next
  player round begins.
- **Bump:** 1 damage. A bump never moves a heavy robot. Sources:
  a forced Push or marble slide hitting a blocker or the board edge
  (the moving robot is bumped; if the blocker is a robot, that robot is
  bumped too); a dasher ram against a robot; a heavy robot that itself
  marble-slides into a blocker or off the board. At 0 HP the robot is
  removed. Leaving the board also removes it even if it still has HP.
- Push (player turn, immediate): a non-heavy robot is shoved one hex away
  from Teddy, then forced along that same direction up to its Move value
  or until a blocker or the board edge. If the first hex away is already
  blocked or off the board, the robot does not move and that is still a
  bump. A hit on a later blocker or the edge is a bump. A push onto
  marbles starts sliding immediately. The
  published plan is not cancelled: after the shove, the same planned
  direction and step count are redrawn from the new tile and still
  execute in the robot phase. Heavy robots are invalid Push targets.
- Nudge (player turn): no tile change. The published path is rotated so
  its steps run away from the bunny. Step count is unchanged. Marble
  sliding is terrain physics: if the new path later moves onto marbles
  during execution, sliding applies then.
- A robot that falls off the board is removed.
- A bomber is removed after its blast even if every hex was empty or
  shielded. A wind-up key skips the whole execution (no walk, no attack,
  no blast).

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
| `cannonballHit` | The cannonball damaged a robot. | **„Die Kanonenkugel hat {Roboter} getroffen!“** |
