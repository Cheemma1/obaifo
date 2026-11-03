"use client";

import { useI18n } from "@/i18n/provider";
import { ButtonLink } from "@/shared/ui/primitives";

// Step headings stay as Igbo verbs in both interfaces: write, shape, publish.
const STEP_VERBS = ["Dee", "Kpụọ", "Bipụta"];

/** The invitation to storytellers, on a charcoal wall. The steps are a real sequence, so they are numbered. */
export function ForAuthors() {
  const { t } = useI18n();
  const a = t.home.authors;
  return (
    <section className="tone-char px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-[90rem]">
        <div className="grid gap-8 lg:grid-cols-12">
          <h2 className="display text-[clamp(2.6rem,6vw,5rem)] lg:col-span-7">{a.title}</h2>
          <p className="text-lg leading-relaxed text-muted lg:col-span-5 lg:pt-3">{a.body}</p>
        </div>

        <ol className="mt-16 grid border-t-2 border-nzu md:grid-cols-3">
          {a.steps.map((step, i) => (
            <li key={STEP_VERBS[i]} className="border-b-2 border-rule py-8 md:border-b-0 md:border-r-2 md:px-8 md:first:pl-0 md:last:border-r-0">
              <p className="flex items-baseline gap-4">
                <span className="text-sm font-bold tabular-nums text-muted">{i + 1}</span>
                <span lang="ig" className="tale text-4xl font-semibold">
                  {STEP_VERBS[i]}
                </span>
              </p>
              <h3 className="mt-5 text-xl font-bold">{step.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{step.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-12 flex flex-wrap gap-3">
          <ButtonLink href="/studio/new" variant="light" arrow>
            {a.open}
          </ButtonLink>
          <ButtonLink href="/register?role=author" variant="outline">
            {a.join}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
