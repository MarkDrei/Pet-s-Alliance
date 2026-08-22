import { LevelSelect } from "@/components/menu/LevelSelect";
import { Sprite } from "@/components/sprites/registry";
import { de } from "@/i18n/de";

function TitleScene() {
  return (
    <svg viewBox="-165 -150 330 220" className="w-full max-w-sm" role="img" aria-label={de.tagline}>
      {/* moon */}
      <circle cx={118} cy={-108} r={26} fill="#f4ecc9" opacity={0.9} />
      <circle cx={108} cy={-114} r={24} fill="#2b2452" opacity={0.55} />
      {/* stars */}
      <circle cx={-130} cy={-120} r={2} fill="#f4ecc9" opacity={0.8} />
      <circle cx={-60} cy={-135} r={1.5} fill="#f4ecc9" opacity={0.6} />
      <circle cx={30} cy={-125} r={1.8} fill="#f4ecc9" opacity={0.7} />
      <circle cx={70} cy={-70} r={1.4} fill="#f4ecc9" opacity={0.5} />

      {/* menacing robots in the back */}
      <g transform="translate(-85 -55) scale(0.72)" opacity={0.92}>
        <Sprite id="robot-stomper" />
      </g>
      <g transform="translate(85 -50) scale(0.72)" opacity={0.92}>
        <Sprite id="robot-dasher" />
      </g>
      <g transform="translate(10 -78) scale(0.6)" opacity={0.85}>
        <Sprite id="robot-stomper" />
      </g>

      {/* carpet tiles with the hero trio */}
      <g transform="translate(-78 22)">
        <Sprite id="tile-light" />
        <Sprite id="teddy" />
      </g>
      <g transform="translate(78 22)">
        <Sprite id="tile-light" />
        <Sprite id="bunny" />
      </g>
      <g transform="translate(0 52)">
        <Sprite id="tile-dark" />
        <Sprite id="unicorn" />
      </g>
      <g transform="translate(-125 45) scale(0.8)">
        <Sprite id="tower" />
      </g>
      <g transform="translate(128 48) scale(0.8)">
        <Sprite id="blocks" />
      </g>
    </svg>
  );
}

export default function TitlePage() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-6 px-6 py-10 text-center">
      <div>
        <h1 className="text-5xl font-extrabold tracking-tight text-accent drop-shadow-lg">
          {de.title}
        </h1>
        <p className="pt-2 text-lg text-foreground/85">{de.tagline}</p>
      </div>

      <TitleScene />

      <p className="text-sm text-foreground/70">{de.intro}</p>

      <div className="flex w-full flex-col gap-4">
        <LevelSelect />
        <button
          type="button"
          disabled
          className="rounded-2xl border border-panel-border bg-panel/60 px-6 py-3 font-semibold opacity-50"
        >
          {de.chooseTeam} · {de.comingSoon}
        </button>
        <button
          type="button"
          disabled
          className="rounded-2xl border border-panel-border bg-panel/60 px-6 py-3 font-semibold opacity-50"
        >
          {de.settings} · {de.comingSoon}
        </button>
      </div>
    </div>
  );
}
