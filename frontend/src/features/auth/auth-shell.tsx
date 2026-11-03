import type { ReactNode } from "react";
import { UliMural } from "@/shared/ui/uli";

/** Sign-in and sign-up: a proverb on the earth wall, the form on limewash. */
export function AuthShell({ proverb, gloss, title, children }: { proverb: string; gloss: string; title: string; children: ReactNode }) {
  return (
    <main className="grid min-h-[calc(100svh-4rem)] lg:grid-cols-2">
      <aside className="tone-earth plinth relative hidden overflow-hidden px-10 pb-20 pt-10 lg:flex lg:flex-col lg:justify-end">
        <UliMural className="pointer-events-none absolute -right-[10%] top-[2%] w-[105%] opacity-90" />
        <p lang="ig" className="tale relative text-6xl font-semibold leading-[1.02] xl:text-7xl">
          {proverb}
        </p>
        <p className="relative mt-6 max-w-sm text-lg leading-relaxed text-muted">{gloss}</p>
      </aside>
      <section className="tone-nzu flex items-center px-5 pb-16 pt-12 md:px-16">
        <div className="mx-auto w-full max-w-md">
          <p lang="ig" className="tale text-2xl font-semibold text-earth lg:hidden">
            {proverb}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight lg:mt-0">{title}</h1>
          <div className="mt-10">{children}</div>
        </div>
      </section>
    </main>
  );
}
