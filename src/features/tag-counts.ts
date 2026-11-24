import type { SitePost } from './site-posts';

export interface TagCount {
    /** Lower-case, as used in /tag/<tag>. */
    tag: string;
    count: number;
}

/** Every tag across `posts` with how many posts use it: most used first, then A–Z. */
export function getTagCounts(posts: SitePost[]): TagCount[] {
    const counts = new Map<string, number>();
    posts.forEach((post) => {
        new Set(post.tags.map((t) => t.toLowerCase())).forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1));
    });
    return [...counts]
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}
