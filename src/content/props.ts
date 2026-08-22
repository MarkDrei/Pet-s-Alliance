import type { PropDef } from "@/engine";

export const PROPS: Record<string, PropDef> = {
  tower: {
    id: "tower",
    toppleable: true,
    visual: "tower",
    toppledVisual: "tower-toppled",
  },
  blocks: {
    id: "blocks",
    toppleable: false,
    visual: "blocks",
  },
  /** Book stack: a chaos target in the reading corner. */
  books: {
    id: "books",
    toppleable: true,
    visual: "books",
    toppledVisual: "books-toppled",
  },
  /** Music box: the most precious chaos target — it plays when it falls! */
  musicbox: {
    id: "musicbox",
    toppleable: true,
    visual: "musicbox",
    toppledVisual: "musicbox-toppled",
  },
};
