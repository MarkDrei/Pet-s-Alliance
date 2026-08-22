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
};
