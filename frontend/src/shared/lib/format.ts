import type { Theme } from "../types";

export const THEME_LABELS: Record<Theme, { ig: string; en: string }> = {
  tortoise: { ig: "Akụkọ Mbe", en: "Tortoise tales" },
  animals: { ig: "Anụmanụ", en: "Animal tales" },
  origins: { ig: "Ihe mere", en: "How things came to be" },
  spirits: { ig: "Mmụọ", en: "Spirits" },
  heroes: { ig: "Dike", en: "Heroes" },
  wisdom: { ig: "Amamihe", en: "Tales that teach" },
  song: { ig: "Ifo nwere egwu", en: "Song tales" },
};

export const TYPE_LABELS = {
  short: { ig: "Ifo mkpirikpi", en: "Short tale" },
  long: { ig: "Ifo ogologo", en: "Long tale" },
} as const;

export const naira = (kobo: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(kobo / 100);

export const compact = (n: number, locale = "en") => new Intl.NumberFormat(locale, { notation: "compact" }).format(n);

export const pad = (n: number, width = 2) => String(n).padStart(width, "0");

export const longDate = (iso: string, locale = "en-GB") =>
  new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });

/** Deterministic 32-bit hash used for generative covers. */
export function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
