"use client";

export function EventTicker({ lines }: { lines: string[] }) {
  if (lines.length === 0) return null;
  return (
    <div className="mx-4 rounded-lg bg-background-deep/70 px-3 py-2 text-sm" role="log">
      {lines.map((line, i) => (
        <div key={i} className="text-foreground/85">
          {line}
        </div>
      ))}
    </div>
  );
}
