import type { Locale } from "../config";
import en, { type Dictionary } from "./en";
import ig from "./ig";

export type { Dictionary };

// Both are small and include formatting functions, so they ship as code
// (usable from server and client components alike) rather than JSON.
export const dictionaries: Record<Locale, Dictionary> = { ig, en };
