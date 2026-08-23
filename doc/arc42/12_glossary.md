# 12. Glossary

German game terms vs. English code terms.

| German (game) | English (code) | Meaning |
| --- | --- | --- |
| Plüschtier | hero (`HeroState`, `HeroDef`) | Player-controlled unit |
| Teddybär | `teddy` | Tank hero |
| Häschen | `bunny` | Scout hero (jumps) |
| Einhorn | `unicorn` | Support hero |
| Roboter | robot (`RobotState`, `RobotDef`) | Enemy unit |
| Stampfer | `stomper` | Robot that walks toward targets and smashes them |
| Flitzer | `dasher` | Robot that charges in a straight line |
| Kreisel | `spinner` | Slow robot that whirls into all four adjacent tiles after moving |
| Knalli | `bomber` | Robot that marches to a chaos target and self-destructs, blasting all adjacent tiles |
| Rostzahn | `rostzahn` (behavior `stomper`, `heavy`) | Boss: slow, 4 HP, 2 damage, too heavy to push or nudge |
| Wegschubsen | `push` ability | Push an adjacent robot one tile away |
| Anschubsen | `nudge` ability | Shove an adjacent robot so it stumbles away from the bunny |
| Funkelschild | `shield` ability | Block the next hit on a plushie or the next topple attempt on a tower |
| Aufziehschlüssel | `windup-key` item | Stun a robot for one turn |
| Chaos | `chaosCount`, `maxChaos` | Number of toppled targets; reaching the limit wakes the kids (defeat) |
| Turm (Bauklotz-Turm) | `tower` prop | Toppleable chaos target |
| Bauklötze | `blocks` prop | Indestructible obstacle |
| Bücherstapel | `books` prop | Toppleable chaos target in the book corner |
| Spieluhr | `musicbox` prop | Precious toppleable chaos target in the finale |
| Murmeln | `marbles` terrain | Robots that move onto them keep sliding — possibly off the board |
| Kissen | `cushion` terrain | Soft ground robots cannot enter; plushies can |
| Runde | round | One player turn + one robot phase |
| Zug beenden | end turn | Hand over to the robot phase |
| Der Teppich | `level-1` | Zone 1: the carpet (stomper, dasher) |
| Die Bücherecke | `level-2` | Zone 2: the reading corner (adds spinner, cushions, book stacks) |
| Die Murmelbahn | `level-3` | Zone 3: the marble run (adds bomber, marble lanes) |
| Die Schreibtisch-Festung | `level-4` | Zone 4: the desk finale (adds boss Rostzahn, music box, everything combined) |
| Erschöpft | down (hp 0) | A hero at 0 HP is out (but the run continues while any hero stands) |
| Aufgezogen | stunned | Robot skips its next execution |
