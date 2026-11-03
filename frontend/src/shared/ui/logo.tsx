import type { SVGProps } from "react";

/**
 * The Ọbaifo mark. Every letter is built from the same two strokes as uli line work:
 * a ring and a straight stem, 7 units thick, on a 46-unit baseline. The ochre dot is the
 * Igbo subdot of the ọ, the one accent in the mark.
 *
 * Letters inherit `currentColor`; the dot is ochre unless `dot` is passed.
 */
const STROKE = 7;
const R = 8.5;
const RING_Y = 34;

const Ring = ({ cx }: { cx: number }) => <circle cx={cx} cy={RING_Y} r={R} fill="none" stroke="currentColor" strokeWidth={STROKE} />;

/** "ọb" — the first two letters, used for the favicon and tight spaces. */
function Ob() {
  return (
    <>
      <Ring cx={12} />
      <rect x={27} y={9} width={STROKE} height={37} fill="currentColor" />
      <Ring cx={40} />
    </>
  );
}

function Aifo() {
  return (
    <>
      {/* a */}
      <Ring cx={67} />
      <rect x={72} y={22} width={STROKE} height={24} fill="currentColor" />
      {/* i */}
      <rect x={82} y={22} width={STROKE} height={24} fill="currentColor" />
      <circle cx={85.5} cy={13} r={4} fill="currentColor" />
      {/* f */}
      <path d="M99.5 46V21a8.5 8.5 0 0 1 8.5-8.5h4" fill="none" stroke="currentColor" strokeWidth={STROKE} />
      <rect x={92} y={22} width={16} height={STROKE} fill="currentColor" />
      {/* o */}
      <Ring cx={125} />
    </>
  );
}

type LogoProps = SVGProps<SVGSVGElement> & { dot?: string; title?: string };

/** Full wordmark: ọbaifo. */
export function Logo({ dot = "var(--color-ochre)", title = "Ọbaifo", ...props }: LogoProps) {
  return (
    <svg viewBox="-1 5 139 54" role="img" aria-label={title} {...props}>
      <Ob />
      <Aifo />
      <circle cx={12} cy={54} r={4} fill={dot} />
    </svg>
  );
}

/** Just "ọb", square. */
export function LogoMark({ dot = "var(--color-ochre)", title = "Ọbaifo", ...props }: LogoProps) {
  return (
    <svg viewBox="0 0 64 64" role="img" aria-label={title} {...props}>
      <g transform="translate(6 -1.5)">
        <Ob />
        <circle cx={12} cy={54} r={4} fill={dot} />
      </g>
    </svg>
  );
}
