/**
 * Interface languages. Tale content is always Igbo and is never translated;
 * only the site's own text (navigation, buttons, help) switches language.
 */
export const LOCALES = ["ig", "en"] as const;
export type Locale = (typeof LOCALES)[number];

/** First-time visitors see Igbo: the site exists to get people reading it. */
export const DEFAULT_LOCALE: Locale = "ig";

export const LOCALE_COOKIE = "obaifo_locale";

export const LOCALE_NAMES: Record<Locale, string> = {
  ig: "Igbo",
  en: "English",
};

export const hasLocale = (value: string | undefined): value is Locale =>
  !!value && (LOCALES as readonly string[]).includes(value);

/** Locale for Intl formatting (dates, numbers). */
export const intlLocale = (locale: Locale) =>
  locale === "ig" ? "ig-NG" : "en-GB";

const PREFIX = /^\/(ig|en)(?=\/|$|\?|#)/;

/** "/stories" → "/ig/stories". Leaves external, protocol-relative and already-prefixed paths alone. */
export function localizePath(path: string, locale: Locale): string {
  if (!path.startsWith("/") || path.startsWith("//") || PREFIX.test(path))
    return path;
  if (path === "/") return `/${locale}`;
  if (path.startsWith("/?") || path.startsWith("/#"))
    return `/${locale}${path.slice(1)}`;
  return `/${locale}${path}`;
}

/** "/ig/read/x/1" → "/read/x/1" */
export const stripLocale = (pathname: string) =>
  pathname.replace(PREFIX, "") || "/";
