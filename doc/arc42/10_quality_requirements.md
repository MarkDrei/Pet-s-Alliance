# 10. Quality Requirements

| Quality | Scenario | Measure |
| --- | --- | --- |
| Extensibility | A new robot type with an existing behavior is added | Only `src/content/robots.ts` (+ sprite + strings) changes; no engine change |
| Extensibility | A new level/zone is added | New file in `src/content/levels/`; no engine change |
| Replaceable visuals | Sprite art replaces a placeholder | Only the registry entry in `sprites/registry.tsx` changes |
| Testability | A rule change (e.g. push damage) is made | Covered by engine unit tests that run headless in < 5 s |
| Kid-friendly UX | Robot plans are always visible before the player commits | Intent overlays render every robot's path and attack tile each player turn |
| Mobile usability | Game is playable one-handed in portrait | All controls in top/bottom bars; the vertical hex board uses full-tile tap targets |
| Honesty of previews | Player changes the board (move/push/nudge) | Previews reflect hex movement immediately; Teddy pushes preserve the robot's original direction and remaining distance |
