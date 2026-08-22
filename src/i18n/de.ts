import type { GameEvent, GameState } from "@/engine";

/**
 * All player-facing text lives here, in German. Code, identifiers and
 * documentation stay English (see AGENTS.md).
 */
export const de = {
  title: "Pet's Alliance",
  tagline: "Die Plüschtiere beschützen das Kinderzimmer!",
  play: "Spielen",
  intro:
    "Nachts erwachen die Spielzeugroboter und wollen Chaos stiften, um die Kinder zu wecken. " +
    "Nur die Plüschtiere können sie aufhalten!",
  comingSoon: "Bald verfügbar",
  settings: "Einstellungen",
  chooseTeam: "Team wählen",

  level1Name: "Der Teppich",
  objective: (rounds: number) => `Haltet ${rounds} Runden durch!`,
  round: (round: number, total: number) => `Runde ${round} von ${total}`,
  chaos: "Chaos",
  endTurn: "Zug beenden",
  robotsAreComing: "Die Roboter zeigen ihren Plan …",

  victoryTitle: "Geschafft!",
  victoryText: "Die Kinder haben friedlich weitergeschlafen. Gut gemacht, Plüschtiere!",
  defeatTitle: "Oh nein!",
  defeatChaosText: "Zu viel Chaos – die Kinder sind aufgewacht!",
  defeatHeroesText: "Alle Plüschtiere sind erschöpft. Die Roboter feiern!",
  playAgain: "Nochmal spielen",
  backToTitle: "Zum Titelbild",

  selectHint: "Tippe auf ein Plüschtier oder einen Roboter, um mehr zu erfahren.",
  move: "Bewegen",
  moved: "Schon bewegt",
  acted: "Schon eingesetzt",
  hp: "Herzen",
  shielded: "Beschützt",
  down: "Erschöpft",
  stunnedLabel: "Aufgezogen",

  heroes: {
    teddy: {
      name: "Teddybär",
      description: "Robuster Beschützer – hält viel aus und stellt sich den Robotern in den Weg.",
      ability: "Wegschubsen",
      abilityHint: "Schubst einen Roboter nebenan ein Feld weg. Prallt er gegen etwas, geht er kaputt(er).",
    },
    bunny: {
      name: "Häschen",
      description: "Flinker Späher – springt beim Laufen über Hindernisse und Roboter hinweg.",
      ability: "Anschubsen",
      abilityHint:
        "Schubst einen Roboter nebenan an, sodass er vom Häschen weg stolpert – die Richtung bestimmst du durch deine Position.",
    },
    unicorn: {
      name: "Einhorn",
      description: "Magische Unterstützung für das Team.",
      ability: "Funkelschild",
      abilityHint: "Beschützt ein Plüschtier oder einen Turm vor dem nächsten Treffer.",
    },
  } as Record<string, { name: string; description: string; ability: string; abilityHint: string }>,

  robots: {
    stomper: {
      name: "Stampfer",
      description:
        "Stapft jede Runde in einer geraden Linie auf den nächsten Turm zu und wirft ihn um, sobald er daneben steht.",
    },
    dasher: {
      name: "Flitzer",
      description:
        "Rast geradeaus in seine Blickrichtung und rammt das Erste, was ihm im Weg steht.",
    },
  } as Record<string, { name: string; description: string }>,

  stats: {
    move: "Bewegung",
    damage: "Schaden",
  },
  ability: "Fähigkeit",
  heroRuleHint: "Jedes Plüschtier darf sich pro Runde einmal bewegen und einmal seine Fähigkeit einsetzen.",
  robotRuleHint: "Roboter ziehen nur in geraden Linien – wie ein Turm beim Schach. Rote Felder zeigen ihren Plan.",

  items: {
    "windup-key": {
      name: "Aufziehschlüssel",
      hint: "Zieht einen Roboter auf – er setzt eine Runde aus.",
    },
  } as Record<string, { name: string; hint: string }>,

  targetHint: {
    move: "Wohin soll es gehen?",
    push: "Welchen Roboter wegschubsen?",
    nudge: "Welchen Roboter anschubsen?",
    shield: "Wen oder was beschützen?",
    item: "Welchen Roboter aufziehen?",
  } as Record<string, string>,
};

function heroName(state: GameState, heroId: string): string {
  const hero = state.heroes.find((h) => h.id === heroId);
  return hero ? de.heroes[hero.defId].name : "?";
}

function robotName(state: GameState, robotId: string): string {
  // The robot may already be gone (destroyed); its def id is in the unit id.
  const robot = state.robots.find((r) => r.id === robotId);
  const defId = robot?.defId ?? robotId.split("-")[1];
  return de.robots[defId]?.name ?? "Roboter";
}

/** Turns an engine event into a German sentence for the event ticker. */
export function eventText(state: GameState, event: GameEvent): string {
  switch (event.type) {
    case "towerToppled":
      return `${robotName(state, event.robotId)} hat einen Turm umgeworfen!`;
    case "heroHit":
      return `${robotName(state, event.robotId)} hat ${heroName(state, event.heroId)} getroffen!`;
    case "shieldBlocked":
      return event.heroId
        ? `Das Funkelschild hat ${heroName(state, event.heroId)} beschützt!`
        : "Das Funkelschild hat einen Turm beschützt!";
    case "heroDown":
      return `${heroName(state, event.heroId)} ist erschöpft!`;
    case "robotBumped":
      return `${robotName(state, event.robotId)} ist angeeckt und hat gewackelt!`;
    case "robotDestroyed":
      return `Ein Roboter ist kaputtgegangen!`;
    case "robotStunnedSkip":
      return `${robotName(state, event.robotId)} war aufgezogen und hat ausgesetzt.`;
    case "robotSpawned":
      return `Ein neuer Roboter ist aufgetaucht!`;
    case "robotExited":
      return `${robotName(state, event.robotId)} ist vom Spielfeld gepurzelt!`;
  }
}
