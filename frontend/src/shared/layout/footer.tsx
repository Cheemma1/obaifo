"use client";

import Link from "@/i18n/link";
import { useI18n } from "@/i18n/provider";
import { UliMark, UliSnake } from "../ui/uli";

export function Footer() {
  const { t } = useI18n();
  const f = t.footer;
  const columns = [
    {
      title: f.read,
      links: [
        { href: "/stories?type=short", label: f.shortTales },
        { href: "/stories?type=long", label: f.longTales },
        { href: "/authors", label: f.storytellers },
        { href: "/library", label: f.shelf },
      ],
    },
    {
      title: f.write,
      links: [
        { href: "/studio", label: f.studio },
        { href: "/studio/new", label: f.share },
        { href: "/register?role=author", label: f.join },
      ],
    },
    {
      title: "Ọbaifo",
      links: [
        { href: "/donate", label: f.support },
        { href: "/login", label: f.signIn },
      ],
    },
  ];

  return (
    <footer className="tone-char plinth px-5 pb-16 pt-16 md:px-10 md:pt-20">
      <div className="mx-auto max-w-[90rem]">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <UliMark className="size-10 text-nzu" />
            <p
              lang="ig"
              className="tale mt-6 text-3xl font-semibold leading-tight md:text-4xl"
            >
              {f.headline}
            </p>
            {f.subline && (
              <p className="mt-2 text-lg text-muted">{f.subline}</p>
            )}
            <p className="mt-6 max-w-sm leading-relaxed text-muted">
              {f.mission}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:col-span-7">
            {columns.map((col) => (
              <div key={col.title}>
                <h2 className="text-base font-bold">{col.title}</h2>
                <ul className="mt-4 space-y-2.5 text-muted">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="hover:text-nzu hover:underline"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <UliSnake className="mt-16 h-6 w-full text-nzu/40" />

        <div className="mt-8 flex flex-wrap justify-between gap-4 text-sm text-muted">
          <span>{f.copyright}</span>
          <span lang="en" className="flex gap-5">
            <Link href="/privacy" className="hover:text-nzu hover:underline">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-nzu hover:underline">
              Terms
            </Link>
          </span>
          {/* <span>{f.madeFor}</span> */}
          <span>
            {f.madeBy[0]}
            <a
              href="https://chidimma-okoloigwe-portfolio.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-nzu underline decoration-nzu/40 underline-offset-4 hover:decoration-nzu"
            >
              Mma
            </a>
            {f.madeBy[1]}
          </span>
        </div>
      </div>
    </footer>
  );
}
