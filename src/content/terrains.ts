import type { TerrainDef } from "@/engine";

export const TERRAINS: Record<string, TerrainDef> = {
  /** Loose marbles: robots that roll onto them keep sliding. */
  marbles: {
    id: "marbles",
    kind: "marbles",
    visual: "terrain-marbles",
  },
  /** Soft cushion: robots cannot roll onto it, plushies may rest on it. */
  cushion: {
    id: "cushion",
    kind: "cushion",
    visual: "terrain-cushion",
  },
};
