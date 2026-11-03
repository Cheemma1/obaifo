"use client";

import Link from "@/i18n/link";
import { useI18n } from "@/i18n/provider";
import { THEME_LABELS } from "@/shared/lib/format";
import { THEMES } from "@/shared/types";
import { KindMotif } from "@/shared/ui/uli";

/** The seven kinds of ifo, painted as a frieze along the wall. Each one opens its shelf. */
export function Kinds() {
  const { t, locale } = useI18n();
  const k = t.home.kinds;
  return (
    <section className="tone-nzu px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-[90rem]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="display text-[clamp(2.5rem,5.5vw,4.5rem)]">{k.title}</h2>
          <p className="max-w-sm text-lg leading-relaxed text-muted">{k.body}</p>
        </div>

        <ul className="mt-12 grid grid-cols-2 border-l-2 border-t-2 border-char sm:grid-cols-4 lg:grid-cols-7">
          {THEMES.map((theme) => (
            <li key={theme} className="border-b-2 border-r-2 border-char">
              <Link
                href={`/stories?theme=${theme}`}
                className="group flex h-full min-h-44 flex-col justify-between gap-6 p-5 transition-colors hover:bg-earth hover:text-nzu"
              >
                <KindMotif theme={theme} className="size-16 text-earth transition-colors group-hover:text-nzu" />
                <span className="text-lg font-bold leading-tight">{THEME_LABELS[theme][locale]}</span>
              </Link>
            </li>
          ))}
          {/* Fills the last row of the four-column frieze so the painted grid closes. */}
          <li aria-hidden className="hidden border-b-2 border-r-2 border-char sm:block lg:hidden" />
        </ul>
      </div>
    </section>
  );
}
