import { describe, expect, it } from "vitest";
import { de, eventText, type TickerEvent } from "./de";

const state = {
  heroes: [{ id: "hero-1", defId: "teddy" }],
  robots: [
    { id: "robot-1", defId: "stomper" },
    { id: "robot-2", defId: "rostzahn" },
  ],
  props: [
    { id: "prop-1", defId: "tower" },
    { id: "prop-2", defId: "musicbox" },
  ],
};

describe("eventText", () => {
  const cases: [TickerEvent, string][] = [
    [
      { type: "towerToppled", robotId: "robot-1", propId: "prop-1" },
      "Stampfer hat einen Turm umgeworfen!",
    ],
    [
      { type: "towerToppled", robotId: "robot-2", propId: "prop-2" },
      "Rostzahn hat die Spieluhr umgeworfen!",
    ],
    [
      { type: "heroHit", robotId: "robot-1", heroId: "hero-1" },
      "Stampfer hat Teddybär getroffen!",
    ],
    [
      { type: "shieldBlocked", heroId: "hero-1" },
      "Das Funkelschild hat Teddybär beschützt!",
    ],
    [
      { type: "shieldBlocked", propId: "prop-2" },
      "Das Funkelschild hat die Spieluhr beschützt!",
    ],
    [{ type: "heroDown", heroId: "hero-1" }, "Teddybär ist erschöpft!"],
    [
      { type: "robotBumped", robotId: "robot-1" },
      "Stampfer ist angeeckt und hat gewackelt!",
    ],
    [{ type: "robotDestroyed", robotId: "robot-1" }, "Ein Roboter ist kaputtgegangen!"],
    [
      { type: "robotExploded", robotId: "robot-1" },
      "Stampfer ist mit einem lauten BUMM explodiert!",
    ],
    [
      { type: "robotStunnedSkip", robotId: "robot-2" },
      "Rostzahn war aufgezogen und hat ausgesetzt.",
    ],
    [{ type: "robotSpawned", robotId: "robot-1" }, "Ein neuer Roboter ist aufgetaucht!"],
    [
      { type: "robotExited", robotId: "robot-1" },
      "Stampfer ist vom Spielfeld gepurzelt!",
    ],
    [
      { type: "cannonballHit", robotId: "robot-2" },
      "Die Kanonenkugel hat Rostzahn getroffen!",
    ],
  ];

  it.each(cases)("translates %j", (event, expected) => {
    expect(eventText(state, event)).toBe(expected);
  });

  it("has quotes for every hero and robot", () => {
    for (const heroId of ["teddy", "bunny", "unicorn"]) {
      expect(de.victoryQuotes[heroId]).toBeTruthy();
      expect(de.heroes[heroId].name).toBeTruthy();
      expect(de.heroes[heroId].ability).toBeTruthy();
    }
    for (const robotId of ["stomper", "dasher", "kipplaster", "bomber", "rostzahn"]) {
      expect(de.defeatQuotes[robotId]).toBeTruthy();
      expect(de.robots[robotId].name).toBeTruthy();
    }
  });

  it("formats round and chaos strings", () => {
    expect(de.round(2, 5)).toBe("Runde 2 von 5");
    expect(de.chaosScore(1, 3)).toBe("Chaos 1 von 3");
    expect(de.objective(6)).toBe("Haltet 6 Runden durch!");
  });
});
