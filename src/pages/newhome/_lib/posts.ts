import type { Post } from './types';

/** How many of the newest posts the home page and an empty search show. */
export const RECENT_LIMIT = 5;

/** Newest first, optionally capped at `limit` entries. */
export function getRecentPosts(posts: Post[], limit?: number): Post[] {
    const sorted = [...posts].sort((a, b) => b.date.localeCompare(a.date));
    return limit === undefined ? sorted : sorted.slice(0, limit);
}

const fullDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric', timeZone: 'UTC' });

/** 2026-10-11 → "Oct 11, 2026" */
export function formatFullDate(isoDate: string): string {
    return fullDate.format(new Date(`${isoDate}T00:00:00Z`));
}
