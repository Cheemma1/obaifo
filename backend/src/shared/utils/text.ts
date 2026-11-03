import { randomUUID } from "node:crypto";

export const newId = () => randomUUID();

export const nowIso = () => new Date().toISOString();

/** "2026-10" — the key we use to count monthly free passes. */
export const monthKey = (date = new Date()) => date.toISOString().slice(0, 7);

/** Folds Igbo dotted vowels (ị ọ ụ ṅ) and other diacritics to ASCII for slugs and search. */
export function fold(input: string): string {
  return input.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function slugify(input: string): string {
  return fold(input)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Average adult reading speed; Igbo words run long, so we stay conservative. */
export const minutesToRead = (words: number) => Math.max(1, Math.round(words / 180));
