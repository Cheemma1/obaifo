/**
 * Uli line drawings, as on the reader site (frontend/src/shared/ui/uli.tsx):
 * even strokes, round caps, ending in dots, stroke-only.
 */

function spiral(cx: number, cy: number, turns: number, r0: number, r1: number, start = 0) {
  const steps = Math.round(turns * 48);
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = start + t * turns * Math.PI * 2;
    const r = r0 + (r1 - r0) * t;
    d += `${i ? "L" : "M"}${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)}`;
  }
  return d;
}

/** The site mark: a coil that ends in a dot. */
export function UliMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <path d={spiral(16, 16, 2.2, 1.5, 12, Math.PI)} stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="28" cy="16" r="2.6" fill="currentColor" />
    </svg>
  );
}

/** A long snake line (agwọ) used to divide passages. */
export function UliSnake({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 40" fill="none" preserveAspectRatio="none" className={className} aria-hidden>
      <path
        d="M6 20 C 56 2, 96 38, 146 20 S 246 2, 296 20 S 396 38, 446 20 S 546 2, 580 20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx="590" cy="20" r="4" fill="currentColor" />
    </svg>
  );
}

const W = 300;
const H = 14;
const WAVES = 3.5;
const wave = (x: number) => H / 2 + Math.sin((x / W) * WAVES * Math.PI * 2) * 4;
/** The whole thread, sampled finely enough to read as one smooth stroke. */
const THREAD = Array.from({ length: 121 }, (_, i) => {
  const x = 4 + (i / 120) * (W - 8);
  return `${i ? "L" : "M"}${x.toFixed(1)} ${wave(x).toFixed(2)}`;
}).join("");

/**
 * How far a reader is through a tale, drawn as an uli line that ends in a dot.
 * The faint full line is the whole tale; the drawn part is how far they've got.
 */
export function UliThread({ progress, label }: { progress: number; label: string }) {
  const p = Math.min(1, Math.max(0.04, progress));
  const x = 4 + p * (W - 8);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-3.5 w-full" role="img" aria-label={label}>
      <path d={THREAD} stroke="currentColor" strokeOpacity="0.16" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path
        d={THREAD}
        pathLength={1}
        stroke="var(--color-earth)"
        strokeWidth="2.6"
        fill="none"
        strokeLinecap="round"
        strokeDasharray="1 1"
        strokeDashoffset={1 - p}
        className="thread-draw"
      />
      <circle cx="0" cy="0" r="3.6" fill="currentColor" className="thread-draw" style={{ transform: `translate(${x}px, ${wave(x)}px)` }} />
    </svg>
  );
}
