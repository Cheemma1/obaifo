"use client";

import { useI18n } from "@/i18n/provider";
import { ButtonLink } from "@/shared/ui/primitives";
import { UliSnake } from "@/shared/ui/uli";

// Pillar headings are Igbo verbs in both interfaces: read, keep, pass on.
const PILLAR_VERBS = ["Gụọ", "Chekwaa", "Nyefee"];

/** Why Ọbaifo exists: promoting Igbo literacy and preserving the language. */
export function Mission() {
  const { t } = useI18n();
  const m = t.home.mission;
  const manifesto = t.home.manifesto.text;

  return (
    <section className="tone-nzu px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-[90rem]">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* The headline is always Igbo; the English interface adds its translation beneath. */}
          <div className="lg:col-span-7">
            <h2 lang="ig" className="tale text-[clamp(2.4rem,5vw,4.25rem)] font-semibold leading-[1.02] text-earth">
              Asụsụ anyị ga-adị ndụ ma ọ bụrụ na anyị na-agụ ya.
            </h2>
            {m.sub && <p className="mt-4 text-[clamp(1.25rem,2vw,1.6rem)] font-medium">{m.sub}</p>}
          </div>
          <div className="space-y-5 text-lg leading-relaxed lg:col-span-5 lg:pt-3">
            <p>{manifesto}</p>
            <p className="text-muted">{m.body}</p>
          </div>
        </div>

        <UliSnake className="mt-16 h-6 w-full text-earth" />

        <ol className="mt-12 grid gap-12 md:grid-cols-3 md:gap-10">
          {m.pillars.map((p, i) => (
            <li key={PILLAR_VERBS[i]}>
              <p lang="ig" className="tale text-4xl font-semibold text-earth">
                {PILLAR_VERBS[i]}
              </p>
              <h3 className="mt-4 text-xl font-bold leading-snug">{p.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{p.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-14 flex flex-wrap gap-3">
          <ButtonLink href="/stories?type=short" arrow>
            {m.read}
          </ButtonLink>
          <ButtonLink href="/studio/new" variant="outline">
            {m.write}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
