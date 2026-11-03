/** Ọbaifo's days run on West Africa Time (UTC+1, no daylight saving), where most readers are. */
export const WAT_OFFSET_MS = 60 * 60 * 1000;
export const DAY_MS = 24 * 60 * 60 * 1000;

/** The WAT calendar day (YYYY-MM-DD) an instant falls on. */
export const watDay = (at: number | Date = Date.now()) => new Date(+at + WAT_OFFSET_MS).toISOString().slice(0, 10);

/** The UTC instant a WAT day (YYYY-MM-DD) begins. */
export const watDayStart = (day: string) => new Date(Date.parse(`${day}T00:00:00Z`) - WAT_OFFSET_MS);

/** The WAT day `n` days before the one `at` falls on. */
export const watDaysAgo = (n: number, at = Date.now()) => watDay(at - n * DAY_MS);
