"use client";

export function EventTicker({ text }: { text: string }) {
  return (
    <div className="px-3 pb-1">
      <p
        key={text}
        className="animate-slide-up truncate rounded-xl bg-black/25 px-3 py-1.5 text-center text-xs text-white/85"
      >
        {text}
      </p>
    </div>
  );
}
