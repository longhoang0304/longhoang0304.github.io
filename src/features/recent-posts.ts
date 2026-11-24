import type { Post } from './types';

/** How many of the newest posts the home page and an empty search show. */
export const RECENT_LIMIT = 5;

/** Newest first, optionally capped at `limit` entries. */
export function getRecentPosts(posts: Post[], limit?: number): Post[] {
    const sorted = [...posts].sort((a, b) => b.date.localeCompare(a.date));
    return limit === undefined ? sorted : sorted.slice(0, limit);
}
