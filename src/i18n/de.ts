/**
 * All player-facing text lives here, in German. Code, identifiers and
 * documentation stay English (see AGENTS.md).
 *
 * Strings match `doc/game-mechanics.md`.
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

  chooseLevel: "Wähle eine Zone im Kinderzimmer",
  levelLabel: (n: number) => `Level ${n}`,
  nextLevel: "Nächstes Level",

  levels: {
    "level-1": {
      name: "Der Teppich",
      tagline: "Die Bauklotz-Türme wackeln schon!",
      feature: "Lerne Stampfer und Flitzer kennen.",
    },
    "level-2": {
      name: "Die Bücherecke",
      tagline: "Kipplaster schütten zwischen den Bücherstapeln.",
      feature: "Neu: Kipplaster und weiche Kissen, auf die kein Roboter rollen kann.",
    },
    "level-3": {
      name: "Die Murmelbahn",
      tagline: "Vorsicht, hier rollt alles!",
      feature: "Neu: Knalli-Roboter und Murmel-Bahnen — wer draufrollt, rutscht weiter!",
    },
    "level-4": {
      name: "Die Schreibtisch-Festung",
      tagline: "Rostzahn kommt. Beschützt die Spieluhr!",
      feature: "Finale: Boss Rostzahn, alle Roboter, Murmeln und Kissen zugleich.",
    },
  } as Record<string, { name: string; tagline: string; feature: string }>,

  objective: (rounds: number) => `Haltet ${rounds} Runden durch!`,
  round: (round: number, total: number) => `Runde ${round} von ${total}`,
  chaos: "Chaos",
  chaosScore: (current: number, max: number) => `Chaos ${current} von ${max}`,
  endTurn: "Zug beenden",
  robotsAreComing: "Die Roboter zeigen ihren Plan …",
  robotPhase: "Die Roboter sind dran …",

  fx: {
    hit: "-1",
    stunned: "Zzz",
  },

  victoryTitle: "Geschafft!",
  victoryText: "Die Kinder haben friedlich weitergeschlafen. Gut gemacht, Plüschtiere!",
  defeatTitle: "Oh nein!",
  defeatChaosText: "Zu viel Chaos – die Kinder sind aufgewacht!",
  defeatHeroesText: "Alle Plüschtiere sind erschöpft. Die Roboter feiern!",
  playAgain: "Nochmal spielen",
  backToTitle: "Zum Titelbild",

  victoryQuotes: {
    teddy: "Ich halt die Stellung. Immer.",
    bunny: "Hüpf und weg — und die Roboter auch!",
    unicorn: "Ein bisschen Glitzer hält die Nacht ruhig.",
  } as Record<string, string>,

  defeatQuotes: {
    stomper: "Stampfen, umwerfen, fertig.",
    dasher: "Zu langsam! Ich war schon da.",
    kipplaster: "Alles zur Seite — Türme auch!",
    bomber: "BUMM. Gute Nacht war gestern.",
    rostzahn: "Zu schwer zum Schubsen. Zu spät zum Schlafen.",
  } as Record<string, string>,

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
      abilityHint:
        "Schubst einen Roboter nebenan weg. Er rutscht weiter, so weit er laufen kann. Prallt er gegen etwas oder vom Rand, geht er kaputt(er). Seinen Plan behält er.",
    },
    bunny: {
      name: "Häschen",
      description: "Flinker Späher – springt beim Laufen über Hindernisse und Roboter hinweg.",
      ability: "Umlenken",
      abilityHint:
        "Dreht nur die Richtung eines Roboters nebenan — weg vom Häschen. Wie weit er läuft, steht schon in seinem Plan.",
    },
    unicorn: {
      name: "Einhorn",
      description: "Magische Unterstützung für das Team.",
      ability: "Funkelschild",
      abilityHint:
        "Beschützt ein Plüschtier oder etwas, das umfallen kann, vor dem nächsten Treffer.",
    },
  } as Record<string, { name: string; description: string; ability: string; abilityHint: string }>,

  robots: {
    stomper: {
      name: "Stampfer",
      description:
        "Stapft in einer geraden Linie Richtung nächstem Turm. Nach dem Zug trifft er das Feld genau vor sich — ganz gleich, was dort steht.",
    },
    dasher: {
      name: "Flitzer",
      description:
        "Rast geradeaus und rammt das nächste Feld, aber nur nach mindestens einem Schritt. Steht schon etwas direkt davor, sucht er sich eine andere Bahn.",
    },
    kipplaster: {
      name: "Kipplaster",
      description:
        "Kippt nach dem Zug nach links und rechts vorn aus — nicht geradeaus. Wer genau davor steht, ist sicher.",
    },
    bomber: {
      name: "Knalli",
      description:
        "Läuft und macht dann BUMM: Die Explosion trifft alle sechs Nachbarfelder — und Knalli selbst ist danach weg. Immer, auch wenn niemand daneben steht.",
    },
    rostzahn: {
      name: "Rostzahn",
      description:
        "Der Anführer der Roboter: langsam, aber riesig stark. Zu schwer zum Schubsen oder Umlenken — nur der Aufziehschlüssel, die Kanonenkugel oder viele Rempler halten ihn auf.",
    },
  } as Record<string, { name: string; description: string }>,

  props: {
    tower: "einen Turm",
    books: "einen Bücherstapel",
    musicbox: "die Spieluhr",
    blocks: "die Bauklötze",
  } as Record<string, string>,

  heavyLabel: "Zu schwer zum Schubsen",

  inspect: {
    propNames: {
      tower: "Bauklotz-Turm",
      books: "Bücherstapel",
      musicbox: "Spieluhr",
      blocks: "Bauklötze",
    } as Record<string, string>,
    propHints: {
      tower: "Kann umgeworfen werden – das gibt Chaos!",
      books: "Kann umgeworfen werden – das gibt Chaos!",
      musicbox: "Das Herzstück des Kinderzimmers. Fällt sie um, gibt das Chaos!",
      blocks: "Feste Bauklötze – hier kommt niemand durch. Umwerfen unmöglich.",
    } as Record<string, string>,
    toppledLabel: "Umgefallen",
    terrainNames: {
      marbles: "Murmeln",
      cushion: "Kissen",
    } as Record<string, string>,
    terrainHints: {
      marbles: "Murmel-Bahnen — wer draufrollt, rutscht weiter!",
      cushion: "Weiche Kissen, auf die kein Roboter rollen kann.",
    } as Record<string, string>,
    planLabel: "Plan",
    planWalk: (steps: number) =>
      steps === 0
        ? "Bleibt stehen und greift dann an."
        : steps === 1
          ? "Läuft 1 Feld und greift dann an."
          : `Läuft ${steps} Felder und greift dann an.`,
    planNoAttack: "Greift diese Runde nicht an.",
    canStillMove: "Darf noch laufen",
    canStillAct: "Fähigkeit noch bereit",
  },

  stats: {
    move: "Bewegung",
    damage: "Schaden",
  },
  ability: "Fähigkeit",
  heroRuleHint:
    "Jedes Plüschtier darf sich pro Runde einmal bewegen und einmal seine Fähigkeit einsetzen.",
  robotRuleHint:
    "Roboter planen vor deinem Zug. Rote Felder zeigen, wohin sie laufen und welche Felder sie treffen. Neu planen tun sie nicht.",

  items: {
    "windup-key": {
      name: "Aufziehschlüssel",
      hint: "Zieht einen Roboter auf – er setzt diese Runde aus. Jede Runde wieder einsetzbar.",
    },
    cannonball: {
      name: "Kanonenkugel",
      hint: "Schießt auf einen Roboter: 2 Schaden, bei Rostzahn nur 1. Einmal pro Level.",
    },
  } as Record<string, { name: string; hint: string }>,

  targetHint: {
    move: "Wohin soll es gehen?",
    push: "Welchen Roboter wegschubsen?",
    nudge: "Welchen Roboter umlenken?",
    shield: "Wen oder was beschützen?",
    item: "Welchen Roboter aufziehen?",
    cannonball: "Welchen Roboter treffen?",
  } as Record<string, string>,
};

type NamedState = {
  heroes: { id: string; defId: string }[];
  robots: { id: string; defId: string }[];
  props: { id: string; defId: string }[];
};

export type TickerEvent =
  | { type: "towerToppled"; robotId: string; propId: string }
  | { type: "heroHit"; robotId: string; heroId: string }
  | { type: "shieldBlocked"; heroId?: string; propId?: string }
  | { type: "heroDown"; heroId: string }
  | { type: "robotBumped"; robotId: string }
  | { type: "robotDestroyed"; robotId: string }
  | { type: "robotExploded"; robotId: string }
  | { type: "robotStunnedSkip"; robotId: string }
  | { type: "robotSpawned"; robotId: string }
  | { type: "robotExited"; robotId: string }
  | { type: "cannonballHit"; robotId: string };

function heroName(state: NamedState, heroId: string): string {
  const hero = state.heroes.find((h) => h.id === heroId);
  return hero ? de.heroes[hero.defId].name : "?";
}

function robotName(state: NamedState, robotId: string): string {
  const robot = state.robots.find((r) => r.id === robotId);
  const defId = robot?.defId ?? robotId.split("-")[1];
  return de.robots[defId]?.name ?? "Roboter";
}

function propPhrase(state: NamedState, propId: string): string {
  const prop = state.props.find((p) => p.id === propId);
  return (prop && de.props[prop.defId]) ?? "einen Turm";
}

/** Turns an engine event into a German sentence for the event ticker. */
export function eventText(state: NamedState, event: TickerEvent): string {
  switch (event.type) {
    case "towerToppled":
      return `${robotName(state, event.robotId)} hat ${propPhrase(state, event.propId)} umgeworfen!`;
    case "heroHit":
      return `${robotName(state, event.robotId)} hat ${heroName(state, event.heroId)} getroffen!`;
    case "shieldBlocked":
      return event.heroId
        ? `Das Funkelschild hat ${heroName(state, event.heroId)} beschützt!`
        : `Das Funkelschild hat ${event.propId ? propPhrase(state, event.propId) : "einen Turm"} beschützt!`;
    case "heroDown":
      return `${heroName(state, event.heroId)} ist erschöpft!`;
    case "robotBumped":
      return `${robotName(state, event.robotId)} ist angeeckt und hat gewackelt!`;
    case "robotDestroyed":
      return `Ein Roboter ist kaputtgegangen!`;
    case "robotExploded":
      return `${robotName(state, event.robotId)} ist mit einem lauten BUMM explodiert!`;
    case "robotStunnedSkip":
      return `${robotName(state, event.robotId)} war aufgezogen und hat ausgesetzt.`;
    case "robotSpawned":
      return `Ein neuer Roboter ist aufgetaucht!`;
    case "robotExited":
      return `${robotName(state, event.robotId)} ist vom Spielfeld gepurzelt!`;
    case "cannonballHit":
      return `Die Kanonenkugel hat ${robotName(state, event.robotId)} getroffen!`;
  }
}
