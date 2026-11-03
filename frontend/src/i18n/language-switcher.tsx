"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/shared/lib/cn";
import { LOCALE_COOKIE, LOCALES, stripLocale, type Locale } from "./config";
import { useI18n } from "./provider";

const ONE_YEAR = 60 * 60 * 24 * 365;

/** Read by proxy.ts so unprefixed links (e.g. shared tales) open in this language. */
function rememberLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
}

/** IG / EN toggle. Switches the interface only; tales stay in Igbo. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const router = useRouter();
  const { locale, t } = useI18n();

  const switchTo = (next: Locale) => {
    if (next === locale) return;
    rememberLocale(next);
    const { pathname, search, hash } = window.location;
    const rest = stripLocale(pathname);
    router.push(`/${next}${rest === "/" ? "" : rest}${search}${hash}`, {
      scroll: false,
    });
  };

  return (
    <div
      role="group"
      aria-label={t.nav.language}
      className={cn(
        "flex border-2 border-current text-sm font-bold",
        className,
      )}
    >
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => switchTo(l)}
          aria-pressed={l === locale}
          lang={l}
          className={cn(
            "min-h-9 min-w-10 px-2 uppercase transition-colors",
            l === locale ? "bg-nzu text-char" : "hover:bg-nzu/15",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
