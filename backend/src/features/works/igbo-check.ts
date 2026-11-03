/**
 * Ọbaifo publishes ifo told in Igbo. This is a deliberately lenient check:
 * it only rejects text that is plainly English (lots of English function
 * words, almost no Igbo ones), so Igbo written without diacritics, tales with
 * an English song line, or code-switching dialogue all still pass.
 */

const ENGLISH = new Set([
  "the", "and", "was", "were", "is", "are", "of", "to", "in", "that", "it", "he", "she", "they",
  "his", "her", "with", "for", "on", "as", "at", "had", "have", "but", "not", "this", "from",
  "by", "you", "said", "there", "would", "could", "when", "what", "which", "their", "them",
]);

const IGBO = new Set([
  "na", "ya", "bu", "ka", "nke", "o", "di", "ha", "m", "gi", "anyi", "unu", "ndi", "otu", "ahu",
  "ma", "ebe", "mgbe", "si", "wee", "kwuru", "ihe", "onye", "obi", "nwa", "nne", "nna", "ruo",
  "n'", "n'ihi", "maka", "ga", "agaghi", "ozo", "niile", "dika", "mere", "nwere",
]);

/** Folds ị ọ ụ ṅ and tone marks to plain letters so diacritic-free Igbo still matches. */
const fold = (word: string) => word.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function looksEnglish(text: string): boolean {
  const words = text
    .split(/[^\p{L}']+/u)
    .map(fold)
    .filter(Boolean);
  if (words.length < 25) return false; // too short to judge fairly

  let english = 0;
  let igbo = 0;
  for (const w of words) {
    if (ENGLISH.has(w)) english++;
    if (IGBO.has(w) || w.startsWith("n'")) igbo++;
  }
  return english / words.length > 0.2 && igbo / words.length < 0.05;
}
