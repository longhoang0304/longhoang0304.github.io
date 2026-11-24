/** Day, short month and year; also what features/local-dates.ts uses in the browser. */
export const FULL_DATE: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' };

const fullDate = new Intl.DateTimeFormat('en-GB', FULL_DATE);

/** 2026-10-11 → "11 Oct 2026" (UK format, the built default; browsers swap in their own). */
export function formatFullDate(isoDate: string): string {
    return fullDate.format(new Date(`${isoDate}T00:00:00Z`));
}
