import { hash } from "../lib/format";
import { cn } from "../lib/cn";
import type { Theme } from "../types";
import { KindMotif, UliMark } from "./uli";

/**
 * Every tale gets a cover. Uploaded art wins; otherwise the cover is a small
 * painted wall: one plaster, the uli motif for its kind drawn large, and the
 * title lettered at the foot. The slug picks the plaster so the shelf varies.
 */

const GROUNDS = [
  { bg: "var(--color-earth)", fg: "var(--color-nzu)", line: "var(--color-char)" },
  { bg: "var(--color-char)", fg: "var(--color-nzu)", line: "var(--color-earth)" },
  { bg: "var(--color-nzu-deep)", fg: "var(--color-char)", line: "var(--color-earth)" },
  { bg: "var(--color-nzu)", fg: "var(--color-earth-deep)", line: "var(--color-char)" },
  { bg: "var(--color-earth-deep)", fg: "var(--color-nzu)", line: "var(--color-char)" },
];

export function Cover({
  slug,
  title,
  author,
  theme = "origins",
  coverUrl,
  className,
  showText = true,
}: {
  slug: string;
  title: string;
  author?: string;
  theme?: Theme;
  coverUrl?: string | null;
  className?: string;
  showText?: boolean;
}) {
  const seed = hash(slug);
  const g = GROUNDS[seed % GROUNDS.length]!;
  // Each cover places the motif differently so neighbours never repeat.
  const placements = ["right-[-12%] top-[6%] w-[78%]", "left-[-8%] top-[10%] w-[70%]", "right-[4%] top-[-6%] w-[64%]"];
  const place = placements[Math.floor(seed / 5) % placements.length];

  return (
    <div className={cn("relative aspect-[3/4] overflow-hidden [container-type:inline-size]", className)} style={{ background: g.bg, color: g.fg }}>
      {coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={coverUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <>
          <KindMotif theme={theme} strokeWidth={1.6} className={cn("absolute aspect-square", place)} />
          <svg viewBox="0 0 300 40" preserveAspectRatio="none" className="absolute inset-x-0 top-[62%] h-[8%] w-full" aria-hidden>
            <path d="M-4 20 C 40 4, 80 36, 130 20 S 220 4, 304 22" fill="none" stroke={g.line} strokeWidth="3" vectorEffect="non-scaling-stroke" />
          </svg>
          {showText && (
            <div className="absolute inset-x-0 bottom-0 p-[8%]">
              <p lang="ig" className="tale text-[clamp(0.95rem,9cqw,2.2rem)] font-semibold leading-[1.05] [text-wrap:balance]">
                {title}
              </p>
              {author && <p className="mt-[4%] text-[clamp(0.65rem,4.6cqw,0.9rem)] font-medium opacity-85">{author}</p>}
            </div>
          )}
          <UliMark className="absolute left-[8%] top-[6%] w-[11%]" />
        </>
      )}
    </div>
  );
}
