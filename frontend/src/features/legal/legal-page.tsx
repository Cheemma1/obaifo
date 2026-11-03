import type { ReactNode } from "react";
import { PageHeader } from "@/shared/ui/primitives";

/** Where people write about their data or the terms. Change this before launch. */
export const LEGAL_CONTACT = "privacy@obaifo.example";
export const LEGAL_UPDATED = "1 November 2026";

export function ContactLink() {
  return (
    <a href={`mailto:${LEGAL_CONTACT}`} className="link font-semibold">
      {LEGAL_CONTACT}
    </a>
  );
}

/** Policy pages are written in English only, whatever the interface language. */
export function LegalPage({ title, intro, children }: { title: string; intro: ReactNode; children: ReactNode }) {
  return (
    <main lang="en">
      <PageHeader title={title}>
        <p>{intro}</p>
        <p className="mt-3 text-base">Last updated {LEGAL_UPDATED}</p>
      </PageHeader>
      <div className="tone-nzu px-5 pb-28 pt-12 md:px-10 md:pt-16">
        <article className="mx-auto max-w-3xl border-t-4 border-char pt-8 text-lg leading-relaxed [&_h2]:mt-12 [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2:first-child]:mt-0 [&_li]:mt-2 [&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6">
          {children}
        </article>
      </div>
    </main>
  );
}
