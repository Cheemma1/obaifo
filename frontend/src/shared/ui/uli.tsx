import type { CSSProperties } from "react";
import type { Theme } from "../types";

/**
 * Uli: the Igbo practice of drawing sparse, flowing lines on compound walls and
 * skin. Lines are even and unhurried, they curl into spirals and end in dots,
 * and they leave most of the wall empty. Everything here is stroke-only.
 */

/** Archimedean spiral as a path, the uli "isi" coil. */
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

/** A palm frond (nkwụ): a curved rib with short leaves on alternating sides. */
function frond(x: number, y: number, length: number, leaves: number) {
  const parts = [`M${x} ${y} C ${x + length * 0.1} ${y - length * 0.4}, ${x - length * 0.05} ${y - length * 0.75}, ${x + length * 0.12} ${y - length}`];
  for (let i = 1; i <= leaves; i++) {
    const t = i / (leaves + 1);
    const px = x + length * 0.06 * Math.sin(t * Math.PI);
    const py = y - length * t;
    const side = i % 2 ? 1 : -1;
    const reach = length * 0.16 * (1 - t * 0.5);
    parts.push(`M${px.toFixed(1)} ${py.toFixed(1)} q ${(side * reach * 0.6).toFixed(1)} ${(-reach * 0.15).toFixed(1)} ${(side * reach).toFixed(1)} ${(-reach * 0.55).toFixed(1)}`);
  }
  return parts.join(" ");
}

const HERO = {
  coil: spiral(640, 330, 3.2, 8, 150, 0.4),
  snake:
    "M40 690 C 160 600, 250 720, 360 640 S 520 470, 470 400 S 470 250, 640 180 S 900 130, 960 40",
  snakeEcho:
    "M70 720 C 180 640, 270 750, 380 670 S 550 500, 500 420",
  frond: frond(860, 720, 380, 14),
  moon: "M220 120 A 70 70 0 1 0 300 230 A 54 54 0 1 1 220 120",
  // a second, charcoal coil-and-tail answering the nzu one
  charLine: "M600 760 C 640 640, 760 600, 820 520 S 900 380, 830 300 S 700 260, 690 340 S 760 420, 800 380",
  // the ladder stands in the open wall above the moon's right, clear of the name
  ladder: "M430 40 V 250 M462 40 V 250",
  rungs: Array.from({ length: 7 }, (_, i) => `M430 ${58 + i * 30} L462 ${70 + i * 30}`).join(" "),
};

const HERO_DOTS: [number, number, number][] = [
  [780, 330, 13], [810, 356, 10], [792, 386, 8],
  [372, 560, 11], [400, 546, 8],
  [960, 40, 15],
  [300, 380, 9], [322, 406, 9], [344, 380, 9],
  [520, 640, 8], [548, 658, 8], [576, 640, 8], [604, 658, 8],
  [800, 380, 12],
];

/**
 * The hero mural. Draws itself once, stroke by stroke, the way a painter's
 * hand covers a wall. Pure CSS (see .uli-draw), so it is finished before JS
 * loads and simply finished under reduced motion.
 */
export function UliMural({ className }: { className?: string }) {
  const timing = (delay: number, duration: number) => ({ "--draw-delay": `${delay}s`, "--draw-duration": `${duration}s` }) as CSSProperties;
  return (
    <svg viewBox="0 0 1000 780" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <g stroke="var(--color-nzu)">
        <path className="uli-draw" pathLength={1} d={HERO.snake} strokeWidth={11} style={timing(0.2, 2.2)} />
        <path className="uli-draw" pathLength={1} d={HERO.coil} strokeWidth={9} style={timing(0.9, 2.4)} />
        <path className="uli-draw" pathLength={1} d={HERO.frond} strokeWidth={7} style={timing(1.6, 1.8)} />
        <path className="uli-draw" pathLength={1} d={HERO.moon} strokeWidth={8} style={timing(2.1, 1.2)} />
      </g>
      <g stroke="var(--color-char)">
        <path className="uli-draw" pathLength={1} d={HERO.charLine} strokeWidth={9} style={timing(1.3, 2)} />
        <path d={HERO.snakeEcho} strokeWidth={6} strokeDasharray="2 18" />
        <path className="uli-draw" pathLength={1} d={HERO.ladder} strokeWidth={8} style={timing(2.4, 0.9)} />
        <path className="uli-draw" pathLength={1} d={HERO.rungs} strokeWidth={6} style={timing(2.8, 0.9)} />
      </g>
      <g fill="var(--color-char)">
        {HERO_DOTS.map(([cx, cy, r], i) => (
          <circle key={i} className="uli-dot" cx={cx} cy={cy} r={r} style={timing(2.6 + i * 0.06, 0.35)} />
        ))}
      </g>
    </svg>
  );
}

