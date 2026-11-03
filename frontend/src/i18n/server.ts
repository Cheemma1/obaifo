import { DEFAULT_LOCALE, hasLocale, type Locale } from "./config";
import { dictionaries } from "./dictionaries";

/** For server pages/layouts: resolves the [lang] param to a locale and its dictionary. */
export async function getPageI18n(params: Promise<{ lang: string }>) {
  const { lang } = await params;
  const locale: Locale = hasLocale(lang) ? lang : DEFAULT_LOCALE;
  return { locale, t: dictionaries[locale] };
}

/**
 * Text for <title>, description and other metadata. Always English, whatever
 * the interface language: it's what search engines (and searchers looking for
 * "Igbo stories" or "African folktales") match best.
 */
export { default as metaT } from "./dictionaries/en";
