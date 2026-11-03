"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { intlLocale, localizePath, type Locale } from "./config";
import { dictionaries } from "./dictionaries";

const LocaleContext = createContext<Locale>("ig");

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  );
}

export function useI18n() {
  const locale = useContext(LocaleContext);
  return useMemo(
    () => ({
      locale,
      t: dictionaries[locale],
      /** The same text in the other interface language, for bilingual accents. */
      other: dictionaries[locale === "ig" ? "en" : "ig"],
      intl: intlLocale(locale),
      href: (path: string) => localizePath(path, locale),
    }),
    [locale],
  );
}

/** next/navigation's router, but paths get the current locale prefix. */
export function useLocaleRouter() {
  const router = useRouter();
  const { href } = useI18n();
  return useMemo(
    () => ({
      push: (path: string) => router.push(href(path)),
      replace: (path: string) => router.replace(href(path)),
    }),
    [router, href],
  );
}
