import type { Post } from './types';

/** Newest first, optionally capped at `limit` entries. */
export function getRecentPosts(posts: Post[], limit?: number): Post[] {
    const sorted = [...posts].sort((a, b) => b.date.localeCompare(a.date));
    return limit === undefined ? sorted : sorted.slice(0, limit);
}

const shortDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', timeZone: 'UTC' });

/** 2026-10-11 → "Oct 11" */
export function formatShortDate(isoDate: string): string {
    return shortDate.format(new Date(`${isoDate}T00:00:00Z`));
}
