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
| Wegschubsen | `push` ability | Push an adjacent robot one tile away |
| Anschubsen | `nudge` ability | Shove an adjacent robot so it stumbles away from the bunny |
| Funkelschild | `shield` ability | Block the next hit on a plushie or the next topple attempt on a tower |
| Aufziehschlüssel | `windup-key` item | Stun a robot for one turn |
| Chaos | `chaosCount`, `maxChaos` | Number of toppled targets; reaching the limit wakes the kids (defeat) |
| Turm (Bauklotz-Turm) | `tower` prop | Toppleable chaos target |
| Bauklötze | `blocks` prop | Indestructible obstacle |
| Runde | round | One player turn + one robot phase |
| Zug beenden | end turn | Hand over to the robot phase |
| Der Teppich | `level-1` | Zone 1: the carpet |
| Erschöpft | down (hp 0) | A hero at 0 HP is out (but the run continues while any hero stands) |
| Aufgezogen | stunned | Robot skips its next execution |
