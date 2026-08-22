# 6. Runtime View

## The turn loop

```mermaid
sequenceDiagram
    participant P as Player
    participant UI as GameScreen/Board
    participant S as gameStore
    participant E as Engine

    Note over E: createGame computes initial robot intents
    E-->>UI: GameState with visible intents (red tiles)
    loop Player turn
        P->>UI: tap hero
        UI->>S: selectHero
        S-->>UI: move range highlighted
        P->>UI: tap destination
        S->>E: moveHero (validates BFS reachability)
        E-->>S: new state, intents recomputed
        P->>UI: ability / item button + target tap
        S->>E: useAbility / useItem
        E-->>S: new state (push, nudge, shield, stun)
    end
    P->>UI: "Zug beenden"
    S->>E: endPlayerTurn
    Note over E: robots execute intents in order:<br/>move (stop if blocked), attack tile,<br/>topple towers / damage heroes / consume shields
    E->>E: evaluate defeat (all heroes down OR chaos >= max)
    E->>E: evaluate victory (round >= roundsToSurvive)
    E->>E: else round+1, spawn due robots, reset flags, new intents
    E-->>S: new state + events
    S-->>UI: event ticker (German), next round or overlay
```

## Key runtime rules

- **Robots move like a rook in chess**: straight orthogonal lines only, never around corners. The stomper picks the straight line (and stop point) that gets it closest to its target each turn; the dasher charges along its facing direction. A blocker in the lane ends the line — robots cannot route around obstacles.
- **Intents are honest**: whenever the player changes the board (move, push, nudge), affected robot intents are recomputed so the preview always shows what will actually be attempted.
- **Execution is defensive**: a robot stops its planned movement early if a tile became blocked, and its attack whiffs if the target tile is no longer adjacent.
- **Shields** can protect plushies and standing towers; they last until the end of the coming robot phase and absorb exactly one hit (or one topple attempt).
- **Stunned robots** (wind-up key) skip exactly one execution.
- **Spawns** appear at the start of their scheduled round; a blocked spawn tile delays them by one round.
- **Confused robots** (nudged by Häschen) replace their plan with a straight stumble away from the bunny for one turn — the player controls the direction through the bunny's position. If the stumble carries past the board edge, the robot falls off and is removed. Robots never leave the board voluntarily: their own plans always stop at the edge.
