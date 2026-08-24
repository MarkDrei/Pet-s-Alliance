import Image from "next/image";
import Link from "next/link";
import { publicUrl } from "@/assetUrl";
import { de } from "@/i18n/de";
import { LEVELS } from "@/engine/levels";

/** Deterministic star field so server and client render identically. */
const STARS = Array.from({ length: 42 }, (_, i) => {
  const x = (i * 61) % 100;
  const y = (i * 37 + 11) % 100;
  const size = 2 + ((i * 13) % 3);
  const delay = ((i * 401) % 2400) / 1000;
  return { x, y, size, delay };
});

const LEVEL_STYLES: Record<string, { card: string; badge: string }> = {
  "level-1": {
    card: "from-rose-500/85 to-red-600/85 border-rose-300/60",
    badge: "bg-rose-200 text-rose-800",
  },
  "level-2": {
    card: "from-amber-500/85 to-orange-600/85 border-amber-300/60",
    badge: "bg-amber-200 text-amber-800",
  },
  "level-3": {
    card: "from-sky-500/85 to-blue-600/85 border-sky-300/60",
    badge: "bg-sky-200 text-sky-800",
  },
  "level-4": {
    card: "from-violet-500/85 to-purple-700/85 border-violet-300/60",
    badge: "bg-violet-200 text-violet-800",
  },
};

const FLOATING_HEROES = [
  { src: "/sprites/heroes/teddy.png", alt: "Teddybär", className: "left-2 top-24 w-20", delay: "0s" },
  { src: "/sprites/heroes/bunny.png", alt: "Häschen", className: "right-3 top-16 w-16", delay: "1.2s" },
  { src: "/sprites/heroes/unicorn.png", alt: "Einhorn", className: "right-6 top-44 w-18", delay: "2.1s" },
];

export default function Home() {
  const title = de.title;
  return (
    <main className="relative mx-auto flex min-h-dvh max-w-md flex-col overflow-hidden px-5 pb-10 pt-14">
      {/* Night sky */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {STARS.map((s, i) => (
          <span
            key={i}
            className="star"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.size,
              height: s.size,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}
        {/* Moon */}
        <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-honey-300/90 shadow-[0_0_80px_30px_rgba(255,209,102,0.35)]" />
        <div className="absolute -right-2 -top-4 h-28 w-28 rounded-full bg-night-900/80" />
      </div>

      {/* Floating plushies */}
      {FLOATING_HEROES.map((h) => (
        <Image
          key={h.src}
          src={publicUrl(h.src)}
          alt={h.alt}
          width={96}
          height={96}
          priority
          aria-hidden
          className={`pointer-events-none absolute animate-float opacity-90 drop-shadow-[0_6px_12px_rgba(0,0,0,0.45)] ${h.className}`}
          style={{ animationDelay: h.delay }}
        />
      ))}

      {/* Title */}
      <header className="relative z-10 mt-6 text-center">
        <h1 className="text-5xl font-bold tracking-wide drop-shadow-[0_4px_0_rgba(0,0,0,0.35)]">
          {title.split("").map((ch, i) => (
            <span
              key={i}
              className="inline-block animate-bob"
              style={{
                animationDelay: `${i * 0.09}s`,
                color: i % 3 === 0 ? "#ffd166" : i % 3 === 1 ? "#ff8fab" : "#7dd3fc",
              }}
            >
              {ch === " " ? "\u00a0" : ch}
            </span>
          ))}
        </h1>
        <p className="mt-3 text-lg font-medium text-plum-400">{de.tagline}</p>
        <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-white/70">{de.intro}</p>
      </header>

      {/* Level select */}
      <section className="relative z-10 mt-8 flex flex-col gap-4">
        <h2 className="text-center text-xl font-semibold text-honey-300">{de.chooseLevel}</h2>
        {LEVELS.map((level, i) => {
          const text = de.levels[level.id];
          const style = LEVEL_STYLES[level.id];
          return (
            <Link
              key={level.id}
              href={`/play/${level.id}`}
              className={`btn-squish animate-pop-in rounded-3xl border-2 bg-gradient-to-br p-4 shadow-lg shadow-black/30 ${style.card}`}
              style={{ animationDelay: `${0.15 + i * 0.1}s` }}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl font-bold shadow-inner ${style.badge}`}
                >
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <div className="text-lg font-bold leading-tight">{text.name}</div>
                  <div className="truncate text-sm text-white/85">{text.tagline}</div>
                </div>
              </div>
              <p className="mt-2 text-xs leading-snug text-white/75">{text.feature}</p>
            </Link>
          );
        })}
      </section>

      {/* Future meta progression slots */}
      <section className="relative z-10 mt-8 flex justify-center gap-3">
        {[de.chooseTeam, de.settings].map((label) => (
          <button
            key={label}
            disabled
            className="rounded-2xl border-2 border-white/15 bg-white/5 px-4 py-2 text-sm text-white/45"
          >
            {label}
            <span className="mt-0.5 block text-[10px] uppercase tracking-wider text-honey-300/60">
              {de.comingSoon}
            </span>
          </button>
        ))}
      </section>
    </main>
  );
}