/** Small-scale motifs, one per kind of tale. Drawn on a 64 grid. */
const KIND_PATHS: Record<Theme, string> = {
  // mbe: the tortoise, shell segments and four feet
  tortoise:
    "M14 34 C 14 20, 50 20, 50 34 C 50 44, 14 44, 14 34 Z M24 26 L28 34 L24 41 M40 26 L36 34 L40 41 M28 34 H36 M50 32 h7 M16 43 l-4 6 M48 43 l4 6 M20 25 l-5 -5 M44 25 l5 -5",
  // footprints in the sand
  animals: "M18 50 l-6 -10 M18 50 l0 -12 M18 50 l6 -10 M42 30 l-6 -10 M42 30 l0 -12 M42 30 l6 -10",
  // the coil: how things came to be
  origins: spiral(32, 32, 2.6, 2, 22, 0),
  // an open eye: the spirit that watches
  spirits: "M6 32 C 18 16, 46 16, 58 32 C 46 48, 18 48, 6 32 Z M32 24 C 37 27, 37 37, 32 40",
  // a ladder with chevrons: the climb of the hero
  heroes: "M24 6 V58 M40 6 V58 M24 14 L40 20 M24 26 L40 32 M24 38 L40 44 M24 50 L40 56",
  // akwụ: a cluster of palm nuts, gathered wisdom
  wisdom:
    "M32 14 m-6 0 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0 M22 32 m-6 0 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0 M42 32 m-6 0 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0 M12 50 m-6 0 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0 M32 50 m-6 0 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0 M52 50 m-6 0 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0",
  // three lines of song, rising and falling
  song: "M4 20 C 14 10, 22 30, 32 20 S 50 10, 60 20 M4 32 C 14 22, 22 42, 32 32 S 50 22, 60 32 M4 44 C 14 34, 22 54, 32 44 S 50 34, 60 44",
};

const KIND_DOTS: Record<Theme, [number, number][]> = {
  tortoise: [[58, 32]],
  animals: [[18, 54], [42, 34]],
  origins: [[54, 32]],
  spirits: [[32, 32]],
  heroes: [[32, 4]],
  wisdom: [],
  song: [[60, 20], [60, 44]],
};

export function KindMotif({ theme, className, strokeWidth = 2.5 }: { theme: Theme; className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d={KIND_PATHS[theme]} />
      {KIND_DOTS[theme].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={strokeWidth * 1.1} fill="currentColor" stroke="none" />
      ))}
    </svg>
  );
}

/** A long snake line (agwọ) used to divide passages. */
export function UliSnake({ className, strokeWidth = 2 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 600 40" fill="none" preserveAspectRatio="none" className={className} aria-hidden>
      <path
        d="M6 20 C 56 2, 96 38, 146 20 S 246 2, 296 20 S 396 38, 446 20 S 546 2, 580 20"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx="590" cy="20" r="4" fill="currentColor" />
    </svg>
  );
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

/** Three dots, the closing mark at the end of a tale. */
export function UliClose({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 24" fill="none" className={className} aria-hidden>
      <path d="M4 12 C 20 2, 30 22, 46 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="60" cy="12" r="4" fill="currentColor" />
      <path d="M74 12 C 90 2, 100 22, 116 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export { spiral as uliSpiral };
