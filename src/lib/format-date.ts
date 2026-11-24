const fullDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric', timeZone: 'UTC' });

/** 2026-10-11 → "Oct 11, 2026" */
export function formatFullDate(isoDate: string): string {
    return fullDate.format(new Date(`${isoDate}T00:00:00Z`));
}
